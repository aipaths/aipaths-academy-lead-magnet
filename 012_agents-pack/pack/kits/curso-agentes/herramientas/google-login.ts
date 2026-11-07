// Abre el navegador, vos aprobás con tu cuenta y queda guardado .credenciales/token.json.
// Uso: node herramientas/google-login.ts [--extra gmail.insert]
import { execFile } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import {
  ALCANCES,
  ARCHIVO_TOKEN,
  correr,
  guardarToken,
  leerArgumentos,
  leerCliente,
  pedirToken,
// @ts-expect-error Node corre este archivo tal cual: necesita la extensión .ts.
} from './google-auth.ts';

function abrirNavegador(url: string): void {
  const comando: Record<string, [string, string[]]> = {
    darwin: ['open', [url]],
    win32: ['cmd', ['/c', 'start', '', url.replaceAll('&', '^&')]],
  };
  const [programa, args] = comando[process.platform] ?? ['xdg-open', [url]];
  execFile(programa, args, () => {});
}

// Levanta un servidor en tu compu para recibir la respuesta de Google.
async function abrirReceptor(estado: string) {
  let resolver: (codigo: string) => void;
  let rechazar: (e: Error) => void;
  const codigo = new Promise<string>((ok, mal) => {
    resolver = ok;
    rechazar = mal;
  });
  const servidor = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const recibido = url.searchParams.get('code');
    const valido = recibido && url.searchParams.get('state') === estado;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(valido ? 'Listo. Ya podés cerrar esta pestaña.' : 'No se aprobó el acceso.');
    servidor.close();
    if (valido) resolver(recibido);
    else rechazar(new Error(url.searchParams.get('error') ?? 'estado inválido'));
  });
  await new Promise<void>((ok) => servidor.listen(0, '127.0.0.1', ok));
  const { port } = servidor.address() as AddressInfo;
  return { codigo, direccion: `http://127.0.0.1:${port}` };
}

correr(async () => {
  const { opciones } = leerArgumentos(process.argv.slice(2));
  const cliente = leerCliente();
  const extra = opciones.extra ? [`https://www.googleapis.com/auth/${opciones.extra}`] : [];
  const verificador = randomBytes(32).toString('base64url');
  const desafio = createHash('sha256').update(verificador).digest('base64url');
  const estado = randomBytes(16).toString('hex');
  const { codigo, direccion } = await abrirReceptor(estado);

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: cliente.client_id,
    redirect_uri: direccion,
    response_type: 'code',
    scope: [...ALCANCES, ...extra].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: estado,
    code_challenge: desafio,
    code_challenge_method: 'S256',
  }).toString();

  console.log(`Abrí este enlace si no se abrió solo:\n${url}\n`);
  abrirNavegador(url.toString());

  const r = await pedirToken({
    client_id: cliente.client_id,
    client_secret: cliente.client_secret,
    code: await codigo,
    code_verifier: verificador,
    redirect_uri: direccion,
    grant_type: 'authorization_code',
  });
  if (r.error) throw new Error(`Google rechazó el código: ${r.error}`);
  guardarToken(r);
  console.log(`Listo. Token guardado en ${ARCHIVO_TOKEN}`);
});
