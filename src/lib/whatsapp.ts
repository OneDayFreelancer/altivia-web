import { SITE } from '@/config/site';
import type { Quote } from '@/lib/quote';

/** Enlace de WhatsApp con el mensaje prellenado. */
export const whatsappHref = (message: string): string =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;

const money = (value: number): string => `S/ ${value.toLocaleString('es-PE')}`;

export interface QuoteMessageInput {
  spaceName: string;
  locationLabel: string;
  spaceUrl: string;
  /** Fecha legible, ej. "sábado, 15 de noviembre". */
  dateLabel: string;
  /** Horario legible, ej. "10:00 am - 2:00 pm". */
  timeRange: string;
  hours: number;
  guests: number;
  quote: Quote;
}

/** Texto de la cotización para enviar por WhatsApp (ONE-24). */
export function buildQuoteMessage(i: QuoteMessageInput): string {
  const lines = [
    'Hola, quiero cotizar este alquiler:',
    '',
    `*Espacio:* ${i.spaceName} (${i.locationLabel})`,
    i.spaceUrl,
    `*Fecha:* ${i.dateLabel}`,
    `*Horario:* ${i.timeRange} (${i.hours} ${i.hours === 1 ? 'hora' : 'horas'})`,
    `*Personas:* ${i.guests}`,
  ];

  if (i.quote.lines.length > 0) {
    lines.push('', '*Complementos:*');
    for (const l of i.quote.lines) {
      const detail = [
        l.hours !== undefined ? `${l.hours} h` : '',
        l.quantity > 1 ? `x${l.quantity}` : '',
      ]
        .filter(Boolean)
        .join(' ');
      lines.push(`- ${l.name}${detail ? ` (${detail})` : ''}: ${money(l.subtotal)}`);
    }
  }

  lines.push('', `*Total estimado:* ${money(i.quote.total)}`);
  return lines.join('\n');
}
