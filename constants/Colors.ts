// En: constants/Colors.ts

const beige = '#F5F3EF';
const sage = '#A3B2A0';
const warmBrown = '#8B6F5A';
const deepGreen = '#2F4F4F';
const onyx = '#1C1C1C';
const taupe = '#D8C8B8';

export default {
  light: {
    text: onyx,
    background: beige,
    tint: deepGreen,
    card: '#FFFFFF',
    header: beige,
    accent: sage,
    info: warmBrown,
    subtle: taupe,
    tabIconDefault: taupe,
    tabIconSelected: deepGreen,
    error: '#B00020', // Mantener un rojo estándar para errores
  },
  dark: { // Un tema oscuro coherente con la paleta
    text: beige,
    background: onyx,
    tint: sage,
    card: '#2a2a2a', // Un gris ligeramente más cálido
    header: onyx,
    accent: deepGreen,
    info: taupe,
    subtle: warmBrown,
    tabIconDefault: warmBrown,
    tabIconSelected: sage,
    error: '#CF6679',
  },
};