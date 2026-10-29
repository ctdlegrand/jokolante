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
  AssociationConfig 
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

const STORAGE_KEYS = {
  CONFIG: 'jookolante_config_v1',
  MEMBERS: 'jookolante_members_v1',
  PAYMENTS: 'jookolante_payments_v1',
  EXPENSES: 'jookolante_expenses_v1',
  MESSAGES: 'jookolante_messages_v1'
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

  // Current active logged in / simulated user
  const [activeMember, setActiveMember] = useState<Member>(() => {
    // Default to the Treasurer (Moussa Diop) or first member
    const treasurer = members.find((m) => m.role === 'Trésorier(ère)');
    return treasurer || members[0] || initialMembers[0];
  });

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
  };

  const handleDeletePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  };

  const handleOpenPaymentModal = (memberId?: string, month?: number, year?: number) => {
    setPaymentPresetMemberId(memberId);
    setPaymentPresetMonth(month || currentMonth);
    setPaymentPresetYear(year || selectedYear);
    setIsNewPaymentOpen(true);
  };

  // Handlers for members
  const handleAddMember = (newMem: Member) => {
    setMembers((prev) => [...prev, newMem]);
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
          // Remove voter from other options in this poll
          const filteredVotes = opt.votes.filter((id) => id !== voterId);
          // If this is the chosen option, add voter
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

  // Receipt lookup member
  const receiptMember = activeReceiptPayment
    ? members.find((m) => m.id === activeReceiptPayment.memberId)
    : undefined;

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
      />
    </div>
  );
}
