// Pasa el ID y el secreto del JSON que baja Google a tu .env, sin mostrarlos en pantalla.
// Uso: node herramientas/google-credenciales.ts [ruta-al-json]
// Sin ruta, busca el client_secret más nuevo en tu carpeta Descargas o Downloads.
import { chmodSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error Node corre este archivo tal cual: necesita la extensión .ts.
import { ARCHIVO_ENV, correr } from './google-auth.ts';

function buscarDescarga(): string {
  const carpetas = ['Downloads', 'Descargas'].map((c) => join(homedir(), c)).filter((c) => existsSync(c));
  const archivos = carpetas.flatMap((c) =>
    readdirSync(c)
      .filter((a) => a.startsWith('client_secret') && a.endsWith('.json'))
      .map((a) => join(c, a)),
  );
  if (!archivos.length) throw new Error('No encontré el JSON en Descargas. Pasame la ruta del archivo.');
  return archivos.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
}

// Cambia las dos líneas de Google y deja como están las demás claves del .env.
function actualizarEnv(id: string, secreto: string): void {
  const previo = existsSync(ARCHIVO_ENV) ? readFileSync(ARCHIVO_ENV, 'utf8') : '';
  const otras = previo.split('\n').filter((l) => l && !/^GOOGLE_CLIENT_(ID|SECRET)=/.test(l));
  const lineas = [...otras, `GOOGLE_CLIENT_ID=${id}`, `GOOGLE_CLIENT_SECRET=${secreto}`];
  writeFileSync(ARCHIVO_ENV, `${lineas.join('\n')}\n`, { mode: 0o600 });
  chmodSync(ARCHIVO_ENV, 0o600);
}

correr(async () => {
  const ruta = process.argv[2] ?? buscarDescarga();
  const json = JSON.parse(readFileSync(ruta, 'utf8'));
  if (!json.installed?.client_id || !json.installed?.client_secret) {
    throw new Error(
      'Ese JSON no es de una «App de escritorio» (Desktop app). Creá un cliente de ese tipo y bajalo.',
    );
  }
  actualizarEnv(json.installed.client_id, json.installed.client_secret);
  console.log(`Listo: .env actualizado con los datos de ${ruta}.`);
  console.log('Ya podés borrar ese JSON: tiene tu secreto.');
});
