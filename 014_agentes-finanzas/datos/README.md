# datos/

Acá van los CSV del banco. El agente `carga-gastos` los lee de esta carpeta y nunca los modifica ni los borra.

- **`Gastos-ejemplo.csv` es inventado:** 398 movimientos ficticios (oct 2025 a sep 2026) con el mismo formato que la exportación de Monzo. Ningún comercio, persona ni monto es real. Sirve para probar el sistema sin usar tus datos.
- **Si vas a cargar tus datos reales, sacá el de ejemplo de esta carpeta.** Si no, el agente te va a preguntar cuál cargar, y si cargás los dos quedan mezclados en la misma hoja.
- **Limpiá tu CSV antes:** el agente manda el archivo entero a tu hoja y no puede anonimizar nombres ni cuentas.
- Tus `.csv` están en el `.gitignore` y no se suben a git. La única excepción es el de ejemplo.
