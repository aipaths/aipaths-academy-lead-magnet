---
content_id: lead-magnets-saas-landing-template
title: Plantilla de Landing Page SaaS
description: Una plantilla Next.js 16 lista para produccion que puedes personalizar completamente con solo 3 prompts de IA. Bilingue, modo oscuro, lista para Supabase, despliega en 20 minutos.
category: templates
tags: [nextjs, saas, landing-page, claude-code, automation, templates]
difficulty: beginner
version: 2.0.0
published: false
locale: es
order: 3
lastUpdated: '2025-12-01'
author: AIPaths Academy
downloadSize: '170 KB'
estimatedSetupTime: '20 minutos'
prerequisites:
  - Node.js 18+ instalado
  - Claude Code o asistente de IA similar
  - Cuenta de Supabase (opcional - usa localStorage como respaldo)
  - Cuenta de Vercel para despliegue (opcional)
files:
  - path: template/
    description: Proyecto Next.js 16 completo con todos los archivos fuente
  - path: template/prompts/PROMPTS.md
    description: El flujo de 3 prompts en ingles
  - path: template/prompts/PROMPTS_ES.md
    description: El flujo de 3 prompts en espanol
  - path: template/prompts/EXAMPLE_ANSWERS.md
    description: Respuestas de ejemplo para guiarte en el prompt de descubrimiento
  - path: template/src/content/
    description: Archivos JSON para todo el contenido (bilingue EN/ES)
  - path: README.md
    description: Instrucciones rapidas de configuracion
---

## Que Es Esto?

Una plantilla de landing page completa y lista para produccion construida con **Next.js 16**, **React 19**, **Tailwind CSS v4** y **Supabase**. La magia? Puedes personalizarla completamente para CUALQUIER idea de SaaS usando solo **3 prompts de IA** en aproximadamente 20 minutos.

No mas pasar dias en landing pages. No mas contratar disenadores para validacion. Solo describe tu idea y deja que la IA genere todo el contenido.

## Lo Que Obtienes

### Una Landing de Pagina Unica Completa

Todas las secciones en una pagina hermosa:
- **Hero**: Titular convincente con acentos degradados y CTAs
- **Caracteristicas**: Grid de 6 items con iconos
- **Como Funciona**: Desglose de proceso en 4 pasos
- **Precios**: Tiers configurables con listas de caracteristicas
- **Waitlist**: Formulario de captura de email (Supabase o respaldo localStorage)
- **FAQ**: Seccion acordeon expandible
- **Nosotros**: Historia y valores de la empresa
- **Contacto**: Formulario de contacto funcional
- **Legal**: Politica de Privacidad y Terminos de Servicio (modales/paginas separadas)

### Caracteristicas Incluidas

- **Bilingue (EN/ES)**: Selector de idioma en navbar, todo el contenido JSON soporta ambos idiomas
- **Modo Oscuro**: Toggle con deteccion de preferencia del sistema
- **Waitlist con Respaldo**: Funciona con Supabase o automaticamente usa localStorage
- **Branding con Degradados**: Cambia dos variables CSS (`--gradient-from`, `--gradient-to`) para cambiar marca usando colores oklch
- **Animaciones Modernas**: Transiciones suaves con Framer Motion
- **Responsive para Movil**: Se ve genial en todos los dispositivos
- **TypeScript**: Completamente tipado para confianza del desarrollador
- **Componentes shadcn/ui**: Componentes UI accesibles pre-construidos

### El Flujo de 3 Prompts

| Prompt | Que Hace | Tiempo |
|--------|----------|--------|
| **Descubrimiento** | La IA pregunta sobre tu producto, audiencia, caracteristicas, precios | ~5 min |
| **Generacion** | La IA crea todos los archivos JSON de contenido (bilingue) | ~2 min |
| **Refinamiento** | Revisar, ajustar, probar y desplegar | ~3 min |

## Stack Tecnologico

- **Framework**: Next.js 16 (App Router)
- **React**: v19 con las ultimas caracteristicas
- **Estilos**: Tailwind CSS v4 con colores oklch
- **Animaciones**: Framer Motion
- **Componentes UI**: shadcn/ui (primitivos Radix)
- **Base de Datos**: Supabase (PostgreSQL) con respaldo localStorage
- **Iconos**: Lucide React
- **Lenguaje**: TypeScript
- **Despliegue**: Listo para Vercel

## Inicio Rapido

### 1. Extraer e Instalar

```bash
unzip saas-landing-template.zip
cd template
npm install
```

### 2. Configurar Supabase (Opcional)

La plantilla funciona sin Supabase - automaticamente usa localStorage como respaldo. Pero si quieres que los datos de email se guarden en una base de datos:

1. Crea un proyecto gratuito en Supabase
2. Ejecuta este SQL en el Editor SQL:

```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default now(),
  source text default 'website'
);

alter table waitlist enable row level security;

create policy "Allow anonymous inserts" on waitlist
  for insert with check (true);
```

3. Configura el entorno:

```bash
cp .env.example .env.local
```

Agrega tus credenciales de Supabase a `.env.local`.

### 3. Ejecutar el Flujo de 3 Prompts

Abre el proyecto en Claude Code (o tu asistente de IA) y sigue `prompts/PROMPTS_ES.md`:

1. **Prompt 1**: Responde preguntas sobre tu producto (ver `EXAMPLE_ANSWERS.md` como guia)
2. **Prompt 2**: La IA genera todo el contenido JSON (bilingue EN/ES)
3. **Prompt 3**: Revisa, prueba y despliega

### 4. Desplegar en Vercel

```bash
npm install -g vercel
vercel
```

## Para Quien Es Esto?

- **Solopreneurs** validando ideas de SaaS rapidamente
- **Indie hackers** que quieren landing pages profesionales sin habilidades de diseno
- **Desarrolladores** cansados de construir el mismo boilerplate
- **Cualquiera** que quiera probar demanda de mercado antes de construir

## Casos de Uso de Ejemplo

- Validar un nuevo concepto de SaaS con una waitlist
- Crear una landing page para un proyecto personal
- Construir landing pages para clientes rapidamente
- Aprender patrones de Next.js con un ejemplo del mundo real

## Que NO Esta Incluido

- Autenticacion de usuarios (esto es para validacion pre-lanzamiento)
- Procesamiento de pagos (agrega Stripe cuando estes listo)
- Panel de administracion (lo construiras cuando tengas usuarios)

Esta plantilla esta intencionalmente enfocada en una cosa: poner tu idea frente a clientes potenciales rapido.

---

**Listo para validar tu idea de SaaS?**

Descarga la plantilla, ejecuta 3 prompts y ten tu landing page en vivo en 20 minutos.
