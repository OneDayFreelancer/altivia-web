import type { ImageMetadata } from 'astro';
import heroImage from '@/assets/hero.jpg';

export interface HeroContent {
  title: string;
  image: ImageMetadata;
  imageAlt: string;
}

export const HERO: HeroContent = {
  title: 'Espacios únicos para momentos inolvidables.',
  image: heroImage,
  imageAlt: 'Personas compartiendo en una terraza con parrilla al atardecer',
};
