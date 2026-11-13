# Altivia Web

Astro 7 · Tailwind v4 · Preact · TypeScript · Biome · pnpm

## Comandos

| Comando        | Acción                             |
| :------------- | :--------------------------------- |
| `pnpm install` | Instala dependencias               |
| `pnpm dev`     | Servidor local en `localhost:4321` |
| `pnpm lint`    | Biome (lint + formato + imports)   |
| `pnpm format`  | Biome con autocorrección           |
| `pnpm check`   | Tipos con `astro check`            |
| `pnpm build`   | Build estático en `dist/`          |

Copia `.env.example` a `.env` y completa `PUBLIC_WHATSAPP_NUMBER`.

## Arquitectura

Sigue la estructura oficial de Astro (`src/pages`, `layouts`, `components`, `styles`, `assets`),
con capas explícitas por responsabilidad.

```text
src/
├── pages/              Rutas (solo componen secciones; sin lógica de negocio)
├── layouts/            Estructura HTML compartida (BaseLayout)
├── components/
│   ├── ui/             Piezas reutilizables sin contexto de negocio (Button, Chip, Card)
│   ├── sections/       Bloques de página (Hero, Buscador, Métricas…) que usan ui/
│   └── islands/        Componentes Preact interactivos (client:*)
├── config/             Constantes del sitio (nombre, navegación, WhatsApp)
├── data/               Contenido estático tipado (propiedades, complementos, métricas)
├── lib/                Funciones puras (precios, cotización, formato). Sin Astro/DOM
├── types/              Tipos compartidos
├── styles/             CSS global y tokens de Tailwind (`@theme`)
└── assets/             Imágenes procesadas por Astro (`astro:assets`)
public/                 Archivos servidos tal cual (favicon, robots.txt)
```

### Reglas de dependencia

`pages` → `sections` → `ui` → `lib`/`config`/`types`

- Una capa solo importa de las que están a su derecha. `lib`, `config` y `types` no importan componentes.
- `islands/` se usa solo si hay interactividad; lo demás es Astro sin JS en el cliente.
- Importar con el alias `@/` (ej. `@/components/ui/Button.astro`).
- Contenido editable va en `data/` (o content collections cuando haya listados reales), no en los componentes.
