import React from 'react';
import { ShoppingCart, Plus, Heart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCLP } from '../../utils/format';
import { RARITY_COLORS } from '../../data/constants';

interface CardItemProps {
  card: Card;
  onClick: () => void;
  onAddToCart?: (card: Card) => void;
  onAddToCollection?: (card: Card) => void;
  onRemove?: () => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  collectionQuantity?: number;
  showPrice?: boolean; 
}

export const CardItem: React.FC<CardItemProps> = ({
  card, onClick, onAddToCart, onAddToCollection, onRemove,
  showFavorite, isFavorite, onToggleFavorite, collectionQuantity, showPrice = true
}) => {
  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    action?.();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-800 flex flex-col h-full relative"
      onClick={onClick}
    >
      <div className="relative w-full aspect-[63/88] bg-gray-800 overflow-hidden">
        <img
          src={card.image}
          alt={card.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10">
          <Badge 
            variant={RARITY_COLORS[card.rarity] || 'default'} 
            className="shadow-lg backdrop-blur-md !bg-gray-900/90 !text-white border !border-white/20 font-bold"
          >
            {card.rarity}
          </Badge>
          
          {collectionQuantity && collectionQuantity > 1 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-white">
              x{collectionQuantity}
            </span>
          )}
        </div>

        {showFavorite && (
          <button
            onClick={(e) => handleAction(e, onToggleFavorite)}
            className={`absolute top-2 left-2 p-2 rounded-full z-10 shadow-lg backdrop-blur-md transition-all duration-300 ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-red-500'
            }`}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow bg-gray-900 relative">
        <div className="mb-2">
          <h3 className="font-bold text-gray-200 text-lg leading-tight truncate group-hover:text-blue-400 transition-colors">
            {card.name}
          </h3>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-1">{card.set}</p>
        </div>
        
        <div className="mt-auto relative h-10 flex items-center">
          {showPrice && (
            <span className="text-lg font-extrabold text-gray-200 tracking-tight truncate block w-full pr-2" title={formatCLP(card.price)}>
              {formatCLP(card.price)}
            </span>
          )}
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2 z-20">
            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              {onRemove && (
                <Button size="sm" variant="destructive" onClick={(e) => handleAction(e, onRemove)} className="h-9 w-9 p-0 rounded-lg shadow-sm" title="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {onAddToCart && (
                <Button size="sm" onClick={(e) => handleAction(e, () => onAddToCart(card))} className="h-9 w-9 p-0 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/50 shadow-md border-transparent" title="Añadir al carrito">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
              {onAddToCollection && (
                <Button size="sm" variant="secondary" onClick={(e) => handleAction(e, () => onAddToCollection(card))} className="h-9 w-9 p-0 rounded-lg bg-purple-900/50 text-purple-300 border border-purple-700 hover:bg-purple-600 hover:text-white hover:border-purple-500 shadow-sm transition-all" title="Coleccionar">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};