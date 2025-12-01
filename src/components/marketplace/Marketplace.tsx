import React, { useState } from 'react';
import { Plus, Filter, DollarSign, Trash2 } from 'lucide-react';
import { MarketplaceListing, Card } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CardDetail } from '../cards/CardDetail';
import { PublishCardForm } from './PublishCardForm';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { Toast } from '../ui/Toast';
import { CardFilters } from '../cards/CardFilters';
import { formatCLP } from '../../utils/format';
import { t } from '../../data/constants';

interface MarketplaceProps {
  listings: MarketplaceListing[];
  onAddListing: (listing: MarketplaceListing) => void;
  onRemoveListing?: (listingId: string) => void;
  availableSets: string[];
}

export const Marketplace: React.FC<MarketplaceProps> = ({ listings, onAddListing, onRemoveListing, availableSets }) => {
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const { addToCart } = useCart();
  const [showToast, setShowToast] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('Todas');
  const [selectedColor, setSelectedColor] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedSet, setSelectedSet] = useState('Todos');
  const [selectedCondition, setSelectedCondition] = useState('Todas');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = selectedRarity === 'Todas' || listing.card.rarity === selectedRarity;
    const matchesColor = selectedColor === 'Todos' || listing.card.color === selectedColor;
    const matchesType = selectedType === 'Todos' || listing.card.type === selectedType;
    const matchesSet = selectedSet === 'Todos' || listing.card.set === selectedSet;
    const matchesCondition = selectedCondition === 'Todas' || listing.condition === selectedCondition;

    const matchesPrice = (!priceRange.min || listing.price >= parseFloat(priceRange.min)) &&
                         (!priceRange.max || listing.price <= parseFloat(priceRange.max));
    
    return matchesSearch && matchesRarity && matchesColor && matchesType && matchesSet && matchesPrice && matchesCondition;
  });

  const handleBuyCard = (listing: MarketplaceListing) => {
    // Evitar comprar tus propias cartas
    if (user?.id === listing.seller.id) {
      alert("No puedes comprar tus propias cartas.");
      return;
    }

    const cardForCart = { 
      ...listing.card, 
      price: listing.price,
      condition: listing.condition 
    };
    addToCart(cardForCart, 1, 'marketplace');
    setShowToast(true);
  };

  const darkInputClasses = "w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-200 placeholder-gray-500";

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Marketplace</h1>
          <p className="text-gray-400 mt-2">Compra y vende cartas con otros jugadores</p>
        </div>
        <Button 
          onClick={() => setShowPublishForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 font-bold"
        >
          <Plus className="h-5 w-5 mr-2" /> Publicar carta
        </Button>
      </div>

      <div className="space-y-4 mb-8">
        <CardFilters
          searchTerm={searchTerm} onSearchChange={setSearchTerm}
          selectedRarity={selectedRarity} onRarityChange={setSelectedRarity}
          selectedColor={selectedColor} onColorChange={setSelectedColor}
          selectedType={selectedType} onTypeChange={setSelectedType}
          selectedSet={selectedSet} onSetChange={setSelectedSet}
          selectedCondition={selectedCondition} onConditionChange={setSelectedCondition}
          availableSets={availableSets}
        />

        <div className="bg-gray-900 rounded-xl shadow-md border border-gray-800 p-6">
          <div className="flex items-center mb-4 text-gray-200">
            <Filter className="h-4 w-4 mr-2 text-blue-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Rango de Precio</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div>
              <input
                type="number"
                placeholder="Precio Mínimo ($0)"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className={darkInputClasses}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Precio Máximo"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className={darkInputClasses}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => {
          const isMyListing = user?.id === listing.seller.id;

          return (
            <div key={listing.id} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden hover:shadow-2xl transition-all hover:border-gray-700 group">
              <div className="cursor-pointer relative overflow-hidden" onClick={() => setSelectedCard(listing.card)}>
                <img
                  src={listing.card.image}
                  alt={listing.card.name}
                  className="w-full h-64 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
                
                {/* BOTÓN DE ELIMINAR (Ahora visible en TODAS las publicaciones) */}
                {onRemoveListing && (
                  <button
                    className="absolute top-2 left-2 z-20 p-2 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-red-700 hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar abrir detalles
                      onRemoveListing(listing.id);
                    }}
                    title="Eliminar publicación"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="p-6 relative">
                <div className="absolute -top-12 right-4 bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-green-500/30 shadow-lg">
                  <span className="text-xl font-bold text-green-400">
                    {formatCLP(listing.price)}
                  </span>
                </div>

                <h3 className="font-bold text-xl text-gray-100 mb-2 truncate">{listing.card.name}</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-blue-900/30 text-blue-300 border border-blue-800">
                    {t(listing.condition)}
                  </Badge>
                  <Badge className="!bg-gray-800 !text-gray-200 !border-gray-600 border font-medium">
                    {t(listing.card.rarity)}
                  </Badge>
                </div>
                
                <div className="flex items-center mb-6 p-3 bg-gray-800/50 rounded-lg border border-gray-800">
                  <img src={listing.seller.avatar} alt={listing.seller.name} className="w-10 h-10 rounded-full mr-3 border border-gray-600 object-cover" />
                  <div>
                    <p className="text-sm font-bold text-gray-200">{listing.seller.name}</p>
                    <p className="text-xs text-gray-500">Vendedor {isMyListing ? '(Tú)' : ''}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleBuyCard(listing)} 
                  disabled={isMyListing}
                  className={`w-full font-bold h-10 shadow-lg ${isMyListing ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'}`}
                >
                  <DollarSign className="h-4 w-4 mr-2" /> {isMyListing ? 'Tu publicación' : 'Comprar ahora'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron cartas con los filtros seleccionados</p>
        </div>
      )}

      <CardDetail card={selectedCard} isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} />

      <PublishCardForm isOpen={showPublishForm} onClose={() => setShowPublishForm(false)} availableSets={availableSets} onPublish={onAddListing} />

      <Toast message="Carta añadida al carrito" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};