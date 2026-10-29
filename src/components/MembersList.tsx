import React, { useState } from 'react';
import { Member, ContributionPayment, MemberRole, AssociationConfig } from '../types';
import { formatFCFA, formatDate, getMonthName } from '../utils/formatters';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  Receipt, 
  Edit, 
  Trash2, 
  Send, 
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface MembersListProps {
  members: Member[];
  payments: ContributionPayment[];
  config: AssociationConfig;
  currentMonth: number;
  currentYear: number;
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onOpenPaymentForMember: (memberId: string) => void;
  onShowReceipt: (p: ContributionPayment) => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  payments,
  config,
  currentMonth,
  currentYear,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onOpenPaymentForMember,
  onShowReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form state for add/edit
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+221 ');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('Membre Actif');
  const [city, setCity] = useState('Dakar');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [monthlyPledge, setMonthlyPledge] = useState<number>(config.defaultMonthlyDues);
  const [notes, setNotes] = useState('');

  // Calculate current month payment status
  const currentMonthPaidIds = new Set(
    payments
      .filter((p) => p.periodMonth === currentMonth && p.periodYear === currentYear && p.type === 'cotisation_mensuelle')
      .map((p) => p.memberId)
  );

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.occupation && m.occupation.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedRole !== 'all' && m.role !== selectedRole) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFirstName('');
    setLastName('');
    setPhone('+221 ');
    setEmail('');
    setRole('Membre Actif');
    setCity('Dakar');
    setAddress('');
    setOccupation('');
    setMonthlyPledge(config.defaultMonthlyDues);
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFirstName(m.firstName);
    setLastName(m.lastName);
    setPhone(m.phone);
    setEmail(m.email);
    setRole(m.role);
    setCity(m.city);
    setAddress(m.address);
    setOccupation(m.occupation || '');
    setMonthlyPledge(m.monthlyPledge);
    setNotes(m.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    if (editingMember) {
      const updated: Member = {
        ...editingMember,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role,
        city: city.trim(),
        address: address.trim(),
        occupation: occupation.trim() || undefined,
        monthlyPledge: Number(monthlyPledge),
        notes: notes.trim() || undefined
      };
      onUpdateMember(updated);
      if (selectedMember?.id === updated.id) {
        setSelectedMember(updated);
      }
    } else {
      const newMember: Member = {
        id: `mem-${Date.now()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@association.sn`,
        role,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        joinedDate: new Date().toISOString().slice(0, 10),
        address: address.trim() || 'Dakar',
        city: city.trim() || 'Dakar',
        monthlyPledge: Number(monthlyPledge),
        status: 'active',
        occupation: occupation.trim() || undefined,
        notes: notes.trim() || undefined
      };
      onAddMember(newMember);
    }
    setIsAddModalOpen(false);
  };

  // Get payments of selected member
  const memberPayments = selectedMember
    ? payments.filter((p) => p.memberId === selectedMember.id)
    : [];

  const memberTotalCotise = memberPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Répertoire des Membres
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
              {members.length} adhérents
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestion des coordonnées, rôles au sein du bureau et engagements financiers
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter un Membre
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, ville, profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tous les rôles</option>
          <option value="Président(e)">Président(e)</option>
          <option value="Trésorier(ère)">Trésorier(ère)</option>
          <option value="Secrétaire Général(e)">Secrétaire Général(e)</option>
          <option value="Commissaire aux Comptes">Commissaire aux Comptes</option>
          <option value="Responsable Organisation">Responsable Organisation</option>
          <option value="Membre Actif">Membre Actif</option>
          <option value="Doyen / Conseiller">Doyen / Conseiller</option>
        </select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const isPaid = currentMonthPaidIds.has(member.id);

          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header with avatar, name & status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.firstName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {member.firstName} {member.lastName}
                      </h4>
                      <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      À jour
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <AlertCircle className="w-3 h-3" />
                      Attente
                    </span>
                  )}
                </div>

                {/* Info List */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                  {member.occupation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.occupation}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.city}</span>
                  </div>
                </div>

                {/* Financial commitment */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cotisation mensuelle :</span>
                  <span className="font-bold text-slate-900">{formatFCFA(member.monthlyPledge)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                >
                  Fiche & Historique →
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenPaymentForMember(member.id)}
                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Encaisser cotisation"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Modifier les coordonnées"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Êtes-vous sûr de vouloir supprimer ${member.firstName} ${member.lastName} du répertoire ?`)) {
                        onDeleteMember(member.id);
                      }
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Supprimer le membre"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Details Drawer Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.firstName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedMember.role} · Membre depuis le {formatDate(selectedMember.joinedDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Stats Card */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Cotisé à ce jour</span>
                  <span className="text-lg font-bold text-emerald-700">{formatFCFA(memberTotalCotise)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Statut ({getMonthName(currentMonth)})</span>
                  <span className="text-lg font-bold text-slate-900">
                    {currentMonthPaidIds.has(selectedMember.id) ? 'À jour ✓' : 'En attente ⏳'}
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-2 text-xs text-slate-600">
                <p><strong>Téléphone :</strong> {selectedMember.phone}</p>
                <p><strong>Email :</strong> {selectedMember.email}</p>
                <p><strong>Ville / Adresse :</strong> {selectedMember.address}, {selectedMember.city}</p>
                {selectedMember.occupation && <p><strong>Profession :</strong> {selectedMember.occupation}</p>}
                {selectedMember.notes && (
                  <p className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 text-amber-900">
                    <strong>Note du Bureau :</strong> {selectedMember.notes}
                  </p>
                )}
              </div>

              {/* Payments History of this Member */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Historique des Règlements de {selectedMember.firstName}
                </h4>
                {memberPayments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Aucun paiement enregistré pour ce membre.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {memberPayments.map((p) => (
                      <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-900">
                            {getMonthName(p.periodMonth)} {p.periodYear} · {formatFCFA(p.amount)}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {p.paymentMethod} {p.transactionRef && `(${p.transactionRef})`} · {formatDate(p.paymentDate)}
                          </p>
                        </div>
                        <button
                          onClick={() => onShowReceipt(p)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          Quittance
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    onOpenPaymentForMember(selectedMember.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Enregistrer un Paiement
                </button>

                <button
                  onClick={() => handleOpenEdit(selectedMember)}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Modifier la Fiche
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingMember ? 'Modifier les coordonnées' : 'Ajouter un Nouveau Membre'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Babacar"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ndiaye"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+221 77 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rôle au sein du Bureau *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as MemberRole)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="Président(e)">Président(e)</option>
                    <option value="Trésorier(ère)">Trésorier(ère)</option>
                    <option value="Secrétaire Général(e)">Secrétaire Général(e)</option>
                    <option value="Commissaire aux Comptes">Commissaire aux Comptes</option>
                    <option value="Responsable Organisation">Responsable Organisation</option>
                    <option value="Membre Actif">Membre Actif</option>
                    <option value="Doyen / Conseiller">Doyen / Conseiller</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ville / Résidence</label>
                  <input
                    type="text"
                    placeholder="Ex: Dakar, Thiès, Paris..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cotisation Mensuelle (FCFA)</label>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={monthlyPledge}
                    onChange={(e) => setMonthlyPledge(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Profession / Activité</label>
                <input
                  type="text"
                  placeholder="Ex: Médecin, Enseignant, Commerçant..."
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Observations</label>
                <input
                  type="text"
                  placeholder="Notes sur la disponibilité ou souhaits du membre..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                >
                  {editingMember ? 'Enregistrer les modifications' : 'Ajouter le Membre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
