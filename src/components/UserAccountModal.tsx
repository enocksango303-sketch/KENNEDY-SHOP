import React from 'react';
import { 
  User, 
  X, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Sparkles, 
  CreditCard, 
  PhoneCall, 
  CheckCircle2 
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onOpenPricing: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  onOpenPricing,
}) => {
  if (!isOpen) return null;

  const toggleRole = () => {
    setCurrentUser((prev) => ({
      ...prev,
      role: prev.role === 'admin' ? 'client' : 'admin',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white overflow-hidden">
        
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">{currentUser.name}</h2>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          
          {/* Subscription plan card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">FORFAIT ACTUEL</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {currentUser.plan}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Crédits de création restants :</span>
              <span className="font-bold text-white">
                {currentUser.plan === 'pro' ? 'Illimités' : `${currentUser.creationsLeft} affiches`}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenPricing();
              }}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-slate-950" />
              Changer de formule / Recharger
            </button>
          </div>

          {/* Role Switcher (Client vs Admin) */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Mode Démonstration & Rôle</span>
                <span className="text-[11px] text-slate-400">
                  Actuellement : {currentUser.role === 'admin' ? 'Administrateur' : 'Client standard'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleRole}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Passer en {currentUser.role === 'admin' ? 'Mode Client' : 'Mode Admin'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Le rôle Administrateur permet d'accéder à l'onglet "Admin" pour changer le statut des commandes d'impression et superviser le catalogue de modèles.
            </p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
