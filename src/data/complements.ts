/**
 * Contenido de la sección "Complementos" de la home (ONE-27).
 * Nombre e imagen salen de la content collection `complements`; aquí se elige cuáles se muestran
 * (en orden) y su descripción corta. Sección informativa: sin "Ver más" ni detalle (no hay más
 * complementos ni página de detalle). Los complementos se agregan al reservar un espacio (ONE-23).
 * DATOS DE PRUEBA: reemplazar con la lista real del cliente.
 */
import { getEntry } from 'astro:content';

export const COMPLEMENTS_SECTION = {
  title: 'Complementos',
} as const;

export const COMPLEMENT_CARDS: readonly { slug: string; description: string }[] = [
  { slug: 'equipo-de-sonido', description: 'Parlantes con micrófono inalámbrico para tu evento.' },
  { slug: 'proyector', description: 'Proyector HD con cable HDMI para presentaciones y videos.' },
  { slug: 'laptop', description: 'Laptop lista para tus presentaciones.' },
  { slug: 'sillas', description: 'Sillas adicionales para que todos tus invitados estén cómodos.' },
];

/** Tarjetas resueltas contra la collection; omite slugs que ya no existan. */
export const getComplementCards = async () => {
  const cards = await Promise.all(
    COMPLEMENT_CARDS.map(async ({ slug, description }) => {
      const entry = await getEntry('complements', slug);
      return entry ? { name: entry.data.name, image: entry.data.image, description } : undefined;
    }),
  );
  return cards.filter((c) => c !== undefined);
};
