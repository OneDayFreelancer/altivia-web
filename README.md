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

## Complementos

Un archivo por complemento en `src/content/complements/<slug>.md` (el nombre del archivo es el slug).
Precio y stock son globales. El build falla si el frontmatter no cumple el schema (`src/content.config.ts`).

```yaml
# Frontmatter de src/content/complements/sillas.md (el cuerpo markdown es la descripción)
name: Sillas
category: mobiliario # mobiliario | audiovisual | tecnologia | servicio | otros
image:
  src: ../../assets/complements/sillas.jpg
  alt: Sillas apilables
pricing: unidad # unidad | evento | hora
price: 2 # soles
maxQuantity: 50
capacity: 1 # opcional: personas que cubre cada unidad
# maxHours: 6               # obligatorio solo con pricing: hora
```

| `pricing` | Cobro                                                          | Uso típico                |
| :-------- | :------------------------------------------------------------- | :------------------------ |
| `unidad`  | precio × cantidad, todo el alquiler                            | sillas, mesas             |
| `evento`  | cargo fijo, todo el alquiler (por unidad si `maxQuantity` > 1) | laptop, proyector, sonido |
| `hora`    | precio × horas × cantidad, dentro del horario del alquiler     | DJ, barman, payasos       |

Para ofrecerlo en un espacio, agrega el slug a `complements:` en `src/content/spaces/<espacio>.md`.
La cotización se calcula en `src/lib/quote.ts` (`buildQuote`).

## Turnos de alquiler

El espacio se alquila solo por horas, en un día, y el cliente elige un turno fijo según el día de la semana.
Los turnos van en `schedule` del frontmatter de `src/content/spaces/<espacio>.md`.

```yaml
schedule:
  default: # obligatorio: aplica a todos los días
    - "10:00-14:00"
    - "14:00-18:00"
    - "18:00-24:00"
  sabado: # opcional: reemplaza a default solo ese día
    - "10:00-16:00"
    - "16:00-24:00"
```

- Días válidos: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo`.
- Formato `"HH:MM-HH:MM"`, inicio < fin, fin máximo `24:00` (se muestra `12:00 am`).
- Un turno inválido rompe el build con error de schema (`src/content.config.ts`).
- Precio base = `priceFrom` × horas del turno. Solo se ofrece reserva si `priceUnit: hora`.

Datos de prueba: precios ficticios e imagen `placeholder.jpg`; reemplazar por las reales.
