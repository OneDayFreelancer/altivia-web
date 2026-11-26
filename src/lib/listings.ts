/** Solicitudes para publicar un espacio. Los límites replican los `check` de la migración. */
import { supabase } from '@/lib/supabase';

export const PROPERTY_TYPES = [
  { value: 'terraza', label: 'Terraza' },
  { value: 'parrilla', label: 'Zona de parrilla' },
  { value: 'jardin', label: 'Jardín' },
  { value: 'salon', label: 'Salón / SUM' },
] as const;

export const LISTING_AMENITIES = [
  'Parrilla a carbón',
  'Parrilla a gas',
  'Zona techada',
  'Jardín',
  'Mesas y sillas',
  'Baño',
  'Cocina',
  'Zona de lavado',
  'Wifi',
  'Estacionamiento',
] as const;

export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const BUCKET = 'listing-photos';

export interface NewListing {
  title: string;
  propertyType: string;
  district: string;
  address: string;
  maxCapacity: number;
  pricePerTurn: number;
  description: string;
  amenities: string[];
  contactPhone: string;
}

/** Mensaje de error de las fotos elegidas, o `undefined` si son válidas. */
export function validatePhotos(files: File[]): string | undefined {
  if (files.length === 0) return 'Sube al menos una foto.';
  if (files.length > MAX_PHOTOS) return `Máximo ${MAX_PHOTOS} fotos.`;
  if (files.some((f) => !PHOTO_EXTENSIONS[f.type])) return 'Solo fotos JPG, PNG o WebP.';
  if (files.some((f) => f.size > MAX_PHOTO_BYTES)) return 'Cada foto debe pesar máximo 5 MB.';
  return undefined;
}

/** Sube las fotos y registra la solicitud. Si algo falla, borra lo subido. */
export async function createListing(
  input: NewListing,
  files: File[],
  userId: string,
): Promise<void> {
  const folder = `${userId}/${crypto.randomUUID()}`;
  const uploaded: string[] = [];
  const bucket = supabase.storage.from(BUCKET);
  try {
    for (const [i, file] of files.entries()) {
      const path = `${folder}/${i + 1}.${PHOTO_EXTENSIONS[file.type]}`;
      const { error } = await bucket.upload(path, file, { contentType: file.type });
      if (error) throw error;
      uploaded.push(path);
    }
    const { error } = await supabase.from('property_listings').insert({
      user_id: userId,
      title: input.title,
      property_type: input.propertyType,
      district: input.district,
      address: input.address,
      max_capacity: input.maxCapacity,
      price_per_turn: input.pricePerTurn,
      description: input.description,
      amenities: input.amenities,
      contact_phone: input.contactPhone,
      photos: uploaded,
    });
    if (error) throw error;
  } catch (e) {
    if (uploaded.length > 0) await bucket.remove(uploaded);
    throw e;
  }
}
