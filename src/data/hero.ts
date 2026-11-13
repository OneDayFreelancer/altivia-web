import type { ImageMetadata } from 'astro';
import heroImage from '@/assets/hero.jpg';

export interface HeroContent {
  title: string;
  image: ImageMetadata;
  imageAlt: string;
}

export const HERO: HeroContent = {
  title: 'Build Your Future, One Property at a Time.',
  image: heroImage,
  imageAlt: 'Modern house with a pool at dusk',
};
