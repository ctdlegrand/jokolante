import React, { useState } from 'react';
import { Member, DiscussionMessage, AssociationConfig } from '../types';
import { formatDate, playSuccessChime } from '../utils/formatters';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Vote, 
  Pin, 
  Flame, 
  ShieldCheck, 
  HeartHandshake, 
  Calendar, 
  Smile, 
  Search,
  CheckCircle2,
  Users
} from 'lucide-react';

interface DiscussionPanelProps {
  messages: DiscussionMessage[];
  activeMember: Member;
  config: AssociationConfig;
  onSendMessage: (msg: DiscussionMessage) => void;
  onVotePoll: (messageId: string, optionId: string, memberId: string) => void;
  onToggleReaction: (messageId: string, emoji: string, memberName: string) => void;
}

export const DiscussionPanel: React.FC<DiscussionPanelProps> = ({
  messages,
  activeMember,
  config,
  onSendMessage,
  onVotePoll,
  onToggleReaction
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'general' | 'bureau' | 'urgences' | 'reunions'>('all');
  const [newMessageText, setNewMessageText] = useState('');
  const [isOfficialAnnouncement, setIsOfficialAnnouncement] = useState(false);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [searchTerm, setSearchTerm] = useState('');

  const canPostOfficial =
    activeMember.role === 'Président(e)' ||
    activeMember.role === 'Trésorier(ère)' ||
    activeMember.role === 'Secrétaire Général(e)';

  const handleAddOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`]);
    }
  };

  const handleOptionChange = (idx: number, text: string) => {
    const updated = [...pollOptions];
    updated[idx] = text;
    setPollOptions(updated);
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() && !pollQuestion.trim()) return;

    let pollData = undefined;
    if (isCreatingPoll && pollQuestion.trim()) {
      pollData = {
        id: `poll-${Date.now()}`,
        question: pollQuestion.trim(),
        closed: false,
        options: pollOptions
          .filter((opt) => opt.trim().length > 0)
          .map((opt, i) => ({
            id: `opt-${i + 1}`,
            text: opt.trim(),
            votes: []
          }))
      };
    }

    const newMsg: DiscussionMessage = {
      id: `msg-${Date.now()}`,
      authorId: activeMember.id,
      authorName: `${activeMember.firstName} ${activeMember.lastName}`,
      authorRole: activeMember.role,
      authorAvatar: activeMember.avatar,
      timestamp: new Date().toISOString(),
      channel: selectedChannel === 'all' ? 'general' : selectedChannel,
      content: newMessageText.trim(),
      isOfficial: isOfficialAnnouncement && canPostOfficial,
      poll: pollData,
      reactions: {}
    };

    playSuccessChime();
    onSendMessage(newMsg);
    setNewMessageText('');
    setIsOfficialAnnouncement(false);
    setIsCreatingPoll(false);
    setPollQuestion('');
    setPollOptions(['Option 1', 'Option 2']);
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (selectedChannel !== 'all' && m.channel !== selectedChannel) return false;
    if (searchTerm.trim()) {
      const matchContent = m.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAuthor = m.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPoll = m.poll?.question.toLowerCase().includes(searchTerm.toLowerCase());
      return matchContent || matchAuthor || matchPoll;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-emerald-600 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Salon de Discussion & Panel des Membres
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Espace d'échange fraternel, annonces officielles du bureau, votes et entraide associative
          </p>
        </div>

        {/* Current Poster identity indicator */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <img
            src={activeMember.avatar}
            alt=""
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-slate-500">Poste en tant que :</span>
          <span className="font-bold text-slate-900">{activeMember.firstName} ({activeMember.role})</span>
        </div>
      </div>

      {/* Channels Tab Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedChannel('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors font-medium ${
              selectedChannel === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tous les flux
          </button>
          <button
            onClick={() => setSelectedChannel('general')}
            className={`px-3 py-1.5 rounded-xl transition-colors font-medium flex items-center gap-1.5 ${
              selectedChannel === 'general'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            💬 Salon Général
          </button>
          <button
            onClick={() => setSelectedChannel('bureau')}
            className={`px-3 py-1.5 rounded-xl transition-colors font-medium flex items-center gap-1.5 ${
              selectedChannel === 'bureau'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📢 Annonces Bureau
          </button>
          <button
            onClick={() => setSelectedChannel('urgences')}
            className={`px-3 py-1.5 rounded-xl transition-colors font-medium flex items-center gap-1.5 ${
              selectedChannel === 'urgences'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🤝 Caisse Secours & Entraide
          </button>
          <button
            onClick={() => setSelectedChannel('reunions')}
            className={`px-3 py-1.5 rounded-xl transition-colors font-medium flex items-center gap-1.5 ${
              selectedChannel === 'reunions'
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📅 Réunions & Sondages
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une discussion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Post Composition Box */}
      <form
        onSubmit={handlePostMessage}
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
      >
        <div className="flex items-start gap-3">
          <img
            src={activeMember.avatar}
            alt=""
            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
          />
          <div className="flex-1 space-y-2">
            <textarea
              rows={3}
              placeholder={`Partagez une nouvelle, un mot d'encouragement ou une question avec l'association...`}
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />

            {/* Poll Creation Sub-form */}
            {isCreatingPoll && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Vote className="w-3.5 h-3.5 text-emerald-600" />
                    Créer un Sondage / Vote Associatif
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingPoll(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    Annuler
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Question du sondage (ex: Lieu de la réunion, Approbation d'une aide...)"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <div className="space-y-1.5 pt-1">
                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Choix ${i + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  ))}
                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-[11px] text-emerald-700 font-semibold hover:underline"
                    >
                      + Ajouter un choix
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar & Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            {canPostOfficial && (
              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOfficialAnnouncement}
                  onChange={(e) => setIsOfficialAnnouncement(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-amber-800">
                  📢 Annonce Officielle du Bureau
                </span>
              </label>
            )}

            <button
              type="button"
              onClick={() => setIsCreatingPoll(!isCreatingPoll)}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
            >
              <Vote className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isCreatingPoll ? 'Masquer sondage' : 'Ajouter un sondage'}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessageText.trim() && !pollQuestion.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Publier dans le salon
          </button>
        </div>
      </form>

      {/* Messages Feed */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Aucun message dans ce canal.</p>
            <p className="text-xs text-slate-400 mt-1">Soyez le premier à lancer la discussion !</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const hasVotedPoll = msg.poll?.options.some((opt) =>
              opt.votes.includes(activeMember.id)
            );
            const totalVotes =
              msg.poll?.options.reduce((sum, opt) => sum + opt.votes.length, 0) || 0;

            return (
              <div
                key={msg.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                  msg.isOfficial
                    ? 'border-amber-300/80 bg-gradient-to-b from-amber-50/30 to-white'
                    : 'border-slate-200'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={msg.authorAvatar}
                      alt={msg.authorName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {msg.authorName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {msg.authorRole}
                        </span>
                        {msg.isOfficial && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-700" />
                            Bureau Officiel
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(msg.timestamp, true)} · Canal : {msg.channel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {msg.content}
                </p>

                {/* Poll Section if present */}
                {msg.poll && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Vote className="w-4 h-4 text-emerald-600" />
                        {msg.poll.question}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {totalVotes} vote{totalVotes > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {msg.poll.options.map((opt) => {
                        const isSelectedByActive = opt.votes.includes(activeMember.id);
                        const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onVotePoll(msg.id, opt.id, activeMember.id)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all relative overflow-hidden flex items-center justify-between ${
                              isSelectedByActive
                                ? 'border-emerald-500 bg-emerald-50/70 font-semibold text-emerald-950'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            {/* Vote background bar */}
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-emerald-100/50 -z-0 pointer-events-none transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            ></div>

                            <span className="relative z-10 flex items-center gap-2">
                              {isSelectedByActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                              {opt.text}
                            </span>

                            <span className="relative z-10 text-[11px] font-bold text-slate-600">
                              {opt.votes.length} ({pct}%)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reactions & Interaction bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['👍', '❤️', '🤲', '👏', '💡'].map((emoji) => {
                      const count = msg.reactions[emoji]?.length || 0;
                      const hasReacted = msg.reactions[emoji]?.includes(
                        `${activeMember.firstName} ${activeMember.lastName}`
                      );

                      return (
                        <button
                          key={emoji}
                          onClick={() =>
                            onToggleReaction(
                              msg.id,
                              emoji,
                              `${activeMember.firstName} ${activeMember.lastName}`
                            )
                          }
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs transition-colors ${
                            hasReacted
                              ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Communauté Jookolante
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
