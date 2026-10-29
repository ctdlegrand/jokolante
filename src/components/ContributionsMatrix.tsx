import React, { useState } from 'react';
import { Member, ContributionPayment, AssociationConfig } from '../types';
import { MONTHS, formatFCFA, getMonthName, formatDate } from '../utils/formatters';
import { 
  Check, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

interface ContributionsMatrixProps {
  members: Member[];
  payments: ContributionPayment[];
  config: AssociationConfig;
  selectedYear: number;
  onYearChange: (year: number) => void;
  currentMonth: number;
  onOpenPaymentForMemberMonth: (memberId: string, month: number, year: number) => void;
  onShowReceipt: (p: ContributionPayment) => void;
  onGoToReminders: () => void;
}

export const ContributionsMatrix: React.FC<ContributionsMatrixProps> = ({
  members,
  payments,
  config,
  selectedYear,
  onYearChange,
  currentMonth,
  onOpenPaymentForMemberMonth,
  onShowReceipt,
  onGoToReminders
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'up_to_date' | 'late'>('all');

  // Filter payments for the selected year
  const yearPayments = payments.filter((p) => p.periodYear === selectedYear);

  // Helper map: key `${memberId}-${month}` -> ContributionPayment
  const paymentMap = new Map<string, ContributionPayment>();
  yearPayments.forEach((p) => {
    paymentMap.set(`${p.memberId}-${p.periodMonth}`, p);
  });

  // Calculate stats for each member
  const memberRows = members.map((member) => {
    let monthsPaidCount = 0;
    let totalPaidYear = 0;
    const isPaidCurrentMonth = paymentMap.has(`${member.id}-${currentMonth}`);

    // Dues required up to currentMonth
    let duesExpectedUpToNow = 0;
    let duesPaidUpToNow = 0;

    for (let m = 1; m <= 12; m++) {
      const p = paymentMap.get(`${member.id}-${m}`);
      if (p) {
        monthsPaidCount++;
        totalPaidYear += p.amount;
        if (m <= currentMonth) {
          duesPaidUpToNow += p.amount;
        }
      }
      if (m <= currentMonth && member.status === 'active') {
        duesExpectedUpToNow += member.monthlyPledge;
      }
    }

    const lateMonthsCount = Math.max(0, currentMonth - monthsPaidCount);
    const isUpToDate = isPaidCurrentMonth;

    return {
      member,
      isPaidCurrentMonth,
      monthsPaidCount,
      totalPaidYear,
      lateMonthsCount,
      isUpToDate
    };
  });

  // Filter by search & status
  const filteredRows = memberRows.filter(({ member, isUpToDate }) => {
    const matchesSearch =
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.city.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'up_to_date') return isUpToDate;
    if (statusFilter === 'late') return !isUpToDate;
    return true;
  });

  // Calculate column totals
  const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
    const mNum = i + 1;
    return yearPayments
      .filter((p) => p.periodMonth === mNum)
      .reduce((sum, p) => sum + p.amount, 0);
  });

  const totalYearCollected = monthlyTotals.reduce((a, b) => a + b, 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Nom & Prénom', 'Téléphone', 'Rôle', 'Montant Mensuel', ...MONTHS, 'Total Année'];
    const rows = filteredRows.map(({ member, totalPaidYear }) => {
      const monthStatuses = Array.from({ length: 12 }, (_, i) => {
        const p = paymentMap.get(`${member.id}-${i + 1}`);
        return p ? p.amount : 0;
      });
      return [
        `"${member.firstName} ${member.lastName}"`,
        `"${member.phone}"`,
        `"${member.role}"`,
        member.monthlyPledge,
        ...monthStatuses,
        totalPaidYear
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cotisations_Jookolante_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls: Year switcher + Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => onYearChange(selectedYear - 1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              title="Année précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-bold text-slate-800">
              Année {selectedYear}
            </span>
            <button
              onClick={() => onYearChange(selectedYear + 1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              title="Année suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Mois actif : <strong className="text-slate-800">{getMonthName(currentMonth)}</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setStatusFilter('up_to_date')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                statusFilter === 'up_to_date' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              À jour
            </button>
            <button
              onClick={() => setStatusFilter('late')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                statusFilter === 'late' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              En retard
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold sticky left-0 bg-slate-50 z-20 min-w-[200px]">
                  Membre & Rôle
                </th>
                <th className="py-3 px-3 font-semibold text-center min-w-[90px]">
                  Pledge
                </th>
                {MONTHS.map((m, idx) => {
                  const mNum = idx + 1;
                  const isCurrent = mNum === currentMonth;
                  return (
                    <th
                      key={m}
                      className={`py-3 px-2 text-center font-semibold min-w-[70px] ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-900 border-x border-emerald-200 font-bold'
                          : ''
                      }`}
                    >
                      {m.substring(0, 3)}.
                    </th>
                  );
                })}
                <th className="py-3 px-4 font-semibold text-right min-w-[100px]">
                  Total {selectedYear}
                </th>
                <th className="py-3 px-3 font-semibold text-center min-w-[80px]">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-slate-400">
                    Aucun membre ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ member, totalPaidYear, isUpToDate, lateMonthsCount }) => {
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Member Info (sticky left) */}
                      <td className="py-3 px-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={member.avatar}
                            alt={member.firstName}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-slate-900 truncate">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {member.role} · {member.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Monthly Pledge */}
                      <td className="py-3 px-3 text-center font-medium text-slate-600">
                        {formatFCFA(member.monthlyPledge)}
                      </td>

                      {/* 12 Months Cells */}
                      {MONTHS.map((_, idx) => {
                        const mNum = idx + 1;
                        const isCurrent = mNum === currentMonth;
                        const payment = paymentMap.get(`${member.id}-${mNum}`);

                        return (
                          <td
                            key={mNum}
                            className={`py-2 px-1 text-center ${
                              isCurrent ? 'bg-emerald-50/40 border-x border-emerald-100' : ''
                            }`}
                          >
                            {payment ? (
                              <button
                                onClick={() => onShowReceipt(payment)}
                                title={`Payé : ${formatFCFA(payment.amount)} via ${payment.paymentMethod} le ${formatDate(payment.paymentDate)} (Cliquer pour voir le reçu)`}
                                className="w-full py-1 px-1 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 font-bold transition-all flex items-center justify-center gap-1 group/btn"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                <span className="text-[10px] hidden group-hover/btn:inline">
                                  {payment.paymentMethod === 'Wave' ? 'W' : 'OM'}
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenPaymentForMemberMonth(member.id, mNum, selectedYear)}
                                title={`Non cotisé pour ${getMonthName(mNum)}. Cliquer pour enregistrer le paiement.`}
                                className={`w-full py-1 px-1 rounded-lg text-[10px] transition-all font-medium ${
                                  mNum <= currentMonth
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                                    : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {mNum <= currentMonth ? (
                                  <span className="flex items-center justify-center gap-0.5">
                                    <Clock className="w-3 h-3 text-rose-500" />
                                    <span>Dû</span>
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Paid Year */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatFCFA(totalPaidYear)}
                      </td>

                      {/* Global Status */}
                      <td className="py-3 px-3 text-center">
                        {isUpToDate ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" />
                            À jour
                          </span>
                        ) : (
                          <button
                            onClick={onGoToReminders}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 hover:bg-rose-100 transition-colors"
                            title="Cliquer pour relancer par WhatsApp"
                          >
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Retard
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Footer Totals */}
            <tfoot>
              <tr className="bg-slate-100 text-slate-800 font-bold border-t-2 border-slate-300">
                <td className="py-3 px-4 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                  Total Mensuel Encaissé
                </td>
                <td className="py-3 px-3 text-center text-slate-500">
                  —
                </td>
                {monthlyTotals.map((tot, idx) => (
                  <td
                    key={idx}
                    className={`py-3 px-1 text-center text-[11px] ${
                      idx + 1 === currentMonth ? 'bg-emerald-100/70 text-emerald-950 font-black' : ''
                    }`}
                  >
                    {tot > 0 ? (tot >= 1000 ? `${Math.round(tot / 1000)}k` : tot) : '0'}
                  </td>
                ))}
                <td className="py-3 px-4 text-right text-emerald-800 font-black">
                  {formatFCFA(totalYearCollected)}
                </td>
                <td className="py-3 px-3 text-center text-slate-500">
                  —
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-700">Légende :</span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</span>
            Cotisation réglée (cliquez pour la quittance)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center text-[9px] font-bold">Dû</span>
            Échéance échue / impayé (cliquez pour encaisser)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold">—</span>
            Mois à venir
          </span>
        </div>

        <button
          onClick={onGoToReminders}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
        >
          Envoyer des relances WhatsApp aux membres en retard →
        </button>
      </div>
    </div>
  );
};
