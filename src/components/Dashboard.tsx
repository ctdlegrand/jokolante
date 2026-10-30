import React, { useState } from 'react';
import { Member, ContributionPayment, ExpenseOrAid, AssociationConfig, isBureauRole } from '../types';
import { formatFCFA, getMonthName, formatDate } from '../utils/formatters';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  HeartHandshake, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Send, 
  Receipt, 
  Plus, 
  ShieldCheck, 
  ChevronRight, 
  PieChart as PieIcon,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

interface DashboardProps {
  members: Member[];
  payments: ContributionPayment[];
  expenses: ExpenseOrAid[];
  config: AssociationConfig;
  activeMember: Member;
  currentMonth: number;
  currentYear: number;
  onOpenNewPayment: () => void;
  onOpenNewExpense: () => void;
  onShowReceipt: (p: ContributionPayment) => void;
  onGoToReminders: () => void;
  onGoToMembers: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  members,
  payments,
  expenses,
  config,
  activeMember,
  currentMonth,
  currentYear,
  onOpenNewPayment,
  onOpenNewExpense,
  onShowReceipt,
  onGoToReminders,
  onGoToMembers
}) => {
  const isBureau = isBureauRole(activeMember.role);
  // Current month calculations
  const monthPayments = payments.filter(
    (p) => p.periodMonth === currentMonth && p.periodYear === currentYear
  );

  const totalCollectedThisMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);

  // Members who have contributed for current month
  const paidMemberIds = new Set(
    monthPayments.filter(p => p.type === 'cotisation_mensuelle').map((p) => p.memberId)
  );
  
  const activeMembers = members.filter((m) => m.status === 'active');
  const totalActive = activeMembers.length;
  const countPaid = activeMembers.filter((m) => paidMemberIds.has(m.id)).length;
  const countUnpaid = totalActive - countPaid;
  const recoveryRate = totalActive > 0 ? Math.round((countPaid / totalActive) * 100) : 0;

  // Expected dues this month
  const totalExpectedThisMonth = activeMembers.reduce((sum, m) => sum + m.monthlyPledge, 0);
  const unpaidAmount = Math.max(0, totalExpectedThisMonth - totalCollectedThisMonth);

  // Cumulative all-time / 2026 totals
  const totalAllTimeIn = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalAllTimeOut = expenses
    .filter((e) => e.status === 'validé')
    .reduce((sum, e) => sum + e.amount, 0);
  const netTreasury = totalAllTimeIn - totalAllTimeOut;

  // Caisse de secours (solidarity fund) estimation
  const totalSecoursIn = payments
    .filter((p) => p.type === 'caisse_secours')
    .reduce((sum, p) => sum + p.amount, 0) + (totalAllTimeIn * (config.secoursPercentage / 100));

  const totalSecoursOut = expenses
    .filter((e) => e.status === 'validé' && (e.category === 'Secours & Urgence' || e.category === 'Solidarité Familiale'))
    .reduce((sum, e) => sum + e.amount, 0);

  const secoursBalance = Math.max(0, totalSecoursIn - totalSecoursOut);

  // Monthly breakdown for 2026 (Jan to Dec)
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const mNum = i + 1;
    const mPays = payments.filter(
      (p) => p.periodMonth === mNum && p.periodYear === currentYear
    );
    const total = mPays.reduce((acc, p) => acc + p.amount, 0);
    return {
      monthNum: mNum,
      name: getMonthName(mNum).substring(0, 4),
      fullName: getMonthName(mNum),
      total,
      count: mPays.length
    };
  });

  const maxMonthValue = Math.max(...monthlyStats.map((s) => s.total), totalExpectedThisMonth || 100000);

  // Method breakdown
  const methodTotals: Record<string, number> = {};
  monthPayments.forEach((p) => {
    methodTotals[p.paymentMethod] = (methodTotals[p.paymentMethod] || 0) + p.amount;
  });

  // Recent payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 5);

  // Recent aids/expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice with Month Selector and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Tableau de Bord Financier
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {getMonthName(currentMonth)} {currentYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Situation comptable et suivi de trésorerie en temps réel pour l'association
          </p>
        </div>

        {isBureau ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewExpense}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-rose-600" />
              Décaisser une Aide
            </button>
            <button
              onClick={onOpenNewPayment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouvel Encaissement
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200/70 px-3.5 py-2 rounded-xl text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Connecté(e) : {activeMember.firstName} ({activeMember.role})</span>
          </div>
        )}
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Collecté ce mois */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Collecté ({getMonthName(currentMonth)})
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {formatFCFA(totalCollectedThisMonth)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span className="font-semibold text-emerald-700">{countPaid} membres</span>
            <span>ont déjà versé leur part</span>
          </div>
        </div>

        {/* KPI 2: Taux de Recouvrement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Taux de Recouvrement
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {recoveryRate}%
            </p>
            <span className="text-xs text-slate-500">
              ({countPaid} / {totalActive})
            </span>
          </div>
          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-500 ${
                recoveryRate >= 80 ? 'bg-emerald-500' : recoveryRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${recoveryRate}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 3: Montant des Impayés (Confidentialité : réservé au Bureau, vue personnelle pour membre actif) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBureau ? "Reste à Recouvrer" : "Ma Cotisation Mensuelle"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 tracking-tight">
            {isBureau ? formatFCFA(unpaidAmount) : formatFCFA(activeMember.monthlyPledge)}
          </p>
          <div className="flex items-center justify-between text-xs mt-2">
            {isBureau ? (
              <>
                <span className="text-slate-500">{countUnpaid} membres en retard</span>
                {countUnpaid > 0 && (
                  <button
                    onClick={onGoToReminders}
                    className="text-amber-700 font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    Relancer <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </>
            ) : (
              <span className={paidMemberIds.has(activeMember.id) ? "text-emerald-700 font-semibold" : "text-amber-700 font-medium"}>
                {paidMemberIds.has(activeMember.id) ? "Votre part est réglée ✓" : "À régulariser ce mois"}
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Trésorerie Totale & Caisse Secours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Solde Net en Caisse
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {formatFCFA(netTreasury)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 border-t border-slate-100 pt-1.5">
            <span>Fonds de Secours :</span>
            <span className="font-semibold text-purple-700">{formatFCFA(secoursBalance)}</span>
          </div>
        </div>
      </div>

      {/* Reminder Alert Banner - UNIQUEMENT réservé au Bureau pour protéger la dignité des membres */}
      {isBureau && countUnpaid > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm">
                Rappels de cotisations recommandés ({countUnpaid} membres en retard)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                La date d'échéance mensuelle (le {config.dueDayOfMonth} du mois) est passée. Envoyez en un clic les relances WhatsApp personnalisées.
              </p>
            </div>
          </div>
          <button
            onClick={onGoToReminders}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors whitespace-nowrap self-start sm:self-center"
          >
            <Send className="w-3.5 h-3.5" />
            Gérer les relances automatiques
          </button>
        </div>
      )}

      {/* Chart & Payment Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Bar Chart (2 columns on large) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Évolution des Encaissements {currentYear}
              </h3>
              <p className="text-xs text-slate-500">
                Montant total des cotisations perçues par mois
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                Encaissements
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-slate-300"></span>
                Objectif ({formatFCFA(totalExpectedThisMonth)})
              </span>
            </div>
          </div>

          {/* Interactive SVG / Bar Visualizer */}
          <div className="h-56 flex items-end justify-between gap-2 pt-6 px-1 border-b border-slate-200">
            {monthlyStats.map((stat) => {
              const heightPercent = maxMonthValue > 0 ? (stat.total / maxMonthValue) * 100 : 0;
              const isCurrent = stat.monthNum === currentMonth;

              return (
                <div key={stat.monthNum} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    {stat.fullName} : {formatFCFA(stat.total)} ({stat.count} reçus)
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-md overflow-hidden flex items-end h-44">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isCurrent
                          ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 ring-2 ring-emerald-300 ring-offset-1'
                          : stat.total > 0
                          ? 'bg-gradient-to-t from-slate-700 to-slate-500 group-hover:from-emerald-600 group-hover:to-teal-500'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    ></div>
                  </div>

                  {/* Month Label */}
                  <span className={`text-[10px] mt-2 font-medium ${isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {stat.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
            <span>Cumul total encaissé en {currentYear} : <strong className="text-slate-800">{formatFCFA(totalAllTimeIn)}</strong></span>
            <span>Objectif mensuel de l'association : <strong className="text-slate-800">{formatFCFA(totalExpectedThisMonth)}</strong></span>
          </div>
        </div>

        {/* Right Column: Channels Breakdown & Caisse Solidarité */}
        <div className="space-y-6">
          {/* Payment Methods Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Modes de Règlement
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Canaux de versement utilisés ce mois
            </p>

            <div className="space-y-3">
              {[
                { name: 'Wave', color: 'bg-cyan-500', icon: '🌊' },
                { name: 'Orange Money', color: 'bg-orange-500', icon: '🟠' },
                { name: 'Espèces', color: 'bg-emerald-600', icon: '💵' },
                { name: 'Virement', color: 'bg-indigo-600', icon: '🏦' }
              ].map((channel) => {
                const total = methodTotals[channel.name] || 0;
                const pct = totalCollectedThisMonth > 0 ? Math.round((total / totalCollectedThisMonth) * 100) : 0;

                return (
                  <div key={channel.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <span>{channel.icon}</span>
                        {channel.name}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatFCFA(total)} <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${channel.color}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Caisse de Secours / Solidarité Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-400" />
                <h4 className="font-bold text-sm tracking-tight">Fonds de Solidarité & Secours</h4>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white/10 text-emerald-300">
                {config.secoursPercentage}% réservés
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Caisse destinée aux mariages, naissances, urgences de santé et assistance fraternelle des membres.
            </p>

            <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/10 text-xs mb-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Solde Actuel</span>
                <span className="font-bold text-emerald-400 text-base">{formatFCFA(secoursBalance)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Aides Versées</span>
                <span className="font-bold text-rose-400 text-base">{formatFCFA(totalSecoursOut)}</span>
              </div>
            </div>

            <button
              onClick={onOpenNewExpense}
              className="w-full py-2 text-xs font-semibold bg-white/15 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10 text-center"
            >
              Enregistrer une action de solidarité
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tables: Recent Payments & Solidarité Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Derniers Versements Reçus</h3>
            </div>
            <button
              onClick={() => onGoToMembers()}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Voir tous
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Aucun versement enregistré</p>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {p.paymentMethod === 'Wave' ? 'W' : p.paymentMethod === 'Orange Money' ? 'OM' : 'C'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.memberName}</p>
                      <p className="text-[11px] text-slate-500">
                        {getMonthName(p.periodMonth)} {p.periodYear} · {p.paymentMethod} {p.transactionRef && `(${p.transactionRef})`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-xs font-bold text-emerald-700">{formatFCFA(p.amount)}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(p.paymentDate)}</p>
                    </div>
                    <button
                      onClick={() => onShowReceipt(p)}
                      title="Voir la quittance"
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Mutual Aid & Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-slate-900 text-sm">Actions de Solidarité & Décaissements</h3>
            </div>
            <button
              onClick={onOpenNewExpense}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              + Décaisser
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Aucune dépense ou aide accordée</p>
            ) : (
              recentExpenses.map((exp) => (
                <div key={exp.id} className="py-3 flex items-start justify-between hover:bg-slate-50/80 rounded-xl px-2 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{exp.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Bénéficiaire : <strong className="text-slate-700">{exp.beneficiary}</strong> · {formatDate(exp.date)}
                    </p>
                    <p className="text-[11px] text-slate-600 italic line-clamp-1">{exp.description}</p>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-bold text-rose-600">-{formatFCFA(exp.amount)}</p>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {exp.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
