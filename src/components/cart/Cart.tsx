import React from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { formatCLP } from '../../utils/format';

interface CartProps {
  onCheckout: () => void;
  onNavigateToCatalog?: () => void;
}

export const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">Tu Carrito</h1>
        <div className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 p-12 text-center relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10 group-hover:bg-blue-600/20 transition-all duration-700"></div>
          <div className="flex flex-col items-center justify-center z-10 relative">
            <div className="bg-gray-800/80 p-8 rounded-full mb-6 ring-1 ring-white/10 shadow-xl backdrop-blur-sm">
              <ShoppingCart className="h-16 w-16 text-blue-400" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4 text-white tracking-tight">
              Tu carrito está <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">vacío</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
              Parece que aún no has descubierto tu próxima carta favorita. 
              Explora el multiverso y encuentra las mejores adiciones para tu mazo.
            </p>
            <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-blue-900/30 text-lg transition-all transform hover:scale-105 hover:shadow-blue-500/25 flex items-center">
              Explorar el Catálogo <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-blue-500" />
            Carrito de Compras
            <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
              {items.length} ítems
            </span>
          </h1>
        </div>
        
        <div className="p-6 space-y-4">
          {items.map((item) => (
            <div key={`${item.card.id}-${item.source}`} className="flex items-center gap-4 p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:border-gray-600 transition-all group">
              
              {/* Imagen del producto */}
              <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-700 shadow-sm">
                <img 
                  src={item.card.image} 
                  alt={item.card.name} 
                  className="h-full w-full object-cover" 
                />
              </div>
              
              {/* Info del producto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                   <h3 className="font-bold text-lg text-gray-100 truncate pr-4">{item.card.name}</h3>
                   {/* --- CAMBIO 1: ELIMINADO EL PRECIO UNITARIO DE AQUÍ --- */}
                </div>
                
                <p className="text-sm text-blue-400 font-medium mb-0.5">{item.card.set}</p>
                
                <div className="flex items-center gap-2 mt-1">
                   <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                     item.source === 'marketplace' 
                       ? 'bg-purple-900/30 text-purple-300 border-purple-800' 
                       : 'bg-gray-700 text-gray-300 border-gray-600'
                   }`}>
                     {item.source === 'marketplace' ? 'Marketplace' : 'Tienda'}
                   </span>
                </div>
              </div>

              {/* Controles de Cantidad */}
              <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg h-10 shadow-sm">
                <button 
                  onClick={() => updateQuantity(item.card.id, item.quantity - 1)} 
                  className="px-3 h-full hover:bg-gray-800 text-gray-400 hover:text-white rounded-l-lg transition-colors border-r border-gray-800 disabled:opacity-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-white tabular-nums">
                  {item.quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(item.card.id, item.quantity + 1)} 
                  className="px-3 h-full hover:bg-gray-800 text-gray-400 hover:text-white rounded-r-lg transition-colors border-l border-gray-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* --- CAMBIO 2: PRECIO TOTAL Y ELIMINAR BAJADOS (pt-6 y gap-2) --- */}
              <div className="text-right min-w-[100px] flex flex-col items-end gap-2 pt-6">
                <p className="font-bold text-lg text-white tracking-tight">{formatCLP(item.card.price * item.quantity)}</p>
                <button 
                  onClick={() => removeFromCart(item.card.id)} 
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline decoration-red-400/50 underline-offset-2 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer con Total y Checkout */}
        <div className="bg-gray-900 border-t border-gray-800 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-sm mb-1">Total a pagar</p>
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                {formatCLP(total)}
              </span>
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:w-auto">
               <div className="flex items-center gap-2 text-xs text-gray-500 justify-center sm:justify-end mb-1">
                  <Package className="h-3.5 w-3.5" /> Envío calculado en el siguiente paso
               </div>
               <Button 
                 onClick={onCheckout} 
                 className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg h-12 shadow-lg shadow-blue-900/20 rounded-xl"
               >
                 Finalizar Compra <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};