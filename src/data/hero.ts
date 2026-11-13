import type { ImageMetadata } from 'astro';
import heroImage from '@/assets/hero.jpg';

export interface HeroContent {
  title: string;
  tags: readonly string[];
  description: string;
  image: ImageMetadata;
  imageAlt: string;
}

export const HERO: HeroContent = {
  title: 'Build Your Future, One Property at a Time.',
  tags: ['House', 'Apartment', 'Residential'],
  description:
    'Discover properties and spaces that fit the way you live. Browse, compare and rent with confidence, all in one place.',
  image: heroImage,
  imageAlt: 'Modern house with a pool at dusk',
};
