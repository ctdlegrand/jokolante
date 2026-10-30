import React from 'react';
import { Member, AssociationConfig, isBureauRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  ReceiptText, 
  BellRing, 
  MessageSquare, 
  PlusCircle, 
  UserCheck, 
  Settings, 
  Shield, 
  Wallet,
  IdCard,
  LogOut,
  Lock
} from 'lucide-react';
import { formatFCFA } from '../utils/formatters';

export type ActiveTab = 'dashboard' | 'members' | 'matrix' | 'history' | 'reminders' | 'discussion';

interface HeaderProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeMember: Member;
  members: Member[];
  onSelectMember: (m: Member) => void;
  onOpenNewPayment: () => void;
  onOpenSettings: () => void;
  onOpenMyCard: () => void;
  onLogout: () => void;
  config: AssociationConfig;
  totalCollectedMonth: number;
  unpaidCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activeMember,
  members,
  onSelectMember,
  onOpenNewPayment,
  onOpenSettings,
  onOpenMyCard,
  onLogout,
  config,
  totalCollectedMonth,
  unpaidCount
}) => {
  const isBureau = isBureauRole(activeMember.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner with Association Identity & Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-orange-500/10">
              <span className="font-extrabold text-base tracking-tight">JK</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Jookolante
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 hidden sm:inline-block">
                  {config.sigle}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                {config.name}
              </p>
            </div>
          </div>

          {/* Quick Info & User Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Financial Snapshot */}
            <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-500">Mois en cours :</span>
                <span className="font-bold text-slate-800">{formatFCFA(totalCollectedMonth)}</span>
              </div>
              {/* Privacy protection: Unpaid count only shown to Bureau members to protect member dignity */}
              {isBureau && unpaidCount > 0 && (
                <div className="flex items-center gap-1 text-amber-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>{unpaidCount} en attente</span>
                </div>
              )}
            </div>

            {/* "Ma Carte de Membre" CTA */}
            <button
              onClick={onOpenMyCard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 rounded-xl hover:bg-amber-100/80 transition-colors shadow-2xs"
              title="Générer ma Carte de Membre Officielle avec QR Code"
            >
              <IdCard className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Ma</span> Carte
            </button>

            {/* Profile Switcher (Simulating different members / roles) */}
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200 transition-colors relative">
              <img
                src={activeMember.avatar}
                alt={activeMember.firstName}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300"
              />
              <div className="text-left text-xs hidden sm:block">
                <p className="font-semibold text-slate-800 leading-tight">
                  {activeMember.firstName} {activeMember.lastName.charAt(0)}.
                </p>
                <p className="text-[10px] text-slate-500">{activeMember.role}</p>
              </div>
              <select
                aria-label="Changer de profil actif"
                value={activeMember.id}
                onChange={(e) => {
                  const found = members.find((m) => m.id === e.target.value);
                  if (found) onSelectMember(found);
                }}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Changer d'utilisateur pour tester les rôles"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Logout / Switch page button */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Se déconnecter / Écran de connexion"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Settings button - Bureau only */}
            {isBureau && (
              <button
                onClick={onOpenSettings}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="Paramètres de l'association (Bureau)"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* CTA Record Payment - Bureau only */}
            {isBureau ? (
              <button
                onClick={onOpenNewPayment}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-sm transition-all hover:shadow active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Enregistrer</span> Paiement
              </button>
            ) : null}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar text-xs sm:text-sm font-medium">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Tableau de Bord
          </button>

          <button
            onClick={() => onTabChange('matrix')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'matrix'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Cotisations Mensuelles
          </button>

          <button
            onClick={() => onTabChange('members')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'members'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Membres ({members.length})
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'history'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            Historique & Quittances
          </button>

          {/* Rappels Automatiques - Bureau Exécutif uniquement pour préserver la confidentialité des impayés */}
          {isBureau && (
            <button
              onClick={() => onTabChange('reminders')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap relative ${
                currentTab === 'reminders'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BellRing className="w-4 h-4" />
              Rappels Automatiques
              {unpaidCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>
          )}

          <button
            onClick={() => onTabChange('discussion')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'discussion'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Salon de Discussion
          </button>
        </nav>
      </div>
    </header>
  );
};
