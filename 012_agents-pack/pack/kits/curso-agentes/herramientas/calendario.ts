// Google Calendar: ver la agenda y crear eventos.
// node herramientas/calendario.ts proximos [--dias 7]
// node herramientas/calendario.ts crear --titulo "..." --inicio 2026-11-19T10:00:00-03:00 --fin ... [--invitado a@b.com]
// @ts-expect-error Node corre este archivo tal cual: necesita la extensión .ts.
import { correr, leerArgumentos, llamarGoogle } from './google-auth.ts';

const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
type Evento = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

async function proximos(dias: number): Promise<void> {
  const q = new URLSearchParams({
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + dias * 86_400_000).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });
  const r = await llamarGoogle<{ items?: Evento[] }>(`${API}?${q}`);
  for (const e of r.items ?? []) {
    console.log(`${e.start?.dateTime ?? e.start?.date} → ${e.end?.dateTime ?? e.end?.date} | ${e.summary}`);
  }
  if (!r.items?.length) console.log('Sin eventos en ese período.');
}

async function crear(o: Record<string, string>): Promise<void> {
  if (!o.titulo || !o.inicio || !o.fin) throw new Error('Faltan --titulo, --inicio o --fin.');
  const cuerpo = {
    summary: o.titulo,
    start: { dateTime: o.inicio },
    end: { dateTime: o.fin },
    attendees: o.invitado ? [{ email: o.invitado }] : undefined,
  };
  // sendUpdates=none: crear el evento no le manda mail a nadie.
  const r = await llamarGoogle<Evento>(`${API}?sendUpdates=none`, {
    method: 'POST',
    body: JSON.stringify(cuerpo),
  });
  console.log(`Evento creado: ${r.id}`);
}

correr(async () => {
  const [comando, ...resto] = process.argv.slice(2);
  const { opciones } = leerArgumentos(resto);
  if (comando === 'proximos') return proximos(Number(opciones.dias ?? 7));
  if (comando === 'crear') return crear(opciones);
  throw new Error('Comandos: proximos, crear.');
});
