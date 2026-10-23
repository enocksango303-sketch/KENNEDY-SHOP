import React from 'react';
import { PosterTemplate } from '../types';
import { Calendar, Clock, MapPin, PhoneCall, Tag } from 'lucide-react';

interface PosterCanvasProps {
  poster: PosterTemplate;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  poster,
  scale = 1,
  className = '',
  onClick,
}) => {
  // Determine aspect ratio class
  const aspectClass =
    poster.aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : poster.aspectRatio === '1:1'
      ? 'aspect-square'
      : 'aspect-[4/5]';

  // Font family helper
  const fontStyle =
    poster.fontFamily === 'serif'
      ? 'font-serif'
      : poster.fontFamily === 'display'
      ? 'font-black tracking-tight'
      : 'font-sans';

  return (
    <div
      onClick={onClick}
      className={`relative w-full ${aspectClass} overflow-hidden rounded-xl shadow-2xl border-4 transition-all ${className}`}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        borderColor: poster.palette.accentColor || '#f59e0b',
        boxShadow: `0 20px 40px -15px ${poster.palette.accentColor}33`,
      }}
    >
      {/* 1. Background Base Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${poster.palette.bgGradient}`} />

      {/* 2. Hero Background Image */}
      {poster.thumbnail && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${poster.thumbnail})`,
            opacity: 1 - poster.overlayOpacity * 0.4,
            filter: 'contrast(1.08) brightness(0.92)',
          }}
        />
      )}

      {/* 3. Deep Cinematic Darkening Gradients for High Contrast Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/35 pointer-events-none" />

      {/* Inner Decorative Framing Lines */}
      <div className="absolute inset-2 border border-white/20 rounded-lg pointer-events-none z-10" />

      {/* 4. Canvas Content Layer */}
      <div className="relative h-full w-full z-15 flex flex-col justify-between p-4 sm:p-6 text-center select-none">
        
        {/* Top Header: Organizer & Macaron Badge */}
        <div className="space-y-2 pt-1">
          {poster.organizer && (
            <p
              className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-shadow drop-shadow-md truncate"
              style={{ color: poster.palette.accentColor }}
            >
              {poster.organizer}
            </p>
          )}

          {poster.badge && (
            <div className="inline-block mx-auto">
              <span
                className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-1 mx-auto"
                style={{
                  backgroundColor: poster.palette.badgeBg,
                  color: poster.palette.badgeText,
                  boxShadow: `0 4px 14px ${poster.palette.badgeBg}66`,
                }}
              >
                <Tag className="w-3 h-3 inline-block" />
                {poster.badge}
              </span>
            </div>
          )}
        </div>

        {/* Center Section: Main Title & Subtitle */}
        <div className="my-auto space-y-2.5 px-1">
          <h1
            className={`text-xl sm:text-2xl md:text-3xl font-black uppercase leading-tight drop-shadow-lg text-white ${fontStyle}`}
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)',
            }}
          >
            {poster.title}
          </h1>

          {poster.subtitle && (
            <p
              className="text-xs sm:text-sm font-semibold tracking-wide max-w-md mx-auto line-clamp-2 drop-shadow"
              style={{ color: poster.palette.primaryText }}
            >
              {poster.subtitle}
            </p>
          )}

          {/* Golden Divider */}
          <div className="w-16 h-1 mx-auto rounded-full my-2" style={{ backgroundColor: poster.palette.accentColor }} />

          {poster.description && (
            <p className="text-[10px] sm:text-[11px] text-slate-300 max-w-xs mx-auto line-clamp-2 italic drop-shadow">
              "{poster.description}"
            </p>
          )}
        </div>

        {/* Bottom Section: Date, Time, Location & WhatsApp Infoline */}
        <div className="space-y-2.5 pb-1">
          {/* Card Date / Time / Place */}
          <div
            className="rounded-xl p-2.5 sm:p-3 text-left backdrop-blur-md border border-white/15 shadow-xl space-y-1.5"
            style={{ backgroundColor: poster.palette.cardBg || 'rgba(15, 23, 42, 0.88)' }}
          >
            <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-amber-300 border-b border-white/10 pb-1">
              <span className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {poster.date}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-white shrink-0">
                <Clock className="w-3 h-3 text-amber-400" />
                {poster.time}
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] sm:text-xs text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 font-medium">{poster.location}</span>
            </div>

            {poster.price && (
              <div className="pt-0.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Accès:</span>
                <span className="font-bold px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${poster.palette.accentColor}26`, color: poster.palette.accentColor }}>
                  {poster.price}
                </span>
              </div>
            )}
          </div>

          {/* Infoline WhatsApp CTA Banner */}
          {poster.contact && (
            <div className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold shadow-lg shadow-emerald-950/40">
              <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="truncate">{poster.contact}</span>
            </div>
          )}

          <div className="text-[9px] text-slate-400/80 tracking-wider">
            AFFICHEPRO.CI • CONÇU POUR L'IMPRESSION
          </div>
        </div>
      </div>
    </div>
  );
};
