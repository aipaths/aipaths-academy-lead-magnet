---
name: follow-up
description: Escribe follow-ups a clientes con mi tono y mi contexto. Usala cuando pida un follow-up, un seguimiento, retomar con un cliente, o revisar quién quedó sin respuesta.
---

# Cómo hago un follow-up

1. **Buscá el contexto.** Mirá `clientes.csv` y los últimos mails con esa persona. Si tenés Gmail conectado, por conector o con
   `node herramientas/gmail.ts buscar "from:<mail> OR to:<mail>"`, buscalos ahí. Si no, mirá `mails/`.
2. **Decidí si hace falta.** Si la pelota está de mi lado, no escribas un follow-up: decime qué me falta
   contestar. Si el último contacto fue hace menos de 3 días, avisame y preguntá antes de escribir.
3. **Escribilo como yo.** Seguí «Cómo escribo» de `AGENTS.md`. Una sola pregunta o pedido por mail.
   Retomá algo concreto de la última charla, nunca «espero que estés bien» ni «te escribo para hacer seguimiento».
4. **Entregalo como borrador.** Con Gmail conectado, usá el conector o:
   `node herramientas/gmail.ts borrador --para <mail> --asunto "<asunto>" --texto "<texto>" --responde <id>`.
   Si no hay Gmail, mostrame el texto. **No mandes nada sin que te lo pida con ese mail a la vista.**
5. **Actualizá `clientes.csv`** sólo si te lo pido, o si `AGENTS.md` dice que lo hagas.

## Si son varios

Armá una tabla: cliente, último contacto, de quién es la pelota y qué proponés. Espero tu tabla antes de
los borradores.

## Si falta un dato

Decilo. No inventes reuniones, montos ni promesas que no estén en los mails o en `clientes.csv`.
