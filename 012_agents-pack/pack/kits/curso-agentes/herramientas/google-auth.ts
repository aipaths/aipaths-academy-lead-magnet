// Credenciales de Google: lee tu cliente OAuth de .env, guarda el token y lo renueva cuando vence.
// Sin dependencias: sólo Node 22.18 o más nuevo.
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CARPETA = join(RAIZ, '.credenciales');
export const ARCHIVO_ENV = join(RAIZ, '.env');
export const ARCHIVO_TOKEN = join(CARPETA, 'token.json');
const URL_TOKEN = 'https://oauth2.googleapis.com/token';

export const ALCANCES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/spreadsheets',
];

export type Cliente = { client_id: string; client_secret: string };
type Token = { access_token: string; refresh_token: string; vence: number };
type RespuestaToken = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
};

export function leerCliente(): Cliente {
  if (existsSync(ARCHIVO_ENV)) process.loadEnvFile(ARCHIVO_ENV);
  const { GOOGLE_CLIENT_ID: client_id, GOOGLE_CLIENT_SECRET: client_secret } = process.env;
  if (!client_id || !client_secret) {
    throw new Error(
      'Falta GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env. Seguí PASO-A-PASO-GOOGLE.md, paso 5.',
    );
  }
  return { client_id, client_secret };
}

export function guardarToken(r: RespuestaToken, anterior?: string): void {
  const refresh = r.refresh_token ?? anterior;
  if (!r.access_token || !refresh) throw new Error('Google no devolvió el token.');
  const token: Token = {
    access_token: r.access_token,
    refresh_token: refresh,
    vence: Date.now() + (r.expires_in ?? 3600) * 1000,
  };
  mkdirSync(CARPETA, { recursive: true });
  writeFileSync(ARCHIVO_TOKEN, JSON.stringify(token, null, 2), { mode: 0o600 });
  chmodSync(ARCHIVO_TOKEN, 0o600);
}

export async function pedirToken(campos: Record<string, string>): Promise<RespuestaToken> {
  const res = await fetch(URL_TOKEN, { method: 'POST', body: new URLSearchParams(campos) });
  return (await res.json()) as RespuestaToken;
}

async function tokenVigente(): Promise<string> {
  if (!existsSync(ARCHIVO_TOKEN)) {
    throw new Error('Todavía no hay token. Corré: node herramientas/google-login.ts');
  }
  const token = JSON.parse(readFileSync(ARCHIVO_TOKEN, 'utf8')) as Token;
  if (Date.now() < token.vence - 60_000) return token.access_token;
  const cliente = leerCliente();
  const r = await pedirToken({
    client_id: cliente.client_id,
    client_secret: cliente.client_secret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token',
  });
  if (r.error === 'invalid_grant') {
    throw new Error(
      'Google dio de baja el permiso. Si tu app sigue en «Testing», vence a los 7 días: ' +
        'corré node herramientas/google-login.ts otra vez o publicala (ver PASO-A-PASO-GOOGLE.md).',
    );
  }
  guardarToken(r, token.refresh_token);
  return r.access_token as string;
}

export async function llamarGoogle<T>(url: string, opciones: RequestInit = {}): Promise<T> {
  const headers = {
    authorization: `Bearer ${await tokenVigente()}`,
    'content-type': 'application/json',
  };
  const res = await fetch(url, { ...opciones, headers });
  const texto = await res.text();
  if (!res.ok) {
    if (res.status === 403 && texto.includes('SERVICE_DISABLED')) {
      throw new Error('Esa API no está habilitada en tu proyecto. Ver PASO-A-PASO-GOOGLE.md, paso 2.');
    }
    if (res.status === 401) {
      throw new Error('Google dio de baja el permiso. Corré node herramientas/google-login.ts otra vez.');
    }
    throw new Error(`Google respondió ${res.status}: ${texto.slice(0, 400)}`);
  }
  return (texto ? JSON.parse(texto) : {}) as T;
}

// Lee argumentos del tipo: comando valor --opcion valor
export function leerArgumentos(args: string[]): { sueltos: string[]; opciones: Record<string, string> } {
  const sueltos: string[] = [];
  const opciones: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) opciones[a.slice(2)] = args[++i] ?? '';
    else sueltos.push(a);
  }
  return { sueltos, opciones };
}

export function correr(principal: () => Promise<void>): void {
  principal().catch((e: Error) => {
    console.error(`ERROR: ${e.message}`);
    process.exit(1);
  });
}
