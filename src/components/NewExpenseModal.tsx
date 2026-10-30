import React, { useState } from 'react';
import { ExpenseOrAid } from '../types';
import { playSuccessChime } from '../utils/formatters';
import { X, HeartHandshake, Check } from 'lucide-react';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: ExpenseOrAid) => void;
  currentRecorder: string;
}

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  currentRecorder
}) => {
  const [title, setTitle] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [category, setCategory] = useState<ExpenseOrAid['category']>('Secours & Urgence');
  const [amount, setAmount] = useState<number>(25000);
  const [secondApprover, setSecondApprover] = useState('Aminata Sow (Présidente)');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const requiresDualApproval = amount >= 50000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    const newExpense: ExpenseOrAid = {
      id: `exp-${Date.now()}`,
      title: title.trim(),
      beneficiary: beneficiary.trim() || 'Association',
      category,
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
      approvedBy: `Bureau Exécutif (${currentRecorder})`,
      secondApprovedBy: requiresDualApproval ? secondApprover : undefined,
      status: 'validé',
      description: description.trim()
    };

    playSuccessChime();
    onSaveExpense(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Décaisser une Aide / Dépense</h3>
              <p className="text-xs text-slate-500">Imputation sur la Caisse de Solidarité ou Frais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Motif / Titre *</label>
            <input
              type="text"
              required
              placeholder="Ex: Soutien santé maman d'un membre, Baptême, Salle AG..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catégorie *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseOrAid['category'])}
                className="w-full rounded-xl border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="Secours & Urgence">Secours & Urgence</option>
                <option value="Solidarité Familiale">Solidarité Familiale</option>
                <option value="Organisation Réunion">Organisation Réunion</option>
                <option value="Frais de Fonctionnement">Frais Fonctionnement</option>
                <option value="Événement / Tabaski">Événement / Fête</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Montant en FCFA *</label>
              <input
                type="number"
                step="1000"
                min="1000"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          {requiresDualApproval && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
              <span className="font-bold flex items-center gap-1.5 text-amber-800">
                🔒 Règle de Double Signature Exigée (Montant ≥ 50 000 FCFA)
              </span>
              <p className="text-[11px] text-amber-700">
                Conformément aux statuts pour éviter tout abus financier, ce décaissement nécessite l'approbation conjointe de la Présidence ou du Commissariat aux Comptes.
              </p>
              <div>
                <label className="block font-semibold text-amber-900 mt-2 mb-1">
                  Deuxième signataire approbateur *
                </label>
                <select
                  value={secondApprover}
                  onChange={(e) => setSecondApprover(e.target.value)}
                  className="w-full rounded-lg border border-amber-300 p-2 bg-white text-slate-800 font-medium"
                >
                  <option value="Aminata Sow (Présidente)">Aminata Sow — Présidente</option>
                  <option value="Mariama Diallo (Secrétaire Générale)">Mariama Diallo — Secrétaire Générale</option>
                  <option value="Commissaire aux Comptes">Commissaire aux Comptes</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bénéficiaire / Destinataire</label>
            <input
              type="text"
              placeholder="Nom du membre ou prestataire..."
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Détails / Justification</label>
            <textarea
              rows={3}
              placeholder="Précisez le contexte de l'aide accordée..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 font-medium text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Valider le Décaissement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
