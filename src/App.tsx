import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { MobileMenu } from './components/layout/MobileMenu';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { CardGrid } from './components/cards/CardGrid';
import { CardDetail } from './components/cards/CardDetail';
import { CardFilters } from './components/cards/CardFilters';
import { AddCardForm } from './components/cards/AddCardForm';
import { Cart } from './components/cart/Cart';
import { Checkout } from './components/checkout/Checkout';
import { Collection } from './components/collection/Collection';
import { Marketplace } from './components/marketplace/Marketplace';
import { Community } from './components/community/Community';
import { Support } from './components/support/Support';
import { Profile } from './components/profile/Profile';
import { PublicCollection } from './components/collection/PublicCollection';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { useCollection } from './hooks/useCollection';
import { useInitialData } from './hooks/useInitialData'; // [NUEVO] Hook
import { useNotification } from './hooks/useNotification';
import { Card, MarketplaceListing, CartItem, User } from './types';
import { ConfirmationModal } from './components/ui/ConfirmationModal';
import { ADMIN_ID } from './context/AuthContext';

type View = 'auth' | 'catalog' | 'collection' | 'marketplace' | 'community' | 'support' | 'cart' | 'checkout' | 'profile' | 'other-collection' | 'user-history';
type AuthView = 'login' | 'register' | 'forgot-password';

function App() {
  const { isAuthenticated, user } = useAuth();
  const { addToCart, clearCart } = useCart();
  const collection = useCollection(user?.id);
  const { addNotification } = useNotification();
  
  // [REFACTOR] Usamos el hook para toda la data inicial
  const { 
    catalogCards, setCatalogCards, 
    marketplaceListings, setMarketplaceListings, 
    availableSets, setAvailableSets 
  } = useInitialData();

  // Estados de Navegación
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);
  const [viewingHistoryUser, setViewingHistoryUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(() => {
    if (!isAuthenticated) return 'auth';
    return (localStorage.getItem('lastView') as View) || 'catalog';
  });
  
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estados de Interfaz
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('Todas');
  const [selectedColor, setSelectedColor] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedSet, setSelectedSet] = useState('Todos');

  // Efectos
  useEffect(() => {
    if (isAuthenticated) localStorage.setItem('lastView', currentView);
    else setAuthView('login');
  }, [currentView, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && catalogCards.length > 0) {
      collection.syncCollectionWithCatalog(catalogCards);
    }
  }, [catalogCards, isAuthenticated]);

  // Handlers
  const openConfirmation = (title: string, message: string, action: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm: action });
  };
  
  const handleAuthSuccess = () => setCurrentView('catalog');
  const handleNavigate = (view: string) => { setCurrentView(view as View); setIsMobileMenuOpen(false); };
  const handleAddToCart = (card: Card) => addToCart(card, 1, 'catalog');
  const handleAddToCollection = (card: Card) => collection.addToCollection(card, 'catalog');

  const handleAddNewCard = (newCard: Card) => {
    setCatalogCards(prev => [{ ...newCard, condition: newCard.condition || 'Mint' }, ...prev]);
  };

  const handleAddListing = (newListing: MarketplaceListing) => setMarketplaceListings(prev => [newListing, ...prev]);

  const handleRemoveListing = (listingId: string) => {
    openConfirmation('Eliminar publicación', '¿Eliminar esta carta del mercado? Es irreversible.', () => {
      setMarketplaceListings(prev => prev.filter(l => l.id !== listingId));
    });
  };

  const handleUpdateCard = (updatedCard: Card) => {
    setCatalogCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    setSelectedCard(updatedCard);
  };

  const handleDeleteCardFromCatalog = (cardId: string) => {
    openConfirmation('Eliminar carta', '¿Eliminar del catálogo permanentemente?', () => {
      setCatalogCards(prev => prev.filter(c => c.id !== cardId));
      setSelectedCard(null);
    });
  };

  const handleAddSet = (newSet: string) => { if (!availableSets.includes(newSet)) setAvailableSets(prev => [...prev, newSet]); };
  const handleDeleteSet = (setToDelete: string) => {
    openConfirmation('Eliminar edición', `¿Eliminar "${setToDelete}"?`, () => setAvailableSets(prev => prev.filter(s => s !== setToDelete)));
  };

  const handleCheckoutSuccess = async (purchasedItems: CartItem[]) => {
    if (purchasedItems.length === 0 || !user) { setCurrentView('catalog'); return; }
    
    try {
        const res = await fetch('/api/v1/marketplace/checkout', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, purchasedItems })
        });
        if (res.ok) { 
            const data = await res.json();
            setMarketplaceListings(data.remainingListings);
            purchasedItems.forEach(cartItem => {
                const listing = marketplaceListings.find(l => l.card.id === cartItem.card.id);
                if (listing) addNotification(listing.seller.id, `¡Tu carta "${listing.card.name}" ha sido vendida!`);
            });
            clearCart();
            collection.syncCollectionWithCatalog(catalogCards); 
        } else { alert("Error del servidor al completar transacción."); }
    } catch (error) { alert("Error de red durante checkout."); }
    setCurrentView('catalog');
  };

  const filteredCards = catalogCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = selectedRarity === 'Todas' || card.rarity === selectedRarity;
    const matchesColor = selectedColor === 'Todos' || card.color === selectedColor;
    const matchesType = selectedType === 'Todos' || card.type === selectedType;
    const matchesSet = selectedSet === 'Todos' || card.set === selectedSet;
    return matchesSearch && matchesRarity && matchesColor && matchesType && matchesSet;
  });

  const isAdmin = user?.id === ADMIN_ID;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <Header currentView={currentView} onNavigate={handleNavigate} onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="pt-1"> 
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {authView === 'login' && <LoginForm onSwitchToRegister={() => setAuthView('register')} onSwitchToForgotPassword={() => setAuthView('forgot-password')} onSuccess={handleAuthSuccess} />}
            {authView === 'register' && <RegisterForm onSwitchToLogin={() => setAuthView('login')} onSuccess={handleAuthSuccess} />}
            {authView === 'forgot-password' && <ForgotPasswordForm onBack={() => setAuthView('login')} />}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <Header currentView={currentView} onNavigate={handleNavigate} onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} currentView={currentView} onNavigate={handleNavigate} />

      <main className="pt-1">
        {currentView === 'catalog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative rounded-2xl bg-gradient-to-r from-gray-900 to-black p-8 mb-10 text-gray-100 shadow-2xl overflow-hidden border border-gray-800">
              <div className="relative z-10"><h1 className="text-4xl font-extrabold mb-4 text-white">Explora el Multiverso</h1><p className="text-gray-400 text-lg">Encuentra las cartas más raras.</p></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>
            <CardFilters
              searchTerm={searchTerm} onSearchChange={setSearchTerm}
              selectedRarity={selectedRarity} onRarityChange={setSelectedRarity}
              selectedColor={selectedColor} onColorChange={setSelectedColor}
              selectedType={selectedType} onTypeChange={setSelectedType}
              selectedSet={selectedSet} onSetChange={setSelectedSet}
              onAddCard={isAdmin ? () => setIsAddCardModalOpen(true) : undefined}
              availableSets={availableSets}
            />
            <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6 min-h-[400px]">
              <CardGrid cards={filteredCards} onCardClick={setSelectedCard} onAddToCart={handleAddToCart} onAddToCollection={handleAddToCollection} />
            </div>
            <CardDetail
              card={selectedCard} isOpen={!!selectedCard} onClose={() => setSelectedCard(null)}
              onAddToCart={handleAddToCart} onAddToCollection={handleAddToCollection}
              onEditCard={handleUpdateCard} onDeleteCard={handleDeleteCardFromCatalog}
              availableSets={availableSets} onAddSet={handleAddSet} onDeleteSet={handleDeleteSet}
            />
            <AddCardForm isOpen={isAddCardModalOpen} onClose={() => setIsAddCardModalOpen(false)} onAdd={handleAddNewCard} availableSets={availableSets} onAddSet={handleAddSet} onDeleteSet={handleDeleteSet} />
          </div>
        )}
        {currentView === 'collection' && <Collection catalogSets={availableSets} collection={collection} />}
        {currentView === 'other-collection' && viewingProfileUser && <PublicCollection userId={viewingProfileUser.id} userName={viewingProfileUser.username} onBack={() => setCurrentView('community')} availableSets={availableSets} />}
        {currentView === 'user-history' && viewingHistoryUser && <Community forcedUser={viewingHistoryUser} readOnly={true} onBack={() => setCurrentView('community')} onViewCollection={(u) => { setViewingProfileUser(u); setCurrentView('other-collection'); }} />}
        {currentView === 'marketplace' && <Marketplace listings={marketplaceListings} onAddListing={handleAddListing} onRemoveListing={handleRemoveListing} availableSets={availableSets} />}
        {currentView === 'community' && <Community onViewCollection={(u) => { setViewingProfileUser(u); setCurrentView('other-collection'); }} onViewHistory={(u) => { setViewingHistoryUser(u); setCurrentView('user-history'); }} />}
        {currentView === 'support' && <Support />}
        {currentView === 'cart' && <Cart onCheckout={() => setCurrentView('checkout')} />}
        {currentView === 'checkout' && <Checkout onBack={() => setCurrentView('cart')} onSuccess={handleCheckoutSuccess} />}
        {currentView === 'profile' && <Profile />}
      </main>
      <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
}

export default App;