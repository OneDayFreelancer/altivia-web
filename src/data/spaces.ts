/**
 * DATOS DE PRUEBA. Reemplazar con la información real de alquileres
 * (espacios, locales, capacidades y precios) cuando el cliente la entregue.
 * Imágenes: Unsplash (placeholders).
 */
import jardin1 from '@/assets/spaces/jardin-1.jpg';
import parrilla1 from '@/assets/spaces/parrilla-1.jpg';
import parrilla2 from '@/assets/spaces/parrilla-2.jpg';
import parrilla3 from '@/assets/spaces/parrilla-3.jpg';
import sum1 from '@/assets/spaces/sum-1.jpg';
import sum2 from '@/assets/spaces/sum-2.jpg';
import sum3 from '@/assets/spaces/sum-3.jpg';
import type { Space, SpaceType } from '@/types/space';

export const SPACE_TYPES: readonly { value: SpaceType; label: string }[] = [
  { value: 'parrilla', label: 'Parrilla' },
  { value: 'parrilla-jardin', label: 'Parrilla Jardín' },
  { value: 'sum', label: 'SUM' },
];

export const LOCATIONS: readonly { value: string; label: string }[] = [
  { value: 'magdalena', label: 'Magdalena' },
  { value: 'miraflores', label: 'Miraflores' },
  { value: 'san-borja', label: 'San Borja' },
];

export const SPACES: readonly Space[] = [
  // Magdalena
  {
    id: 'f632a16b-2e43-4cb1-ab44-55ab55b22368',
    slug: 'parrilla-magdalena',
    type: 'parrilla',
    name: 'Parrilla Magdalena',
    location: 'magdalena',
    maxCapacity: 25,
    priceFrom: 120,
    priceUnit: 'hora',
    featured: true,
    image: parrilla1,
    imageAlt: 'Carne asada lista para servir en la parrilla de Magdalena',
  },
  {
    id: '33c225c2-7abc-44c3-958b-631e86e51179',
    slug: 'parrilla-jardin-magdalena',
    type: 'parrilla-jardin',
    name: 'Parrilla Jardín Magdalena',
    location: 'magdalena',
    maxCapacity: 40,
    priceFrom: 180,
    priceUnit: 'hora',
    featured: true,
    image: jardin1,
    imageAlt: 'Jardín con sillas y decoración floral para eventos en Magdalena',
  },
  {
    id: 'ab83ca69-eb83-4448-a6c3-ebe2bb2b4343',
    slug: 'sum-magdalena',
    type: 'sum',
    name: 'SUM Magdalena',
    location: 'magdalena',
    maxCapacity: 60,
    priceFrom: 250,
    priceUnit: 'hora',
    featured: true,
    image: sum1,
    imageAlt: 'Salón de usos múltiples con mesas redondas en Magdalena',
  },
  // Miraflores
  {
    id: '9e8aff9d-7861-4ed2-8695-c54de859e525',
    slug: 'parrilla-miraflores',
    type: 'parrilla',
    name: 'Parrilla Miraflores',
    location: 'miraflores',
    maxCapacity: 20,
    priceFrom: 150,
    priceUnit: 'hora',
    featured: true,
    image: parrilla2,
    imageAlt: 'Parrillada variada con brochetas y salsas en Miraflores',
  },
  {
    id: '8bd413e6-8050-4737-8357-cdd7f2270cb4',
    slug: 'parrilla-jardin-miraflores',
    type: 'parrilla-jardin',
    name: 'Parrilla Jardín Miraflores',
    location: 'miraflores',
    maxCapacity: 35,
    priceFrom: 200,
    priceUnit: 'hora',
    featured: false,
    image: jardin1,
    imageAlt: 'Jardín con sillas y decoración floral para eventos en Miraflores',
  },
  {
    id: '3d69bb41-665b-4207-8029-a94e86a89c3e',
    slug: 'sum-miraflores',
    type: 'sum',
    name: 'SUM Miraflores',
    location: 'miraflores',
    maxCapacity: 80,
    priceFrom: 320,
    priceUnit: 'hora',
    featured: false,
    image: sum2,
    imageAlt: 'Salón de eventos decorado con mesas puestas en Miraflores',
  },
  // San Borja
  {
    id: 'df23eff7-7d47-4dcc-9636-165f0154d006',
    slug: 'parrilla-san-borja',
    type: 'parrilla',
    name: 'Parrilla San Borja',
    location: 'san-borja',
    maxCapacity: 30,
    priceFrom: 130,
    priceUnit: 'hora',
    featured: false,
    image: parrilla3,
    imageAlt: 'Costillas a la parrilla servidas en tabla en San Borja',
  },
  {
    id: '99ebd9ea-6021-431c-8688-5cf97b242ce9',
    slug: 'parrilla-jardin-san-borja',
    type: 'parrilla-jardin',
    name: 'Parrilla Jardín San Borja',
    location: 'san-borja',
    maxCapacity: 50,
    priceFrom: 210,
    priceUnit: 'hora',
    featured: false,
    image: jardin1,
    imageAlt: 'Jardín con sillas y decoración floral para eventos en San Borja',
  },
  {
    id: '0bf45ca5-a8f3-4311-a0b7-6a07354a54d6',
    slug: 'sum-san-borja',
    type: 'sum',
    name: 'SUM San Borja',
    location: 'san-borja',
    maxCapacity: 100,
    priceFrom: 380,
    priceUnit: 'hora',
    featured: false,
    image: sum3,
    imageAlt: 'Mesa larga con arreglos florales para banquete en San Borja',
  },
];

/** Mayor capacidad registrada por tipo de espacio (para las tarjetas de categoría). */
export const maxCapacityByType = (type: SpaceType): number =>
  Math.max(...SPACES.filter((s) => s.type === type).map((s) => s.maxCapacity));

/** Espacios "más solicitados" de la home. El orden del array define el bento (grande, vertical, 2 pequeñas). */
export const FEATURED_SPACES: readonly Space[] = SPACES.filter((s) => s.featured);

/** Ruta del detalle del espacio (ONE-21). */
export const spaceHref = (space: Space): string => `/espacios/${space.slug}`;
