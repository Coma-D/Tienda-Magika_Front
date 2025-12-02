import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Card, CardSource } from '../types';
import { useAuth } from '../hooks/useAuth'; // Importar para obtener el userId

interface CartContextType {
  items: CartItem[];
  addToCart: (card: Card, quantity?: number, source?: CardSource) => void; 
  removeFromCart: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // ----------------------------------------------------------------------
  // FUNCIÓN PARA CARGAR CARRITO DESDE LA NUBE (AL LOGUEARSE)
  // ----------------------------------------------------------------------
  const fetchCartFromBackend = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setItems([]); // Vacía si no hay usuario o si no está autenticado
      return;
    }

    try {
      const res = await fetch(`/api/v1/cart/${user.id}`);
      if (res.ok) {
        const data: CartItem[] = await res.json();
        setItems(data);
      } else {
        console.error("Failed to fetch cart from backend:", res.status);
      }
    } catch (error) {
      console.error("Network error fetching cart:", error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCartFromBackend();
  }, [fetchCartFromBackend]);


  // ----------------------------------------------------------------------
  // FUNCIÓN PARA MODIFICAR EL CARRITO EN LA NUBE
  // ----------------------------------------------------------------------
  const updateBackendCart = useCallback(async (endpoint: string, payload: any) => {
    if (!user) return false;
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...payload }),
      });

      if (res.ok) {
        const updatedCart: CartItem[] = await res.json();
        setItems(updatedCart); // Usamos la respuesta del backend para actualizar el estado
        return true;
      } else {
        console.error(`Backend error on cart operation: ${res.status}`);
        return false;
      }
    } catch (error) {
      console.error("Network error updating cart:", error);
      return false;
    }
  }, [user]);

  
  // ----------------------------------------------------------------------
  // IMPLEMENTACIÓN DE MÉTODOS PÚBLICOS
  // ----------------------------------------------------------------------

  const addToCart = (card: Card, quantity: number = 1, source: CardSource = 'catalog') => {
    if (!user) {
        alert("Debes iniciar sesión para añadir ítems al carrito.");
        return;
    }
    // Llama al nuevo endpoint centralizado
    updateBackendCart('/api/v1/cart/add', { card, quantity, source });
  };

  const removeFromCart = (cardId: string) => {
    if (!user) return;
    // Llama al nuevo endpoint para eliminar el ítem completo
    updateBackendCart('/api/v1/cart/remove', { cardId, quantity: -10000 }); // Usamos un número grande para simular eliminación total
  };

  const updateQuantity = (cardId: string, quantity: number) => {
    if (!user) return;
    
    // Calcula la diferencia de cantidad para el payload del backend
    const currentItem = items.find(item => item.card.id === cardId);
    if (!currentItem) return;
    
    const quantityChange = quantity - currentItem.quantity;

    if (quantity <= 0) {
        removeFromCart(cardId);
    } else {
        // Llama al endpoint de adición con el cambio necesario
        updateBackendCart('/api/v1/cart/add', { card: currentItem.card, quantity: quantityChange, source: currentItem.source });
    }
  };

  const clearCart = () => {
    // Para simplificar, si limpiamos el carrito, simplemente eliminamos todos los ítems
    if (!user) return;
    const itemIds = items.map(item => item.card.id);
    itemIds.forEach(id => removeFromCart(id));
  };


  // El cálculo del total se mantiene en el frontend para eficiencia
  const total = items.reduce((sum, item) => sum + (item.card.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};