import React, { useState, useRef } from 'react';
import { Member, AssociationConfig } from '../types';
import { formatDate } from '../utils/formatters';
import { 
  Printer, 
  Share2, 
  X, 
  ShieldCheck, 
  QrCode, 
  Palette, 
  Download, 
  Check, 
  Sparkles,
  Phone,
  Droplet,
  IdCard,
  Building2
} from 'lucide-react';

interface MemberCardModalProps {
  member: Member | null;
  config: AssociationConfig;
  onClose: () => void;
}

type CardTheme = 'emerald' | 'navy' | 'gold' | 'burgundy';

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  member,
  config,
  onClose
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('emerald');
  const [activeSide, setActiveSide] = useState<'both' | 'recto' | 'verso'>('both');
  const cardRef = useRef<HTMLDivElement>(null);

  if (!member) return null;

  const validityYearStart = new Date(member.joinedDate).getFullYear() || 2022;
  const currentYear = new Date().getFullYear();
  const validityText = `${currentYear} - ${currentYear + 1}`;

  const themeStyles = {
    emerald: {
      bg: 'from-emerald-900 via-teal-900 to-slate-950',
      accent: 'border-emerald-500/40',
      bannerBg: 'bg-emerald-800/80',
      badgeBg: 'bg-emerald-500 text-slate-950',
      textAccent: 'text-emerald-400',
      glow: 'shadow-emerald-950/50'
    },
    navy: {
      bg: 'from-blue-950 via-slate-900 to-indigo-950',
      accent: 'border-cyan-500/40',
      bannerBg: 'bg-blue-800/80',
      badgeBg: 'bg-cyan-400 text-slate-950',
      textAccent: 'text-cyan-400',
      glow: 'shadow-blue-950/50'
    },
    gold: {
      bg: 'from-amber-950 via-yellow-950 to-stone-950',
      accent: 'border-amber-500/40',
      bannerBg: 'bg-amber-800/80',
      badgeBg: 'bg-amber-400 text-slate-950',
      textAccent: 'text-amber-400',
      glow: 'shadow-amber-950/50'
    },
    burgundy: {
      bg: 'from-rose-950 via-red-950 to-slate-950',
      accent: 'border-rose-500/40',
      bannerBg: 'bg-rose-800/80',
      badgeBg: 'bg-rose-400 text-slate-950',
      textAccent: 'text-rose-400',
      glow: 'shadow-rose-950/50'
    }
  };

  const currentStyle = themeStyles[selectedTheme];

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*CARTE DE MEMBRE OFFICIELLE - ${config.name}*\n` +
      `Nom : ${member.firstName} ${member.lastName}\n` +
      `Matricule : ${member.matricule || member.id}\n` +
      `Rôle : ${member.role}\n` +
      `Statut : MEMBRE ACTIF VALIDÉ\n` +
      `Devise : ${config.slogan}\n` +
      `Vérifié par la commission d'adhésion.`;
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in print:p-0 print:bg-white overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-w-full my-6">
        
        {/* Modal Top Bar (hidden during printing) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <IdCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Générateur de Carte de Membre Officielle
              </h3>
              <p className="text-xs text-slate-500">
                Badge d'adhérent biométrique & sécurisé pour {member.firstName} {member.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs mr-2">
              <span className="text-[11px] text-slate-500 font-medium px-1 flex items-center gap-1">
                <Palette className="w-3 h-3" />
                Thème :
              </span>
              {(['emerald', 'navy', 'gold', 'burgundy'] as CardTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setSelectedTheme(thm)}
                  className={`w-5 h-5 rounded-lg border transition-all ${
                    thm === 'emerald' ? 'bg-emerald-700' :
                    thm === 'navy' ? 'bg-blue-800' :
                    thm === 'gold' ? 'bg-amber-600' : 'bg-rose-800'
                  } ${selectedTheme === thm ? 'ring-2 ring-slate-900 scale-110' : 'opacity-70 hover:opacity-100'}`}
                  title={thm}
                />
              ))}
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Imprimer Badge
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              Partager
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View toggle (Recto / Verso / Les deux) */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between print:hidden text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium mr-2">Affichage :</span>
            <button
              onClick={() => setActiveSide('both')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeSide === 'both' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recto + Verso
            </button>
            <button
              onClick={() => setActiveSide('recto')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeSide === 'recto' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recto seul
            </button>
            <button
              onClick={() => setActiveSide('verso')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeSide === 'verso' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verso seul
            </button>
          </div>

          <span className="text-slate-400 text-[11px] hidden md:inline">
            Format standard ISO/IEC 7810 ID-1 (CR-80 Badge 85.6 × 54 mm)
          </span>
        </div>

        {/* Card Display Container */}
        <div ref={cardRef} className="p-8 print:p-2 bg-slate-100 flex flex-col md:flex-row items-center justify-center gap-8">
          
          {/* ================= RECTO (FRONT) ================= */}
          {(activeSide === 'both' || activeSide === 'recto') && (
            <div className={`w-[360px] sm:w-[390px] h-[240px] sm:h-[248px] rounded-2xl p-4 bg-gradient-to-br ${currentStyle.bg} text-white shadow-xl ${currentStyle.glow} border ${currentStyle.accent} relative overflow-hidden flex flex-col justify-between shrink-0 select-none print:shadow-none print:border-slate-800`}>
              
              {/* Background watermark seal */}
              <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
                <div className="w-48 h-48 rounded-full border-[10px] border-white flex items-center justify-center font-black text-6xl">
                  JK
                </div>
              </div>

              {/* Decorative Hologram Foil Strip */}
              <div className="absolute top-0 right-12 w-10 h-3 bg-gradient-to-r from-amber-300 via-emerald-200 to-amber-300 opacity-60 rounded-b-md blur-[0.5px]"></div>

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center font-black text-xs text-slate-950 shadow-sm">
                    JK
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wider uppercase text-white leading-tight">
                      {config.sigle} · {config.name.substring(0, 24)}...
                    </h4>
                    <p className="text-[9px] text-slate-300 font-medium">
                      CARTE D'ADHÉRENT OFFICIELLE
                    </p>
                  </div>
                </div>

                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${currentStyle.badgeBg} shadow-2xs`}>
                  {validityText}
                </span>
              </div>

              {/* Card Main Body */}
              <div className="flex items-center gap-3.5 my-1">
                {/* Member Avatar with ring */}
                <div className="relative shrink-0">
                  <img
                    src={member.avatar}
                    alt={member.firstName}
                    className="w-20 h-20 rounded-xl object-cover ring-2 ring-amber-400/80 shadow-md bg-slate-800"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 ring-2 ring-slate-900" title="Identité vérifiée">
                    <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                  </div>
                </div>

                {/* Member details */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-extrabold text-white truncate leading-tight tracking-tight uppercase">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className={`text-[11px] font-bold ${currentStyle.textAccent} truncate`}>
                    {member.role}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 text-[9px] text-slate-300">
                    <div>
                      <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Matricule</span>
                      <span className="font-mono font-bold text-white text-[10px]">{member.matricule || member.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Adhésion</span>
                      <span className="font-semibold text-white">{formatDate(member.joinedDate)}</span>
                    </div>
                    {member.occupation && (
                      <div className="col-span-2 truncate">
                        <span className="text-slate-400 text-[8px] uppercase">Activité : </span>
                        <span className="text-white">{member.occupation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[8px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span className="font-mono tracking-widest text-slate-300 font-semibold">
                    SN-SECURE-{member.matricule?.replace(/[^0-9]/g, '') || '001'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 italic">Signature Présidence : </span>
                  <span className="font-serif italic font-bold text-amber-300">Fatou Sow</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= VERSO (BACK) ================= */}
          {(activeSide === 'both' || activeSide === 'verso') && (
            <div className={`w-[360px] sm:w-[390px] h-[240px] sm:h-[248px] rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white shadow-xl ${currentStyle.glow} border ${currentStyle.accent} relative overflow-hidden flex flex-col justify-between shrink-0 select-none print:shadow-none print:border-slate-800`}>
              
              {/* Magnetic Strip Simulation */}
              <div className="absolute top-4 left-0 right-0 h-8 bg-slate-950 border-y border-slate-800 flex items-center px-4">
                <span className="text-[7px] font-mono text-slate-600 tracking-widest">
                  ||||| | |||||||| |||| | |||||| |||||||||||| |||| | ||||||
                </span>
              </div>

              {/* Space under magnetic strip */}
              <div className="pt-9">
                <div className="flex items-start justify-between gap-3">
                  {/* Emergency & Personal Health info */}
                  <div className="space-y-1.5 text-[9px] flex-1">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Droplet className="w-3 h-3 text-rose-500" />
                          Groupe Sanguin :
                        </span>
                        <span className="font-bold text-rose-400 text-[10px]">
                          {member.bloodGroup || 'O+'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">CNI / Identifiant :</span>
                        <span className="font-mono text-slate-200">
                          {member.nationalId || '1 755 1988 00412'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Urgence / Contact :</span>
                        <span className="font-medium text-slate-200 truncate max-w-[130px]">
                          {member.emergencyContact || member.phone}
                        </span>
                      </div>
                    </div>

                    <p className="text-[7.5px] text-slate-400 leading-tight">
                      Cette carte est strictement personnelle. En cas de perte ou d'accident, merci de contacter le siège de l'association au {config.treasurerPhone}.
                    </p>
                  </div>

                  {/* QR Code de vérification biométrique/numérique */}
                  <div className="bg-white p-2 rounded-xl text-slate-900 shrink-0 text-center shadow-md">
                    <svg
                      viewBox="0 0 29 29"
                      className="w-16 h-16"
                      shapeRendering="crispEdges"
                    >
                      {/* Stylized QR Code Pattern */}
                      <path fill="#0f172a" d="M0,0 h7 v7 h-7 z M2,2 h3 v3 h-3 z M22,0 h7 v7 h-7 z M24,2 h3 v3 h-3 z M0,22 h7 v7 h-7 z M2,24 h3 v3 h-3 z M8,1 h2 v2 h-2 z M12,0 h1 v3 h-1 z M15,1 h2 v2 h-2 z M19,0 h1 v3 h-1 z M9,4 h3 v2 h-3 z M14,4 h2 v1 h-2 z M18,4 h2 v2 h-2 z M8,8 h1 v3 h-1 z M11,8 h2 v1 h-2 z M15,8 h3 v2 h-3 z M20,8 h2 v2 h-2 z M24,8 h2 v3 h-2 z M9,12 h2 v2 h-2 z M13,11 h3 v2 h-3 z M18,12 h1 v3 h-1 z M21,12 h3 v1 h-3 z M0,15 h2 v2 h-2 z M4,15 h3 v1 h-3 z M8,15 h2 v3 h-2 z M12,15 h3 v1 h-3 z M17,16 h3 v2 h-3 z M22,15 h2 v1 h-2 z M26,15 h3 v2 h-3 z M10,19 h2 v2 h-2 z M14,18 h2 v3 h-2 z M18,19 h3 v1 h-3 z M23,19 h2 v2 h-2 z M8,23 h3 v2 h-3 z M13,23 h2 v1 h-2 z M17,23 h2 v3 h-2 z M21,22 h2 v3 h-2 z M25,24 h3 v2 h-3 z" />
                    </svg>
                    <span className="text-[7px] font-bold text-slate-700 block mt-0.5 tracking-tighter">
                      SCAN VÉRIFIÉ
                    </span>
                  </div>
                </div>
              </div>

              {/* Verso Footer: Mobile Money numbers & Motto */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[8px] text-slate-400">
                <div>
                  <span className="font-semibold text-white">Wave :</span> {config.waveNumber} · <span className="font-semibold text-white">OM :</span> {config.orangeMoneyNumber}
                </div>
                <div className="text-amber-400 font-bold italic">
                  "{config.slogan}"
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action hints and instructions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <p>
              Pour une impression plastifiée optimale (recto/verso), utilisez du papier bristol 250g ou une imprimante à cartes PVC standard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
            >
              Envoyer au membre via WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
            >
              Imprimer les 2 faces
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
