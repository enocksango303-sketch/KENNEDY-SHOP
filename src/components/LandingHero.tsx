import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Flame, 
  Calendar,
  Compass,
  Heart,
  Car,
  Church,
  GraduationCap,
  Utensils,
  Trophy
} from 'lucide-react';
import { PosterCategory, PosterTemplate } from '../types';
import { PosterCanvas } from './PosterCanvas';

interface LandingHeroProps {
  templates: PosterTemplate[];
  onSelectTemplate: (template: PosterTemplate) => void;
  onOpenGallery: (category?: PosterCategory) => void;
  onStartWithAi: () => void;
  onOpenPricing: () => void;
}

const CATEGORIES_SHOWCASE = [
  { id: 'voyage' as PosterCategory, label: 'Voyage & Tourisme', icon: Compass, count: '8 modèles' },
  { id: 'mariage' as PosterCategory, label: 'Mariage & Fiançailles', icon: Heart, count: '6 modèles' },
  { id: 'carwash' as PosterCategory, label: 'Lavage Auto & Detailing', icon: Car, count: '5 modèles' },
  { id: 'eglise' as PosterCategory, label: 'Église & Culte', icon: Church, count: '7 modèles' },
  { id: 'scolaire' as PosterCategory, label: 'Rentrée Scolaire', icon: GraduationCap, count: '6 modèles' },
  { id: 'resto' as PosterCategory, label: 'Restaurant & Pâtisserie', icon: Utensils, count: '5 modèles' },
  { id: 'sport' as PosterCategory, label: 'Sport & Tournois', icon: Trophy, count: '4 modèles' },
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  templates,
  onSelectTemplate,
  onOpenGallery,
  onStartWithAi,
  onOpenPricing,
}) => {
  const featuredTemplates = templates.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 border-b border-slate-800 bg-radial-at-t from-slate-900 via-slate-950 to-black text-white">
        
        {/* Glowing atmospheric background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Plateforme N°1 en Côte d'Ivoire & Afrique de l'Ouest
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Créez des Affiches Professionnelles en{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              2 Minutes avec l'IA
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Pour vos églises, événements, mariages, commerces, écoles et restaurants.
            Personnalisez des modèles prêts à l'emploi, générez vos visuels par IA et commandez vos impressions livrées chez vous.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onOpenGallery()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Layers className="w-4 h-4 text-slate-950" />
              Explorer les 36 Modèles Prêts
            </button>

            <button
              onClick={onStartWithAi}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-950/40"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Générer une Affiche par IA
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zéro compétence graphique requise</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Export HD 300 DPI pour tirage</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Livraison à Abidjan sous 24h/48h</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Paiement Wave & Mobile Money</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Catégories Populaires</h2>
            <p className="text-xs text-slate-400">Sélectionnez votre domaine d'activité pour trouver votre modèle idéal</p>
          </div>
          <button
            onClick={() => onOpenGallery()}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Tout voir
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES_SHOWCASE.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onOpenGallery(cat.id)}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 p-3.5 rounded-xl cursor-pointer text-center group transition-all hover:scale-[1.03]"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 border border-slate-700 mx-auto flex items-center justify-center transition-colors mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                  {cat.label}
                </h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {cat.count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED TEMPLATES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-black text-white">Modèles Recommandés</h2>
            </div>
            <p className="text-xs text-slate-400">
              Inspirés des plus belles affiches créées pour les communautés et entreprises africaines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div className="p-3 bg-slate-950/60">
                <PosterCanvas poster={template} />
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                    {template.categoryLabel}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5 truncate">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {template.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-950/30"
                  >
                    Personnaliser
                  </button>
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Voir les détails"
                  >
                    Aperçu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PRICING SECTION - Strictly complying with Cahier des charges Page 4 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            Modèle Économique & Forfaits
          </span>
          <h2 className="text-3xl font-black text-white mt-3">Tarifs Clairs & Sans Engagement</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Commencez gratuitement avec 2 affiches par mois, ou passez au niveau supérieur avec nos forfaits en Francs CFA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Plan Gratuit */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Gratuit</h3>
                <p className="text-xs text-slate-400">Pour tester et créer ses premiers visuels</p>
              </div>
              <div className="text-3xl font-black text-white">
                0 <span className="text-sm font-semibold text-slate-400">FCFA</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>2 affiches offertes par mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Accès à toute la galerie de modèles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Export JPG standard</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span>Assistant rédactionnel IA basique</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenGallery()}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Commencer Gratuitement
            </button>
          </div>

          {/* Plan Starter (Popular) */}
          <div className="bg-gradient-to-b from-slate-900 to-emerald-950/40 border-2 border-emerald-500 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
              Recommandé Particuliers & PME
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400">Pour églises, formateurs et commerçants actifs</p>
              </div>
              <div className="text-3xl font-black text-emerald-400">
                5 000 <span className="text-sm font-semibold text-slate-400">FCFA / mois</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">Jusqu'à 20 affiches par mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Génération de textes & titres par IA illimitée</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exports Haute Définition (PNG & 300 DPI)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Accès prioritaire aux commandes d'impression</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenPricing}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors shadow-lg shadow-emerald-950/50"
            >
              Souscrire Starter (5 000 FCFA)
            </button>
          </div>

          {/* Plan Pro */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Pro / Entreprise</h3>
                <p className="text-xs text-slate-400">Agences événementielles & grandes communautés</p>
              </div>
              <div className="text-3xl font-black text-amber-400">
                10 000 <span className="text-sm font-semibold text-slate-400">FCFA / mois</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold">Affiches illimitées</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Génération d'images IA illimitée</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Remise 15% sur tous les tirages d'impression</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Support VIP WhatsApp dédié 24h/7j</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenPricing}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 transition-colors"
            >
              Souscrire Pro (10 000 FCFA)
            </button>
          </div>
        </div>

        {/* Local payment badges */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <span>Moyens de paiement acceptés : </span>
          <span className="text-white font-semibold">Wave • Orange Money • MTN MoMo • Moov Money • Carte Visa/Mastercard</span>
        </div>
      </section>
    </div>
  );
};
