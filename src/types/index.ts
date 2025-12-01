export interface Card {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  color: 'White' | 'Blue' | 'Black' | 'Red' | 'Green' | 'Colorless';
  type: 'Creature' | 'Spell' | 'Artifact' | 'Land';
  set: string;
  description: string;
  price: number;
  manaCoat: number;
  attack?: number;
  defense?: number;
  condition?: 'Mint' | 'Near Mint' | 'Lightly Played' | 'Moderately Played' | 'Heavily Played';
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  password?: string; // NUEVO: Para guardar la contraseña en localStorage
}

export type CardSource = 'catalog' | 'marketplace' | 'custom';

export interface CartItem {
  card: Card;
  quantity: number;
  source: CardSource;
}

export interface MarketplaceListing {
  id: string;
  card: Card;
  seller: User;
  price: number;
  condition: 'Mint' | 'Near Mint' | 'Lightly Played' | 'Moderately Played' | 'Heavily Played';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: User;
  message: string;
  timestamp: string;
  isPrivate?: boolean;
  recipient?: User;
  read?: boolean;
}

export interface CollectionCard extends Card {
  isFavorite: boolean;
  addedAt: string;
  quantity: number;
  source: CardSource;
  originalId?: string;
}