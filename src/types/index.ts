export type MemberRole = 
  | 'Président(e)' 
  | 'Trésorier(ère)' 
  | 'Secrétaire Général(e)' 
  | 'Commissaire aux Comptes' 
  | 'Responsable Organisation' 
  | 'Membre Actif' 
  | 'Doyen / Conseiller';

export type PaymentMethod = 'Wave' | 'Orange Money' | 'Espèces' | 'Virement' | 'Chèque' | 'Free Money';

export type ContributionType = 'cotisation_mensuelle' | 'caisse_secours' | 'droit_adhesion' | 'don_extraordinaire';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: MemberRole;
  avatar: string;
  joinedDate: string;
  address: string;
  city: string;
  monthlyPledge: number; // usually 10,000 or 15,000 FCFA
  status: 'active' | 'suspended' | 'honorary';
  occupation?: string;
  notes?: string;
}

export interface ContributionPayment {
  id: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  periodMonth: number; // 1 to 12
  periodYear: number;
  amount: number;
  paymentDate: string; // ISO
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  recordedBy: string;
  type: ContributionType;
  note?: string;
}

export interface ExpenseOrAid {
  id: string;
  title: string;
  category: 'Secours & Urgence' | 'Solidarité Familiale' | 'Organisation Réunion' | 'Frais de Fonctionnement' | 'Événement / Tabaski' | 'Autre';
  beneficiary: string;
  amount: number;
  date: string;
  approvedBy: string;
  status: 'validé' | 'en_attente' | 'rejeté';
  description: string;
}

export interface ReminderItem {
  id: string;
  memberId: string;
  memberName: string;
  phone: string;
  month: number;
  year: number;
  amountDue: number;
  status: 'suggéré' | 'envoyé' | 'ignoré';
  type: 'preventif' | 'echeance' | 'retard';
  channel: 'whatsapp' | 'sms' | 'email';
  messageText: string;
  lastSentAt?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // member ids
}

export interface DiscussionMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: MemberRole;
  authorAvatar: string;
  timestamp: string;
  channel: 'general' | 'bureau' | 'urgences' | 'reunions';
  content: string;
  isOfficial?: boolean;
  isUrgent?: boolean;
  poll?: {
    id: string;
    question: string;
    options: PollOption[];
    closed: boolean;
  };
  reactions: Record<string, string[]>; // emoji -> array of member names
  attachment?: {
    type: 'document' | 'image' | 'recu';
    name: string;
    size?: string;
  };
}

export interface AssociationConfig {
  name: string;
  sigle: string;
  devise: string; // "FCFA"
  defaultMonthlyDues: number;
  dueDayOfMonth: number; // e.g. 5
  treasurerName: string;
  treasurerPhone: string;
  presidentName: string;
  waveNumber: string;
  orangeMoneyNumber: string;
  bankRib?: string;
  slogan: string;
  foundationYear: number;
  location: string;
  secoursPercentage: number; // % of contributions reserved for emergency fund
}
