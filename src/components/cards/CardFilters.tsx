import React from 'react';
import { Plus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { RARITIES, COLORS, TYPES, CONDITIONS, t } from '../../data/constants';

interface CardFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRarity: string;
  onRarityChange: (value: string) => void;
  selectedColor: string;
  onColorChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedSet: string;
  onSetChange: (value: string) => void;
  selectedCondition?: string;
  onConditionChange?: (value: string) => void;
  onAddCard?: () => void;
  availableSets?: string[];
}

export const CardFilters: React.FC<CardFiltersProps> = ({
  searchTerm, onSearchChange,
  selectedRarity, onRarityChange,
  selectedColor, onColorChange,
  selectedType, onTypeChange,
  selectedSet, onSetChange,
  selectedCondition, onConditionChange,
  onAddCard, availableSets = []
}) => {
  const setsToUse = availableSets.length > 0 ? availableSets : ['Colección Básica 2024'];
  const darkSelectClasses = "w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-200";
  
  const hasConditionFilter = selectedCondition && onConditionChange;
  const gridColsClass = hasConditionFilter ? "lg:grid-cols-6" : "lg:grid-cols-5";

  return (
    <div className="bg-gray-900 rounded-xl shadow-md border border-gray-800 p-6 mb-6">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-4`}>
        <div className="w-full">
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 placeholder-gray-500"
          />
        </div>
        
        <div>
          <select value={selectedRarity} onChange={(e) => onRarityChange(e.target.value)} className={darkSelectClasses}>
            <option value="Todas">Todas las Rarezas</option>
            {RARITIES.map(r => <option key={r} value={r}>{t(r)}</option>)}
          </select>
        </div>

        <div>
          <select value={selectedColor} onChange={(e) => onColorChange(e.target.value)} className={darkSelectClasses}>
            <option value="Todos">Todos los Colores</option>
            {COLORS.map(c => <option key={c} value={c}>{t(c)}</option>)}
          </select>
        </div>

        <div>
          <select value={selectedType} onChange={(e) => onTypeChange(e.target.value)} className={darkSelectClasses}>
            <option value="Todos">Todos los Tipos</option>
            {TYPES.map(type => <option key={type} value={type}>{t(type)}</option>)}
          </select>
        </div>

        {hasConditionFilter && (
          <div>
            <select value={selectedCondition} onChange={(e) => onConditionChange && onConditionChange(e.target.value)} className={darkSelectClasses}>
              <option value="Todas">Todas las Condiciones</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{t(c)}</option>)}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <select value={selectedSet} onChange={(e) => onSetChange(e.target.value)} className={`${darkSelectClasses} flex-1 min-w-0`}>
            <option value="Todos">Todas las Ediciones</option>
            {setsToUse.map(set => <option key={set} value={set}>{set}</option>)}
          </select>
          
          {onAddCard && (
            <Button onClick={onAddCard} className="px-3 py-2 shadow-sm flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white border-none">
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};