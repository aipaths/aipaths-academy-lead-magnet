---
content_id: lead-magnets-ai-agents-config
title: Paquete de Configuración de Agentes IA
description: Agentes de Claude Code listos para usar en tareas comunes de desarrollo. Cópialos a tu carpeta de agentes y empieza a usarlos inmediatamente.
category: ai-agents
tags: [ai-agents, automation, claude-code, productivity, workflow]
difficulty: beginner
version: 1.0.0
published: false
locale: es
order: 2
lastUpdated: '2025-11-14'
author: AIPaths Academy
downloadSize: '50 KB'
estimatedSetupTime: '2 minutos'
prerequisites:
  - Claude Code instalado
files:
  - path: agents/
    description: 5 archivos de agentes de Claude Code pre-configurados
  - path: README.md
    description: Instrucciones rápidas de configuración
---

## ¿Qué Son los Agentes IA?

Los agentes IA en Claude Code son asistentes especializados que manejan automáticamente tareas específicas de desarrollo. En lugar de pedirle manualmente a Claude revisiones de código, commits o trabajo de base de datos, los agentes se activan proactivamente cuando detectan tareas relevantes.

## Lo Que Obtienes

Este paquete incluye 5 agentes listos para usar en flujos de trabajo comunes:

### 1. Guardián de Commits Git
- Revisa tus cambios en busca de problemas de seguridad (API keys, secretos, etc.)
- Crea mensajes de commit profesionales y convencionales
- Detecta archivos que no deberían ser commiteados (capturas, archivos temporales)
- Maneja todo el proceso de commit y push de forma segura

### 2. Gestor de Base de Datos Supabase
- Crea migraciones de base de datos con el schema apropiado
- Configura políticas de Row Level Security (RLS)
- Optimiza queries lentas e índices
- Gestiona cambios de schema de base de datos para tus apps Next.js + Supabase

### 3. Auditor de Seguridad Next.js
- Escanea tu código en busca de vulnerabilidades de seguridad
- Verifica secretos y API keys expuestas
- Valida flujos de autenticación y autorización
- Revisa dependencias en busca de CVEs conocidos
- Asegura que los headers de seguridad estén configurados correctamente

### 4. Probador de Navegador Playwright
- Prueba páginas web en navegadores reales
- Verifica errores de consola y problemas
- Captura capturas de pantalla y diagnósticos
- Valida funcionalidad antes del despliegue

### 5. Auditor de Limpieza de Código
- Encuentra archivos no usados y carpetas vacías
- Identifica artefactos temporales y desorden
- Sugiere oportunidades de limpieza
- Ayuda a mantener tu repositorio organizado

## Configuración (Toma 2 Minutos)

1. **Descargar y Extraer**
   ```bash
   unzip ai-agents-config.zip
   ```

2. **Copiar Archivos de Agentes**
   ```bash
   cp agents/*.md ~/.claude/agents/
   ```

   O manualmente:
   - Ve a la carpeta `agents` en la descarga
   - Copia los 5 archivos `.md`
   - Pégalos en `~/.claude/agents/` en tu máquina

3. **¡Eso Es Todo!**
   Los agentes ya están activos en Claude Code.

## Cómo Usarlos

Los agentes se activan automáticamente cuando son relevantes. Simplemente trabaja naturalmente con Claude Code:

**Guardián de Commits Git:**
- Di "commitea estos cambios" o "sube el código"
- El agente revisa problemas de seguridad y maneja el commit

**Gestor de DB Supabase:**
- Di "crea una tabla para preferencias de usuario"
- El agente crea la migración con las políticas RLS apropiadas

**Auditor de Seguridad Next.js:**
- Di "revisa mi app en busca de problemas de seguridad"
- El agente realiza una auditoría de seguridad completa

**Probador de Navegador Playwright:**
- Di "prueba http://localhost:3000 en busca de errores"
- El agente abre un navegador y diagnostica problemas

**Auditor de Limpieza de Código:**
- Di "revisa qué podemos limpiar"
- El agente escanea archivos no usados y sugiere limpieza

## Consejos

- Los agentes trabajan proactivamente - se sugerirán cuando sean relevantes
- Puedes seguir usando Claude normalmente - los agentes mejoran, no reemplazan
- Revisa los archivos `.md` individuales para ver las capacidades completas de cada agente
- Personaliza el comportamiento de los agentes editando los archivos `.md`

## ¿Necesitas Ayuda?

- **Problemas**: Repórtalos en https://github.com/anthropics/claude-code/issues
- **Comunidad**: Únete a nuestro Discord en discord.gg/aipaths
- **Email**: support@aipaths.academy

{/* Test automation v2: Fri Nov 14 09:28:14 GMT 2025 */}
