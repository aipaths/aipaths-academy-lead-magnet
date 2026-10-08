---
content_id: lead-magnets-saas-landing-template
title: SaaS Landing Page Template
description: A production-ready Next.js 16 landing page template you can fully customize with just 3 AI prompts. Bilingual, dark mode, Supabase-ready, deploy in 20 minutes.
category: templates
tags: [nextjs, saas, landing-page, claude-code, automation, templates]
difficulty: beginner
version: 2.0.0
published: false
locale: en
order: 3
lastUpdated: '2025-12-01'
author: AIPaths Academy
downloadSize: '170 KB'
estimatedSetupTime: '20 minutes'
prerequisites:
  - Node.js 18+ installed
  - Claude Code or similar AI coding assistant
  - Supabase account (optional - falls back to localStorage)
  - Vercel account for deployment (optional)
files:
  - path: template/
    description: Complete Next.js 16 project with all source files
  - path: template/prompts/PROMPTS.md
    description: The 3-prompt workflow in English
  - path: template/prompts/PROMPTS_ES.md
    description: The 3-prompt workflow in Spanish
  - path: template/prompts/EXAMPLE_ANSWERS.md
    description: Example answers to guide you through the discovery prompt
  - path: template/src/content/
    description: JSON files for all page content (bilingual EN/ES)
  - path: README.md
    description: Quick setup instructions
---

## What Is This?

A complete, production-ready landing page template built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **Supabase**. The magic? You can fully customize it for ANY SaaS idea using just **3 AI prompts** in about 20 minutes.

No more spending days on landing pages. No more hiring designers for validation. Just describe your idea, and let AI generate all the content.

## What You Get

### A Complete Single-Page Landing

All sections on one beautiful page:
- **Hero**: Compelling headline with gradient accents and CTAs
- **Features**: 6-item grid with icons
- **How It Works**: 4-step process breakdown
- **Pricing**: Configurable tiers with feature lists
- **Waitlist**: Email capture form (Supabase or localStorage fallback)
- **FAQ**: Expandable accordion section
- **About**: Company story and values
- **Contact**: Working contact form
- **Legal**: Privacy Policy and Terms of Service (separate modals/pages)

### Built-In Features

- **Bilingual (EN/ES)**: Language switcher in navbar, all JSON content supports both languages
- **Dark Mode**: Toggle switch with system preference detection
- **Waitlist with Fallback**: Works with Supabase or automatically falls back to localStorage
- **Gradient Branding**: Change two CSS variables (`--gradient-from`, `--gradient-to`) to rebrand using oklch colors
- **Modern Animations**: Smooth transitions powered by Framer Motion
- **Mobile Responsive**: Looks great on all devices
- **TypeScript**: Fully typed for developer confidence
- **shadcn/ui Components**: Pre-built accessible UI components

### The 3-Prompt Workflow

| Prompt | What It Does | Time |
|--------|--------------|------|
| **Discovery** | AI asks about your product, audience, features, pricing | ~5 min |
| **Generation** | AI creates all JSON content files (bilingual) | ~2 min |
| **Refinement** | Review, adjust, test, and deploy | ~3 min |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: v19 with latest features
- **Styling**: Tailwind CSS v4 with oklch colors
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui (Radix primitives)
- **Database**: Supabase (PostgreSQL) with localStorage fallback
- **Icons**: Lucide React
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## Quick Start

### 1. Extract and Install

```bash
unzip saas-landing-template.zip
cd template
npm install
```

### 2. Set Up Supabase (Optional)

The template works without Supabase - it automatically uses localStorage as a fallback. But if you want email data stored in a database:

1. Create a free Supabase project
2. Run this SQL in the SQL Editor:

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

3. Configure environment:

```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`.

### 3. Run the 3-Prompt Workflow

Open the project in Claude Code (or your AI assistant) and follow `prompts/PROMPTS.md`:

1. **Prompt 1**: Answer questions about your product (see `EXAMPLE_ANSWERS.md` for guidance)
2. **Prompt 2**: AI generates all JSON content (bilingual EN/ES)
3. **Prompt 3**: Review, test, and deploy

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## Who Is This For?

- **Solopreneurs** validating SaaS ideas quickly
- **Indie hackers** who want professional landing pages without design skills
- **Developers** tired of building the same boilerplate
- **Anyone** who wants to test market demand before building

## Example Use Cases

- Validate a new SaaS concept with a waitlist
- Create a landing page for a side project
- Build client landing pages quickly
- Learn Next.js patterns with a real-world example

## What's NOT Included

- User authentication (this is for pre-launch validation)
- Payment processing (add Stripe when you're ready)
- Admin dashboard (you'll build this when you have users)

This template is intentionally focused on one thing: getting your idea in front of potential customers fast.

---

**Ready to validate your SaaS idea?**

Download the template, run 3 prompts, and have your landing page live in 20 minutes.
