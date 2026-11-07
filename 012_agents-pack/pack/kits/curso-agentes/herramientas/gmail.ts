// Gmail: buscar, leer, dejar borradores y, sólo si lo habilitás, mandar.
// node herramientas/gmail.ts buscar "is:unread" [--max 10]
// node herramientas/gmail.ts leer <id>
// node herramientas/gmail.ts borrador --para a@b.com --asunto "..." --texto "..." [--responde <id>]
// node herramientas/gmail.ts enviar <id-del-borrador>
import { existsSync, readFileSync } from 'node:fs';
// @ts-expect-error Node corre este archivo tal cual: necesita la extensión .ts.
import { correr, leerArgumentos, llamarGoogle } from './google-auth.ts';

const API = 'https://gmail.googleapis.com/gmail/v1/users/me';
const PERMISOS = new URL('../permisos.json', import.meta.url);

type Parte = { mimeType?: string; body?: { data?: string }; parts?: Parte[] };
type Encabezado = { name: string; value: string };
type Mensaje = {
  id: string;
  threadId: string;
  snippet?: string;
  payload?: Parte & { headers?: Encabezado[] };
};

const encabezado = (m: Mensaje, nombre: string): string =>
  m.payload?.headers?.find((h) => h.name.toLowerCase() === nombre.toLowerCase())?.value ?? '';

function textoPlano(p?: Parte): string {
  if (!p) return '';
  if (p.mimeType === 'text/plain' && p.body?.data) {
    return Buffer.from(p.body.data, 'base64url').toString('utf8');
  }
  return (p.parts ?? []).map(textoPlano).join('');
}

async function buscar(consulta: string, max: string): Promise<void> {
  const q = new URLSearchParams({ q: consulta, maxResults: max });
  const lista = await llamarGoogle<{ messages?: { id: string }[] }>(`${API}/messages?${q}`);
  for (const { id } of lista.messages ?? []) {
    const m = await llamarGoogle<Mensaje>(`${API}/messages/${id}?format=full`);
    console.log([id, encabezado(m, 'Date'), encabezado(m, 'From'), encabezado(m, 'Subject')].join(' | '));
  }
  if (!lista.messages?.length) console.log('Sin resultados.');
}

async function leer(id: string): Promise<void> {
  const m = await llamarGoogle<Mensaje>(`${API}/messages/${id}?format=full`);
  console.log(`De: ${encabezado(m, 'From')}\nAsunto: ${encabezado(m, 'Subject')}\n`);
  console.log(textoPlano(m.payload) || m.snippet);
}

function armarMail(o: Record<string, string>, original?: Mensaje): string {
  const asunto = `=?UTF-8?B?${Buffer.from(o.asunto ?? '').toString('base64')}?=`;
  const lineas = [`To: ${o.para}`, `Subject: ${asunto}`];
  if (original) {
    const idMail = encabezado(original, 'Message-ID');
    lineas.push(`In-Reply-To: ${idMail}`, `References: ${idMail}`);
  }
  lineas.push('MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', '', o.texto ?? '');
  return Buffer.from(lineas.join('\r\n')).toString('base64url');
}

async function borrador(o: Record<string, string>): Promise<void> {
  if (!o.para || !o.texto) throw new Error('Faltan --para o --texto.');
  const original = o.responde
    ? await llamarGoogle<Mensaje>(`${API}/messages/${o.responde}?format=full`)
    : undefined;
  const message = { raw: armarMail(o, original), threadId: original?.threadId };
  const r = await llamarGoogle<{ id: string }>(`${API}/drafts`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  console.log(`Borrador creado: ${r.id}. Revisalo en Gmail; no se mandó nada.`);
}

async function enviar(id: string): Promise<void> {
  const permisos = existsSync(PERMISOS) ? JSON.parse(readFileSync(PERMISOS, 'utf8')) : {};
  if (permisos.puede_enviar_mails !== true) {
    throw new Error('Este agente sólo deja borradores (permisos.json). No se mandó nada.');
  }
  const r = await llamarGoogle<{ id: string }>(`${API}/drafts/send`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
  console.log(`Enviado: ${r.id}`);
}

correr(async () => {
  const [comando, ...resto] = process.argv.slice(2);
  const { sueltos, opciones } = leerArgumentos(resto);
  if (comando === 'buscar') return buscar(sueltos[0] ?? '', opciones.max ?? '10');
  if (comando === 'leer') return leer(sueltos[0]);
  if (comando === 'borrador') return borrador(opciones);
  if (comando === 'enviar') return enviar(sueltos[0]);
  throw new Error('Comandos: buscar, leer, borrador, enviar.');
});
