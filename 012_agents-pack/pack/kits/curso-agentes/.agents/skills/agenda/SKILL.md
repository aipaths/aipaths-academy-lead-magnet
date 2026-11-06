---
name: agenda
description: Agenda reuniones respetando mis horarios. Usala cuando pida agendar, mover una reunión, buscar un hueco o ver qué tengo.
---

# Cómo agendo una reunión

1. **Mirá la agenda** con el conector de Calendar o con `node herramientas/calendario.ts proximos --dias 14`. Si no hay Google, decime que no podés ver la agenda. No la inventes.
2. **Respetá mis horarios** de `AGENTS.md`. Mirá también `clientes.csv`: si un cliente prefiere la mañana, ofrecé la mañana.
3. **Proponé hasta dos horarios.** Si el pedido es claro y hay un solo hueco posible, proponé uno.
4. **Confirmá conmigo** el día, la hora, la duración y el invitado antes de crear el evento.
5. **Creá el evento** con la zona horaria de `AGENTS.md`, con el conector o con:
   `node herramientas/calendario.ts crear --titulo "Reunión con <nombre>" --inicio <ISO> --fin <ISO> --invitado <mail>`.
   Con `calendario.ts`, crear el evento no le avisa al invitado; con un conector, puede avisarle: fijate antes. Si hay que avisarle, dejá el borrador del mail con la skill `follow-up`.

## Si no hay hueco

Decilo y proponé qué movería, pero no muevas ni borres nada sin que te lo pida.
