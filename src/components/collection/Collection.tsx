import React, { useState } from 'react';
import { Star, TrendingUp, Package, Plus, AlertTriangle, ArrowLeft, User } from 'lucide-react';
import { Card, CollectionCard } from '../../types';
import { CardItem } from '../cards/CardItem';
import { CardDetail } from '../cards/CardDetail';
import { CardFilters } from '../cards/CardFilters';
import { AddCardForm } from '../cards/AddCardForm'; 
import { CollectionState } from '../../hooks/useCollection';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface CollectionProps {
  catalogSets?: string[];
  collection: CollectionState;
  isOwner?: boolean;
  userName?: string;
  onBack?: () => void;
}

export const Collection: React.FC<CollectionProps> = ({ 
  catalogSets = [], 
  collection, 
  isOwner = true, 
  userName,
  onBack
}) => {
  const { 
    cards, toggleFavorite, getCollectionStats, addToCollection, 
    removeQuantityFromCollection, updateCollectionCard 
  } = collection;

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deletingCard, setDeletingCard] = useState<CollectionCard | null>(null);
  const [deleteQuantity, setDeleteQuantity] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('Todas');
  const [selectedColor, setSelectedColor] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedSet, setSelectedSet] = useState('Todos');
  const [selectedCondition, setSelectedCondition] = useState('Todas');

  const collectionSets = Array.from(new Set(cards.map(card => card.set))).sort();

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = selectedRarity === 'Todas' || card.rarity === selectedRarity;
    const matchesColor = selectedColor === 'Todos' || card.color === selectedColor;
    const matchesType = selectedType === 'Todos' || card.type === selectedType;
    const matchesSet = selectedSet === 'Todos' || card.set === selectedSet;
    const cardCondition = card.condition || 'Mint';
    const matchesCondition = selectedCondition === 'Todas' || cardCondition === selectedCondition;
    const matchesFavorite = !showFavoritesOnly || card.isFavorite;

    return matchesSearch && matchesRarity && matchesColor && matchesType && matchesSet && matchesCondition && matchesFavorite;
  });

  const stats = getCollectionStats();

  const handleAddCustomCard = (newCard: Card) => {
    addToCollection(newCard, 'custom');
    setIsAddModalOpen(false);
  };

  const initiateDelete = (card: CollectionCard) => {
    setDeletingCard(card);
    setDeleteQuantity(1);
  };

  const confirmDelete = () => {
    if (deletingCard) {
      removeQuantityFromCollection(deletingCard.id, deleteQuantity);
      setDeletingCard(null);
      if (selectedCard?.id === deletingCard.id && deleteQuantity >= deletingCard.quantity) {
        setSelectedCard(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        
        {/* --- CABECERA DE COLECCIÓN REDISEÑADA --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-5">
            {/* Botón Volver (solo si no es owner) */}
            {!isOwner && onBack && (
              <button 
                onClick={onBack} 
                className="group p-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-blue-500 hover:bg-gray-700 transition-all shadow-lg"
                title="Volver a la comunidad"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            
            {/* Títulos y Subtítulos */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border ${isOwner ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-purple-900/30 text-purple-400 border-purple-800'}`}>
                  {isOwner ? 'TU ESPACIO' : 'VISITANDO'}
                </span>
              </div>
              
              {/* TÍTULO PRINCIPAL: CAMBIO APLICADO AQUÍ */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {isOwner ? (
                  'Mi Colección'
                ) : (
                  /* Texto de exploración como título principal */
                  <span className="text-2xl md:text-3xl font-bold">
                    Explorando el inventario público de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{userName}</span>
                  </span>
                )}
              </h1>
              
              {/* SUBTÍTULO: Solo se muestra si es el dueño (para instrucciones) */}
              {isOwner && (
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                  Gestiona y organiza tu inventario personal de cartas Magic
                </p>
              )}
            </div>
          </div>
          
          {/* Botón Añadir (Solo si es owner) */}
          {isOwner && (
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 font-bold h-12 px-6 rounded-xl">
              <Plus className="h-5 w-5 mr-2" /> Añadir Carta Propia
            </Button>
          )}
        </div>
        
        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-900/10 to-transparent"></div>
            <div className="flex items-center relative z-10">
              <div className="p-3 bg-blue-900/20 rounded-xl mr-4 border border-blue-900/30">
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Cartas</p>
                <p className="text-3xl font-black text-white mt-1">{stats.totalCards}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-green-900/10 to-transparent"></div>
            <div className="flex items-center relative z-10">
              <div className="p-3 bg-green-900/20 rounded-xl mr-4 border border-green-900/30">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sets Activos</p>
                <p className="text-3xl font-black text-white mt-1">{stats.completeSets}</p>
              </div>
            </div>
          </div>
          
          <div onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`bg-gray-900 rounded-xl p-6 border shadow-lg relative overflow-hidden group cursor-pointer transition-all duration-300 ${showFavoritesOnly ? 'border-yellow-500 ring-1 ring-yellow-500/50' : 'border-gray-800 hover:border-gray-600'}`}>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-yellow-900/10 to-transparent"></div>
            <div className="flex items-center relative z-10">
              <div className={`p-3 rounded-xl mr-4 transition-colors border ${showFavoritesOnly ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-yellow-900/20 text-yellow-500 border-yellow-900/30'}`}>
                <Star className={`h-8 w-8 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${showFavoritesOnly ? 'text-yellow-400' : 'text-gray-500'}`}>{showFavoritesOnly ? 'Filtro Activo' : 'Favoritas'}</p>
                <p className="text-3xl font-black text-white mt-1">{stats.favoriteCards}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardFilters
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        selectedRarity={selectedRarity} onRarityChange={setSelectedRarity}
        selectedColor={selectedColor} onColorChange={setSelectedColor}
        selectedType={selectedType} onTypeChange={setSelectedType}
        selectedSet={selectedSet} onSetChange={setSelectedSet}
        selectedCondition={selectedCondition} onConditionChange={setSelectedCondition}
        availableSets={collectionSets.length > 0 ? collectionSets : undefined}
      />

      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6 min-h-[400px]">
        {filteredCards.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="bg-gray-800 p-6 rounded-full mb-6 border border-gray-700">
              {showFavoritesOnly ? <Star className="h-16 w-16 text-yellow-600" /> : <Package className="h-16 w-16 text-gray-600" />}
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">{showFavoritesOnly ? 'Sin cartas favoritas' : 'Colección vacía'}</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {showFavoritesOnly ? 'Este usuario no tiene cartas favoritas.' : isOwner ? 'Aún no has añadido cartas.' : 'Este usuario aún no tiene cartas en su colección.'}
            </p>
            {isOwner && !showFavoritesOnly && (
              <div className="flex gap-4">
                <Button onClick={() => window.location.href = '/'} className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-lg border border-gray-700">Ir al Catálogo</Button>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-blue-900/20"><Plus className="h-5 w-5 mr-2" /> Añadir Manualmente</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCards.map((card) => (
              <div key={card.id} className="relative">
                <CardItem
                  card={card} onClick={() => setSelectedCard(card)}
                  isFavorite={card.isFavorite} showFavorite={true}
                  onToggleFavorite={isOwner ? () => toggleFavorite(card.id) : undefined}
                  collectionQuantity={card.quantity}
                  onRemove={isOwner ? () => initiateDelete(card) : undefined}
                  onAddToCollection={isOwner ? () => addToCollection(card) : undefined}
                  showPrice={false} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <CardDetail
        card={selectedCard} isOpen={!!selectedCard} onClose={() => setSelectedCard(null)}
        onAddToCollection={isOwner ? addToCollection : undefined} 
        onEditCard={isOwner ? updateCollectionCard : undefined}
        onDeleteCard={isOwner ? () => selectedCard && initiateDelete(selectedCard as CollectionCard) : undefined}
        availableSets={catalogSets}
      />

      {isOwner && (
        <>
          <AddCardForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCustomCard} availableSets={catalogSets.length > 0 ? catalogSets : ['Colección Básica 2024']} />

          <Modal isOpen={!!deletingCard} onClose={() => setDeletingCard(null)} className="max-w-sm !bg-gray-900 border border-gray-800" showCloseButton={false}>
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-2">Eliminar Carta</h3>
              <p className="text-gray-400 mb-6 text-sm">¿Estás seguro de que quieres eliminar <span className="font-bold text-white">"{deletingCard?.name}"</span> de tu colección?</p>
              {deletingCard && deletingCard.quantity > 1 && (
                <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 text-left">Cantidad a eliminar</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDeleteQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 text-white hover:bg-gray-600">-</button>
                    <div className="flex-1 text-center"><span className="text-xl font-bold text-white">{deleteQuantity}</span><span className="text-gray-500 text-sm ml-1">/ {deletingCard.quantity}</span></div>
                    <button onClick={() => setDeleteQuantity(q => Math.min(deletingCard.quantity, q + 1))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 text-white hover:bg-gray-600">+</button>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setDeletingCard(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-700">Cancelar</Button>
                <Button variant="destructive" onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700">{deletingCard && deletingCard.quantity > 1 && deleteQuantity < deletingCard.quantity ? `Eliminar ${deleteQuantity}` : 'Eliminar'}</Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};