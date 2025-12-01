import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Card } from '../../types';
import { Upload, Trash2, X, Plus, Check } from 'lucide-react';
import { formatCLP } from '../../utils/format';
import { RARITIES, COLORS, TYPES, CONDITIONS, t, DEFAULT_CONDITION, DEFAULT_CARD_IMAGE } from '../../data/constants';

interface AddCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: Card) => void;
  availableSets?: string[];
  onAddSet?: (newSet: string) => void;
  onDeleteSet?: (set: string) => void;
}

export const AddCardForm: React.FC<AddCardFormProps> = ({ 
  isOpen, onClose, onAdd, availableSets = [], onAddSet, onDeleteSet 
}) => {
  const [loading, setLoading] = useState(false);
  const [isCustomSet, setIsCustomSet] = useState(false);
  const [customSetInputValue, setCustomSetInputValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({}); // Estado para errores
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<{
    name: string; price: string; rarity: string; color: string; type: string;
    set: string; description: string; manaCoat: string; image: string | null; condition: string;
  }>({
    name: '', price: '', rarity: 'Common', color: 'Colorless', type: 'Creature',
    set: availableSets[0] || 'Colección Básica 2024', description: '', manaCoat: '0', 
    image: null, condition: DEFAULT_CONDITION
  });

  const handleChange = (field: string, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error al escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
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
  
  const handleCustomSetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSetInputValue(e.target.value);
    handleChange('set', e.target.value);
  };

  const handleSaveCustomSet = () => {
    if (customSetInputValue.trim() && onAddSet) {
      onAddSet(customSetInputValue.trim());
      handleChange('set', customSetInputValue.trim());
      setIsCustomSet(false);
      setCustomSetInputValue('');
    }
  };

  const handleCancelCustomSet = () => {
    setIsCustomSet(false);
    setCustomSetInputValue('');
    handleChange('set', availableSets[0] || '');
  };

  const handleDeleteCurrentSet = () => {
    if (isCustomSet || !formData.set) return;
    if (onDeleteSet) {
      onDeleteSet(formData.set);
      const setsToUse = availableSets.length > 0 ? availableSets.filter(s => s !== formData.set) : ['Colección Básica 2024'];
      handleChange('set', setsToUse[0] || 'Colección Básica 2024');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange('image', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return; // Validar antes de enviar

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const finalImage = formData.image || DEFAULT_CARD_IMAGE;

    const newCard: Card = {
      id: Date.now().toString(),
      name: formData.name || 'Nueva Carta',
      image: finalImage,
      rarity: formData.rarity as any,
      color: formData.color as any,
      type: formData.type as any,
      set: formData.set || 'Sin Edición',
      description: formData.description,
      price: parseFloat(formData.price),
      manaCoat: parseInt(formData.manaCoat) || 0,
      condition: formData.condition as any
    };

    onAdd(newCard);
    setLoading(false);
    
    setFormData({
      name: '', price: '', rarity: 'Common', color: 'Colorless', type: 'Creature',
      set: availableSets[0] || '', description: '', manaCoat: '0', image: null, condition: DEFAULT_CONDITION
    });
    setErrors({});
    setIsCustomSet(false);
    setCustomSetInputValue('');
    onClose();
  };

  const darkInputClasses = "bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 placeholder-gray-500";
  const darkSelectClasses = "bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-[90vw] w-full h-[85vh] overflow-hidden flex flex-col p-0 rounded-3xl shadow-2xl !bg-gray-900 !border !border-gray-800">
      <div className="flex h-full w-full">
        <div className="relative h-full w-[31.8%] flex-none bg-gray-900 flex items-center justify-center p-0 overflow-hidden rounded-l-3xl group border-r border-gray-800">
          {formData.image ? (
            <>
              <img src={formData.image} alt="Preview" className="relative w-full h-full max-w-full max-h-full object-contain z-10 shadow-black drop-shadow-xl p-4" />
              <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-12 w-12 text-white mb-2" />
                <span className="text-white font-bold">Cambiar Imagen</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer bg-gray-800/50 border-2 border-dashed border-gray-700 m-8 rounded-2xl hover:border-blue-500 hover:bg-gray-800 transition-all" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-16 w-16 text-gray-500 mb-4" />
              <span className="text-gray-300 font-bold text-lg">Subir Imagen</span>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div className="flex-1 flex flex-col h-full bg-gray-900 relative min-w-0 rounded-r-3xl overflow-hidden">
          <button onClick={onClose} className="absolute top-3 right-3 z-50 p-2 bg-gray-800 hover:bg-red-900 hover:text-red-100 rounded-full transition-colors text-gray-400 shadow-sm border border-gray-700">
            <X className="h-5 w-5" />
          </button>

          <div className="flex-shrink-0 px-8 py-6 border-b border-gray-800 pr-14">
            <div className="flex items-center gap-2 mb-2">
              <Input 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="Nombre de la carta" 
                className={`text-xl font-bold ${darkInputClasses}`} 
                autoFocus 
                error={errors.name}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
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
              <textarea className={`w-full p-2 border rounded text-sm outline-none resize-none ${darkInputClasses}`} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-1">Edición</h3>
                <div className="flex gap-1">
                  {!isCustomSet ? (
                    <>
                      <select value={formData.set} onChange={handleSetSelectChange} className={`flex-1 h-9 px-2 border rounded text-sm ${darkSelectClasses}`}>
                        {availableSets.map(set => <option key={set} value={set}>{set}</option>)}
                        <option disabled>──────────</option>
                        <option value="NEW_CUSTOM_SET">+ Crear nueva...</option>
                      </select>
                      {onDeleteSet && (
                        <button onClick={handleDeleteCurrentSet} className="p-2 text-gray-400 border border-gray-700 rounded hover:bg-red-900/30 hover:text-red-400 transition-colors" type="button">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <Input value={customSetInputValue} onChange={handleCustomSetChange} placeholder="Nombre nueva edición" className={`h-9 text-sm flex-1 ${darkInputClasses}`} autoFocus onKeyDown={(e) => { if(e.key === 'Enter') handleSaveCustomSet(); }} />
                  )}
                  {isCustomSet && (
                    <>
                      <button onClick={handleSaveCustomSet} disabled={!customSetInputValue.trim()} className="p-2 text-blue-400 border border-blue-900 rounded hover:bg-blue-900/30 disabled:opacity-50" type="button"><Check className="h-5 w-5" /></button>
                      <button onClick={handleCancelCustomSet} className="p-2 text-gray-400 border border-gray-700 rounded hover:bg-gray-800" type="button"><X className="h-5 w-5" /></button>
                    </>
                  )}
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
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Precio Base</h3>
                <Input 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => handleChange('price', e.target.value)} 
                  placeholder="0" 
                  className={`h-9 text-sm ${darkInputClasses}`} 
                  onKeyDown={handlePriceKeyDown}
                  error={errors.price}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 px-8 py-6 border-t border-gray-800">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5 font-bold uppercase tracking-wider">Precio Vista Previa</p>
                <p className="text-lg font-bold text-gray-100">{formatCLP(parseFloat(formData.price) || 0)}</p>
              </div>
            </div>
            <Button onClick={handleSubmit} loading={loading} className="w-full h-12 text-lg font-bold shadow-md hover:shadow-lg transition-all rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-5 w-5 mr-2" /> Añadir al Catálogo
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};