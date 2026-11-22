/**
 * Contenido de la sección "Preguntas frecuentes" de la home (ONE-29).
 * Editar aquí preguntas y respuestas; la primera inicia abierta.
 * PENDIENTE: el cliente debe confirmar las respuestas marcadas "Por definir"
 * (pagos, cancelación, horarios, qué incluye).
 */
export const FAQ_SECTION = {
  title: 'Preguntas frecuentes',
} as const;

export const FAQ_ITEMS: readonly { question: string; answer: string }[] = [
  {
    question: '¿Qué espacios puedo reservar?',
    answer:
      'Parrilla, Parrilla Jardín y SUM, cada uno con su capacidad máxima indicada en la ficha.',
  },
  {
    question: '¿Cuál es la capacidad máxima de cada espacio?',
    answer: 'Se muestra en cada tarjeta y en el detalle. No se recomienda superarla.',
  },
  {
    question: '¿Cómo solicito una cotización?',
    answer: 'Elige el espacio y los complementos, y envía tu cotización por WhatsApp con un clic.',
  },
  {
    question: '¿Qué complementos puedo agregar?',
    answer: 'Equipos, laptop y otros, con la cantidad que necesites.',
  },
  {
    question: '¿Cómo y cuándo confirmo mi reserva?',
    answer:
      'Tras la cotización, nuestro equipo confirma disponibilidad y los pasos de pago por WhatsApp.',
  },
  { question: '¿Cuáles son las formas de pago?', answer: 'Por definir.' },
  { question: '¿Puedo cancelar o reprogramar mi reserva?', answer: 'Por definir.' },
  { question: '¿Qué horarios y duración de alquiler manejan?', answer: 'Por definir.' },
  { question: '¿Incluye limpieza, mobiliario o insumos?', answer: 'Por definir.' },
];
