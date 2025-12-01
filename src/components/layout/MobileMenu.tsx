import React from 'react';
import { X } from 'lucide-react';
import { NAV_ITEMS } from '../../data/constants'; // Importar constantes

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, currentView, onNavigate }) => {
  // Ya no necesitamos useAuth aquí porque el menú solo se muestra si estás logueado en la App
  // O si necesitas filtrar, la lógica de App.tsx controla el renderizado general.
  // Pero asumiendo que este componente solo se monta si hay usuario:

  const handleNavigate = (view: string) => {
    onNavigate(view);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {/* Renderizado dinámico */}
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                currentView === item.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};