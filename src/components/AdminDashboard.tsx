import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Printer, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Truck, 
  PhoneCall, 
  Filter, 
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { PrintOrder, PosterTemplate } from '../types';

interface AdminDashboardProps {
  orders: PrintOrder[];
  templates: PosterTemplate[];
  onUpdateOrderStatus: (orderId: string, newStatus: PrintOrder['orderStatus']) => void;
  onOpenEditorWithTemplate: (template: PosterTemplate) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  templates,
  onUpdateOrderStatus,
  onOpenEditorWithTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'templates'>('orders');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PrintOrder['orderStatus']>('ALL');

  // Compute metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING').length;
  const inProductionOrders = orders.filter((o) => o.orderStatus === 'IN_PRODUCTION').length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.orderStatus === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white">Espace Administrateur AffichePro</h1>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
              Rôle Privilégié
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervision de la production d'impression, gestion des modèles du catalogue et relations clients en Côte d'Ivoire.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Commandes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'templates'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Catalogue Modèles ({templates.length})
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Chiffre d'Affaires</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {totalRevenue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FCFA</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tirages physiques validés</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>En Attente de Tirage</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {pendingOrders}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">BAT à valider sur WhatsApp</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>En Impression Atelier</span>
            <Printer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2">
            {inProductionOrders}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Bâches, A3 et Roll-ups</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Commandes Livrées</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {deliveredOrders}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Clients satisfaits</span>
        </div>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Gestion des Commandes Clients</h2>
              <p className="text-xs text-slate-400">
                Passez les commandes en production ou expédition, contactez le client pour confirmation.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['ALL', 'PENDING', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL'
                    ? 'Tous'
                    : st === 'PENDING'
                    ? 'En attente'
                    : st === 'IN_PRODUCTION'
                    ? 'En impression'
                    : st === 'SHIPPED'
                    ? 'Expédiées'
                    : 'Livrées'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">N° Commande</th>
                  <th className="py-3 px-4">Client & Contact</th>
                  <th className="py-3 px-4">Affiche & Quantité</th>
                  <th className="py-3 px-4">Lieu de Livraison</th>
                  <th className="py-3 px-4">Montant (FCFA)</th>
                  <th className="py-3 px-4">Statut Actuel</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {ord.orderNumber}
                      <span className="block text-[10px] text-slate-500 font-normal">
                        {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{ord.clientName}</div>
                      <a
                        href={`https://wa.me/${ord.clientPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 text-[11px] flex items-center gap-1 hover:underline"
                      >
                        <PhoneCall className="w-3 h-3" />
                        {ord.clientPhone}
                      </a>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white truncate max-w-[180px]">{ord.posterTitle}</div>
                      <div className="text-[11px] text-slate-400">
                        {ord.quantity}x {ord.format} • {ord.paperType}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-[180px]">
                      <div className="truncate text-slate-200">{ord.deliveryCity}</div>
                      {ord.deliveryAddress && (
                        <div className="text-[10px] text-slate-500 truncate">{ord.deliveryAddress}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-black text-emerald-400">
                        {ord.totalPrice.toLocaleString('fr-FR')}
                      </span>
                      <span className="block text-[10px] text-slate-500">{ord.paymentMethod}</span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) =>
                          onUpdateOrderStatus(ord.id, e.target.value as PrintOrder['orderStatus'])
                        }
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border bg-slate-950 focus:outline-none ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'text-emerald-400 border-emerald-500/50'
                            : ord.orderStatus === 'SHIPPED'
                            ? 'text-cyan-400 border-cyan-500/50'
                            : ord.orderStatus === 'IN_PRODUCTION'
                            ? 'text-purple-400 border-purple-500/50'
                            : 'text-amber-400 border-amber-500/50'
                        }`}
                      >
                        <option value="PENDING">En attente (Validation)</option>
                        <option value="IN_PRODUCTION">Impression en cours</option>
                        <option value="SHIPPED">En cours de livraison</option>
                        <option value="DELIVERED">Colis livré au client</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <a
                        href={`https://wa.me/${ord.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Bonjour ${ord.clientName}, ici l'équipe AffichePro concernant votre commande ${ord.orderNumber} pour l'affiche "${ord.posterTitle}".`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                      >
                        <PhoneCall className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES MANAGEMENT */}
      {activeTab === 'templates' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Modèles Actifs au Catalogue</h2>
              <p className="text-xs text-slate-400">
                Visualisez et modifiez les modèles disponibles pour les utilisateurs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="h-28 rounded-lg overflow-hidden bg-slate-900 relative">
                    <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white uppercase">
                      {tpl.categoryLabel}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white truncate">{tpl.name}</h3>
                    <p className="text-[10px] text-slate-400 truncate">{tpl.subtitle}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 mt-3">
                  <button
                    onClick={() => onOpenEditorWithTemplate(tpl)}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    Ouvrir dans l'éditeur
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
