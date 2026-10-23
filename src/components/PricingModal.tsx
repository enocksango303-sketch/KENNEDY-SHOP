import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Crown, 
  Zap, 
  CreditCard, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'gratuit' | 'starter' | 'pro'>('starter');
  const [paymentMethod, setPaymentMethod] = useState<'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'CARTE'>('WAVE');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const creationsToAdd = selectedPlan === 'pro' ? 9999 : selectedPlan === 'starter' ? 20 : 2;
      setCurrentUser((prev) => ({
        ...prev,
        plan: selectedPlan,
        creationsLeft: creationsToAdd,
      }));
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}
      alert(`Félicitations ! Votre forfait ${selectedPlan.toUpperCase()} est désormais actif.`);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white my-8 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Choisissez Votre Forfait AffichePro</h2>
              <p className="text-xs text-slate-400">Tarification officielle en Francs CFA (XOF)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'gratuit' as const,
                title: 'Gratuit',
                price: '0 FCFA',
                period: 'À vie',
                desc: '2 affiches par mois',
                features: ['Export standard JPG', 'Accès galerie'],
              },
              {
                id: 'starter' as const,
                title: 'Starter',
                price: '5 000 FCFA',
                period: '/ mois',
                desc: '20 affiches / mois',
                features: ['Génération IA illimitée', 'Export 300 DPI HD', 'Support WhatsApp'],
                recommended: true,
              },
              {
                id: 'pro' as const,
                title: 'Pro VIP',
                price: '10 000 FCFA',
                period: '/ mois',
                desc: 'Affiches illimitées',
                features: ['Images IA illimitées', '-15% sur les impressions', 'Support 24/7'],
              },
            ].map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/50'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{p.title}</span>
                      {p.recommended && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-400">
                          TOP
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-lg font-black text-white">{p.price}</span>
                      <span className="text-[10px] text-slate-400 block">{p.period}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold">{p.desc}</p>
                    <ul className="text-[10px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Method selector */}
          {selectedPlan !== 'gratuit' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Mode de règlement en Côte d'Ivoire
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'WAVE' as const, label: 'Wave (0%)' },
                  { id: 'ORANGE_MONEY' as const, label: 'Orange Money' },
                  { id: 'MTN_MOMO' as const, label: 'MTN MoMo' },
                  { id: 'CARTE' as const, label: 'Carte Bancaire' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === pm.id
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 ring-2 ring-emerald-500/40'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Activation immédiate & sécurisée
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Validation...
                  </>
                ) : (
                  <span>Confirmer l'abonnement</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
