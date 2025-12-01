import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Fondo oscuro backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Ventana Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100 overflow-hidden">
        {/* Barra superior de advertencia */}
        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {/* Botones de acción - MODIFICADO: justify-between para separar botones */}
        <div className="p-4 bg-gray-50 flex gap-3 justify-between">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="w-auto font-medium px-6" // Agregado px-6 para mejor tamaño
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-auto font-medium shadow-red-200 shadow-md px-6"
          >
            Sí, eliminar
          </Button>
        </div>

        {/* Botón Cerrar (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-white/50 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};