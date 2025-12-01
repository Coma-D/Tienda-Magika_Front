export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
export const COLORS = ['White', 'Blue', 'Black', 'Red', 'Green', 'Colorless'];
export const TYPES = ['Creature', 'Spell', 'Artifact', 'Land'];
export const CONDITIONS = ['Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played'];

export const DEFAULT_CONDITION = 'Near Mint';
export const DEFAULT_CARD_IMAGE = 'https://placehold.co/400x600/1a1a1a/ffffff?text=Sin+Imagen';

export const NAV_ITEMS = [
  { id: 'catalog', label: 'Catálogo' },
  { id: 'collection', label: 'Mi Colección' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'community', label: 'Comunidad' },
  { id: 'support', label: 'Soporte' },
];

export const TRANSLATIONS: Record<string, string> = {
  // Rarezas
  'Common': 'Común', 'Uncommon': 'Poco común', 'Rare': 'Rara', 'Epic': 'Épica', 'Legendary': 'Legendaria',
  // Colores
  'White': 'Blanco', 'Blue': 'Azul', 'Black': 'Negro', 'Red': 'Rojo', 'Green': 'Verde', 'Colorless': 'Incoloro',
  // Tipos
  'Creature': 'Criatura', 'Spell': 'Hechizo', 'Artifact': 'Artefacto', 'Land': 'Tierra',
  // Condiciones
  'Mint': 'Nueva', 'Near Mint': 'Casi Nueva', 'Lightly Played': 'Ligeramente Jugada',
  'Moderately Played': 'Moderadamente Jugada', 'Heavily Played': 'Muy Jugada',
  // Filtros Generales
  'Todas': 'Todas las Rarezas', 'Todos': 'Todos', 'Todas las Condiciones': 'Todas las Condiciones',
  // Chat
  'Online': 'En línea', 'Offline': 'Desconectado', 'General Chat': 'Chat General',
  'Type a message': 'Escribe un mensaje...', 'Search users': 'Buscar usuarios...'
};

export const RARITY_COLORS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'error'> = {
  Common: 'default', Uncommon: 'secondary', Rare: 'warning', Epic: 'error', Legendary: 'success'
};

export const t = (key: string) => TRANSLATIONS[key] || key;