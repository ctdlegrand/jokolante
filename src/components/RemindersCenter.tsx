import React, { useState } from 'react';
import { Member, ContributionPayment, AssociationConfig, ReminderItem } from '../types';
import { formatFCFA, getMonthName, playSuccessChime } from '../utils/formatters';
import { 
  BellRing, 
  Send, 
  MessageSquare, 
  Phone, 
  Copy, 
  Check, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  Edit3, 
  CheckCircle2, 
  History,
  Info
} from 'lucide-react';

interface RemindersCenterProps {
  members: Member[];
  payments: ContributionPayment[];
  config: AssociationConfig;
  currentMonth: number;
  currentYear: number;
  onOpenNewPayment: (memberId: string) => void;
}

export const RemindersCenter: React.FC<RemindersCenterProps> = ({
  members,
  payments,
  config,
  currentMonth,
  currentYear,
  onOpenNewPayment
}) => {
  const [selectedUrgency, setSelectedUrgency] = useState<'all' | 'retard' | 'echeance'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentReminders, setSentReminders] = useState<ReminderItem[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  // Default reminder template
  const [customTemplate, setCustomTemplate] = useState<string>(
    `Salam aleykoum {prenom},\n\nCeci est un rappel amical de l'association {association}.\nVotre cotisation mensuelle du mois de {mois} ({montant}) n'a pas encore été enregistrée.\n\nMerci de bien vouloir effectuer votre versement :\n• Wave : {wave}\n• Orange Money : {om}\n\nEn cas de question ou difficulté, n'hésitez pas à contacter le trésorier ({tresorier} au {tel_tresorier}).\n\nNio Far ! 🤝`
  );

  // Find all payments for active month
  const paidMemberIds = new Set(
    payments
      .filter((p) => p.periodMonth === currentMonth && p.periodYear === currentYear && p.type === 'cotisation_mensuelle')
      .map((p) => p.memberId)
  );

  // Late members
  const activeMembers = members.filter((m) => m.status === 'active');
  const unpaidMembers = activeMembers.filter((m) => !paidMemberIds.has(m.id));

  // Generate personalized text for a member
  const generateMessage = (member: Member): string => {
    return customTemplate
      .replace(/{prenom}/g, member.firstName)
      .replace(/{nom}/g, member.lastName)
      .replace(/{association}/g, config.name)
      .replace(/{mois}/g, `${getMonthName(currentMonth)} ${currentYear}`)
      .replace(/{montant}/g, formatFCFA(member.monthlyPledge))
      .replace(/{jour_echeance}/g, `${config.dueDayOfMonth}`)
      .replace(/{wave}/g, config.waveNumber)
      .replace(/{om}/g, config.orangeMoneyNumber)
      .replace(/{tresorier}/g, config.treasurerName)
      .replace(/{tel_tresorier}/g, config.treasurerPhone);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendWhatsApp = (member: Member) => {
    const text = generateMessage(member);
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    recordSentReminder(member, 'whatsapp', text);
  };

  const handleSendSMS = (member: Member) => {
    const text = generateMessage(member);
    const cleanPhone = member.phone.replace(/\s+/g, '');
    const url = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
    window.location.href = url;

    recordSentReminder(member, 'sms', text);
  };

  const recordSentReminder = (member: Member, channel: 'whatsapp' | 'sms', text: string) => {
    playSuccessChime();
    const item: ReminderItem = {
      id: `rem-${Date.now()}-${member.id}`,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      phone: member.phone,
      month: currentMonth,
      year: currentYear,
      amountDue: member.monthlyPledge,
      status: 'envoyé',
      type: 'retard',
      channel,
      messageText: text,
      lastSentAt: new Date().toISOString()
    };
    setSentReminders((prev) => [item, ...prev]);
  };

  // Batch trigger for all
  const [batchIndex, setBatchIndex] = useState<number | null>(null);

  const handleBatchLaunch = () => {
    if (unpaidMembers.length === 0) return;
    // Launch first one and notify user
    handleSendWhatsApp(unpaidMembers[0]);
    alert(
      `Ouverture de WhatsApp pour ${unpaidMembers[0].firstName} ${unpaidMembers[0].lastName}. Vous pouvez continuer avec les ${unpaidMembers.length - 1} autres membres directement depuis la liste.`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Centre de Rappels Automatiques
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {unpaidMembers.length} à relancer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Générez et envoyez instantanément des messages personnalisés via WhatsApp et SMS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingTemplate(!isEditingTemplate)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingTemplate ? 'Fermer le modèle' : 'Personnaliser le modèle'}
          </button>
          {unpaidMembers.length > 0 && (
            <button
              onClick={handleBatchLaunch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Lancer les relances WhatsApp
            </button>
          )}
        </div>
      </div>

      {/* Template Editor Drawer if opened */}
      {isEditingTemplate && (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              Modèle du Message de Relance
            </h3>
            <span className="text-xs text-slate-500">
              Variables disponibles : {'{prenom}'}, {'{nom}'}, {'{mois}'}, {'{montant}'}, {'{wave}'}, {'{om}'}, {'{tresorier}'}
            </span>
          </div>
          <textarea
            rows={6}
            value={customTemplate}
            onChange={(e) => setCustomTemplate(e.target.value)}
            className="w-full text-xs font-sans rounded-xl border border-slate-300 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditingTemplate(false)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg"
            >
              Enregistrer le modèle
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Unpaid Members List + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members to remind list (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Membres en attente de cotisation ({getMonthName(currentMonth)} {currentYear})
            </h3>
            <span className="text-xs text-slate-500">
              Total impayé : <strong className="text-amber-700">{formatFCFA(unpaidMembers.reduce((sum, m) => sum + m.monthlyPledge, 0))}</strong>
            </span>
          </div>

          {unpaidMembers.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center text-emerald-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-base">Tous les membres sont à jour !</h4>
              <p className="text-xs text-emerald-700 mt-1">
                Félicitations, aucune cotisation en souffrance pour le mois de {getMonthName(currentMonth)}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {unpaidMembers.map((member) => {
                const message = generateMessage(member);
                const wasSent = sentReminders.some((r) => r.memberId === member.id);

                return (
                  <div
                    key={member.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.firstName}
                          className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {member.firstName} {member.lastName}
                            </h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {member.role}
                            </span>
                            {wasSent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                Relancé ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tél : {member.phone} · Ville : {member.city}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-amber-700 block">
                          {formatFCFA(member.monthlyPledge)}
                        </span>
                        <span className="text-[10px] text-slate-400">Échéance passée</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* WhatsApp Button */}
                        <button
                          onClick={() => handleSendWhatsApp(member)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                          Envoyer WhatsApp
                        </button>

                        {/* SMS Button */}
                        <button
                          onClick={() => handleSendSMS(member)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          SMS
                        </button>

                        {/* Copy text */}
                        <button
                          onClick={() => handleCopy(member.id, message)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Copier le texte dans le presse-papier"
                        >
                          {copiedId === member.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Quick direct payment entry */}
                      <button
                        onClick={() => onOpenNewPayment(member.id)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
                      >
                        Enregistrer paiement reçu
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Rules & Reminder History */}
        <div className="space-y-6">
          {/* Automatic Rules Explanation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Politique des Relances Jookolante
            </h3>
            <p className="text-xs text-slate-600">
              L'échéance mensuelle est fixée au <strong>{config.dueDayOfMonth} de chaque mois</strong>. Le système applique les règles suivantes :
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <p className="font-bold text-blue-900">1. Alerte Préventive (J-3)</p>
                <p className="text-blue-800 text-[11px] mt-0.5">
                  Notification d'anticipation pour les membres en déplacement ou diaspora.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <p className="font-bold text-amber-900">2. Jour J de l'Échéance</p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Rappel officiel des numéros Wave et Orange Money du trésorier.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                <p className="font-bold text-rose-900">3. Relance Bureau (J+10)</p>
                <p className="text-rose-800 text-[11px] mt-0.5">
                  Prise de contact amicale directe du Président ou du Doyen médiateur.
                </p>
              </div>
            </div>
          </div>

          {/* Sent Reminders Log */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                Historique des Relances
              </h3>
              <span className="text-xs text-slate-400">
                {sentReminders.length} envoyée(s)
              </span>
            </div>

            {sentReminders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aucun rappel envoyé pendant cette session.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {sentReminders.map((r) => (
                  <div key={r.id} className="py-2.5 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{r.memberName}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold uppercase">
                        {r.channel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Montant : {formatFCFA(r.amountDue)} · {r.lastSentAt ? new Date(r.lastSentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
