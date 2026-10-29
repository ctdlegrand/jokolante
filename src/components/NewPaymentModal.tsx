import React, { useState } from 'react';
import { Member, ContributionPayment, PaymentMethod, ContributionType, AssociationConfig } from '../types';
import { MONTHS, formatFCFA, generateReceiptNumber, playSuccessChime } from '../utils/formatters';
import { X, Check, CreditCard, Sparkles } from 'lucide-react';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSavePayment: (payment: ContributionPayment) => void;
  defaultMemberId?: string;
  defaultMonth?: number;
  defaultYear?: number;
  config: AssociationConfig;
  currentRecorder: string;
  onShowReceipt: (payment: ContributionPayment) => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  members,
  onSavePayment,
  defaultMemberId,
  defaultMonth = new Date().getMonth() + 1,
  defaultYear = new Date().getFullYear(),
  config,
  currentRecorder,
  onShowReceipt
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    defaultMemberId || (members.length > 0 ? members[0].id : '')
  );
  const [periodMonth, setPeriodMonth] = useState<number>(defaultMonth);
  const [periodYear, setPeriodYear] = useState<number>(defaultYear);
  const [type, setType] = useState<ContributionType>('cotisation_mensuelle');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Wave');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const [amount, setAmount] = useState<number>(
    selectedMember ? selectedMember.monthlyPledge : config.defaultMonthlyDues
  );

  // Update amount when member changes
  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId);
    const m = members.find((mem) => mem.id === memberId);
    if (m && type === 'cotisation_mensuelle') {
      setAmount(m.monthlyPledge);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || amount <= 0) return;

    const newPayment: ContributionPayment = {
      id: `pay-${Date.now()}`,
      receiptNumber: generateReceiptNumber(Math.floor(Math.random() * 899 + 100)),
      memberId: selectedMember.id,
      memberName: `${selectedMember.firstName} ${selectedMember.lastName}`,
      periodMonth,
      periodYear,
      amount: Number(amount),
      paymentDate: new Date().toISOString(),
      paymentMethod,
      transactionRef: transactionRef.trim() || undefined,
      recordedBy: currentRecorder,
      type,
      note: note.trim() || undefined
    };

    playSuccessChime();
    onSavePayment(newPayment);
    onClose();
    // Offer receipt preview
    onShowReceipt(newPayment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Enregistrer une Cotisation</h3>
              <p className="text-xs text-slate-500">Génération automatique du reçu de versement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Membre cotisant *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} — ({m.role}) · {formatFCFA(m.monthlyPledge)}
                </option>
              ))}
            </select>
          </div>

          {/* Type & Period */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type de versement
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContributionType)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="cotisation_mensuelle">Cotisation Mensuelle</option>
                <option value="caisse_secours">Fonds Urgence / Secours</option>
                <option value="droit_adhesion">Droit d'Adhésion</option>
                <option value="don_extraordinaire">Don Extraordinaire</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mois concerné
              </label>
              <select
                value={periodMonth}
                onChange={(e) => setPeriodMonth(Number(e.target.value))}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MONTHS.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m} {periodYear}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Montant en FCFA *
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mode de paiement *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Wave">Wave (App)</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Espèces">Espèces / Cash</option>
                <option value="Virement">Virement Bancaire</option>
                <option value="Free Money">Free Money</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>
          </div>

          {/* Transaction Ref */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Référence de transaction (Optionnelle)
            </label>
            <input
              type="text"
              placeholder="Ex: WAV-984210 ou OM-45812..."
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarque / Note interne
            </label>
            <input
              type="text"
              placeholder="Ex: Reçu en main propre, avance sur le mois prochain..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Recorded By preview */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Enregistré par : <strong className="text-slate-700">{currentRecorder}</strong></span>
            <span>Date : <strong className="text-slate-700">Aujourd'hui</strong></span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Valider et générer la quittance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
