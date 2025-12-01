import React from 'react';
import { Card } from '../../types';
import { CardItem } from './CardItem';

interface CardGridProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  onAddToCart?: (card: Card) => void;
  onAddToCollection?: (card: Card) => void;
  showPrice?: boolean; // Nueva prop para controlar el precio en todo el grid
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onCardClick,
  onAddToCart,
  onAddToCollection,
  showPrice = true
}) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron cartas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onClick={() => onCardClick(card)}
          onAddToCart={onAddToCart}
          onAddToCollection={onAddToCollection}
          showPrice={showPrice} // Pasamos la prop
        />
      ))}
    </div>
  );
};