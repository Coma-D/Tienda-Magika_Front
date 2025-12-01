import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, X, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { MarketplaceListing, Card } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { formatCLP } from '../../utils/format';
import { RARITIES, COLORS, TYPES, CONDITIONS, t } from '../../data/constants';

interface PublishCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  availableSets?: string[];
  onPublish: (listing: MarketplaceListing) => void;
}

export const PublishCardForm: React.FC<PublishCardFormProps> = ({ 
  isOpen, onClose, availableSets = [], onPublish
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCustomSet, setIsCustomSet] = useState(false);
  const [customSetInputValue, setCustomSetInputValue] = useState('');

  const [formData, setFormData] = useState({
    cardName: '', price: '', description: '', imageUrl: '',
    rarity: 'Common', color: 'Colorless', type: 'Creature', condition: 'Near Mint',
    set: availableSets[0] || 'Colección Básica 2024', manaCoat: '0'
  });

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const finalImage = formData.imageUrl || 'https://placehold.co/400x600/1a1a1a/ffffff?text=Sin+Imagen';
    const newCard: Card = {
      id: Date.now().toString(),
      name: formData.cardName,
      image: finalImage,
      rarity: formData.rarity as any,
      color: formData.color as any,
      type: formData.type as any,
      set: formData.set || 'Sin Edición',
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      manaCoat: parseInt(formData.manaCoat) || 0,
    };

    const newListing: MarketplaceListing = {
      id: `listing_${Date.now()}`,
      card: newCard,
      seller: user,
      price: parseFloat(formData.price) || 0,
      condition: formData.condition as any,
      createdAt: new Date().toISOString()
    };

    onPublish(newListing);
    setLoading(false);
    setStep('success');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange('imageUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      cardName: '', price: '', description: '', imageUrl: '',
      rarity: 'Common', color: 'Colorless', type: 'Creature', condition: 'Near Mint',
      set: availableSets[0] || '', manaCoat: '0'
    });
    setIsCustomSet(false);
    onClose();
  };

  const handleSetSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'NEW_CUSTOM_SET') {
      setIsCustomSet(true);
      setCustomSetInputValue('');
      handleChange('set', '');
    } else {
      setIsCustomSet(false);
      handleChange('set', e.target.value);
    }
  };

  const handleCustomSetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSetInputValue(e.target.value);
    handleChange('set', e.target.value);
  };

  const handleCancelCustomSet = () => {
    setIsCustomSet(false);
    setCustomSetInputValue('');
    handleChange('set', availableSets[0] || '');
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  };

  const darkInputClasses = "bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 placeholder-gray-500";
  const darkSelectClasses = "bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500";

  if (step === 'success') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md !bg-gray-900 border border-gray-800">
        <div className="text-center p-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-900/20 mb-6 ring-1 ring-green-500/20">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">¡Venta Publicada!</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">Tu carta ha sido publicada en el marketplace correctamente.</p>
          <Button onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-lg shadow-blue-900/20">Volver al Marketplace</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={false} className="max-w-[90vw] w-full h-[85vh] overflow-hidden flex flex-col p-0 rounded-3xl shadow-2xl !bg-gray-900 !border !border-gray-800">
      <div className="flex h-full w-full">
        <div className="relative h-full w-[31.8%] flex-none bg-gray-900 flex items-center justify-center p-0 overflow-hidden rounded-l-3xl group border-r border-gray-800">
          {formData.imageUrl ? (
            <>
              <img src={formData.imageUrl} alt="Preview" className="relative w-full h-full max-w-full max-h-full object-contain z-10 shadow-black drop-shadow-xl p-4" />
              <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-12 w-12 text-white mb-2" />
                <span className="text-white font-bold">Cambiar Imagen</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer bg-gray-800/50 border-2 border-dashed border-gray-700 m-8 rounded-2xl hover:border-blue-500 hover:bg-gray-800 transition-all" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-10 w-10 text-blue-500" />
              <span className="text-gray-300 font-bold text-lg">Subir Foto</span>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div className="flex-1 flex flex-col h-full bg-gray-900 relative min-w-0 rounded-r-3xl overflow-hidden">
          <button onClick={handleClose} className="absolute top-3 right-3 z-50 p-2 bg-gray-800 hover:bg-red-900 hover:text-red-100 rounded-full transition-colors text-gray-400 shadow-sm border border-gray-700"><X className="h-5 w-5" /></button>

          <div className="flex-shrink-0 px-8 py-6 border-b border-gray-800 pr-14">
             <div className="mb-1"><span className="text-[12px] font-extrabold text-blue-500 uppercase tracking-widest">MARKETPLACE</span></div>
             <h1 className="text-3xl font-bold text-white mb-4">Publicar Venta</h1>
             <Input value={formData.cardName} onChange={(e) => handleChange('cardName', e.target.value)} placeholder="Nombre de la carta" className={`text-xl font-bold ${darkInputClasses}`} autoFocus />
            
            <div className="flex flex-wrap gap-2 items-center mt-3">
              <select value={formData.rarity} onChange={(e) => handleChange('rarity', e.target.value)} className={`text-xs px-2 py-1 border rounded ${darkSelectClasses}`}>
                {RARITIES.map(r => <option key={r} value={r}>{t(r)}</option>)}
              </select>
              <select value={formData.color} onChange={(e) => handleChange('color', e.target.value)} className={`text-xs px-2 py-1 border rounded ${darkSelectClasses}`}>
                {COLORS.map(c => <option key={c} value={c}>{t(c)}</option>)}
              </select>
              <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} className={`text-xs px-2 py-1 border rounded ${darkSelectClasses}`}>
                {TYPES.map(type => <option key={type} value={type}>{t(type)}</option>)}
              </select>
              <select value={formData.condition} onChange={(e) => handleChange('condition', e.target.value)} className={`text-xs px-2 py-1 border rounded ${darkSelectClasses}`}>
                {CONDITIONS.map(c => <option key={c} value={c}>{t(c)}</option>)}
              </select>
            </div>
          </div>

          <div className="flex-grow px-8 py-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
              <h3 className="font-bold text-gray-400 text-[10px] mb-2 uppercase tracking-widest">Texto de Reglas</h3>
              <textarea className={`w-full p-2 border rounded text-sm outline-none resize-none ${darkInputClasses}`} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-1">Edición</h3>
                <div className="flex gap-1">
                  {!isCustomSet ? (
                    <select value={formData.set} onChange={handleSetSelectChange} className={`flex-1 h-9 px-2 border rounded text-sm ${darkSelectClasses}`}>
                      {availableSets.map(set => <option key={set} value={set}>{set}</option>)}
                      <option disabled>──────────</option>
                      <option value="NEW_CUSTOM_SET">+ Crear nueva...</option>
                    </select>
                  ) : (
                    <Input value={customSetInputValue} onChange={handleCustomSetInputChange} placeholder="Nombre edición" className={`h-9 text-sm flex-1 ${darkInputClasses}`} autoFocus />
                  )}
                  {isCustomSet && <button onClick={handleCancelCustomSet} className="p-2 text-gray-400 border border-gray-700 rounded hover:bg-gray-800"><X className="h-5 w-5" /></button>}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-1">Coste</h3>
                <div className="flex items-center gap-1">
                  <Input type="number" value={formData.manaCoat} onChange={(e) => handleChange('manaCoat', e.target.value)} className={`h-9 text-sm w-20 ${darkInputClasses}`} onKeyDown={handlePriceKeyDown} />
                  <span className="text-gray-400 text-sm">Mana</span>
                </div>
              </div>
              <div className="col-span-2 pt-2">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-1">Precio de Venta (CLP)</h3>
                <Input type="number" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} className={`h-9 text-sm ${darkInputClasses}`} onKeyDown={handlePriceKeyDown} />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 px-8 py-6 bg-gray-900">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5 font-bold uppercase tracking-wider">Precio Final</p>
                <p className="text-2xl font-extrabold text-green-500">{formatCLP(formData.price)}</p>
              </div>
            </div>
            <Button onClick={handleSubmit} loading={loading} disabled={!formData.cardName || !formData.price} className="w-full h-12 text-lg font-bold shadow-md hover:shadow-lg transition-all rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-5 w-5 mr-2" /> Publicar en Marketplace
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};