import React, { useState } from 'react';
import { 
  Search, 
  Layers, 
  Sparkles, 
  Printer, 
  Filter, 
  ArrowRight,
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

interface TemplateGalleryProps {
  templates: PosterTemplate[];
  selectedCategory: PosterCategory;
  onSelectCategory: (cat: PosterCategory) => void;
  onCustomizeTemplate: (template: PosterTemplate) => void;
  onOrderTemplate: (template: PosterTemplate) => void;
  onStartWithAi: () => void;
}

const CATEGORIES: { id: PosterCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'Tous les modèles', icon: Layers },
  { id: 'voyage', label: 'Voyage & Tourisme', icon: Compass },
  { id: 'mariage', label: 'Mariage & Fiançailles', icon: Heart },
  { id: 'carwash', label: 'Lavage Auto & Detailing', icon: Car },
  { id: 'eglise', label: 'Église & Culte', icon: Church },
  { id: 'scolaire', label: 'Rentrée Scolaire', icon: GraduationCap },
  { id: 'resto', label: 'Restaurant & Pâtisserie', icon: Utensils },
  { id: 'sport', label: 'Sport & Tournois', icon: Trophy },
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  selectedCategory,
  onSelectCategory,
  onCustomizeTemplate,
  onOrderTemplate,
  onStartWithAi,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      tpl.name.toLowerCase().includes(q) ||
      tpl.title.toLowerCase().includes(q) ||
      tpl.subtitle.toLowerCase().includes(q) ||
      tpl.categoryLabel.toLowerCase().includes(q) ||
      tpl.location.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            Galerie Officielle AffichePro
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Catalogue de Modèles Prêts à Personnaliser
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Retrouvez tous les formats pour voyages, mariages, car wash, églises, rentrée scolaire, restaurants et tournois sportifs.
          </p>
        </div>

        <button
          onClick={onStartWithAi}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-purple-950/70 hover:bg-purple-900/90 border border-purple-500/40 text-purple-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition-transform hover:scale-105 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Créer un nouveau modèle avec l'IA
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé, ville, thème..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Templates Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Affichage de <span className="font-bold text-white">{filteredTemplates.length}</span> modèle(s)
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-emerald-400 hover:underline"
          >
            Effacer la recherche
          </button>
        )}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Aucun modèle ne correspond à votre recherche</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Essayez de modifier votre mot-clé ou demandez à l'IA de concevoir votre affiche à partir de zéro !
          </p>
          <button
            onClick={onStartWithAi}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            Générer ce visuel par l'IA
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl hover:-translate-y-1 duration-300"
            >
              {/* Canvas visual preview */}
              <div 
                onClick={() => onCustomizeTemplate(template)}
                className="p-3 bg-slate-950/70 cursor-pointer"
              >
                <PosterCanvas poster={template} />
              </div>

              {/* Template Meta and Quick Actions */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                      {template.categoryLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {template.aspectRatio}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 truncate group-hover:text-emerald-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {template.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onCustomizeTemplate(template)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 flex items-center justify-center gap-1 transition-colors shadow-md shadow-emerald-950/30"
                  >
                    Personnaliser
                  </button>
                  <button
                    onClick={() => onOrderTemplate(template)}
                    className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 transition-colors"
                    title="Commander directement en impression"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
