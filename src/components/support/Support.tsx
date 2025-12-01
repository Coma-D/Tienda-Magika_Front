import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle, ChevronDown, ChevronRight, Mail, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { faqData } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { ADMIN_ID } from '../../context/AuthContext';

export const Support: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // EFECTO: Auto-rellenar datos del usuario al cargar
  useEffect(() => {
    if (user) {
      setContactForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 1. ENVIAR AL ADMINISTRADOR
    addNotification(
      ADMIN_ID, 
      `Soporte: Ticket de ${contactForm.name}\nAsunto: ${contactForm.subject}\n\n${contactForm.message}`
    );

    // 2. CONFIRMACIÓN AL USUARIO
    if (user) {
      addNotification(
        user.id,
        `Sistema: Ticket Recibido\nAsunto: Recibido: ${contactForm.subject}\n\nHola ${user.name}, hemos recibido tu ticket correctamente. Un agente revisará tu mensaje:\n"${contactForm.message.substring(0, 50)}..."\n\nTe responderemos a la brevedad.`
      );
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Limpiar formulario (mantenemos nombre/email si sigue logueado)
    setContactForm(prev => ({ ...prev, subject: '', message: '' }));
  };

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const darkInputClasses = "bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 placeholder-gray-500 rounded-lg";

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6 h-[60vh] flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-12 text-center max-w-lg w-full">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-900/20 mb-6 ring-1 ring-green-500/30">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">¡Ticket enviado!</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Hemos recibido tu consulta correctamente. Revisa tus notificaciones para ver la confirmación.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)} 
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-medium py-3 rounded-xl"
          >
            Enviar otra consulta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Centro de Soporte</h1>
        <p className="text-gray-400 text-lg">¿Tienes dudas sobre tus cartas o envíos? Estamos aquí para ayudarte.</p>
      </div>

      {/* Navegación de Pestañas */}
      <div className="mb-8">
        <div className="border-b border-gray-800 flex space-x-8">
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-all flex items-center ${
              activeTab === 'faq'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            Preguntas Frecuentes
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-all flex items-center ${
              activeTab === 'contact'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            <Mail className="h-5 w-5 mr-2" />
            Contactar Soporte
          </button>
        </div>
      </div>

      {activeTab === 'faq' ? (
        <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
              Respuestas Rápidas
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {faqData.map((faq, index) => (
              <div key={index} className="group">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left p-6 hover:bg-gray-800/50 transition-colors focus:outline-none"
                >
                  <span className={`text-lg font-medium transition-colors ${expandedFaq === index ? 'text-blue-400' : 'text-gray-200 group-hover:text-white'}`}>
                    {faq.question}
                  </span>
                  {expandedFaq === index ? (
                    <ChevronDown className="h-5 w-5 text-blue-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-gray-300" />
                  )}
                </button>
                
                {expandedFaq === index && (
                  <div className="px-6 pb-6 pt-0 animate-fade-in">
                    <div className="pl-4 border-l-2 border-blue-500/30">
                      <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Formulario */}
          <div className="lg:col-span-2 bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Envíanos un mensaje</h2>
              <p className="text-gray-400">Completa el formulario y te responderemos en menos de 24 horas.</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre completo"
                  value={contactForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Tu nombre"
                  className={`bg-gray-800 border-gray-700 text-white ${user ? 'opacity-70 cursor-not-allowed' : ''}`}
                  readOnly={!!user} // Solo lectura si hay usuario
                />
                <Input
                  label="Correo electrónico"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className={`bg-gray-800 border-gray-700 text-white ${user ? 'opacity-70 cursor-not-allowed' : ''}`}
                  readOnly={!!user} // Solo lectura si hay usuario
                />
              </div>

              <Input
                label="Asunto"
                value={contactForm.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Ej: Problema con un pedido"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mensaje
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Describe detalladamente tu problema..."
                  className={`w-full px-4 py-3 min-h-[150px] outline-none focus:ring-2 focus:ring-blue-500 resize-y ${darkInputClasses}`}
                  required
                />
              </div>

              <Button 
                type="submit" 
                loading={isSubmitting} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 shadow-lg shadow-blue-900/20"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Ticket
              </Button>
            </form>
          </div>

          {/* Columna Derecha: Tips */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-900/10 border border-blue-900/30 rounded-2xl p-6">
              <h3 className="font-bold text-blue-200 mb-4 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                Tips para soporte
              </h3>
              <ul className="space-y-4 text-sm text-blue-100/70">
                <li className="flex items-start">
                  <span className="mr-2 text-blue-500">•</span>
                  Sé específico con el nombre de la carta o número de pedido.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-500">•</span>
                  Si es un error técnico, dinos qué navegador usas.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-500">•</span>
                  Adjuntar capturas de pantalla ayuda mucho.
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-2">Horario de Atención</h3>
              <p className="text-gray-400 text-sm">Lunes a Viernes<br/>9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};