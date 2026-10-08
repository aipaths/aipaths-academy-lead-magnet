---
# Unique identifier linking EN/ES versions
content_id: "lead-magnets-agentes-finanzas"

# Locale (must match filename)
locale: "es"

# SEO & Display
title: "Agentes para tus gastos (Claude Code + Google Sheets)"
description: "Dos agentes que cargan los gastos de tu CSV en Google Sheets, los grafican con selectores y los revisan. Seis prompts en orden, los agentes y el código."

# Category and taxonomy
category: "ai-agents"
tags:
  - ai-agents
  - claude-code
  - google-sheets
  - apps-script
  - finanzas
  - prompts

# Metadata
difficulty: "beginner"
version: "1.0.0"
published: true
coverImage: "/images/resources/014_agentes-finanzas/thumb.png"
order: 14
lastUpdated: "2026-10-08"
author: "AIPaths Academy"
downloadSize: "156 KB"
estimatedSetupTime: "1 hora"

# Prerequisites
prerequisites:
  - Una cuenta de Claude de pago, con la app de escritorio (pestaña Code)
  - Chrome con la extensión Claude in Chrome
  - Una cuenta de Google (Google Sheets y Apps Script son gratis)
  - Un CSV con los movimientos de tu banco, limpio de nombres y cuentas

# Files included
files:
  - path: prompts/
    description: Los 6 prompts del sistema, uno por tarea, y 3 capturas de cómo tienen que verse los gráficos
  - path: agents/
    description: Los dos agentes ya armados, listos para usar - carga-gastos y revisor-de-gastos
  - path: apps-script/
    description: El código de la hoja - la puerta con token y la pestaña Resumen con sus 3 gráficos
  - path: datos/
    description: La carpeta donde dejás tu CSV
  - path: README.md
    description: Cómo usarlo, las tres variables que necesita y qué cuidar con tus datos
---

## Por qué este kit

Cargar los gastos a mano es la tarea que todos posponen: abrís el extracto, copiás, pegás, corregís categorías, y a fin de mes seguís sin saber cuánto gastaste ni en qué. Es repetitiva, mecánica y fácil de verificar: justo lo que un agente hace bien.

Este kit arma ese sistema con dos agentes de Claude Code. El primero carga el CSV de tu banco en una hoja de Google, categoriza los comercios nuevos y arma el resumen con gráficos. El segundo revisa en frío que los números cierren al centavo y deja la hoja prolija. El trabajo se hace y vos revisás.

## Qué incluye

- **Seis prompts, uno por tarea** — los pegás en orden. Cada uno termina con una lista de verificación: si Claude no escribió "TAREA N LISTA", la tarea no terminó y no pasás a la siguiente.
- **Dos agentes listos para usar** — `carga-gastos` y `revisor-de-gastos`, en la carpeta `agents/`.
- **El código de la hoja** — Apps Script con una puerta protegida por token y la pestaña Resumen con tres bloques: selector, mini tabla y gráfico.
- **Tres capturas de referencia** de cómo tienen que verse los gráficos.
- **Una tabla para decidir qué automatizar después**, con cinco preguntas de sí o no.

## Cómo funciona

1. **Tarea 1:** Claude crea el primer agente y la estructura de carpetas.
2. **Tarea 2:** desde tu Chrome, Claude crea la puerta a tu hoja con Apps Script. El permiso de Google lo aprobás vos.
3. **Tarea 3:** carga tu CSV y verifica que la hoja coincida con el archivo al centavo. Cargar dos veces el mismo archivo no duplica nada.
4. **Tarea 4:** arma el Resumen con tres gráficos y selectores que actualizan tabla y gráfico.
5. **Tarea 5:** el segundo agente revisa los números y pule la hoja. Si cambiás un monto a mano, tiene que dar NO PASA y decirte cuál.
6. **Tarea 6:** una matriz para decidir qué conviene automatizar después.

## Antes de usarlo con tus datos reales

Tu CSV tiene movimientos reales. Limpialo antes de cargarlo: el agente manda el archivo entero a tu hoja y no puede anonimizar nombres ni cuentas. Nada de esto se conecta a tu banco: trabaja con el CSV que vos descargás.

La puerta es una dirección pública que protege solo un token. El token vive en `.env.local` y en las propiedades del script, nunca dentro del código. Cuando termines de usar el sistema, archivá la implementación.

## Para usar los agentes de la carpeta agents

Claude Code busca los agentes de un proyecto en `.claude/agents/`, una carpeta oculta. Para que se vean en el ZIP vienen en `agents/`: copiá esos dos archivos a `.claude/agents/` dentro de tu carpeta de trabajo y ya los podés invocar. El README del ZIP lo explica paso a paso.

## Recursos relacionados

- [Video de este sistema, paso a paso](https://youtu.be/7nQwx3v9pvQ)
