import { useState, useEffect } from 'react';
import { CollectionCard, Card, CardSource } from '../types';

// Exportamos la interfaz para usarla en otros componentes
export interface CollectionState {
  cards: CollectionCard[];
  addToCollection: (card: Card, source?: CardSource) => void;
  removeFromCollection: (cardId: string) => void;
  removeQuantityFromCollection: (cardId: string, quantityToRemove: number) => void;
  updateCollectionCard: (updatedCard: Card) => void;
  toggleFavorite: (cardId: string) => void;
  syncCollectionWithCatalog: (catalogCards: Card[]) => void;
  getCollectionStats: () => {
    totalCards: number;
    completeSets: number;
    favoriteCards: number;
    totalValue: number;
  };
}

export const useCollection = (userId?: string): CollectionState => {
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // Nuevo estado para controlar la carga inicial

  // Efecto de CARGA
  useEffect(() => {
    if (userId) {
      const savedCollection = localStorage.getItem(`collection_${userId}`);
      if (savedCollection) {
        try {
          setCards(JSON.parse(savedCollection));
        } catch (e) {
          console.error("Error parsing collection", e);
        }
      }
      setIsLoaded(true); // Marcamos como cargado incluso si no había datos (array vacío)
    }
  }, [userId]);

  // Efecto de GUARDADO
  useEffect(() => {
    // Solo guardamos si ya se cargó la data inicial para evitar sobrescribir con [] al inicio
    if (userId && isLoaded) {
      localStorage.setItem(`collection_${userId}`, JSON.stringify(cards));
    }
  }, [cards, userId, isLoaded]);

  const syncCollectionWithCatalog = (catalogCards: Card[]) => {
    setCards(prevCards => {
      let hasChanges = false;
      const newCards = prevCards.map(collectionCard => {
        if (collectionCard.source === 'catalog' && collectionCard.originalId) {
          const catalogItem = catalogCards.find(c => c.id === collectionCard.originalId);
          
          if (catalogItem) {
            const isDifferent = 
              catalogItem.name !== collectionCard.name ||
              catalogItem.image !== collectionCard.image ||
              catalogItem.price !== collectionCard.price ||
              catalogItem.description !== collectionCard.description ||
              catalogItem.rarity !== collectionCard.rarity ||
              catalogItem.color !== collectionCard.color ||
              catalogItem.type !== collectionCard.type ||
              catalogItem.set !== collectionCard.set ||
              catalogItem.manaCoat !== collectionCard.manaCoat ||
              catalogItem.attack !== collectionCard.attack ||
              catalogItem.defense !== collectionCard.defense;

            if (isDifferent) {
              hasChanges = true;
              return {
                ...collectionCard,
                name: catalogItem.name,
                image: catalogItem.image,
                price: catalogItem.price,
                description: catalogItem.description,
                rarity: catalogItem.rarity,
                color: catalogItem.color,
                type: catalogItem.type,
                set: catalogItem.set,
                manaCoat: catalogItem.manaCoat,
                attack: catalogItem.attack,
                defense: catalogItem.defense
              };
            }
          }
        }
        return collectionCard;
      });

      return hasChanges ? newCards : prevCards;
    });
  };

  const getCardSignature = (card: Card | CollectionCard) => {
    return JSON.stringify({
      catalogId: (card as CollectionCard).originalId || card.id.split('-')[0],
      name: card.name,
      set: card.set,
      condition: card.condition || 'Mint',
      price: 'ignore', // Ignoramos precio en la firma base
      rarity: card.rarity,
      color: card.color,
      type: card.type,
      manaCoat: card.manaCoat,
      image: card.image,
      description: card.description
    });
  };

  const addToCollection = (card: Card, source: CardSource = 'catalog') => {
    setCards(prevCards => {
      const signatureToAdd = JSON.stringify({
        originalId: card.id,
        condition: card.condition || 'Mint',
        source: source,
        price: source === 'catalog' ? 'dynamic' : card.price 
      });

      const existingCardIndex = prevCards.findIndex(c => {
        const sig = JSON.stringify({
          originalId: c.originalId || c.id.split('-')[0],
          condition: c.condition || 'Mint',
          source: c.source || 'catalog',
          price: c.source === 'catalog' ? 'dynamic' : c.price
        });
        return sig === signatureToAdd;
      });
      
      if (existingCardIndex >= 0) {
        const newCards = [...prevCards];
        newCards[existingCardIndex] = {
          ...newCards[existingCardIndex],
          quantity: (newCards[existingCardIndex].quantity || 1) + 1
        };
        return newCards;
      } else {
        const newCollectionCard: CollectionCard = {
          ...card,
          id: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          originalId: card.id,
          source: source,
          isFavorite: false,
          addedAt: new Date().toISOString(),
          quantity: 1,
          condition: card.condition || 'Mint'
        };
        return [...prevCards, newCollectionCard];
      }
    });
  };

  const removeFromCollection = (cardId: string) => {
    setCards(prevCards => {
      const existingCard = prevCards.find(c => c.id === cardId);
      if (!existingCard) return prevCards;

      if (existingCard.quantity > 1) {
        return prevCards.map(c => 
          c.id === cardId 
            ? { ...c, quantity: c.quantity - 1 }
            : c
        );
      }
      return prevCards.filter(card => card.id !== cardId);
    });
  };

  const removeQuantityFromCollection = (cardId: string, quantityToRemove: number) => {
    setCards(prevCards => {
      const existingCard = prevCards.find(c => c.id === cardId);
      if (!existingCard) return prevCards;

      if (existingCard.quantity > quantityToRemove) {
        return prevCards.map(c => 
          c.id === cardId 
            ? { ...c, quantity: c.quantity - quantityToRemove }
            : c
        );
      }
      return prevCards.filter(card => card.id !== cardId);
    });
  };

  const updateCollectionCard = (updatedCard: Card) => {
    setCards(prevCards => 
      prevCards.map(c => c.id === updatedCard.id ? { ...c, ...updatedCard } : c)
    );
  };

  const toggleFavorite = (cardId: string) => {
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFavorite: !card.isFavorite } : card
      )
    );
  };

  const getCollectionStats = () => {
    const totalCards = cards.reduce((acc, card) => acc + (card.quantity || 1), 0);
    const sets = new Set(cards.map(card => card.set));
    const completeSets = sets.size;
    const favoriteCards = cards.filter(card => card.isFavorite).length;
    const totalValue = cards.reduce((acc, card) => acc + (card.price * (card.quantity || 1)), 0);

    return { totalCards, completeSets, favoriteCards, totalValue };
  };

  return {
    cards,
    addToCollection,
    removeFromCollection,
    removeQuantityFromCollection,
    updateCollectionCard,
    toggleFavorite,
    syncCollectionWithCatalog,
    getCollectionStats
  };
};