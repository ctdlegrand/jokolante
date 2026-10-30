import React, { useState } from 'react';
import { AssociationConfig, AuditLog } from '../types';
import { X, Check, Settings, RotateCcw, Shield, Download, FileSpreadsheet, ShieldCheck, History } from 'lucide-react';
import { formatDate, formatFCFA } from '../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AssociationConfig;
  onSaveConfig: (updated: AssociationConfig) => void;
  onResetData: () => void;
  onExportBackup?: () => void;
  auditLogs?: AuditLog[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
  onExportBackup,
  auditLogs = []
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'audit'>('general');
  const [name, setName] = useState(config.name);
  const [sigle, setSigle] = useState(config.sigle);
  const [slogan, setSlogan] = useState(config.slogan);
  const [defaultMonthlyDues, setDefaultMonthlyDues] = useState(config.defaultMonthlyDues);
  const [dueDayOfMonth, setDueDayOfMonth] = useState(config.dueDayOfMonth);
  const [treasurerName, setTreasurerName] = useState(config.treasurerName);
  const [treasurerPhone, setTreasurerPhone] = useState(config.treasurerPhone);
  const [waveNumber, setWaveNumber] = useState(config.waveNumber);
  const [orangeMoneyNumber, setOrangeMoneyNumber] = useState(config.orangeMoneyNumber);
  const [secoursPercentage, setSecoursPercentage] = useState(config.secoursPercentage);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      name: name.trim(),
      sigle: sigle.trim(),
      slogan: slogan.trim(),
      defaultMonthlyDues: Number(defaultMonthlyDues),
      dueDayOfMonth: Number(dueDayOfMonth),
      treasurerName: treasurerName.trim(),
      treasurerPhone: treasurerPhone.trim(),
      waveNumber: waveNumber.trim(),
      orangeMoneyNumber: orangeMoneyNumber.trim(),
      secoursPercentage: Number(secoursPercentage)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Paramètres de l'Association</h3>
              <p className="text-xs text-slate-500">Configuration des cotisations et coordonnées de paiement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Paramètres & Trésorerie
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Piste d'Audit & Sauvegarde ({auditLogs.length})
          </button>
        </div>

        {activeTab === 'general' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom Officiel de l'Association *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sigle / Acronyme</label>
                <input
                  type="text"
                  value={sigle}
                  onChange={(e) => setSigle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Devise / Slogan</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cotisation Mensuelle Standard (FCFA) *</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={defaultMonthlyDues}
                  onChange={(e) => setDefaultMonthlyDues(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jour d'Échéance du Mois *</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  required
                  value={dueDayOfMonth}
                  onChange={(e) => setDueDayOfMonth(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="font-bold text-slate-800 mb-2">Canaux de Réception des Cotisations</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Numéro Wave du Trésorier *</label>
                  <input
                    type="text"
                    required
                    value={waveNumber}
                    onChange={(e) => setWaveNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-cyan-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Numéro Orange Money *</label>
                  <input
                    type="text"
                    required
                    value={orangeMoneyNumber}
                    onChange={(e) => setOrangeMoneyNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-orange-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du Trésorier</label>
                <input
                  type="text"
                  value={treasurerName}
                  onChange={(e) => setTreasurerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">% Réservé Caisse Secours</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={secoursPercentage}
                  onChange={(e) => setSecoursPercentage(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-purple-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Reset Demo Data Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Voulez-vous réinitialiser toutes les données aux valeurs de démonstration ?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-medium text-xs hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser les données de démo
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Enregistrer
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Audit & Backup Tab */
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Sauvegarde & Export Intégral
                </h4>
                <p className="text-slate-600 text-xs mt-0.5">
                  Téléchargez une copie JSON complète (membres, cotisations, quittances, journal d'audit) pour archivage sécurisé.
                </p>
              </div>
              <button
                type="button"
                onClick={onExportBackup}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                Exporter JSON
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 text-xs">
                  Journal des Actions Récentes (Audit Trail)
                </h4>
                <span className="text-[10px] text-slate-400">
                  Traçabilité des opérations de caisse
                </span>
              </div>

              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Aucune action d'audit consignée pour le moment.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                  {auditLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="p-2.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-[11px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase ${
                            log.action === 'ENCAISSEMENT' ? 'bg-emerald-100 text-emerald-800' :
                            log.action === 'ANNULATION' ? 'bg-rose-100 text-rose-800' :
                            log.action === 'DECAISSEMENT' ? 'bg-amber-100 text-amber-800' :
                            log.action === 'EXPORT_BACKUP' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {log.action.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-slate-800">{log.details}</span>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-0.5">
                          Par <strong className="text-slate-600">{log.actorName}</strong> · {formatDate(log.timestamp, true)}
                        </p>
                      </div>
                      {log.amount && (
                        <span className="font-bold text-slate-900 shrink-0">
                          {formatFCFA(log.amount)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
