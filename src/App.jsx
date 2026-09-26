import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { CustomPageView } from './pages/CustomPageView';
import { OwnerPortal } from './pages/OwnerPortal';
import { EmployeePortal } from './pages/EmployeePortal';
import { AuthModal } from './components/AuthModal';
import { BookingWizardModal } from './components/BookingWizardModal';
import { 
  INITIAL_ARTISTS, 
  INITIAL_FLASH_DESIGNS, 
  INITIAL_PRODUCTS, 
  INITIAL_PAY_STUBS, 
  INITIAL_YEARLY_TAX_DATA, 
  INITIAL_CUSTOM_PAGES, 
  INITIAL_APPOINTMENTS, 
  INITIAL_INVENTORY, 
  INITIAL_REVIEWS 
} from './data/initialData';
import { playClickSound, playSuccessChime } from './utils/soundEffects';

export function App() {
  // Navigation & User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('shane_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState('landing'); // 'landing', 'owner-dashboard', 'employee-dashboard', 'custom-page'
  const [activeCustomSlug, setActiveCustomSlug] = useState('events/guest-spot-2026');

  // Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('owner');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPreselectedData, setBookingPreselectedData] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistent / Stateful Database
  const [artists, setArtists] = useState(() => {
    const saved = localStorage.getItem('shane_artists');
    return saved ? JSON.parse(saved) : INITIAL_ARTISTS;
  });

  const [flashDesigns, setFlashDesigns] = useState(() => {
    const saved = localStorage.getItem('shane_flash');
    return saved ? JSON.parse(saved) : INITIAL_FLASH_DESIGNS;
  });

  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  const [payStubs, setPayStubs] = useState(() => {
    const saved = localStorage.getItem('shane_paystubs');
    return saved ? JSON.parse(saved) : INITIAL_PAY_STUBS;
  });

  const [taxData, setTaxData] = useState(() => {
    const saved = localStorage.getItem('shane_tax');
    return saved ? JSON.parse(saved) : INITIAL_YEARLY_TAX_DATA;
  });

  const [customPages, setCustomPages] = useState(() => {
    const saved = localStorage.getItem('shane_pages');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_PAGES;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('shane_appts');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('shane_inv');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shane_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Save changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('shane_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('shane_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('shane_paystubs', JSON.stringify(payStubs));
  }, [payStubs]);

  useEffect(() => {
    localStorage.setItem('shane_pages', JSON.stringify(customPages));
  }, [customPages]);

  useEffect(() => {
    localStorage.setItem('shane_appts', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('shane_flash', JSON.stringify(flashDesigns));
  }, [flashDesigns]);

  useEffect(() => {
    localStorage.setItem('shane_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth Handlers
  const handleOpenAuth = (role = 'owner') => {
    playClickSound();
    setAuthRole(role);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'owner') {
      setActiveView('owner-dashboard');
    } else {
      setActiveView('employee-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('landing');
  };

  // Navigation Handler
  const handleNavigate = (view, targetSlugOrId = null) => {
    if (view === 'custom-page') {
      setActiveCustomSlug(targetSlugOrId);
      setActiveView('custom-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'landing') {
      setActiveView('landing');
      if (targetSlugOrId) {
        setTimeout(() => {
          const el = document.getElementById(targetSlugOrId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setActiveView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Cart Handlers
  const handleAddToCart = (product) => {
    playSuccessChime();
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId, delta) => {
    playClickSound();
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.id === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (productId) => {
    playClickSound();
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Booking Flow Triggers
  const handleOpenBookingWithSpec = (specData = null) => {
    setBookingPreselectedData(specData);
    setIsBookingModalOpen(true);
  };

  const handleClaimFlash = (flash) => {
    handleOpenBookingWithSpec({
      service: `Flash Claim - ${flash.title}`,
      artistId: flash.artistId,
      placement: flash.placement,
      size: flash.size,
      description: `Claiming original flash design: "${flash.title}" ($${flash.price})`,
      depositAmount: flash.deposit
    });
  };

  const handleSelectArtistForBooking = (artist) => {
    handleOpenBookingWithSpec({
      artistId: artist.id,
      depositAmount: artist.id === 'shane' ? 150 : 100
    });
  };

  const handleBookWithConcept = (conceptData) => {
    handleOpenBookingWithSpec({
      service: `AI Concept - ${conceptData.conceptStyle}`,
      conceptPrompt: conceptData.conceptPrompt,
      conceptStyle: conceptData.conceptStyle,
      conceptImage: conceptData.conceptImage,
      description: `AI Visualized Blueprint: "${conceptData.conceptPrompt}"`,
      depositAmount: 100
    });
  };

  const handleSaveAppointment = (newAppt) => {
    setAppointments([newAppt, ...appointments]);
  };

  // Pay Stub Handlers
  const handleAddPayStub = (newStub) => {
    setPayStubs([newStub, ...payStubs]);
  };

  const handleDeletePayStub = (stubId) => {
    setPayStubs(payStubs.filter((s) => s.id !== stubId));
  };

  // Custom Pages Handlers
  const handleSavePage = (savedPage) => {
    const exists = customPages.some((p) => p.id === savedPage.id);
    if (exists) {
      setCustomPages(customPages.map((p) => (p.id === savedPage.id ? savedPage : p)));
    } else {
      setCustomPages([savedPage, ...customPages]);
    }
  };

  const handleDeletePage = (pageId) => {
    setCustomPages(customPages.filter((p) => p.id !== pageId));
  };

  // Toggle Flash Status
  const handleToggleFlashClaimed = (flashId) => {
    setFlashDesigns((prev) =>
      prev.map((f) => (f.id === flashId ? { ...f, claimed: !f.claimed } : f))
    );
  };

  const handleAddFlash = (newFlash) => {
    setFlashDesigns([newFlash, ...flashDesigns]);
  };

  const handleUpdateStock = (newInventory) => {
    setInventory(newInventory);
  };

  const handleUpdateAppointmentStatus = (apptId, newStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: newStatus } : a))
    );
  };

  const currentCustomPage = customPages.find((p) => p.slug === activeCustomSlug);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans">
      {/* If in owner or employee view, render the dedicated portal */}
      {activeView === 'owner-dashboard' && currentUser?.role === 'owner' ? (
        <OwnerPortal
          currentUser={currentUser}
          taxData={taxData}
          payStubs={payStubs}
          onAddPayStub={handleAddPayStub}
          onDeletePayStub={handleDeletePayStub}
          customPages={customPages}
          onSavePage={handleSavePage}
          onDeletePage={handleDeletePage}
          appointments={appointments}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          inventory={inventory}
          onUpdateStock={handleUpdateStock}
          artists={artists}
          onNavigateToPublic={() => handleNavigate('landing')}
          onNavigateToCustomPage={(slug) => handleNavigate('custom-page', slug)}
          onLogout={handleLogout}
        />
      ) : activeView === 'employee-dashboard' && currentUser ? (
        <EmployeePortal
          currentUser={currentUser}
          appointments={appointments}
          payStubs={payStubs}
          flashDesigns={flashDesigns}
          onAddFlash={handleAddFlash}
          onToggleFlashClaimed={handleToggleFlashClaimed}
          onNavigateToPublic={() => handleNavigate('landing')}
          onLogout={handleLogout}
        />
      ) : (
        /* Public Experience */
        <div className="flex flex-col min-h-screen">
          <Navbar
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            activeView={activeView}
            cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenBooking={() => handleOpenBookingWithSpec(null)}
            customPages={customPages}
          />

          <main className="flex-1">
            {activeView === 'custom-page' ? (
              <CustomPageView
                page={currentCustomPage}
                onBackToHome={() => handleNavigate('landing')}
                onOpenBooking={() => handleOpenBookingWithSpec(null)}
              />
            ) : (
              <LandingPage
                artists={artists}
                flashDesigns={flashDesigns}
                products={products}
                reviews={reviews}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateCartQty={handleUpdateCartQty}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                isCartOpen={isCartOpen}
                onCloseCart={() => setIsCartOpen(false)}
                onOpenBookingWithSpec={handleOpenBookingWithSpec}
                onClaimFlash={handleClaimFlash}
                onSelectArtistForBooking={handleSelectArtistForBooking}
                onBookWithConcept={handleBookWithConcept}
              />
            )}
          </main>

          <Footer
            onOpenAuth={handleOpenAuth}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authRole}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Booking Wizard Modal */}
      <BookingWizardModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        artists={artists}
        preselectedData={bookingPreselectedData}
        onSaveAppointment={handleSaveAppointment}
      />
    </div>
  );
}

export default App;
