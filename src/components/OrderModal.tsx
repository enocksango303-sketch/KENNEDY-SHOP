import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  PhoneCall, 
  CreditCard, 
  Loader2,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PosterTemplate, PrintOrder } from '../types';

interface OrderModalProps {
  poster: PosterTemplate;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: PrintOrder) => void;
}

const PRINT_FORMATS = [
  {
    id: 'A3',
    name: 'Affiche A3 Murale (29.7 x 42 cm)',
    description: 'Le format roi pour vitrines, poteaux et commerces',
    paperDefault: 'Papier Couché Brillant 350g haute tenue',
    unitPrice: 750,
    minQty: 5,
    popular: true,
  },
  {
    id: 'BACHE',
    name: 'Bâche PVC Grand Format (2m x 1m20)',
    description: 'Imperméable avec œillets métalliques pour extérieurs & églises',
    paperDefault: 'Bâche PVC 450g résistante pluie et soleil UV',
    unitPrice: 8500,
    minQty: 1,
    popular: true,
  },
  {
    id: 'ROLLUP',
    name: 'Roll-up Pro & Totem (85 x 200 cm)',
    description: 'Support aluminium rétractable avec housse de transport VIP',
    paperDefault: 'Toile polypropylène indéchirable anti-reflet',
    unitPrice: 12000,
    minQty: 1,
  },
  {
    id: 'A4',
    name: 'Affichette A4 Vitrine (21 x 29.7 cm)',
    description: 'Idéal pour comptoirs, réceptions et affichage intérieur',
    paperDefault: 'Papier Couché 300g satiné',
    unitPrice: 300,
    minQty: 10,
  },
  {
    id: 'FLYER',
    name: 'Flyers A5 Main Propre (14.8 x 21 cm)',
    description: 'Parfait pour distribution de masse et prospection directe',
    paperDefault: 'Couché Moderne 170g Recto/Verso',
    unitPrice: 150,
    minQty: 50,
  },
];

const CITIES_COMMUNES = [
  'Abidjan - Cocody (Angré, Danga, Riviera, 2 Plateaux)',
  'Abidjan - Plateau (Centre des affaires)',
  'Abidjan - Marcory (Zone 4, Biétry, Résidentiel)',
  'Abidjan - Yopougon (Siporex, Niangon, Maroc)',
  'Abidjan - Treichville & Koumassi',
  'Abidjan - Port-Bouët (Aéroport, Vridi)',
  'Abidjan - Bingerville & Grand-Bassam',
  'Intérieur - Bouaké',
  'Intérieur - Yamoussoukro',
  'Intérieur - San Pedro',
  'Autre localité / International',
];

export const OrderModal: React.FC<OrderModalProps> = ({
  poster,
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const [selectedFormat, setSelectedFormat] = useState('A3');
  const [quantity, setQuantity] = useState(10);
  const [paperType, setPaperType] = useState('Papier Couché Brillant 350g haute tenue');
  
  // Client info
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+225 ');
  const [clientEmail, setClientEmail] = useState('');
  const [deliveryCity, setDeliveryCity] = useState(CITIES_COMMUNES[0]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'CARTE'>('WAVE');

  // AI order recommendation state
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [aiEventDesc, setAiEventDesc] = useState('');
  const [aiAudience, setAiAudience] = useState('Environ 200 à 500 personnes');
  const [aiBudget, setAiBudget] = useState('25000');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PrintOrder | null>(null);

  if (!isOpen) return null;

  const currentFormatConfig = PRINT_FORMATS.find((f) => f.id === selectedFormat) || PRINT_FORMATS[0];

  // Calculate volume discount
  let discountPercent = 0;
  if (selectedFormat === 'A3' || selectedFormat === 'A4') {
    if (quantity >= 100) discountPercent = 0.2;
    else if (quantity >= 50) discountPercent = 0.1;
  } else if (selectedFormat === 'FLYER') {
    if (quantity >= 500) discountPercent = 0.25;
    else if (quantity >= 200) discountPercent = 0.15;
  }

  const rawTotal = currentFormatConfig.unitPrice * quantity;
  const totalPrice = Math.round(rawTotal * (1 - discountPercent));

  // Handle AI Recommendation call
  const handleGetAiRecommendation = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/recommend-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posterTitle: poster.title,
          category: poster.categoryLabel,
          eventDescription: aiEventDesc || poster.description || poster.subtitle,
          expectedAudience: aiAudience,
          budget: aiBudget,
          city: deliveryCity,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setAiRecommendation(data.data);
        // Pre-apply recommendation values
        if (data.data.recommendedFormat) {
          const match = PRINT_FORMATS.find((f) => f.id === data.data.recommendedFormat);
          if (match) {
            setSelectedFormat(match.id);
            setPaperType(data.data.paperType || match.paperDefault);
          }
        }
        if (data.data.recommendedQuantity) {
          setQuantity(data.data.recommendedQuantity);
        }
      }
    } catch (err) {
      console.error('Failed to get AI recommendation:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || clientPhone.trim() === '+225') {
      alert('Veuillez renseigner votre nom et votre numéro de téléphone WhatsApp pour la confirmation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        posterId: poster.id,
        posterTitle: poster.title,
        category: poster.categoryLabel,
        format: selectedFormat,
        paperType,
        quantity,
        unitPrice: currentFormatConfig.unitPrice,
        totalPrice,
        clientName,
        clientPhone,
        clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '')}@contact.ci`,
        deliveryCity,
        deliveryAddress: deliveryAddress || 'Livraison à domicile / point relais convenu par WhatsApp',
        paymentMethod,
        notes,
        posterPreviewUrl: poster.thumbnail,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCompletedOrder(data.order);
        onOrderSuccess(data.order);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (_) {}
      } else {
        alert('Erreur lors de la commande: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (err: any) {
      alert('Erreur réseau lors de la validation: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white my-8 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                Commander l'Impression Pro
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  Abidjan Express
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Affiche : <span className="text-slate-200 font-semibold">{poster.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedOrder ? (
          /* SUCCESS VIEW */
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Commande Enregistrée avec Succès !</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Votre visuel haute définition a été transmis à notre atelier d'impression partenaire à Abidjan.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="max-w-lg mx-auto bg-slate-950/70 border border-slate-800 rounded-xl p-5 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">N° COMMANDE :</span>
                <span className="font-bold text-amber-400">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SUPPORT CHOISI :</span>
                <span className="text-white font-semibold">{completedOrder.paperType} ({completedOrder.format})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">QUANTITÉ :</span>
                <span className="text-white font-semibold">{completedOrder.quantity} exemplaires</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TOTAL PAYÉ :</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {completedOrder.totalPrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MODE DE PAIEMENT :</span>
                <span className="text-white">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">LIVRAISON :</span>
                <span className="text-slate-200">{completedOrder.deliveryCity}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-emerald-400">
                <span>ESTIMATION LIVRAISON :</span>
                <span className="font-bold">{completedOrder.estimatedDeliveryDate}</span>
              </div>
            </div>

            {/* WhatsApp Contact Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <a
                href={`https://wa.me/2250748291102?text=${encodeURIComponent(
                  `Bonjour AffichePro, je viens de passer la commande d'affiche N° ${completedOrder.orderNumber} pour "${completedOrder.posterTitle}". Pouvons-nous valider le Bon À Tirer (BAT) ?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <PhoneCall className="w-4 h-4" />
                Valider le BAT sur WhatsApp
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm"
              >
                Fermer & Retour à l'atelier
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-6">
            
            {/* AI Advisor Banner / Drawer */}
            <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs sm:text-sm font-bold text-purple-200">
                    Conseiller d'Impression IA AffichePro
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiAdvisor(!showAiAdvisor)}
                  className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors"
                >
                  {showAiAdvisor ? 'Masquer' : 'Calculer le meilleur choix IA'}
                </button>
              </div>

              {showAiAdvisor && (
                <div className="mt-4 pt-3 border-t border-purple-500/20 space-y-3">
                  <p className="text-xs text-slate-300">
                    L'IA analyse votre événement et votre budget pour vous recommander la combinaison la plus impactante :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Audience / Personnes ciblées</label>
                      <input
                        type="text"
                        value={aiAudience}
                        onChange={(e) => setAiAudience(e.target.value)}
                        placeholder="Ex: 500 fidèles ou quartier Cocody"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Budget envisagé (FCFA)</label>
                      <input
                        type="number"
                        value={aiBudget}
                        onChange={(e) => setAiBudget(e.target.value)}
                        placeholder="25000"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleGetAiRecommendation}
                        disabled={aiLoading}
                        className="w-full h-8 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Générer la commande idéale
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {aiRecommendation && (
                    <div className="bg-slate-950/80 border border-purple-500/40 rounded-lg p-3 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Recommandation appliquée : {aiRecommendation.recommendedQuantity} x {aiRecommendation.recommendedFormat} ({aiRecommendation.totalPrice.toLocaleString('fr-FR')} FCFA)
                      </div>
                      <p className="text-slate-300 italic">
                        "{aiRecommendation.expertReasoning}"
                      </p>
                      <div className="text-[11px] text-amber-300 flex items-start gap-1">
                        <Truck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Conseil de distribution: {aiRecommendation.displayAdvice}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 1: Format & Support selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Choisissez le format & le support
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {PRINT_FORMATS.map((fmt) => {
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => {
                        setSelectedFormat(fmt.id);
                        setPaperType(fmt.paperDefault);
                        if (quantity < fmt.minQty) setQuantity(fmt.minQty);
                      }}
                      className={`cursor-pointer rounded-xl p-3 border transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-white">{fmt.name}</span>
                        {fmt.popular && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                            TOP
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{fmt.description}</p>
                      <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center justify-between">
                        <span>{fmt.unitPrice.toLocaleString('fr-FR')} FCFA <span className="text-[10px] text-slate-400 font-normal">/ unité</span></span>
                        <span className="text-[10px] text-slate-400">Min: {fmt.minQty}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Quantity & Pricing summary */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  2. Quantité souhaitée
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={currentFormatConfig.minQty}
                    max={selectedFormat === 'BACHE' ? 10 : selectedFormat === 'ROLLUP' ? 10 : 500}
                    step={selectedFormat === 'BACHE' || selectedFormat === 'ROLLUP' ? 1 : 5}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <input
                    type="number"
                    min={currentFormatConfig.minQty}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(currentFormatConfig.minQty, Number(e.target.value)))}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-sm text-white"
                  />
                </div>
                {discountPercent > 0 && (
                  <p className="text-xs text-amber-400 font-semibold mt-1">
                    🎉 Remise volume de {discountPercent * 100}% appliquée !
                  </p>
                )}
              </div>

              {/* Total Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">TOTAL ESTIMÉ</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">
                    {totalPrice.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Délai moyen: 24h à 48h</span>
                  <span className="block text-amber-400 font-medium">Épreuve BAT incluse</span>
                </div>
              </div>
            </div>

            {/* Step 3: Shipping & Contact details */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Coordonnées de livraison & validation BAT
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nom complet / Structure *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Pasteur Emmanuel / Boutique Elegance"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Téléphone WhatsApp (obligatoire pour le BAT) *</label>
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ville ou Commune de livraison *</label>
                  <select
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CITIES_COMMUNES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Adresse ou point de repère précis</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ex: Près de la Pharmacie du 22ème, carrefour Duncan"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Payment method selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                4. Mode de paiement sécurisé
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'WAVE', label: 'Wave', sub: '0% frais', color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300' },
                  { id: 'ORANGE_MONEY', label: 'Orange Money', sub: '#144#', color: 'border-orange-500/50 bg-orange-950/20 text-orange-300' },
                  { id: 'MTN_MOMO', label: 'MTN MoMo', sub: '*133#', color: 'border-yellow-500/50 bg-yellow-950/20 text-yellow-300' },
                  { id: 'MOOV_MONEY', label: 'Moov Money', sub: '*155#', color: 'border-blue-500/50 bg-blue-950/20 text-blue-300' },
                  { id: 'CARTE', label: 'Carte Bancaire', sub: 'Visa / Mastercard', color: 'border-purple-500/50 bg-purple-950/20 text-purple-300' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === pm.id
                        ? `${pm.color} ring-2 ring-emerald-500 font-bold scale-[1.02]`
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">{pm.label}</span>
                    <span className="text-[10px] opacity-75">{pm.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Paiement 100% sécurisé & Satisfaction garantie
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      Transmission...
                    </>
                  ) : (
                    <>
                      <span>Confirmer ({totalPrice.toLocaleString('fr-FR')} FCFA)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
