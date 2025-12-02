import { useState, useEffect } from 'react';
import { CollectionCard, Card, CardSource } from '../types';

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
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. EFECTO DE CARGA: AHORA DESDE LA API ("NUBE")
  useEffect(() => {
    const fetchCollection = async () => {
      if (!userId) {
        setCards([]);
        setIsLoaded(false);
        return;
      }

      try {
        // [CAMBIO CRÍTICO] Pedimos los datos al Backend, no al LocalStorage
        const response = await fetch(`/api/v1/collection/${userId}`);
        
        if (response.ok) {
          const cloudData = await response.json();
          // Si la API devuelve datos, los usamos. Si no, array vacío.
          setCards(Array.isArray(cloudData) ? cloudData : []);
        } else {
          // Fallback silencioso si la API falla (o usuario nuevo)
          console.warn("No se pudo cargar la colección de la nube.");
          setCards([]);
        }
      } catch (error) {
        console.error("Error de red al cargar colección:", error);
        setCards([]);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchCollection();
  }, [userId]);

  // 2. EFECTO DE GUARDADO: SE MANTIENE LOCALSTORAGE COMO "CACHÉ" (OPCIONAL)
  // Pero idealmente, cada acción de agregar/borrar debería también avisar al backend.
  // Por simplicidad en este prototipo híbrido, mantendremos la sincronización local
  // para persistencia rápida, pero la carga inicial (arriba) ya prioriza la nube.
  useEffect(() => {
    if (userId && isLoaded) {
      localStorage.setItem(`collection_${userId}`, JSON.stringify(cards));
    }
  }, [cards, userId, isLoaded]);

  // --- LÓGICA DE SINCRONIZACIÓN (Se mantiene igual) ---
  const syncCollectionWithCatalog = (catalogCards: Card[]) => {
    setCards(prevCards => {
      let hasChanges = false;
      const newCards = prevCards.map(collectionCard => {
        if (collectionCard.source === 'catalog' && collectionCard.originalId) {
          const catalogItem = catalogCards.find(c => c.id === collectionCard.originalId);
          if (catalogItem) {
            // Copiamos lógica de comparación para no saturar el render
            const isDifferent = 
              catalogItem.name !== collectionCard.name ||
              catalogItem.price !== collectionCard.price; // Simplificado para el ejemplo
            
            if (isDifferent) {
              hasChanges = true;
              return { ...collectionCard, ...catalogItem };
            }
          }
        }
        return collectionCard;
      });
      return hasChanges ? newCards : prevCards;
    });
  };

  // --- ACCIONES (SOLO LOCALES POR AHORA) ---
  // Nota: En una app real completa, addToCollection debería hacer un POST a /api/v1/collection/add
  // Por ahora, dejaremos que el Checkout (que ya hace POST) maneje las compras reales,
  // y este método maneje las agregaciones manuales del catálogo.

  const addToCollection = (card: Card, source: CardSource = 'catalog') => {
    setCards(prevCards => {
      // Lógica de agrupación por ID original
      const existingIndex = prevCards.findIndex(c => c.originalId === card.id && c.source === source);
      
      if (existingIndex >= 0) {
        const updated = [...prevCards];
        updated[existingIndex] = {
            ...updated[existingIndex], 
            quantity: (updated[existingIndex].quantity || 1) + 1
        };
        return updated;
      } else {
        const newCard: CollectionCard = {
            ...card,
            originalId: card.id, // Importante para sync
            id: `${card.id}-${Date.now()}`, // ID único de instancia
            source,
            quantity: 1,
            isFavorite: false,
            addedAt: new Date().toISOString()
        };
        return [...prevCards, newCard];
      }
    });
  };

  const removeFromCollection = (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  };

  const removeQuantityFromCollection = (cardId: string, qty: number) => {
    setCards(prev => {
        const target = prev.find(c => c.id === cardId);
        if (!target) return prev;
        if (target.quantity && target.quantity > qty) {
            return prev.map(c => c.id === cardId ? { ...c, quantity: c.quantity! - qty } : c);
        }
        return prev.filter(c => c.id !== cardId);
    });
  };

  const updateCollectionCard = (updatedCard: Card) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? { ...c, ...updatedCard } : c));
  };

  const toggleFavorite = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  const getCollectionStats = () => {
    const totalCards = cards.reduce((acc, card) => acc + (card.quantity || 1), 0);
    const sets = new Set(cards.map(card => card.set));
    const favoriteCards = cards.filter(card => card.isFavorite).length;
    const totalValue = cards.reduce((acc, card) => acc + (card.price * (card.quantity || 1)), 0);
    return { totalCards, completeSets: sets.size, favoriteCards, totalValue };
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