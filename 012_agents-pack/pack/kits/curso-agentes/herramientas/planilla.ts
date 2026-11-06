// Google Sheets: crear una planilla, leerla y sumarle filas.
// node herramientas/planilla.ts crear "Facturas"
// node herramientas/planilla.ts leer <id> "Hoja1!A1:G50"
// node herramientas/planilla.ts agregar <id> "Hoja1" valor1 valor2 valor3
// @ts-expect-error Node corre este archivo tal cual: necesita la extensión .ts.
import { correr, leerArgumentos, llamarGoogle } from './google-auth.ts';

const API = 'https://sheets.googleapis.com/v4/spreadsheets';

async function crear(titulo: string): Promise<void> {
  const r = await llamarGoogle<{ spreadsheetId: string; spreadsheetUrl: string }>(API, {
    method: 'POST',
    // La hoja se llama Hoja1 también en cuentas en inglés, así las skills no dependen del idioma.
    body: JSON.stringify({ properties: { title: titulo }, sheets: [{ properties: { title: 'Hoja1' } }] }),
  });
  console.log(`Planilla creada: ${r.spreadsheetId}\n${r.spreadsheetUrl}`);
}

async function leer(id: string, rango: string): Promise<void> {
  const url = `${API}/${id}/values/${encodeURIComponent(rango)}`;
  const r = await llamarGoogle<{ values?: string[][] }>(url);
  for (const fila of r.values ?? []) console.log(fila.join(' | '));
  if (!r.values?.length) console.log('Vacía.');
}

async function agregar(id: string, rango: string, valores: string[]): Promise<void> {
  const q = new URLSearchParams({ valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS' });
  const url = `${API}/${id}/values/${encodeURIComponent(rango)}:append?${q}`;
  const r = await llamarGoogle<{ updates?: { updatedRange?: string } }>(url, {
    method: 'POST',
    body: JSON.stringify({ values: [valores] }),
  });
  console.log(`Fila agregada en ${r.updates?.updatedRange}`);
}

correr(async () => {
  const [comando, ...resto] = process.argv.slice(2);
  const { sueltos } = leerArgumentos(resto);
  if (comando === 'crear') return crear(sueltos[0]);
  if (comando === 'leer') return leer(sueltos[0], sueltos[1]);
  if (comando === 'agregar') return agregar(sueltos[0], sueltos[1], sueltos.slice(2));
  throw new Error('Comandos: crear, leer, agregar.');
});
