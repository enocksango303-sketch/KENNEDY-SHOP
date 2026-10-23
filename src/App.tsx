import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { TemplateGallery } from './components/TemplateGallery';
import { PosterEditor } from './components/PosterEditor';
import { MyCreations } from './components/MyCreations';
import { MyOrders } from './components/MyOrders';
import { AdminDashboard } from './components/AdminDashboard';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { OrderModal } from './components/OrderModal';
import { UserAccountModal } from './components/UserAccountModal';
import { PricingModal } from './components/PricingModal';
import { INITIAL_TEMPLATES } from './data/templates';
import { PosterCategory, PosterTemplate, PrintOrder, UserPoster, UserProfile } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'gallery' | 'editor' | 'creations' | 'orders' | 'admin' | 'pricing'
  >('home');

  // Templates
  const [templates, setTemplates] = useState<PosterTemplate[]>(INITIAL_TEMPLATES);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<PosterCategory>('all');
  const [currentPoster, setCurrentPoster] = useState<PosterTemplate>(INITIAL_TEMPLATES[0]);

  // Saved creations (persisted in localStorage)
  const [creations, setCreations] = useState<UserPoster[]>(() => {
    try {
      const saved = localStorage.getItem('affichepro_creations');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    // Seed with initial sample creations
    return [
      {
        ...INITIAL_TEMPLATES[0],
        id: 'creation-1',
        savedAt: new Date(Date.now() - 3600 * 24 * 1000).toISOString(),
      },
      {
        ...INITIAL_TEMPLATES[5],
        id: 'creation-2',
        savedAt: new Date(Date.now() - 3600 * 48 * 1000).toISOString(),
      },
    ];
  });

  // Orders
  const [orders, setOrders] = useState<PrintOrder[]>([]);

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('affichepro_user');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      id: 'usr-1',
      name: 'Pasteur Emmanuel Konan',
      email: 'eglise.grace@gmail.com',
      phone: '+225 07 48 29 11 02',
      role: 'client',
      plan: 'starter',
      creationsLeft: 18,
      totalCreationsCount: 2,
    };
  });

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [posterToOrder, setPosterToOrder] = useState<PosterTemplate | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Sync creations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('affichepro_creations', JSON.stringify(creations));
    } catch (_) {}
  }, [creations]);

  // Sync user to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('affichepro_user', JSON.stringify(currentUser));
    } catch (_) {}
  }, [currentUser]);

  // Fetch initial orders from backend API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (e) {
        console.warn('Backend orders fetch failed, using local fallback:', e);
      }
    };
    fetchOrders();
  }, []);

  // Handlers
  const handleSelectTemplate = (template: PosterTemplate) => {
    setCurrentPoster(template);
    setActiveTab('editor');
  };

  const handleOpenGalleryWithCategory = (category: PosterCategory = 'all') => {
    setSelectedGalleryCategory(category);
    setActiveTab('gallery');
  };

  const handleSaveToCreations = (poster: PosterTemplate) => {
    const existingIndex = creations.findIndex((c) => c.id === poster.id);
    const updatedUserPoster: UserPoster = {
      ...poster,
      savedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const updated = [...creations];
      updated[existingIndex] = updatedUserPoster;
      setCreations(updated);
    } else {
      setCreations([updatedUserPoster, ...creations]);
    }
  };

  const handleDuplicatePoster = (poster: UserPoster) => {
    const copy: UserPoster = {
      ...poster,
      id: `copy-${Date.now()}`,
      title: `${poster.title} (Copie)`,
      savedAt: new Date().toISOString(),
    };
    setCreations([copy, ...creations]);
  };

  const handleDeletePoster = (id: string) => {
    setCreations(creations.filter((c) => c.id !== id));
  };

  const handleOpenOrderModalFor = (poster: PosterTemplate) => {
    setPosterToOrder(poster);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = (newOrder: PrintOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Also save to creations if not already there
    const posterTemplate = templates.find((t) => t.id === newOrder.posterId) || currentPoster;
    handleSaveToCreations(posterTemplate);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: PrintOrder['orderStatus']) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.warn('Status update sync error:', e);
    }
  };

  const handlePosterGeneratedByAi = (newPoster: PosterTemplate) => {
    setTemplates((prev) => [newPoster, ...prev]);
    setCurrentPoster(newPoster);
    setActiveTab('editor');
    handleSaveToCreations(newPoster);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Primary Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenNewPoster={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingHero
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onOpenGallery={handleOpenGalleryWithCategory}
            onStartWithAi={() => setIsAiModalOpen(true)}
            onOpenPricing={() => setIsPricingModalOpen(true)}
          />
        )}

        {activeTab === 'gallery' && (
          <TemplateGallery
            templates={templates}
            selectedCategory={selectedGalleryCategory}
            onSelectCategory={setSelectedGalleryCategory}
            onCustomizeTemplate={handleSelectTemplate}
            onOrderTemplate={handleOpenOrderModalFor}
            onStartWithAi={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'editor' && (
          <PosterEditor
            currentPoster={currentPoster}
            onUpdatePoster={setCurrentPoster}
            onSaveToCreations={handleSaveToCreations}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {activeTab === 'creations' && (
          <MyCreations
            creations={creations}
            onEditPoster={handleSelectTemplate}
            onDuplicatePoster={handleDuplicatePoster}
            onDeletePoster={handleDeletePoster}
            onOrderPoster={handleOpenOrderModalFor}
            onOpenNewPoster={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <MyOrders
            orders={orders}
            onOpenGallery={() => setActiveTab('gallery')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            orders={orders}
            templates={templates}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenEditorWithTemplate={handleSelectTemplate}
          />
        )}

        {activeTab === 'pricing' && (
          <div className="py-12">
            <LandingHero
              templates={templates}
              onSelectTemplate={handleSelectTemplate}
              onOpenGallery={handleOpenGalleryWithCategory}
              onStartWithAi={() => setIsAiModalOpen(true)}
              onOpenPricing={() => setIsPricingModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">AffichePro</span>
            <span>• Conçu pour l'Afrique de l'Ouest & francophonie</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>Abidjan, Côte d'Ivoire</span>
            <span>Support WhatsApp: +225 07 48 29 11 02</span>
            <span>Paiements Wave & Mobile Money</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onPosterGenerated={handlePosterGeneratedByAi}
      />

      {posterToOrder && (
        <OrderModal
          poster={posterToOrder}
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setPosterToOrder(null);
          }}
          onOrderSuccess={(order) => {
            handleOrderSuccess(order);
          }}
        />
      )}

      <UserAccountModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenPricing={() => setIsPricingModalOpen(true)}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </div>
  );
}
