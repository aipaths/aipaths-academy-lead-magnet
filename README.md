# AIPaths Academy Lead Magnets

This repository contains downloadable resources (lead magnets) for AIPaths Academy. These are high-value content pieces designed to help developers accelerate their AI development skills.

## Purpose

Lead magnets are free, downloadable resources that provide immediate value to our community while helping build our email list and engagement. Each lead magnet includes:

- A Spanish landing page (Spanish-only policy, GON-150 — new lead magnets ship `.es.md` only; some older lead magnets also have a legacy `.en.md`, which stays published but isn't required for new ones)
- Practical configuration files and templates
- Setup instructions and documentation
- Ready-to-use code examples

## Repository Structure

```
AIPaths_Academy_Lead_Magnets/
├── 002_ai-agents-config/          # AI Agents Configuration Pack (legacy: EN + ES)
│   ├── 002_ai-agents-config.en.md
│   ├── 002_ai-agents-config.es.md
│   ├── README.md
│   └── agents/                    # Sample agent configs
├── 014_agentes-finanzas/          # Agentes para tus gastos (Spanish only)
│   ├── 014_agentes-finanzas.es.md # Landing page (not included in the ZIP)
│   ├── README.md                  # Setup instructions (included in the ZIP)
│   ├── agents/                    # Payload: ready-to-use agents
│   ├── apps-script/               # Payload
│   ├── prompts/                   # Payload
│   └── datos/                     # Payload
└── README.md                      # This file
```

## Naming Conventions

- Folders: `XXX_kebab-case-name/` (e.g., `014_agentes-finanzas/`)
- Landing pages: `XXX_slug.{locale}.md` (e.g., `014_agentes-finanzas.es.md`)
- Locale codes: `en` (English, legacy/optional), `es` (Spanish, required)

## Frontmatter Structure

Each landing page includes metadata:

```yaml
---
content_id: lead-magnets-your-slug
title: Lead Magnet Title
description: Brief description
category: category-name
tags: [tag1, tag2, tag3]
difficulty: beginner|intermediate|advanced
version: 1.0.0
published: true|false
locale: en|es
order: 1
lastUpdated: 'YYYY-MM-DD'
author: AIPaths Academy
downloadSize: 'X.X MB'
estimatedSetupTime: 'X minutes'
coverImage: /images/resources/XXX_slug/thumb.png
prerequisites:
  - Requirement 1
  - Requirement 2
files:
  - path: folder/
    description: What's inside
---
```

`content_id` is required (the validator fails without it): `lead-magnets-` plus the
kebab-case name without the number, e.g. `lead-magnets-agentes-finanzas`. It is the
same in the `.es.md` and in the legacy `.en.md` of a resource.

## Three Rules That Are Easy to Break

**The landing page lives exactly one level deep.** The website scanner reads
`<slug>/<slug>.<locale>.md` and nothing deeper. Everything below that is payload
— the files the visitor gets in the ZIP — and is never parsed.

This is not an optimization. A resource can legitimately ship markdown of its
own (an agent pack, for instance), and that markdown can carry frontmatter that
is valid for its own tool but not valid YAML. Before the depth limit existed,
one such file threw during the scan and the catalog came back empty: the whole
resources page rendered "No se encontraron recursos". Deep markdown is fine —
just never expect it to be read.

**Cover images do not go in the resource folder.** The download ZIP is built
from the entire folder, so an image parked inside it ships to the user. Covers
belong in the main website repo under `public/images/resources/`, and
`coverImage` points at that public path.

**`published: false` unlists, it does not unpublish.** The resource disappears
from the catalog listing, but its URL and its download keep working. That is
deliberate: links already out in YouTube descriptions, emails and the funnel
must not start 404ing. To actually retire a resource, the link has to be
retired too.

## Creating New Lead Magnets

1. Create a new folder with naming convention `XXX_kebab-case/`
2. Add `.es.md` (required). Do not create a new `.en.md` — EN is legacy/optional (GON-150)
3. Include a README.md with setup instructions
4. Add all necessary files, configs, and templates
5. Test the setup process thoroughly
6. Commit with descriptive message

## Integration with Main Website

These lead magnets are referenced from the main AIPaths Academy website. Landing pages are consumed by:

- Resource library pages
- Blog post CTAs
- Email campaigns
- Social media promotions

## License

All content in this repository is proprietary to AIPaths Academy.

## Support

For questions or issues, contact the AIPaths Academy team.

