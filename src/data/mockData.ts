import { Card, User, MarketplaceListing, ChatMessage } from '../types';

const GLOBAL_IMAGE = '/sp_res5myxp7z.jpg'; 

export const mockCards: Card[] = [
  {
    id: '1',
    name: 'Lightning Bolt',
    image: GLOBAL_IMAGE,
    rarity: 'Common',
    color: 'Red',
    type: 'Spell',
    set: 'Colección Básica 2024',
    description: 'Hace 3 puntos de daño a cualquier objetivo.',
    price: 5990,
    manaCoat: 1,
    condition: 'Mint'
  },
  {
    id: '2',
    name: 'Black Lotus',
    image: GLOBAL_IMAGE,
    rarity: 'Legendary',
    color: 'Colorless',
    type: 'Artifact',
    set: 'Alpha',
    description: 'Agrega tres maná de cualquier un color a tu reserva de maná.',
    price: 250000000000000,
    manaCoat: 0,
    condition: 'Mint'
  },
  {
    id: '3',
    name: 'Serra Angel',
    image: GLOBAL_IMAGE,
    rarity: 'Rare',
    color: 'White',
    type: 'Creature',
    set: 'Colección Básica 2024',
    description: 'Vuela, vigilancia.',
    price: 12990,
    manaCoat: 5,
    attack: 4,
    defense: 4,
    condition: 'Mint'
  },
  {
    id: '4',
    name: 'Counterspell',
    image: GLOBAL_IMAGE,
    rarity: 'Uncommon',
    color: 'Blue',
    type: 'Spell',
    set: 'Colección Básica 2024',
    description: 'Contrarresta el hechizo objetivo.',
    price: 8500,
    manaCoat: 2,
    condition: 'Mint'
  },
  {
    id: '5',
    name: 'Forest',
    image: GLOBAL_IMAGE,
    rarity: 'Common',
    color: 'Green',
    type: 'Land',
    set: 'Colección Básica 2024',
    description: 'Tierra básica - Bosque. Gira para agregar un maná verde.',
    price: 250,
    manaCoat: 0,
    condition: 'Mint'
  },
  {
    id: '6',
    name: 'Dark Ritual',
    image: GLOBAL_IMAGE,
    rarity: 'Common',
    color: 'Black',
    type: 'Spell',
    set: 'Alpha',
    description: 'Agrega tres maná negro.',
    price: 15990,
    manaCoat: 1,
    condition: 'Mint'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Rodriguez',
    username: 'alexrod', // NUEVO
    email: 'alex@example.com',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    isOnline: true
  },
  {
    id: '2',
    name: 'Sarah Chen',
    username: 'sarah_c', // NUEVO
    email: 'sarah@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    isOnline: true
  },
  {
    id: '3',
    name: 'Mike Johnson',
    username: 'mike_j', // NUEVO
    email: 'mike@example.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    isOnline: false
  }
];

export const mockListings: MarketplaceListing[] = [
  {
    id: '1',
    card: mockCards[1],
    seller: mockUsers[0],
    price: 24500000,
    condition: 'Near Mint',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    card: mockCards[2],
    seller: mockUsers[1],
    price: 11990,
    condition: 'Mint',
    createdAt: '2024-01-16'
  }
];

export const mockMessages: ChatMessage[] = [
  {
    id: '1',
    sender: mockUsers[0],
    message: '¡Hola a todos! ¡Acabo de conseguir cartas nuevas del último set!',
    timestamp: '2024-01-16T10:30:00Z'
  },
  {
    id: '2',
    sender: mockUsers[1],
    message: '¡Genial! ¿Cambias alguna de ellas?',
    timestamp: '2024-01-16T10:32:00Z'
  }
];

export const faqData = [
  {
    question: '¿Cómo puedo comprar cartas?',
    answer: 'Puedes navegar por nuestro catálogo, añadir cartas al carrito y proceder al checkout. Aceptamos tarjetas de crédito y débito.'
  },
  {
    question: '¿Cómo funciona el marketplace?',
    answer: 'En el marketplace puedes comprar cartas de otros usuarios o vender las tuyas. Solo necesitas publicar tu carta con un precio y esperar compradores.'
  },
  {
    question: '¿Puedo rastrear mis pedidos?',
    answer: 'Sí, recibirás un email de confirmación con información de seguimiento una vez que tu pedido sea procesado.'
  },
  {
    question: '¿Hay garantía en las cartas?',
    answer: 'Todas nuestras cartas vienen con garantía de autenticidad. Si recibes una carta dañada, puedes solicitar un reembolso.'
  }
];