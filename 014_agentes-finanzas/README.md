# Agentes para tus gastos (Claude Code + Google Sheets)

Dos agentes de Claude Code que **cargan los gastos de un CSV del banco en una hoja de Google, los grafican con selectores y los revisan**. Los armás pegando seis prompts, en orden. No hace falta saber programar.

▶ **Video:** https://youtu.be/7nQwx3v9pvQ

## Qué hay en este ZIP

```
├── prompts/
│   ├── prompts-crear-agentes-desde-0.md   los 6 prompts, uno por tarea
│   └── references/                        3 capturas de cómo tienen que verse los gráficos
├── agents/
│   ├── carga-gastos.md                    agente 1: carga el CSV, categoriza y arma el resumen
│   └── revisor-de-gastos.md               agente 2: revisa los números y pule la hoja, "en frío"
├── apps-script/
│   ├── Code.gs                            la "puerta": una web app con token que escribe en tu hoja
│   └── Resumen.gs                         arma la pestaña Resumen (3 bloques con selector, tabla y gráfico)
├── datos/                                 acá van tus CSV
├── .env.local.example                     las 3 variables que necesita el sistema (archivo oculto)
└── .gitignore                             para que tus variables y tus CSV no se suban nunca a git
```

## Cómo usarlo

1. **Descomprimí este ZIP en una carpeta que se llame `finanzas`.** Es la carpeta de trabajo: los prompts la nombran así.
2. **Antes de arrancar:** una hoja de Google vacía (con tu sesión abierta en Chrome), Chrome con la extensión **Claude in Chrome**, y tu CSV del banco en `datos/`.
3. App de Claude → pestaña **Code** → **Local** → la carpeta `finanzas`. Modo **Manual**, para ver cada permiso.
4. Abrí `prompts/prompts-crear-agentes-desde-0.md` y pegá los prompts **en orden**, uno por tarea. Lo que va entre `[corchetes]` lo completás vos.
5. Cada prompt termina con un "FINAL DE LA TAREA N": una lista que Claude verifica punto por punto. Si no escribió "TAREA N LISTA", no pases a la siguiente.

## Los agentes de la carpeta `agents/`

Son el resultado de las tareas 1 y 5, ya armados, para que los leas o los uses directo. Claude Code los busca en `.claude/agents/`, una carpeta oculta: por eso acá vienen en `agents/`, que se ve.

- **Para usarlos directo:** copiá los dos archivos de `agents/` a `.claude/agents/` dentro de tu carpeta `finanzas` (si la carpeta no existe, creala).
- **Para armarlos vos:** seguí los prompts. La tarea 1 crea el primero y la tarea 5 el segundo.

## Variables

El sistema usa tres variables en un archivo `.env.local` (copiá `.env.local.example`, o dejá que la tarea 1 lo cree). **Nunca se suben a git**: el `.gitignore` las excluye.

| Variable | Qué es | De dónde sale |
|---|---|---|
| `HOJA` | El link de tu hoja de Google | Lo copiás vos de la barra del navegador |
| `URL` | La dirección de la "puerta" (termina en `/exec`) | Tarea 2: al publicar el Apps Script como aplicación web |
| `TOKEN` | La contraseña de la puerta (32 caracteres hexadecimales) | Tarea 2: la genera Claude |

**El `TOKEN` vive en dos lugares con el mismo valor:** en `.env.local` y en las **Propiedades del script** de tu proyecto de Apps Script (clave `TOKEN`). El código lo compara contra esa propiedad; si falta, toda llamada responde `"error":"token"`.

Los agentes leen estas variables dentro del mismo comando (`set -a; . ./.env.local; set +a`) y nunca las muestran en pantalla.

## Cuidado con tus datos

- Tu CSV tiene movimientos reales. **Limpialo antes de cargarlo**: el agente manda el archivo entero a tu hoja y no puede anonimizar nombres ni cuentas.
- `datos/*.csv` está en el `.gitignore`: tus extractos no se suben a git.
- Nada de esto se conecta a tu banco: trabaja con el CSV que vos descargás.
- La dirección de la puerta es pública y sólo la protege el token. Cuando termines de usar el sistema: Implementar → Administrar implementaciones → archivar.

Más notas y límites conocidos al final de `prompts/prompts-crear-agentes-desde-0.md`.
