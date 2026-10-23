import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Wand2, 
  Loader2, 
  Compass, 
  Heart, 
  Car, 
  Church, 
  GraduationCap, 
  Utensils, 
  Trophy,
  ArrowRight
} from 'lucide-react';
import { PosterCategory, PosterTemplate } from '../types';
import { COLOR_PALETTES } from '../data/templates';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPosterGenerated: (poster: PosterTemplate) => void;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPosterGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PosterCategory>('eglise');
  const [tone, setTone] = useState('Inspirant et prestigieux');
  const [isLoading, setIsLoading] = useState(false);
  const [stepStatus, setStepStatus] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Veuillez décrire brièvement votre événement.');
      return;
    }

    setIsLoading(true);
    setStepStatus('Rdaction des textes et titres avec Gemini...');

    try {
      // 1. Generate text and layout content
      const textRes = await fetch('/api/ai/generate-poster-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: prompt,
          eventType: selectedCategory,
          tone,
        }),
      });

      const textData = await textRes.json();
      const content = textData.data || {};

      setStepStatus('Génération du visuel haute résolution par l\'IA...');

      // 2. Generate or match image
      const imagePrompt = content.imagePromptSuggestion || prompt;
      const imgRes = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: '4:5',
          category: selectedCategory,
        }),
      });

      const imgData = await imgRes.json();
      const imageUrl =
        imgData.imageUrl ||
        'https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?auto=format&fit=crop&w=1200&q=80';

      // Pick palette
      const palette = COLOR_PALETTES.find(
        (p) => p.name.toLowerCase() === (content.suggestedPalette?.paletteName || '').toLowerCase()
      ) || COLOR_PALETTES[0];

      const newPoster: PosterTemplate = {
        id: `ai-poster-${Date.now()}`,
        name: content.title || 'Affiche Générée par IA',
        category: selectedCategory,
        categoryLabel:
          selectedCategory === 'eglise'
            ? 'Église & Culte'
            : selectedCategory === 'voyage'
            ? 'Voyage & Tourisme'
            : selectedCategory === 'mariage'
            ? 'Mariage & Fiançailles'
            : selectedCategory === 'carwash'
            ? 'Lavage Auto & Detailing'
            : selectedCategory === 'scolaire'
            ? 'Rentrée Scolaire'
            : selectedCategory === 'resto'
            ? 'Restaurant & Pâtisserie'
            : 'Sport & Tournois',
        thumbnail: imageUrl,
        title: content.title || 'GRAND ÉVÉNEMENT 2026',
        subtitle: content.subtitle || 'Une expérience inoubliable au cœur d\'Abidjan',
        badge: content.badge || 'ENTRÉE LIBRE',
        date: content.date || 'Samedi Prochain',
        time: content.time || 'À partir de 18h00',
        location: content.location || 'Abidjan, Côte d\'Ivoire',
        contact: content.contact || 'Infoline WhatsApp: +225 07 00 00 00 00',
        organizer: content.organizer || 'Comité d\'Organisation',
        price: content.price || 'Accès Libre',
        description: content.description || 'Venez nombreux participer à cette rencontre exceptionnelle.',
        palette,
        fontFamily: 'display',
        aspectRatio: '4:5',
        overlayOpacity: 0.65,
      };

      onPosterGenerated(newPoster);
      onClose();
    } catch (err: any) {
      alert('Erreur lors de la création IA: ' + err.message);
    } finally {
      setIsLoading(false);
      setStepStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl text-white my-8 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Créateur d'Affiche Intégral par IA
              </h2>
              <p className="text-xs text-purple-200">
                Génération conjointe de visuel, titres, slogans & coordonnées
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

        {/* Form */}
        <form onSubmit={handleGenerate} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              1. Choisissez votre domaine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'eglise' as PosterCategory, label: 'Église & Prière' },
                { id: 'voyage' as PosterCategory, label: 'Voyage & Tour' },
                { id: 'mariage' as PosterCategory, label: 'Mariage' },
                { id: 'carwash' as PosterCategory, label: 'Lavage Auto' },
                { id: 'scolaire' as PosterCategory, label: 'Rentrée Scolaire' },
                { id: 'resto' as PosterCategory, label: 'Restaurant / Food' },
                { id: 'sport' as PosterCategory, label: 'Sport & Tournoi' },
                { id: 'commerce' as PosterCategory, label: 'Commerce & Promo' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    selectedCategory === cat.id
                      ? 'bg-purple-950/60 border-purple-400 text-purple-200 ring-2 ring-purple-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              2. Décrivez votre événement en quelques mots
            </label>
            <textarea
              rows={3}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Grande veillée de prière et louange avec pasteur David ce vendredi à Cocody Angré 8ème tranche, entrée gratuite, infoline WhatsApp 07 48 29 11 02..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Quick inspiration ideas */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">Exemples rapides :</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Voyage de noces à Zanzibar avec hôtel 5 étoiles et vol inclus',
                'Lavage auto carrosserie & lustrage avec 40% de réduction à Marcory',
                'Rentrée scolaire bilingue avec bus climatisé et inscription offerte',
                'Grande fête des mères avec buffet africain et concert live',
              ].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-left truncate max-w-full"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/50 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{stepStatus || 'Création en cours...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Générer le Chef-d'œuvre</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
