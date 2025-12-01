import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus, X, Pencil, Save, XCircle, Upload, Trash2, Check } from 'lucide-react';
import { Card } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { formatCLP } from '../../utils/format';
import { RARITIES, COLORS, TYPES, t } from '../../data/constants';

interface CardDetailProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (card: Card, quantity: number) => void;
  onAddToCollection?: (card: Card) => void;
  onEditCard?: (updatedCard: Card) => void;
  availableSets?: string[];
  onAddSet?: (newSet: string) => void;
  onDeleteSet?: (set: string) => void;
  onDeleteCard?: (cardId: string) => void;
}

export const CardDetail: React.FC<CardDetailProps> = ({
  card, isOpen, onClose, onAddToCart, onAddToCollection, onEditCard,
  availableSets = [], onAddSet, onDeleteSet, onDeleteCard
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isCustomSet, setIsCustomSet] = useState(false);
  const [customSetInputValue, setCustomSetInputValue] = useState('');
  const [editData, setEditData] = useState<Card | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuantity(1);
    setIsEditing(false);
    setEditData(card);
    setIsCustomSet(false);
    setCustomSetInputValue('');
  }, [card]);

  if (!card || !editData) return null;

  const rarityColors = {
    Common: 'default', Uncommon: 'secondary', Rare: 'warning', Epic: 'error', Legendary: 'success'
  } as const;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleSaveChanges = () => {
    if (onEditCard && editData) {
      if (isCustomSet && customSetInputValue.trim() && onAddSet) {
        onAddSet(customSetInputValue.trim());
        editData.set = customSetInputValue.trim();
      }
      onEditCard(editData);
      setIsEditing(false);
      setIsCustomSet(false);
      setCustomSetInputValue('');
    }
  };

  const handleEditChange = (field: keyof Card, value: string | number) => {
    setEditData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  };

  const handleSetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'NEW_CUSTOM_SET') {
      setIsCustomSet(true);
      setCustomSetInputValue('');
      handleEditChange('set', '');
    } else {
      setIsCustomSet(false);
      handleEditChange('set', e.target.value);
    }
  };

  const handleSaveCustomSet = () => {
    if (customSetInputValue.trim() && onAddSet) {
      onAddSet(customSetInputValue.trim());
      handleEditChange('set', customSetInputValue.trim());
      setIsCustomSet(false);
      setCustomSetInputValue('');
    }
  };

  const handleCancelCustomSet = () => {
    setIsCustomSet(false);
    setCustomSetInputValue('');
    handleEditChange('set', availableSets.includes(editData.set) ? editData.set : availableSets[0] || '');
  };

  const handleDeleteCurrentSet = () => {
    if (isCustomSet || !editData.set || !onDeleteSet) return;
    onDeleteSet(editData.set);
    handleEditChange('set', availableSets[0] || '');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleEditChange('image', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const darkInputClasses = "bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 placeholder-gray-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-[90vw] w-full h-[85vh] overflow-hidden flex flex-col p-0 rounded-3xl shadow-2xl !bg-gray-900 !border !border-gray-800">
      <div className="flex h-full w-full">
        <div className="relative h-full w-[31.8%] flex-none bg-gray-900 flex items-center justify-center p-0 overflow-hidden rounded-l-3xl group">
          <img src={editData.image} alt={editData.name} className="relative w-full h-full max-w-full max-h-full object-contain z-10 shadow-black drop-shadow-xl" />
          {isEditing && (
            <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-12 w-12 text-white mb-2" />
              <span className="text-white font-bold">Cambiar Imagen</span>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col h-full bg-gray-900 relative min-w-0 rounded-r-3xl overflow-hidden">
          <button onClick={onClose} className="absolute top-3 right-3 z-50 p-2 bg-gray-800 hover:bg-red-900 hover:text-red-100 rounded-full transition-colors text-gray-400 shadow-sm border border-gray-700"><X className="h-5 w-5" /></button>

          <div className="flex-shrink-0 px-6 py-4 pr-14">
            <div className="flex items-center gap-2 mb-2">
              {isEditing ? (
                <Input value={editData.name} onChange={(e) => handleEditChange('name', e.target.value)} className={`text-xl font-bold ${darkInputClasses}`} />
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <h1 className="text-3xl font-bold text-gray-100 leading-tight truncate">{editData.name}</h1>
                  {onEditCard && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-blue-400 rounded-full transition-colors"><Pencil className="h-4 w-4" /></button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {isEditing ? (
                <>
                  <select value={editData.rarity} onChange={(e) => handleEditChange('rarity', e.target.value)} className={`text-xs px-2 py-1 border rounded ${darkInputClasses}`}>
                    {RARITIES.map(r => <option key={r} value={r}>{t(r)}</option>)}
                  </select>
                  <select value={editData.color} onChange={(e) => handleEditChange('color', e.target.value)} className={`text-xs px-2 py-1 border rounded ${darkInputClasses}`}>
                    {COLORS.map(c => <option key={c} value={c}>{t(c)}</option>)}
                  </select>
                  <select value={editData.type} onChange={(e) => handleEditChange('type', e.target.value)} className={`text-xs px-2 py-1 border rounded ${darkInputClasses}`}>
                    {TYPES.map(type => <option key={type} value={type}>{t(type)}</option>)}
                  </select>
                </>
              ) : (
                <>
                  <Badge variant={rarityColors[card.rarity]} className="text-xs px-2.5 py-0.5 uppercase tracking-wide">{t(card.rarity)}</Badge>
                  <Badge className="text-xs px-2.5 py-0.5 uppercase tracking-wide">{t(card.color)}</Badge>
                  <Badge className="text-xs px-2.5 py-0.5 uppercase tracking-wide">{t(card.type)}</Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex-grow px-6 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-5">
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
              <h3 className="font-bold text-gray-400 text-[10px] mb-2 uppercase tracking-widest">Texto de Reglas</h3>
              {isEditing ? (
                <textarea className={`w-full p-2 border rounded text-sm outline-none resize-none ${darkInputClasses}`} value={editData.description} onChange={(e) => handleEditChange('description', e.target.value)} rows={4} />
              ) : (
                <p className="text-gray-300 text-base leading-relaxed font-serif italic">{editData.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-1">Edición</h3>
                {isEditing ? (
                  <div className="flex gap-1">
                    {!isCustomSet ? (
                      <select value={editData.set} onChange={handleSetChange} className={`flex-1 h-9 px-2 border rounded text-sm ${darkInputClasses}`}>
                        {availableSets.map(set => <option key={set} value={set}>{set}</option>)}
                        <option disabled>──────────</option>
                        <option value="NEW_CUSTOM_SET">+ Crear nueva...</option>
                      </select>
                    ) : (
                      <Input value={customSetInputValue} onChange={(e) => setCustomSetInputValue(e.target.value)} placeholder="Nombre edición" className={`h-9 text-sm flex-1 ${darkInputClasses}`} autoFocus onKeyDown={(e) => { if(e.key === 'Enter') handleSaveCustomSet(); }} />
                    )}
                    {!isCustomSet && onDeleteSet && (
                      <button onClick={handleDeleteCurrentSet} className="p-2 text-red-400 border border-gray-700 rounded hover:bg-red-900/30"><Trash2 className="h-5 w-5" /></button>
                    )}
                    {isCustomSet && (
                      <>
                        <button onClick={handleSaveCustomSet} disabled={!customSetInputValue.trim()} className="p-2 text-blue-400 border border-blue-900 rounded hover:bg-blue-900/30 disabled:opacity-50"><Check className="h-5 w-5" /></button>
                        <button onClick={handleCancelCustomSet} className="p-2 text-gray-400 border border-gray-700 rounded hover:bg-gray-800"><X className="h-5 w-5" /></button>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-200 font-semibold text-base truncate">{editData.set}</p>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-1">Coste</h3>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input type="number" value={editData.manaCoat} onChange={(e) => handleEditChange('manaCoat', parseInt(e.target.value))} className={`h-9 text-sm w-20 ${darkInputClasses}`} onKeyDown={handlePriceKeyDown} />
                    <span className="text-gray-400 text-sm">Mana</span>
                  </div>
                ) : (
                  <p className="text-gray-200 font-semibold text-base">{editData.manaCoat} Mana</p>
                )}
              </div>
              {isEditing && (
                <div className="col-span-2 pt-2">
                  <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Precio Base</h3>
                  <Input type="number" value={editData.price} onChange={(e) => handleEditChange('price', parseInt(e.target.value))} className={`h-9 text-sm ${darkInputClasses}`} onKeyDown={handlePriceKeyDown} />
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-800">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button onClick={handleSaveChanges} className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-base font-bold shadow-lg shadow-blue-900/20"><Save className="h-5 w-5 mr-2" /> Guardar Cambios</Button>
                  <Button onClick={() => { setIsEditing(false); setEditData(card); setIsCustomSet(false); setCustomSetInputValue(''); }} variant="secondary" className="w-full h-10 text-base font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"><XCircle className="h-5 w-5 mr-2" /> Cancelar</Button>
                </div>
                {onDeleteCard && (
                  <Button onClick={() => onDeleteCard(card.id)} variant="destructive" className="w-full h-10 text-sm mt-2 font-medium border border-red-900/30 hover:bg-red-900/50"><Trash2 className="h-4 w-4 mr-2" /> Eliminar Carta del Catálogo</Button>
                )}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5 font-bold uppercase tracking-wider">Precio Unitario</p>
                    <p className="text-lg font-bold text-gray-100">{formatCLP(editData.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 mb-0.5 font-bold uppercase tracking-wider">Total</p>
                    <p className="text-3xl font-extrabold text-green-500">{formatCLP(editData.price * quantity)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {onAddToCart && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl shadow-sm h-12">
                        <button onClick={handleDecrement} className="px-3 h-full hover:bg-gray-700 text-gray-400 rounded-l-xl disabled:opacity-50" disabled={quantity <= 1}><Minus className="h-4 w-4" /></button>
                        <span className="w-10 text-center font-bold text-lg text-gray-200">{quantity}</span>
                        <button onClick={handleIncrement} className="px-3 h-full hover:bg-gray-700 text-gray-400 rounded-r-xl"><Plus className="h-4 w-4" /></button>
                      </div>
                      <Button onClick={() => { onAddToCart(card, quantity); onClose(); }} className="flex-1 h-12 text-lg font-bold shadow-md hover:shadow-lg transition-all rounded-xl"><ShoppingCart className="h-5 w-5 mr-2" /> Comprar</Button>
                    </div>
                  )}
                  {onAddToCollection && (
                    <Button onClick={() => { onAddToCollection(card); onClose(); }} variant="secondary" className="w-full h-10 text-sm font-bold rounded-xl border border-purple-700 text-purple-300 hover:bg-purple-900/30"><Plus className="h-4 w-4 mr-2" /> Añadir a Colección</Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};