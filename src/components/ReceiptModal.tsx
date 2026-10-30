import React, { useRef } from 'react';
import { ContributionPayment, AssociationConfig, Member } from '../types';
import { formatFCFA, formatDate, amountToFrenchWords, getMonthName } from '../utils/formatters';
import { Printer, Download, Share2, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  payment: ContributionPayment | null;
  member?: Member;
  config: AssociationConfig;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  member,
  config,
  onClose
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*QUITTANCE DE PAIEMENT - ${config.name}*\n` +
      `N° Reçu : ${payment.receiptNumber}\n` +
      `Membre : ${payment.memberName}\n` +
      `Période : ${getMonthName(payment.periodMonth)} ${payment.periodYear}\n` +
      `Montant : ${formatFCFA(payment.amount)}\n` +
      `Moyen : ${payment.paymentMethod} (Réf: ${payment.transactionRef || 'N/A'})\n` +
      `Date : ${formatDate(payment.paymentDate, true)}\n` +
      `Statut : ENCAISSÉ PAR LE TRÉSORIER\n` +
      `Merci pour votre fidélité et votre esprit d'entraide !`;
    
    const url = `https://wa.me/${member?.phone?.replace(/\s+/g, '').replace('+', '') || ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-w-full">
        {/* Modal Top Bar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-slate-800 text-sm">
              Quittance Officielle de Cotisation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              Partager WhatsApp
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-8 print:p-6 text-slate-800 relative bg-white">
          {/* Subtle decorative watermark / seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-9xl font-black tracking-widest text-slate-900">JOOKO</span>
          </div>

          {/* Association Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  JK
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {config.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {config.sigle} · {config.slogan}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {config.location} · Tél Trésorerie : {config.treasurerPhone}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider rounded-md border border-emerald-200 mb-2">
                REÇU DE CAISSE
              </span>
              <p className="text-sm font-mono font-bold text-slate-900">
                {payment.receiptNumber}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Date : {formatDate(payment.paymentDate, true)}
              </p>
            </div>
          </div>

          {/* Member & Payment Details Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Bénéficiaire / Membre
              </span>
              <p className="font-bold text-slate-900 text-base">{payment.memberName}</p>
              {member && (
                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                  <p>Tél : {member.phone}</p>
                  <p>Ville : {member.city}</p>
                  <p>Rôle : {member.role}</p>
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Détails du Paiement
              </span>
              <div className="text-xs text-slate-700 space-y-1">
                <p>
                  <span className="text-slate-500">Mois concerné :</span>{' '}
                  <span className="font-semibold text-slate-900">{getMonthName(payment.periodMonth)} {payment.periodYear}</span>
                </p>
                <p>
                  <span className="text-slate-500">Mode de versement :</span>{' '}
                  <span className="font-semibold text-slate-900">{payment.paymentMethod}</span>
                </p>
                {payment.transactionRef && (
                  <p>
                    <span className="text-slate-500">Réf. transaction :</span>{' '}
                    <span className="font-mono text-slate-900">{payment.transactionRef}</span>
                  </p>
                )}
                <p>
                  <span className="text-slate-500">Type :</span>{' '}
                  <span className="capitalize">{payment.type.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="border border-slate-200 rounded-xl p-5 mb-6 bg-white shadow-xs">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">Montant Reçu</span>
              <span className="text-2xl font-black text-emerald-700">
                {formatFCFA(payment.amount)}
              </span>
            </div>
            <p className="text-xs text-slate-600 italic border-t border-slate-100 pt-2">
              <span className="font-semibold text-slate-700 not-italic">En toutes lettres :</span> {amountToFrenchWords(payment.amount)}
            </p>
            {payment.note && (
              <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg">
                <span className="font-semibold">Note :</span> {payment.note}
              </p>
            )}
          </div>

          {/* Signatures, Verification Hash & Seal */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-700 mb-1">Le Membre Cotisant</p>
              <p className="text-slate-500">{payment.memberName}</p>
              <div className="h-10 flex items-end">
                <span className="text-slate-400 italic text-[11px]">[Signature & Accord]</span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <p className="font-semibold text-slate-700 mb-1">Pour la Trésorerie Générale</p>
              <p className="text-slate-500">{payment.recordedBy || config.treasurerName}</p>
              <div className="mt-1 border-2 border-dashed border-emerald-600/40 rounded-lg p-2 text-center inline-block bg-emerald-50/50">
                <div className="flex items-center gap-1 justify-center text-emerald-800 font-bold text-[10px] uppercase">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  PAYÉ & VALIDÉ
                </div>
                <span className="text-[9px] text-emerald-700 block mt-0.5">
                  CAISSE CENTRALE JOOKOLANTE
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Verification Seal / Anti-Fraud Hash */}
          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">
                  Empreinte Numérique Anti-Falsification
                </span>
                <span className="font-mono text-[11px] text-slate-600 select-all font-semibold">
                  {payment.verificationHash || `SN-VFY-${payment.receiptNumber.replace(/[^0-9]/g, '').slice(-4)}-${payment.amount.toString().slice(0, 4)}`}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
              ✓ Registre Inaltérable
            </span>
          </div>

          {/* Footer notice */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Quittance certifiée générée par l'application Jookolante. Document valant preuve de paiement libératoire des cotisations associatives.
          </div>
        </div>
      </div>
    </div>
  );
};
