import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Save, 
  Printer, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Layers, 
  Upload, 
  RefreshCw, 
  Check, 
  Maximize2,
  Wand2,
  Tag,
  Calendar,
  Clock,
  MapPin,
  PhoneCall,
  User,
  Sliders,
  Loader2,
  FileText,
  ChevronDown
} from 'lucide-react';
import { PosterTemplate, PrintOrder } from '../types';
import { COLOR_PALETTES, STOCK_PHOTOS } from '../data/templates';
import { PosterCanvas } from './PosterCanvas';
import { exportPosterAsImage, exportPosterAsPDF } from '../utils/canvasExporter';
import { OrderModal } from './OrderModal';

interface PosterEditorProps {
  currentPoster: PosterTemplate;
  onUpdatePoster: (updated: PosterTemplate) => void;
  onSaveToCreations: (poster: PosterTemplate) => void;
  onOrderSuccess: (order: PrintOrder) => void;
}

export const PosterEditor: React.FC<PosterEditorProps> = ({
  currentPoster,
  onUpdatePoster,
  onSaveToCreations,
  onOrderSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'ai' | 'style' | 'image'>('text');
  
  // AI Text state
  const [aiThemePrompt, setAiThemePrompt] = useState('');
  const [aiEventType, setAiEventType] = useState('Église & Culte');
  const [aiAudience, setAiAudience] = useState('Chrétiens et grand public');
  const [aiTone, setAiTone] = useState('Inspirant et prestigieux');
  const [isGeneratingAiText, setIsGeneratingAiText] = useState(false);

  // AI Image state
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);

  // Export & Modal state
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string>('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const posterCanvasRef = React.useRef<HTMLDivElement>(null);

  // Update helper
  const updateField = (field: keyof PosterTemplate, value: any) => {
    onUpdatePoster({
      ...currentPoster,
      [field]: value,
    });
  };

  // Generate poster text with Gemini API
  const handleGenerateAiText = async () => {
    if (!aiThemePrompt.trim()) {
      alert('Veuillez entrer une description ou un thème pour votre événement.');
      return;
    }

    setIsGeneratingAiText(true);
    try {
      const res = await fetch('/api/ai/generate-poster-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: aiThemePrompt,
          eventType: aiEventType,
          audience: aiAudience,
          tone: aiTone,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        onUpdatePoster({
          ...currentPoster,
          title: d.title || currentPoster.title,
          subtitle: d.subtitle || currentPoster.subtitle,
          badge: d.badge || currentPoster.badge,
          date: d.date || currentPoster.date,
          time: d.time || currentPoster.time,
          location: d.location || currentPoster.location,
          contact: d.contact || currentPoster.contact,
          organizer: d.organizer || currentPoster.organizer,
          price: d.price || currentPoster.price,
          description: d.description || currentPoster.description,
        });

        // If palette suggested, apply
        if (d.suggestedPalette) {
          const matchPalette = COLOR_PALETTES.find(
            (p) => p.name.toLowerCase() === (d.suggestedPalette.paletteName || '').toLowerCase()
          );
          if (matchPalette) {
            onUpdatePoster({ ...currentPoster, palette: matchPalette });
          }
        }

        if (d.imagePromptSuggestion) {
          setAiImagePrompt(d.imagePromptSuggestion);
        }
      }
    } catch (err: any) {
      alert('Erreur lors de la génération: ' + err.message);
    } finally {
      setIsGeneratingAiText(false);
    }
  };

  // Generate visual image with Gemini API
  const handleGenerateAiImage = async () => {
    const promptToUse = aiImagePrompt.trim() || currentPoster.title;
    if (!promptToUse) return;

    setIsGeneratingAiImage(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          aspectRatio: currentPoster.aspectRatio,
          category: currentPoster.category,
        }),
      });

      const result = await res.json();
      if (result.success && result.imageUrl) {
        onUpdatePoster({
          ...currentPoster,
          thumbnail: result.imageUrl,
        });
      }
    } catch (err: any) {
      alert('Erreur génération d\'image: ' + err.message);
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  // Image Download export
  const handleExport = async (format: 'png' | 'jpeg') => {
    setIsExporting(true);
    setExportType(format.toUpperCase());
    try {
      const dataUrl = await exportPosterAsImage(currentPoster, format, 2);
      const link = document.createElement('a');
      link.download = `AffichePro_${currentPoster.title.slice(0, 20).replace(/\s+/g, '_')}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      alert('Erreur lors de l\'exportation d\'image : ' + err.message);
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  // High-Resolution PDF Export with jsPDF & html2canvas
  const handleExportPDF = async (paperFormat: 'a4' | 'a3' = 'a4') => {
    setIsExporting(true);
    setExportType(`PDF ${paperFormat.toUpperCase()}`);
    try {
      await exportPosterAsPDF(currentPoster, paperFormat, posterCanvasRef.current);
    } catch (err: any) {
      alert('Erreur lors de l\'exportation PDF : ' + err.message);
    } finally {
      setIsExporting(false);
      setExportType('');
      setShowExportMenu(false);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          onUpdatePoster({
            ...currentPoster,
            thumbnail: uploadEvent.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveToCreations(currentPoster);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      
      {/* Top Toolbar Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-white">Studio de Personnalisation</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              Mode WYSIWYG
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Modifiez chaque texte, appliquez les styles et générez des visuels avec l'IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Enregistrer dans Mes Créations */}
          <button
            onClick={handleSave}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              saveFeedback
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {saveFeedback ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4 text-emerald-400" />}
            {saveFeedback ? 'Enregistré !' : 'Enregistrer'}
          </button>

          {/* Export PDF Haute Résolution (jsPDF / html2canvas) Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              title="Exporter l'affiche en PDF Haute Définition vectoriel pour imprimeur"
            >
              {isExporting && exportType.includes('PDF') ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
              ) : (
                <FileText className="w-4 h-4 text-amber-400" />
              )}
              <span>{isExporting && exportType.includes('PDF') ? exportType : 'Exporter en PDF HD'}</span>
              <ChevronDown className="w-3 h-3 text-purple-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Formats PDF Haute Résolution (jsPDF)
                </div>
                <button
                  onClick={() => handleExportPDF('a4')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-purple-950/60 hover:text-purple-200 text-slate-200 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">Format A4 (21 x 29.7 cm)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">300 DPI</span>
                </button>
                <button
                  onClick={() => handleExportPDF('a3')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-purple-950/60 hover:text-purple-200 text-slate-200 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">Format A3 (29.7 x 42 cm)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">Affiche</span>
                </button>
                <div className="border-t border-slate-800 my-1 pt-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Formats Image Standard
                  </div>
                  <button
                    onClick={() => {
                      handleExport('png');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center justify-between"
                  >
                    <span>Image PNG HD</span>
                    <span className="text-[10px] text-cyan-400">Web & Print</span>
                  </button>
                  <button
                    onClick={() => {
                      handleExport('jpeg');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center justify-between"
                  >
                    <span>Image JPEG</span>
                    <span className="text-[10px] text-slate-400">Réseaux</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Download Image Button */}
          <button
            onClick={() => handleExport('png')}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Télécharger en PNG 300 DPI pour affichage ou web"
          >
            {isExporting && exportType === 'PNG' ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Download className="w-4 h-4 text-cyan-400" />
            )}
            Télécharger Image
          </button>

          {/* Primary CTA: Order Print */}
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            Commander l'impression
          </button>
        </div>
      </div>

      {/* Main Split Layout: Controls on left, Canvas Preview on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Tool Tabs & Controls (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'text'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Textes
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ai'
                  ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                  : 'text-purple-400/80 hover:text-purple-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Magie IA
            </button>

            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'style'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Thème & Styles
            </button>

            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'image'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Visuel & Photos
            </button>
          </div>

          <div className="p-5 space-y-5">
            
            {/* TAB 1: TEXTS */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                
                {/* Organisateur & Macaron */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      Nom de l'organisateur / Église / Marque
                    </label>
                    <input
                      type="text"
                      value={currentPoster.organizer}
                      onChange={(e) => updateField('organizer', e.target.value)}
                      placeholder="Ex: Ministère Grâce & Vie"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      Macaron / Badge accrocheur
                    </label>
                    <input
                      type="text"
                      value={currentPoster.badge}
                      onChange={(e) => updateField('badge', e.target.value)}
                      placeholder="Ex: ENTRÉE LIBRE & GRATUITE"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Titre Principal */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
                    <span>Titre Principal de l'Affiche *</span>
                    <span className="text-[10px] text-slate-400">Impact visuel maximal</span>
                  </label>
                  <textarea
                    rows={2}
                    value={currentPoster.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Ex: GRANDE NUIT DE TRAVERSÉE"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>

                {/* Sous-titre */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Sous-titre / Slogan percutant
                  </label>
                  <input
                    type="text"
                    value={currentPoster.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    placeholder="Ex: Passer de l'Ombre à la Lumière Divine"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Date & Heure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Date de l'événement
                    </label>
                    <input
                      type="text"
                      value={currentPoster.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      placeholder="Ex: Vendredi 31 Décembre 2026"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Heure
                    </label>
                    <input
                      type="text"
                      value={currentPoster.time}
                      onChange={(e) => updateField('time', e.target.value)}
                      placeholder="Ex: Dès 21h00 jusqu'à l'aube"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Lieu & Prix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      Lieu précis / Salle / Quartier
                    </label>
                    <input
                      type="text"
                      value={currentPoster.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="Ex: Palais de la Culture, Treichville / Cocody Angré"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tarif / Accès
                    </label>
                    <input
                      type="text"
                      value={currentPoster.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      placeholder="Ex: Entrée Libre / 5 000 FCFA"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Contact WhatsApp */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    Infoline & WhatsApp de contact
                  </label>
                  <input
                    type="text"
                    value={currentPoster.contact}
                    onChange={(e) => updateField('contact', e.target.value)}
                    placeholder="Ex: Infoline & WhatsApp: +225 07 48 29 11 02"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Courte description ou phrase d'invitation
                  </label>
                  <textarea
                    rows={2}
                    value={currentPoster.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Ex: Venez vivre un moment inoubliable avec des chantres renommés..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: AI MAGIC */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                
                {/* 1. AI Text Copywriter */}
                <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Générateur Rédactionnel IA (Gemini 3.8 Flash)</h3>
                      <p className="text-xs text-purple-200">
                        Décrivez simplement votre événement en une phrase : l'IA rédige tous vos titres, slogans et contacts adaptés à Abidjan !
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Votre idée ou sujet :</label>
                    <textarea
                      rows={2}
                      value={aiThemePrompt}
                      onChange={(e) => setAiThemePrompt(e.target.value)}
                      placeholder="Ex: Concert gospel géant pour jeunes avec chantres locaux le 20 décembre au Palais de la Culture, entrée gratuite..."
                      className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Catégorie</label>
                      <select
                        value={aiEventType}
                        onChange={(e) => setAiEventType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        <option value="Église & Culte">Église & Culte</option>
                        <option value="Commerce & Promotion">Commerce & Promotion</option>
                        <option value="Restaurant & Gastronomie">Restaurant & Gastronomie</option>
                        <option value="Événements & Soirées">Événements & Soirées</option>
                        <option value="Formation & Conférence">Formation & Conférence</option>
                        <option value="Anniversaire">Anniversaire</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Tonalité</label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        <option value="Inspirant et prestigieux">Inspirant et prestigieux</option>
                        <option value="Festif et vibrant">Festif et vibrant</option>
                        <option value="Urgent et promo flash">Urgent et promo flash</option>
                        <option value="Sérieux et professionnel">Sérieux et professionnel</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleGenerateAiText}
                        disabled={isGeneratingAiText}
                        className="w-full h-8 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isGeneratingAiText ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Rédaction...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Rédiger l'affiche par IA
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. AI Image Generator */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Générateur d'Image Visuelle IA</h3>
                      <p className="text-xs text-slate-400">
                        Créez un arrière-plan ou une illustration sur-mesure pour votre affiche.
                      </p>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={aiImagePrompt}
                      onChange={(e) => setAiImagePrompt(e.target.value)}
                      placeholder="Ex: Scène de louange gospel avec foule illuminée et dorures royales..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Predefined prompt pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Culte gospel & lumières célestes',
                      'Modèle africaine en pagne wax chic',
                      'Buffet chic et grillades alloco',
                      'Ambiance concert néon afrobeat',
                      'Conférence tech & leadership',
                    ].map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setAiImagePrompt(pill)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiImage}
                    disabled={isGeneratingAiImage}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingAiImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Génération de l'image en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        Générer l'illustration IA
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: STYLES & PALETTES */}
            {activeTab === 'style' && (
              <div className="space-y-5">
                
                {/* Palette Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Palettes de Couleurs & Ambiance
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {COLOR_PALETTES.map((palette) => {
                      const isSelected = currentPoster.palette.name === palette.name;
                      return (
                        <button
                          key={palette.name}
                          type="button"
                          onClick={() => updateField('palette', palette)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-slate-800 ring-2 ring-emerald-500/50'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: palette.accentColor }}
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: palette.badgeBg }}
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: palette.primaryText }}
                            />
                          </div>
                          <span className="text-xs font-bold text-white block truncate">
                            {palette.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Format d'affichage
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '4:5', label: 'Affiche Standard', sub: '4:5 Portrait Mur' },
                      { id: '9:16', label: 'Story & WhatsApp', sub: '9:16 Plein écran' },
                      { id: '1:1', label: 'Carré Réseaux', sub: '1:1 Instagram / Post' },
                    ].map((ratio) => (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => updateField('aspectRatio', ratio.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          currentPoster.aspectRatio === ratio.id
                            ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <span className="block text-xs font-bold">{ratio.label}</span>
                        <span className="text-[10px] opacity-75">{ratio.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography style */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Style Typographique
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'display', label: 'Impact Display', desc: 'Gras & Moderne' },
                      { id: 'serif', label: 'Prestige Serif', desc: 'Chic & Luxe' },
                      { id: 'sans', label: 'Corporate Sans', desc: 'Épuré & Direct' },
                    ].map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => updateField('fontFamily', font.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          currentPoster.fontFamily === font.id
                            ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <span className="block text-xs font-bold">{font.label}</span>
                        <span className="text-[10px] opacity-75">{font.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Overlay Opacity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-300 font-semibold">Contraste du fond sombre</span>
                    <span className="text-emerald-400 font-mono">
                      {Math.round(currentPoster.overlayOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.9"
                    step="0.05"
                    value={currentPoster.overlayOpacity}
                    onChange={(e) => updateField('overlayOpacity', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Augmentez pour rendre les textes plus lisibles sur les photos chargées.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: IMAGES & VISUALS */}
            {activeTab === 'image' && (
              <div className="space-y-4">
                
                {/* File Upload & URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Téléverser une image / logo
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-950 transition-colors">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-300 font-medium">Choisir un fichier</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Ou coller l'URL d'une image
                    </label>
                    <input
                      type="url"
                      value={currentPoster.thumbnail}
                      onChange={(e) => updateField('thumbnail', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Curated Stock Library */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Bibliothèque Photo Thématique Gratuite
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {STOCK_PHOTOS.map((photo, idx) => (
                      <div
                        key={idx}
                        onClick={() => updateField('thumbnail', photo.url)}
                        className={`relative rounded-xl overflow-hidden aspect-[4/3] border cursor-pointer group transition-all ${
                          currentPoster.thumbnail === photo.url
                            ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] font-bold text-white truncate">
                            {photo.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Poster Canvas (5 cols on desktop) */}
        <div className="lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-300">Aperçu direct en temps réel</span>
            <span className="font-mono text-emerald-400">Ratio {currentPoster.aspectRatio}</span>
          </div>

          {/* Interactive Poster Component with ref for html2canvas */}
          <div ref={posterCanvasRef} className="max-w-[380px] mx-auto">
            <PosterCanvas poster={currentPoster} />
          </div>

          {/* Quick PDF & Print CTA below canvas */}
          <div className="pt-2 space-y-2 text-center max-w-[380px] mx-auto">
            <button
              onClick={() => handleExportPDF('a4')}
              disabled={isExporting}
              className="w-full py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isExporting && exportType.includes('PDF') ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Télécharger le Bon À Tirer (PDF A4 300 DPI)</span>
            </button>

            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition-transform hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              Commander ce visuel en impression
            </button>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Disponible en A3, A4, Bâche extérieure avec œillets & Roll-up VIP.
            </p>
          </div>
        </div>
      </div>

      {/* Print Order Modal */}
      <OrderModal
        poster={currentPoster}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderSuccess={(order) => {
          onOrderSuccess(order);
        }}
      />
    </div>
  );
};
