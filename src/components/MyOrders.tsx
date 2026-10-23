import React from 'react';
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  PhoneCall, 
  Printer, 
  MapPin, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { PrintOrder } from '../types';

interface MyOrdersProps {
  orders: PrintOrder[];
  onOpenGallery: () => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ orders, onOpenGallery }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white">Suivi des Commandes d'Impression</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Suivez en temps réel l'avancement de vos tirages d'affiches, bâches et flyers à Abidjan.
          </p>
        </div>

        <button
          onClick={onOpenGallery}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          Commander une nouvelle affiche
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Aucune commande en cours</h2>
          <p className="text-xs text-slate-400">
            Vous n'avez pas encore passé de commande d'impression physique. Choisissez une affiche pour commander vos tirages !
          </p>
          <button
            onClick={onOpenGallery}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Découvrir les formats d'impression
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            // Compute status step index
            const steps = [
              { key: 'PENDING', label: 'Commande Validée', icon: Clock },
              { key: 'IN_PRODUCTION', label: 'Impression en Cours', icon: Printer },
              { key: 'SHIPPED', label: 'En Cours de Livraison', icon: Truck },
              { key: 'DELIVERED', label: 'Colis Livré', icon: CheckCircle2 },
            ];

            const currentStepIndex =
              order.orderStatus === 'DELIVERED'
                ? 3
                : order.orderStatus === 'SHIPPED'
                ? 2
                : order.orderStatus === 'IN_PRODUCTION'
                ? 1
                : 0;

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-white"
              >
                {/* Order Top Bar */}
                <div className="bg-slate-950/80 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {order.orderNumber}
                    </span>
                    <span className="text-slate-400">
                      Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      PAIEMENT {order.paymentMethod} VALIDÉ
                    </span>
                    <span className="text-sm font-black text-white">
                      {order.totalPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  
                  {/* Status Progression Stepper */}
                  <div>
                    <div className="grid grid-cols-4 gap-2 relative">
                      {/* Connecting Line */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />
                      <div
                        className="absolute top-4 left-6 h-0.5 bg-emerald-500 transition-all -z-0"
                        style={{
                          width: `${(currentStepIndex / 3) * 100}%`,
                        }}
                      />

                      {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 ring-4 ring-emerald-500/20'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[10px] sm:text-xs mt-2 font-semibold ${
                                isCurrent
                                  ? 'text-emerald-400'
                                  : isDone
                                  ? 'text-slate-200'
                                  : 'text-slate-500'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
                    
                    {/* Visual & Poster */}
                    <div className="space-y-1">
                      <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                        Affiche Commandée
                      </span>
                      <p className="font-bold text-white text-sm">{order.posterTitle}</p>
                      <p className="text-emerald-400 font-mono">
                        {order.quantity} x {order.format} ({order.paperType})
                      </p>
                    </div>

                    {/* Delivery Destination */}
                    <div className="space-y-1">
                      <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                        Destinataire & Adresse
                      </span>
                      <p className="font-bold text-white">{order.clientName}</p>
                      <p className="text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        {order.deliveryCity}
                      </p>
                      {order.deliveryAddress && (
                        <p className="text-slate-400 text-[11px] truncate">{order.deliveryAddress}</p>
                      )}
                    </div>

                    {/* Assistance & Actions */}
                    <div className="flex flex-col justify-between items-start md:items-end gap-3">
                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[10px] block md:text-right">
                          Livraison Estimée
                        </span>
                        <p className="font-bold text-amber-300 text-sm md:text-right">
                          {order.estimatedDeliveryDate}
                        </p>
                      </div>

                      <a
                        href={`https://wa.me/2250748291102?text=${encodeURIComponent(
                          `Bonjour AffichePro, j'aimerais avoir des nouvelles de ma commande N° ${order.orderNumber} (${order.posterTitle}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                        Contacter l'atelier WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
