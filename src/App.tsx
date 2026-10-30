/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Member, 
  ContributionPayment, 
  ExpenseOrAid, 
  DiscussionMessage, 
  AssociationConfig,
  AuditLog
} from './types';
import { 
  initialConfig, 
  initialMembers, 
  initialPayments, 
  initialExpenses, 
  initialMessages 
} from './data/initialData';
import { Header, ActiveTab } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ContributionsMatrix } from './components/ContributionsMatrix';
import { MembersList } from './components/MembersList';
import { PaymentHistory } from './components/PaymentHistory';
import { RemindersCenter } from './components/RemindersCenter';
import { DiscussionPanel } from './components/DiscussionPanel';
import { ReceiptModal } from './components/ReceiptModal';
import { NewPaymentModal } from './components/NewPaymentModal';
import { NewExpenseModal } from './components/NewExpenseModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginPage } from './components/LoginPage';
import { MemberCardModal } from './components/MemberCardModal';

const STORAGE_KEYS = {
  CONFIG: 'jookolante_config_v1',
  MEMBERS: 'jookolante_members_v1',
  PAYMENTS: 'jookolante_payments_v1',
  EXPENSES: 'jookolante_expenses_v1',
  MESSAGES: 'jookolante_messages_v1',
  AUTH: 'jookolante_auth_v1',
  ACTIVE_USER_ID: 'jookolante_active_user_v1',
  AUDIT_LOGS: 'jookolante_audit_logs_v1'
};

export default function App() {
  // Load state from localStorage or seed
  const [config, setConfig] = useState<AssociationConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : initialConfig;
    } catch {
      return initialConfig;
    }
  });

  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return saved ? JSON.parse(saved) : initialMembers;
    } catch {
      return initialMembers;
    }
  });

  const [payments, setPayments] = useState<ContributionPayment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return saved ? JSON.parse(saved) : initialPayments;
    } catch {
      return initialPayments;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseOrAid[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : initialExpenses;
    } catch {
      return initialExpenses;
    }
  });

  const [messages, setMessages] = useState<DiscussionMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  // Audit Trail State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'log-init-1',
        action: 'ENCAISSEMENT',
        details: 'Initialisation du registre de trésorerie Jookolante',
        actorName: 'Abdoulaye Ndiaye',
        actorRole: 'Trésorier(ère)',
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      // Default to true for ease of review unless explicitly logged out
      return savedAuth !== 'false';
    } catch {
      return true;
    }
  });

  // Current active logged in / simulated user
  const [activeMember, setActiveMember] = useState<Member>(() => {
    try {
      const savedUserId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
      if (savedUserId) {
        const found = members.find((m) => m.id === savedUserId);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    const treasurer = members.find((m) => m.role === 'Trésorier(ère)');
    return treasurer || members[0] || initialMembers[0];
  });

  // Helper: Record Audit Log
  const recordAuditLog = (
    action: AuditLog['action'],
    details: string,
    amount?: number,
    receiptNumber?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      amount,
      receiptNumber,
      actorName: `${activeMember.firstName} ${activeMember.lastName}`,
      actorRole: activeMember.role,
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeMember) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, activeMember.id);
    }
  }, [activeMember]);

  // Current View Navigation
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');

  // Month & Year context
  const [currentMonth, setCurrentMonth] = useState<number>(10); // October (current context)
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Modals state
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [paymentPresetMemberId, setPaymentPresetMemberId] = useState<string | undefined>(undefined);
  const [paymentPresetMonth, setPaymentPresetMonth] = useState<number | undefined>(undefined);
  const [paymentPresetYear, setPaymentPresetYear] = useState<number | undefined>(undefined);

  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<ContributionPayment | null>(null);

  // Member Card Generator Modal State
  const [cardModalMember, setCardModalMember] = useState<Member | null>(null);

  // Global calculations for current month
  const monthPayments = payments.filter(
    (p) => p.periodMonth === currentMonth && p.periodYear === selectedYear
  );
  const totalCollectedMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  const paidMemberIds = new Set(
    monthPayments.filter((p) => p.type === 'cotisation_mensuelle').map((p) => p.memberId)
  );
  const activeMembers = members.filter((m) => m.status === 'active');
  const unpaidCount = activeMembers.filter((m) => !paidMemberIds.has(m.id)).length;

  // Handlers for payments
  const handleSavePayment = (payment: ContributionPayment) => {
    setPayments((prev) => [payment, ...prev]);
    recordAuditLog(
      'ENCAISSEMENT',
      `Enregistrement quittance ${payment.receiptNumber} pour ${payment.memberName}`,
      payment.amount,
      payment.receiptNumber
    );
  };

  const handleDeletePayment = (paymentId: string) => {
    const target = payments.find((p) => p.id === paymentId);
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    if (target) {
      recordAuditLog(
        'ANNULATION',
        `Suppression quittance ${target.receiptNumber} (${target.memberName})`,
        target.amount,
        target.receiptNumber
      );
    }
  };

  const handleOpenPaymentModal = (memberId?: string, month?: number, year?: number) => {
    setPaymentPresetMemberId(memberId);
    setPaymentPresetMonth(month || currentMonth);
    setPaymentPresetYear(year || selectedYear);
    setIsNewPaymentOpen(true);
  };

  // Full Database JSON Backup Export
  const handleExportBackup = () => {
    const backupData = {
      app: 'Jookolante',
      version: '2.0-secure',
      exportedAt: new Date().toISOString(),
      association: config.name,
      config,
      members,
      payments,
      expenses,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jookolante-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    recordAuditLog('EXPORT_BACKUP', 'Exportation intégrale de la base de données (JSON)');
  };

  // Handlers for members
  const handleAddMember = (newMem: Member) => {
    setMembers((prev) => [...prev, newMem]);
    recordAuditLog('NOUVEAU_MEMBRE', `Adhésion nouveau membre : ${newMem.firstName} ${newMem.lastName} (${newMem.matricule})`);
  };

  const handleUpdateMember = (updated: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    if (activeMember.id === updated.id) {
      setActiveMember(updated);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (activeMember.id === memberId) {
      const remaining = members.filter((m) => m.id !== memberId);
      if (remaining.length > 0) setActiveMember(remaining[0]);
    }
  };

  // Handlers for expenses
  const handleSaveExpense = (newExp: ExpenseOrAid) => {
    setExpenses((prev) => [newExp, ...prev]);
    recordAuditLog(
      'DECAISSEMENT',
      `Décaissement : ${newExp.title} (${newExp.category}) — Bénéficiaire : ${newExp.beneficiary}`,
      newExp.amount
    );
  };

  // Handlers for discussion
  const handleSendMessage = (msg: DiscussionMessage) => {
    setMessages((prev) => [msg, ...prev]);
  };

  const handleVotePoll = (messageId: string, optionId: string, voterId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.poll) return msg;

        const updatedOptions = msg.poll.options.map((opt) => {
          const filteredVotes = opt.votes.filter((id) => id !== voterId);
          if (opt.id === optionId) {
            filteredVotes.push(voterId);
          }
          return {
            ...opt,
            votes: filteredVotes
          };
        });

        return {
          ...msg,
          poll: {
            ...msg.poll,
            options: updatedOptions
          }
        };
      })
    );
  };

  const handleToggleReaction = (messageId: string, emoji: string, memberName: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || {};
        const voters = currentReactions[emoji] || [];
        const exists = voters.includes(memberName);

        const newVoters = exists
          ? voters.filter((n) => n !== memberName)
          : [...voters, memberName];

        return {
          ...msg,
          reactions: {
            ...currentReactions,
            [emoji]: newVoters
          }
        };
      })
    );
  };

  // Reset to initial demo data
  const handleResetData = () => {
    setConfig(initialConfig);
    setMembers(initialMembers);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setMessages(initialMessages);
    setActiveMember(initialMembers[1]); // Moussa Diop
    localStorage.clear();
  };

  // Login handlers
  const handleLoginSuccess = (user: Member) => {
    setActiveMember(user);
    setIsAuthenticated(true);
  };

  const handleRegisterMember = (newMem: Member) => {
    setMembers((prev) => [...prev, newMem]);
    setActiveMember(newMem);
    setIsAuthenticated(true);
    // Automatically open their new card
    setCardModalMember(newMem);
  };

  // Receipt lookup member
  const receiptMember = activeReceiptPayment
    ? members.find((m) => m.id === activeReceiptPayment.memberId)
    : undefined;

  // Render Login page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage
        members={members}
        config={config}
        onLoginSuccess={handleLoginSuccess}
        onRegisterMember={handleRegisterMember}
        onBypassGuest={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeMember={activeMember}
        members={members}
        onSelectMember={setActiveMember}
        onOpenNewPayment={() => handleOpenPaymentModal()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMyCard={() => setCardModalMember(activeMember)}
        onLogout={() => setIsAuthenticated(false)}
        config={config}
        totalCollectedMonth={totalCollectedMonth}
        unpaidCount={unpaidCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            members={members}
            payments={payments}
            expenses={expenses}
            config={config}
            activeMember={activeMember}
            currentMonth={currentMonth}
            currentYear={selectedYear}
            onOpenNewPayment={() => handleOpenPaymentModal()}
            onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            onShowReceipt={(p) => setActiveReceiptPayment(p)}
            onGoToReminders={() => setCurrentTab('reminders')}
            onGoToMembers={() => setCurrentTab('members')}
          />
        )}

        {currentTab === 'matrix' && (
          <ContributionsMatrix
            members={members}
            payments={payments}
            config={config}
            activeMember={activeMember}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            currentMonth={currentMonth}
            onOpenPaymentForMemberMonth={(mId, mNum, yr) => handleOpenPaymentModal(mId, mNum, yr)}
            onShowReceipt={(p) => setActiveReceiptPayment(p)}
            onGoToReminders={() => setCurrentTab('reminders')}
          />
        )}

        {currentTab === 'members' && (
          <MembersList
            members={members}
            payments={payments}
            config={config}
            currentMonth={currentMonth}
            currentYear={selectedYear}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onOpenPaymentForMember={(mId) => handleOpenPaymentModal(mId)}
            onShowReceipt={(p) => setActiveReceiptPayment(p)}
            onGenerateCard={(m) => setCardModalMember(m)}
          />
        )}

        {currentTab === 'history' && (
          <PaymentHistory
            payments={payments}
            members={members}
            config={config}
            onShowReceipt={(p) => setActiveReceiptPayment(p)}
            onDeletePayment={handleDeletePayment}
            onOpenNewPayment={() => handleOpenPaymentModal()}
          />
        )}

        {currentTab === 'reminders' && (
          <RemindersCenter
            members={members}
            payments={payments}
            config={config}
            currentMonth={currentMonth}
            currentYear={selectedYear}
            onOpenNewPayment={(mId) => handleOpenPaymentModal(mId)}
          />
        )}

        {currentTab === 'discussion' && (
          <DiscussionPanel
            messages={messages}
            activeMember={activeMember}
            config={config}
            onSendMessage={handleSendMessage}
            onVotePoll={handleVotePoll}
            onToggleReaction={handleToggleReaction}
          />
        )}
      </main>

      {/* Floating Action Quick Button on Mobile */}
      <div className="fixed bottom-5 right-5 sm:hidden z-30">
        <button
          onClick={() => handleOpenPaymentModal()}
          className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-xl flex items-center justify-center font-bold text-xl hover:scale-105 active:scale-95 transition-transform"
          title="Encaisser un paiement"
        >
          +
        </button>
      </div>

      {/* Modals */}
      <NewPaymentModal
        isOpen={isNewPaymentOpen}
        onClose={() => setIsNewPaymentOpen(false)}
        members={members}
        existingPayments={payments}
        onSavePayment={handleSavePayment}
        defaultMemberId={paymentPresetMemberId}
        defaultMonth={paymentPresetMonth}
        defaultYear={paymentPresetYear}
        config={config}
        currentRecorder={`${activeMember.firstName} ${activeMember.lastName}`}
        onShowReceipt={(p) => setActiveReceiptPayment(p)}
      />

      <ReceiptModal
        payment={activeReceiptPayment}
        member={receiptMember}
        config={config}
        onClose={() => setActiveReceiptPayment(null)}
      />

      <NewExpenseModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        onSaveExpense={handleSaveExpense}
        currentRecorder={`${activeMember.firstName} ${activeMember.lastName}`}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={setConfig}
        onResetData={handleResetData}
        onExportBackup={handleExportBackup}
        auditLogs={auditLogs}
      />

      {/* Member Card Generation Modal */}
      <MemberCardModal
        member={cardModalMember}
        config={config}
        onClose={() => setCardModalMember(null)}
      />
    </div>
  );
}
