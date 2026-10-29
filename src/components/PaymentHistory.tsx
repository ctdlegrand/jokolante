import React, { useState } from 'react';
import { ContributionPayment, Member, AssociationConfig, PaymentMethod, ContributionType } from '../types';
import { MONTHS, formatFCFA, formatDate, getMonthName } from '../utils/formatters';
import { 
  ReceiptText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Share2, 
  Plus, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

interface PaymentHistoryProps {
  payments: ContributionPayment[];
  members: Member[];
  config: AssociationConfig;
  onShowReceipt: (p: ContributionPayment) => void;
  onDeletePayment: (paymentId: string) => void;
  onOpenNewPayment: () => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  members,
  config,
  onShowReceipt,
  onDeletePayment,
  onOpenNewPayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filtering
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.note && p.note.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedMonth !== 'all' && p.periodMonth !== selectedMonth) return false;
    if (selectedMethod !== 'all' && p.paymentMethod !== selectedMethod) return false;
    if (selectedType !== 'all' && p.type !== selectedType) return false;

    return true;
  });

  const totalFiltered = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleExportCSV = () => {
    const headers = ['N° Reçu', 'Date Paiement', 'Membre', 'Mois', 'Année', 'Montant FCFA', 'Moyen', 'Référence', 'Type', 'Enregistré Par'];
    const rows = filteredPayments.map((p) => [
      `"${p.receiptNumber}"`,
      `"${formatDate(p.paymentDate, true)}"`,
      `"${p.memberName}"`,
      `"${getMonthName(p.periodMonth)}"`,
      p.periodYear,
      p.amount,
      `"${p.paymentMethod}"`,
      `"${p.transactionRef || 'N/A'}"`,
      `"${p.type}"`,
      `"${p.recordedBy}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Historique_Paiements_Jookolante_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareWhatsApp = (p: ContributionPayment) => {
    const mem = members.find((m) => m.id === p.memberId);
    const cleanPhone = mem?.phone.replace(/[^0-9]/g, '') || '';
    const text = `Bonjour ${p.memberName},\nVotre reçu de cotisation *${p.receiptNumber}* pour *${getMonthName(p.periodMonth)} ${p.periodYear}* d'un montant de *${formatFCFA(p.amount)}* a bien été validé par la trésorerie de l'association *${config.name}*.\nMerci pour votre engagement !`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ReceiptText className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Historique Complet des Paiements & Quittances
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consultez, imprimez ou partagez les quittances officielles de chaque cotisation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Exporter l'Historique
          </button>
          <button
            onClick={onOpenNewPayment}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau Versement
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par membre, N° reçu, réf transaction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Month */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tous les mois</option>
          {MONTHS.map((m, idx) => (
            <option key={idx} value={idx + 1}>
              {m}
            </option>
          ))}
        </select>

        {/* Method */}
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tous les modes</option>
          <option value="Wave">Wave</option>
          <option value="Orange Money">Orange Money</option>
          <option value="Espèces">Espèces</option>
          <option value="Virement">Virement</option>
        </select>

        {/* Type */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tous les types</option>
          <option value="cotisation_mensuelle">Cotisation Mensuelle</option>
          <option value="caisse_secours">Caisse de Secours</option>
          <option value="droit_adhesion">Droit d'Adhésion</option>
        </select>

        {/* Total Badge */}
        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-slate-500">Total : </span>
          <strong className="text-emerald-700 font-bold">{formatFCFA(totalFiltered)}</strong>
          <span className="text-slate-400 ml-1">({filteredPayments.length} reçus)</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">N° Quittance</th>
                <th className="py-3 px-4">Date de Paiement</th>
                <th className="py-3 px-4">Membre Cotisant</th>
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Mode & Réf</th>
                <th className="py-3 px-4">Enregistré Par</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Aucun versement ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const mem = members.find((m) => m.id === p.memberId);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Quittance # */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => onShowReceipt(p)}
                          className="hover:text-emerald-700 hover:underline flex items-center gap-1.5"
                          title="Voir la quittance complète"
                        >
                          <ReceiptText className="w-3.5 h-3.5 text-emerald-600" />
                          {p.receiptNumber}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(p.paymentDate, true)}
                      </td>

                      {/* Membre */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {mem?.avatar && (
                            <img
                              src={mem.avatar}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                          )}
                          <span className="font-bold text-slate-900">{p.memberName}</span>
                        </div>
                      </td>

                      {/* Période */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <span className="font-semibold">{getMonthName(p.periodMonth)}</span> {p.periodYear}
                      </td>

                      {/* Montant */}
                      <td className="py-3 px-4 font-bold text-emerald-700 whitespace-nowrap">
                        {formatFCFA(p.amount)}
                      </td>

                      {/* Mode & Réf */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                          {p.transactionRef && (
                            <span className="block text-[10px] font-mono text-slate-400">
                              {p.transactionRef}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Enregistré par */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {p.recordedBy}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onShowReceipt(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Voir & Imprimer Quittance"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleShareWhatsApp(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Partager par WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Confirmez-vous l'annulation du paiement ${p.receiptNumber} pour ${p.memberName} ?`)) {
                                onDeletePayment(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Supprimer ce versement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
