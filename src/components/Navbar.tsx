import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Palette, 
  FolderHeart, 
  ShoppingBag, 
  ShieldCheck, 
  PlusCircle, 
  User, 
  Zap,
  Menu,
  X
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'gallery' | 'editor' | 'creations' | 'orders' | 'admin' | 'pricing';
  setActiveTab: (tab: 'home' | 'gallery' | 'editor' | 'creations' | 'orders' | 'admin' | 'pricing') => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onOpenUserModal: () => void;
  onOpenNewPoster: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  onOpenUserModal,
  onOpenNewPoster,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleRole = () => {
    setCurrentUser(prev => ({
      ...prev,
      role: prev.role === 'admin' ? 'client' : 'admin',
    }));
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                AffichePro
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                IA & Impression
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Création d'affiches professionnelles • Abidjan
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'home'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Accueil
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'gallery'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Modèles
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'editor'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            Éditeur
          </button>

          <button
            onClick={() => setActiveTab('creations')}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'creations'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            Mes Créations
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'orders'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Commandes
          </button>

          {/* Admin tab */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'admin'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/30'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Admin
          </button>
        </nav>

        {/* Right Action buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Create CTA */}
          <button
            onClick={onOpenNewPoster}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 flex items-center gap-2 shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            Créer une affiche
          </button>

          {/* User profile & Plan status */}
          <div 
            onClick={onOpenUserModal}
            className="flex items-center gap-2 pl-3 border-l border-slate-800 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:border-emerald-500 transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                {currentUser.name}
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  currentUser.role === 'admin' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {currentUser.role === 'admin' ? 'ADMIN' : currentUser.plan.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                {currentUser.plan === 'pro' ? 'Affiches illimitées' : `${currentUser.creationsLeft} crédits restants`}
              </div>
            </div>
          </div>

          {/* Quick role switcher pill */}
          <button
            onClick={toggleRole}
            title="Basculer entre la vue Client et la vue Administrateur"
            className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            {currentUser.role === 'admin' ? 'Mode Admin' : 'Mode Client'}
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={onOpenNewPoster}
            className="p-2 rounded-lg bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            Créer
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">{currentUser.name}</div>
                <div className="text-xs text-emerald-400 font-mono">
                  Forfait {currentUser.plan.toUpperCase()} • {currentUser.creationsLeft} restants
                </div>
              </div>
            </div>
            <button
              onClick={toggleRole}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-400"
            >
              {currentUser.role === 'admin' ? 'Vue Admin' : 'Vue Client'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-sm text-left font-medium ${
                activeTab === 'home' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => { setActiveTab('gallery'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-sm text-left font-medium ${
                activeTab === 'gallery' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300'
              }`}
            >
              Modèles d'affiches
            </button>
            <button
              onClick={() => { setActiveTab('editor'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-sm text-left font-medium ${
                activeTab === 'editor' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300'
              }`}
            >
              Éditeur Studio
            </button>
            <button
              onClick={() => { setActiveTab('creations'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-sm text-left font-medium ${
                activeTab === 'creations' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300'
              }`}
            >
              Mes Créations
            </button>
            <button
              onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-sm text-left font-medium ${
                activeTab === 'orders' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300'
              }`}
            >
              Mes Commandes
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-sm text-left font-medium ${
                activeTab === 'admin' ? 'bg-amber-950/60 text-amber-400' : 'text-amber-400/80'
              }`}
            >
              Administration
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
