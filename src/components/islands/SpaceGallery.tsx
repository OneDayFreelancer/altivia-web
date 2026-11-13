import { useRef, useState } from 'preact/hooks';

export interface GalleryImage {
  src: string;
  thumb: string;
  alt: string;
}

interface Props {
  images: GalleryImage[];
  /** Ancho y alto de `src`, para reservar el espacio y evitar saltos de layout. */
  width: number;
  height: number;
}

const SWIPE_THRESHOLD = 40;

const arrow =
  'absolute top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-pill bg-white/90 text-text shadow-soft transition-colors hover:bg-white';

export default function SpaceGallery({ images, width, height }: Props) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const count = images.length;
  const multiple = count > 1;

  const go = (next: number) => setIndex((next + count) % count);

  const onKeyDown = (e: KeyboardEvent) => {
    if (!multiple) return;
    const target: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: count - 1,
    };
    if (e.key in target) {
      e.preventDefault();
      go(target[e.key]);
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) go(index + (delta < 0 ? 1 : -1));
  };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Galería de fotos"
      class="flex flex-col gap-3"
      onKeyDown={onKeyDown}
    >
      <div
        class="relative overflow-hidden rounded-card bg-surface-alt"
        style={{ aspectRatio: `${width} / ${height}`, touchAction: 'pan-y' }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={onTouchEnd}
      >
        {images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={width}
            height={height}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            class={`absolute inset-0 h-full w-full object-cover ${i === index ? '' : 'hidden'}`}
          />
        ))}

        {multiple && (
          <>
            <button
              type="button"
              class={`${arrow} left-3`}
              aria-label="Foto anterior"
              onClick={() => go(index - 1)}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              class={`${arrow} right-3`}
              aria-label="Foto siguiente"
              onClick={() => go(index + 1)}
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </div>

      {multiple && (
        <>
          <p class="sr-only" aria-live="polite">
            Foto {index + 1} de {count}
          </p>
          <ul class="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <li key={img.thumb} class="shrink-0">
                <button
                  type="button"
                  aria-label={`Ver foto ${i + 1} de ${count}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => setIndex(i)}
                  class={`block overflow-hidden rounded-md border-2 transition-colors ${i === index ? 'border-dark' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img
                    src={img.thumb}
                    alt=""
                    width={112}
                    height={75}
                    class="block h-[4.7rem] w-28 object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
