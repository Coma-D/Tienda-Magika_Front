import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, CheckCircle, MapPin, User, Mail, ShieldCheck, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { CartItem } from '../../types';
import { formatCLP } from '../../utils/format';

interface CheckoutProps {
  onBack: () => void;
  onSuccess: (purchasedItems: CartItem[]) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  const [formData, setFormData] = useState({
    name: '', email: '', address: '', city: '', zipCode: '',
    cardNumber: '', expiryDate: '', cvv: ''
  });

  // EFECTO: Auto-rellenar datos
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const purchasedItems = [...items];
    clearCart();
    setStep('success');
    setLoading(false);
    onSuccess(purchasedItems);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const darkInputClasses = "bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 placeholder-gray-500";

  if (step === 'success') {
    return (
      <div className="max-w-3xl mx-auto p-6 py-20">
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
          
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-900/20 mb-8 ring-1 ring-green-500/30 animate-bounce-slow">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">¡Compra Exitosa!</h1>
          <p className="text-gray-400 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
            Tu pedido ha sido procesado correctamente. Hemos enviado un correo de confirmación a <span className="text-white font-medium">{formData.email}</span>.
          </p>
          
          <Button 
            onClick={() => onSuccess([])} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-xl font-bold shadow-lg shadow-blue-900/20"
          >
            Volver a la Tienda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <button 
        onClick={onBack} 
        className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Volver al carrito
      </button>

      <div className="grid lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-8">
            <div className="flex items-center mb-6 border-b border-gray-800 pb-4">
              <MapPin className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-bold text-white">Detalles de Envío</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Nombre completo" 
                  value={formData.name} 
                  onChange={(e) => handleChange('name', e.target.value)} 
                  required 
                  placeholder="Ej: Juan Pérez"
                  // BLOQUEO CONDICIONAL
                  className={`${darkInputClasses} ${user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  readOnly={!!user}
                />
                <Input 
                  label="Correo electrónico" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => handleChange('email', e.target.value)} 
                  required 
                  placeholder="ejemplo@correo.com"
                  // BLOQUEO CONDICIONAL
                  className={`${darkInputClasses} ${user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  readOnly={!!user}
                />
              </div>

              <Input 
                label="Dirección" 
                value={formData.address} 
                onChange={(e) => handleChange('address', e.target.value)} 
                required 
                className={darkInputClasses}
                placeholder="Calle, número, depto..."
              />

              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="Ciudad" 
                  value={formData.city} 
                  onChange={(e) => handleChange('city', e.target.value)} 
                  required 
                  className={darkInputClasses}
                />
                <Input 
                  label="Código postal" 
                  value={formData.zipCode} 
                  onChange={(e) => handleChange('zipCode', e.target.value)} 
                  required 
                  className={darkInputClasses}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-8">
            <div className="flex items-center mb-6 border-b border-gray-800 pb-4">
              <CreditCard className="h-6 w-6 text-purple-500 mr-3" />
              <h2 className="text-xl font-bold text-white">Método de Pago</h2>
            </div>

            <div className="space-y-6">
              <Input 
                label="Número de tarjeta" 
                placeholder="0000 0000 0000 0000" 
                value={formData.cardNumber} 
                onChange={(e) => handleChange('cardNumber', e.target.value)} 
                required 
                className={darkInputClasses}
              />
              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="Vencimiento" 
                  placeholder="MM/AA" 
                  value={formData.expiryDate} 
                  onChange={(e) => handleChange('expiryDate', e.target.value)} 
                  required 
                  className={darkInputClasses}
                />
                <Input 
                  label="CVV" 
                  placeholder="123" 
                  value={formData.cvv} 
                  onChange={(e) => handleChange('cvv', e.target.value)} 
                  required 
                  type="password"
                  className={darkInputClasses}
                />
              </div>
            </div>
            
            <div className="mt-6 flex items-center text-gray-500 text-sm bg-gray-800/50 p-3 rounded-lg border border-gray-800">
              <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
              Transacción encriptada y segura de extremo a extremo.
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center">
              <Package className="h-5 w-5 mr-2 text-gray-400" /> Resumen del Pedido
            </h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {items.map((item) => (
                <div key={`${item.card.id}-${item.source}`} className="flex items-start gap-3 py-3 border-b border-gray-800 last:border-0">
                  <div className="relative w-12 h-16 flex-shrink-0 rounded bg-gray-800 overflow-hidden border border-gray-700">
                    <img src={item.card.image} alt={item.card.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 border-tl border-gray-700">x{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{item.card.name}</p>
                    <p className="text-xs text-gray-500">{item.card.set}</p>
                    <p className="text-xs font-bold text-gray-400 mt-1">{formatCLP(item.card.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 py-4 border-t border-gray-800">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>{formatCLP(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Envío</span>
                <span className="text-green-500 font-medium">Gratis</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-gray-200 font-medium">Total</span>
                <span className="text-2xl font-bold text-white">{formatCLP(total)}</span>
              </div>
            </div>

            <Button 
              onClick={(e) => handleSubmit(e)}
              loading={loading} 
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-green-900/20"
            >
              Confirmar Pago
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};