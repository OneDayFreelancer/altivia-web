/**
 * Textos informativos de /publicar.
 * PENDIENTE: el cliente debe confirmar beneficios, requisitos y plazo de revisión.
 */
export const REVIEW_TIME = '3 a 5 días hábiles';

export const PUBLISH_BENEFITS: readonly { title: string; text: string }[] = [
  {
    title: 'Genera ingresos',
    text: 'Alquila tu terraza en los días que no la usas.',
  },
  {
    title: 'Llega a más personas',
    text: 'Tu espacio aparece junto a los demás espacios para eventos de Altivia.',
  },
  {
    title: 'Revisión previa',
    text: 'Nuestro equipo revisa los datos y te contacta antes de publicar.',
  },
];

export const PUBLISH_REQUIREMENTS: readonly string[] = [
  'Ser propietario o tener autorización para alquilar el espacio.',
  'Que el reglamento del edificio o condominio permita el alquiler para eventos.',
  'Entregar el espacio limpio, seguro y con los servicios que declaras.',
  'Enviar fotos reales y actuales del espacio.',
  'Indicar capacidad, precio y reglas de uso verdaderos.',
];
