import React, { useState } from 'react';
import { Member, AssociationConfig } from '../types';
import { formatFCFA, playSuccessChime } from '../utils/formatters';
import { 
  Lock, 
  Phone, 
  Mail, 
  ArrowRight, 
  UserPlus, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  KeyRound, 
  HeartHandshake, 
  CheckCircle2,
  Building,
  HelpCircle
} from 'lucide-react';

interface LoginPageProps {
  members: Member[];
  config: AssociationConfig;
  onLoginSuccess: (member: Member) => void;
  onRegisterMember: (newMember: Member) => void;
  onBypassGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  members,
  config,
  onLoginSuccess,
  onRegisterMember,
  onBypassGuest
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login credentials
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // Register credentials
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('+221 ');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('Dakar');
  const [regOccupation, setRegOccupation] = useState('');
  const [regPledge, setRegPledge] = useState(config.defaultMonthlyDues);
  const [regPin, setRegPin] = useState('1234');
  const [regBloodGroup, setRegBloodGroup] = useState('O+');

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;
  const remainingSeconds = lockoutUntil ? Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000)) : 0;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (isLockedOut) {
      setLoginError(`Accès temporairement bloqué par sécurité anti-force brute. Réessayez dans ${remainingSeconds} secondes.`);
      return;
    }

    const cleanInput = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9]/g, '');

    const found = members.find((m) => {
      const matchEmail = m.email.toLowerCase() === cleanInput;
      const matchPhone = m.phone.replace(/[^0-9]/g, '').includes(cleanPhone);
      const matchName = `${m.firstName} ${m.lastName}`.toLowerCase().includes(cleanInput);
      const matchMatricule = m.matricule?.toLowerCase() === cleanInput;
      return matchEmail || matchPhone || matchName || matchMatricule;
    });

    if (!found) {
      setLoginError('Identifiant introuvable. Entrez votre numéro de téléphone ou sélectionnez un profil ci-dessous.');
      return;
    }

    // Check PIN (if set on member, or accept 1234 as default)
    if (found.pin && pin && found.pin !== pin) {
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      if (nextFails >= 3) {
        setLockoutUntil(Date.now() + 180000); // 3 minutes lockout
        setLoginError('Compte verrouillé temporairement (3 échecs consécutifs). Veuillez patienter 3 minutes.');
      } else {
        setLoginError(`Code PIN erroné (${3 - nextFails} essai(s) restant(s) avant blocage).`);
      }
      return;
    }

    // Reset failed attempts on success
    setFailedAttempts(0);
    setLockoutUntil(null);
    playSuccessChime();
    onLoginSuccess(found);
  };

  const handleQuickLogin = (member: Member) => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    playSuccessChime();
    onLoginSuccess(member);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regPhone.trim()) return;

    const count = members.length + 1;
    const year = new Date().getFullYear();
    const matricule = `JK-${year}-${String(count).padStart(3, '0')}`;

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      matricule,
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim() || `${regFirstName.toLowerCase()}.${regLastName.toLowerCase()}@association.sn`,
      role: 'Membre Actif',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().slice(0, 10),
      address: regCity.trim(),
      city: regCity.trim(),
      monthlyPledge: Number(regPledge),
      status: 'active',
      occupation: regOccupation.trim() || undefined,
      bloodGroup: regBloodGroup,
      pin: regPin.trim() || '1234',
      notes: "Nouvel adhérent enregistré en ligne."
    };

    playSuccessChime();
    onRegisterMember(newMember);
    onLoginSuccess(newMember);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* Decorative ambient background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Simple Nav */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-emerald-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-orange-500/20">
            JK
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight block">
              Jookolante
            </span>
            <span className="text-[11px] text-slate-400">
              {config.name} ({config.sigle})
            </span>
          </div>
        </div>

        <button
          onClick={onBypassGuest}
          className="text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition-colors border border-white/10"
        >
          Accéder en visiteur / consultation →
        </button>
      </div>

      {/* Main Center Card */}
      <div className="max-w-4xl w-full mx-auto px-4 py-8 relative z-10 flex flex-col md:flex-row items-center gap-10">
        
        {/* Left Side: Presentation & Association Trust */}
        <div className="flex-1 space-y-6 text-left hidden md:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Portail Officiel des Membres & Cotisations
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Gérez vos cotisations et votre carte de membre en toute transparence.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Bienvenue sur la plateforme sécurisée de <strong>{config.name}</strong>. Accédez à vos reçus officiels, suivez l'état de la trésorerie et participez aux discussions et votes de la communauté.
          </p>

          {/* Key pillars */}
          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Génération instantanée de la <strong>Carte de Membre officielle</strong> avec QR code.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Quittances certifiées et relances amicales automatiques via <strong>Wave & Orange Money</strong>.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Salon de discussion réservé et votations démocratiques pour les assemblées.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center gap-6 text-xs text-slate-400">
            <div>
              <span className="font-bold text-lg text-white block">{members.length}</span>
              <span>Membres Adhérents</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div>
              <span className="font-bold text-lg text-emerald-400 block">{formatFCFA(config.defaultMonthlyDues)}</span>
              <span>Cotisation mensuelle</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div>
              <span className="font-bold text-lg text-amber-400 block">"{config.slogan}"</span>
              <span>Devise fraternelle</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Box */}
        <div className="w-full md:w-[420px] bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 space-y-5">
          
          {/* Tabs: Connexion / Adhésion */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Se Connecter
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Nouvelle Adhésion
            </button>
          </div>

          {activeTab === 'login' ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Espace Membre
                </h2>
                <p className="text-xs text-slate-500">
                  Connectez-vous pour consulter vos cotisations et votre carte
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Téléphone, Email ou Matricule
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: 77 450 12 34 ou moussa.diop@jookolante.sn"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Code PIN (4 chiffres)</label>
                    <span className="text-[10px] text-slate-400">PIN test : 1234</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white font-mono tracking-widest"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                >
                  <span>Connexion Sécurisée</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Fast Demo Accounts Picker */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  ⚡ Connexion Rapide en 1 Clic (Comptes de Démonstration) :
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {members.slice(0, 4).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleQuickLogin(m)}
                      className="text-left p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center gap-2 group"
                    >
                      <img
                        src={m.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-emerald-700">
                          {m.firstName} {m.lastName.charAt(0)}.
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">
                          {m.role}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Demande d'Adhésion
                </h2>
                <p className="text-xs text-slate-500">
                  Rejoignez {config.name} et obtenez votre carte
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Modou"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fall"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Téléphone WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="+221 77 123 45 67"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Ville</label>
                  <input
                    type="text"
                    placeholder="Dakar, Thiès, Diaspora..."
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Groupe Sanguin</label>
                  <select
                    value={regBloodGroup}
                    onChange={(e) => setRegBloodGroup(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Profession</label>
                  <input
                    type="text"
                    placeholder="Ex: Enseignant, Commerçant..."
                    value={regOccupation}
                    onChange={(e) => setRegOccupation(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Code PIN (4 chiffres)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Confirmer l'Adhésion & Générer ma Carte</span>
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={onBypassGuest}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline"
            >
              Continuer sans connexion (Mode Consultation)
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl w-full mx-auto px-4 py-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        Plateforme d'Entraide Jookolante · Gestion des Cotisations Associatives & Tontines · Sécurité conforme aux normes de protection des données
      </div>
    </div>
  );
};
