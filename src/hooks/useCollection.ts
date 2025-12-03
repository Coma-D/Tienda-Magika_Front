import { useState, useEffect, useCallback } from 'react';
import { CollectionCard, Card, CardSource } from '../types';

export interface CollectionState {
  cards: CollectionCard[];
  addToCollection: (card: Card, source?: CardSource, quantity?: number) => void;
  removeFromCollection: (cardId: string) => void;
  removeQuantityFromCollection: (cardId: string, quantityToRemove: number) => void;
  updateCollectionCard: (updatedCard: CollectionCard) => void; // <--- Tipo CollectionCard
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

  // Helper para recargar el estado desde el backend (Fuente Única de Verdad)
  const fetchCollection = useCallback(async () => {
    if (!userId) {
      setCards([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    try {
      // 1. EFECTO DE CARGA: SOLO DESDE LA API ("NUBE")
      const response = await fetch(`/api/v1/collection/${userId}`);
      
      if (response.ok) {
        const cloudData = await response.json();
        // Filtrar datos nulos o incorrectos y actualizar el estado
        setCards(Array.isArray(cloudData) ? cloudData.filter((c: any) => c.id) : []);
      } else {
        console.error(`Error ${response.status} al cargar colección:`, await response.text());
        setCards([]); 
      }
    } catch (error) {
      console.error("Error de red al cargar colección:", error);
      setCards([]);
    } finally {
      setIsLoaded(true);
    }
  }, [userId]);

  // Se ejecuta solo al montar o si el userId cambia para cargar la colección
  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  // 2. EFECTO DE GUARDADO: ELIMINADO. El guardado es asíncrono en el backend.

  // --- LÓGICA DE SINCRONIZACIÓN (Se mantiene, solo afecta al estado local en tiempo real) ---
  const syncCollectionWithCatalog = (catalogCards: Card[]) => {
    setCards(prevCards => {
      let hasChanges = false;
      const newCards = prevCards.map(collectionCard => {
        if (collectionCard.source === 'catalog' && collectionCard.originalId) {
          const catalogItem = catalogCards.find(c => c.id === collectionCard.originalId);
          if (catalogItem) {
            const isDifferent = 
              catalogItem.name !== collectionCard.name ||
              catalogItem.price !== collectionCard.price; 
            
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

  // --- ACCIONES ASÍNCRONAS Y PERSISTENTES AL BACKEND ---

  const addToCollection = async (card: Card, source: CardSource = 'catalog', quantityToAdd: number = 1) => {
    if (!userId) return;

    try {
      const payload = {
        userId,
        card,
        source,
        quantity: quantityToAdd
      };

      const response = await fetch(`/api/v1/collection/add-or-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error al añadir carta: ${response.statusText}`);
      }

      // Recargar la colección desde el backend para obtener el estado oficial
      fetchCollection();

    } catch (error) {
      console.error("Fallo al añadir carta:", error);
    }
  };

  const removeQuantityFromCollection = async (cardId: string, quantityToRemove: number) => {
    if (!userId) return;

    try {
      const payload = {
        userId,
        cardId, 
        quantityToRemove, 
      };

      const response = await fetch(`/api/v1/collection/remove-quantity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error al quitar cantidad: ${response.statusText}`);
      }

      fetchCollection();

    } catch (error) {
      console.error("Fallo al quitar cantidad:", error);
    }
  };
  
  const removeFromCollection = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || !card.quantity) return;
    
    // Llamar a removeQuantityFromCollection con la cantidad total para eliminar la instancia
    removeQuantityFromCollection(cardId, card.quantity);
  };
  

  const updateCollectionCard = async (updatedCard: CollectionCard) => {
    if (!userId) return;

    try {
      const payload = {
        userId,
        updatedCard, 
      };
      
      const response = await fetch(`/api/v1/collection/update-card`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar carta: ${response.statusText}`);
      }
      
      fetchCollection();

    } catch (error) {
      console.error("Fallo al actualizar carta:", error);
    }
  };

  const toggleFavorite = async (cardId: string) => {
    if (!userId) return;

    try {
      const payload = {
        userId,
        cardId, 
      };

      const response = await fetch(`/api/v1/collection/toggle-favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error al cambiar favorito: ${response.statusText}`);
      }

      fetchCollection();

    } catch (error) {
      console.error("Fallo al cambiar favorito:", error);
    }
  };
  
  const getCollectionStats = () => {
    const totalCards = cards.reduce((acc, card) => acc + (card.quantity || 1), 0);
    const sets = new Set(cards.map(card => card.set));
    const favoriteCards = cards.filter(card => card.isFavorite).length;
    // Aseguramos que price es un número para la suma
    const totalValue = cards.reduce((acc, card) => acc + (Number(card.price) * (card.quantity || 1)), 0); 
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