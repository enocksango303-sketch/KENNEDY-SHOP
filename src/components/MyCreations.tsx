import React from 'react';
import { 
  FolderHeart, 
  PlusCircle, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  Printer, 
  Calendar, 
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import { PosterTemplate, UserPoster } from '../types';
import { PosterCanvas } from './PosterCanvas';
import { exportPosterAsImage, exportPosterAsPDF } from '../utils/canvasExporter';

interface MyCreationsProps {
  creations: UserPoster[];
  onEditPoster: (poster: PosterTemplate) => void;
  onDuplicatePoster: (poster: UserPoster) => void;
  onDeletePoster: (id: string) => void;
  onOrderPoster: (poster: PosterTemplate) => void;
  onOpenNewPoster: () => void;
}

export const MyCreations: React.FC<MyCreationsProps> = ({
  creations,
  onEditPoster,
  onDuplicatePoster,
  onDeletePoster,
  onOrderPoster,
  onOpenNewPoster,
}) => {
  const handleDownload = async (poster: PosterTemplate) => {
    try {
      const dataUrl = await exportPosterAsImage(poster, 'png', 2);
      const link = document.createElement('a');
      link.download = `AffichePro_${poster.title.slice(0, 15).replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e: any) {
      alert('Erreur lors du téléchargement : ' + e.message);
    }
  };

  const handleDownloadPDF = async (poster: PosterTemplate) => {
    try {
      await exportPosterAsPDF(poster, 'a4');
    } catch (e: any) {
      alert('Erreur lors de l\'exportation PDF : ' + e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FolderHeart className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white">Mes Créations Enregistrées</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Retrouvez tous vos projets d'affiches, téléchargez vos exports HD ou commandez des tirages papier.
          </p>
        </div>

        <button
          onClick={onOpenNewPoster}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform hover:scale-105"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          Nouvelle Affiche
        </button>
      </div>

      {/* Grid of creations */}
      {creations.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FolderHeart className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Vous n'avez pas encore d'affiche enregistrée</h2>
          <p className="text-xs text-slate-400">
            Personnalisez un modèle depuis notre galerie ou utilisez le générateur IA pour créer votre premier chef-d'œuvre !
          </p>
          <button
            onClick={onOpenNewPoster}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            Créer ma première affiche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creations.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Preview canvas */}
              <div 
                onClick={() => onEditPoster(item)}
                className="p-3 bg-slate-950/70 cursor-pointer"
              >
                <PosterCanvas poster={item} />
              </div>

              {/* Information */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold">{item.categoryLabel}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(item.savedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5 truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.location}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onEditPoster(item)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      Modifier
                    </button>

                    <button
                      onClick={() => onOrderPoster(item)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-950/30"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimer
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleDownloadPDF(item)}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                      title="Télécharger l'affiche au format PDF Haute Résolution (A4)"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      PDF HD
                    </button>

                    <button
                      onClick={() => handleDownload(item)}
                      className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                      title="Télécharger l'image en PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Image PNG
                    </button>

                    <button
                      onClick={() => onDuplicatePoster(item)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      title="Dupliquer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Dupliquer
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer l'affiche "${item.title}" ?`)) {
                          onDeletePoster(item.id);
                        }
                      }}
                      className="text-xs text-rose-400/80 hover:text-rose-400 p-1"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
