import { useState } from 'react';
import {
  Vote,
  Coins,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Users,
  Lock,
  Gavel,
  Loader2,
  Flame,
} from 'lucide-react';
import {
  daoProposals,
  STAKING_POOL_STATS,
  type DaoProposal,
} from '@/data/dao';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/context/ToastContext';

export function DaoView() {
  const { state, awardKawal } = useWallet();
  const { push } = useToast();
  const [proposals, setProposals] = useState<DaoProposal[]>(daoProposals);
  const [actioning, setActioning] = useState<string | null>(null);

  const doAction = (id: string, type: 'approve' | 'dispute', amount: number) => {
    if (!state.connected) {
      push('warning', 'Wallet belum terhubung', 'Connect wallet untuk stake token $KAWAL.');
      return;
    }
    setActioning(id);
    setTimeout(() => {
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          if (type === 'approve') {
            const newPool = p.stakePool + amount;
            const newStakers = p.totalStakers + 1;
            const approveWeight = (p.stakePool * (p.approvePct / 100)) + amount;
            const approvePct = (approveWeight / newPool) * 100;
            return {
              ...p,
              stakePool: newPool,
              totalStakers: newStakers,
              approvePct: Math.round(approvePct),
              disputePct: Math.round(100 - approvePct),
            };
          } else {
            const newPool = p.stakePool + amount;
            const newStakers = p.totalStakers + 1;
            const disputeWeight = (p.stakePool * (p.disputePct / 100)) + amount;
            const disputePct = (disputeWeight / newPool) * 100;
            return {
              ...p,
              stakePool: newPool,
              totalStakers: newStakers,
              disputePct: Math.round(disputePct),
              approvePct: Math.round(100 - disputePct),
            };
          }
        }),
      );
      setActioning(null);
      awardKawal(5);
      if (type === 'approve') {
        push('success', 'Stake & Approve Berhasil', `${amount} $KAWAL distake untuk verifikasi. Reward APY ${proposals.find(p => p.id === id)?.apyReward}% aktif.`);
      } else {
        push('warning', 'Dispute Filed', `${amount} $KAWAL distake untuk challenge. Slashing risk aktif jika terbukti fitnah.`);
      }
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-zk/10 px-3 py-1 text-xs font-semibold text-zk ring-1 ring-zk/30">
          <Vote size={13} /> DAO Validator & Anti-Fraud Staking
        </div>
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          DAO Oversight — Validator Consensus
        </h2>
        <p className="text-sm text-slate-400">
          Auditor independen & warga stake token $KAWAL untuk verifikasi laporan.
          Mekanisme slashing untuk anti-hoax & dispute resolution.
        </p>
      </div>

      {/* Staking pool stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PoolStat
          icon={Lock}
          label="Total Staked"
          value={`${STAKING_POOL_STATS.totalStaked.toLocaleString()} $KAWAL`}
          accent="text-zk"
          sub={`$${(STAKING_POOL_STATS.totalStaked * STAKING_POOL_STATS.tokenPrice).toLocaleString()} USD`}
        />
        <PoolStat
          icon={Users}
          label="Active Validators"
          value={STAKING_POOL_STATS.totalValidators.toString()}
          accent="text-web3"
          sub="Validator independen"
        />
        <PoolStat
          icon={TrendingUp}
          label="Average APY"
          value={`${STAKING_POOL_STATS.avgApy}%`}
          accent="text-neon"
          sub="Reward validator"
        />
        <PoolStat
          icon={Flame}
          label="Total Slashed"
          value={`${STAKING_POOL_STATS.totalSlashed.toLocaleString()} $KAWAL`}
          accent="text-danger"
          sub="Penalti fitnah/hoax"
        />
      </div>

      {/* Proposals */}
      <div className="space-y-4">
        {proposals.map((p) => (
          <ProposalCard
            key={p.id}
            proposal={p}
            actioning={actioning === p.id}
            onApprove={() => doAction(p.id, 'approve', 500)}
            onDispute={() => doAction(p.id, 'dispute', 500)}
          />
        ))}
      </div>
    </div>
  );
}

function ProposalCard({
  proposal,
  actioning,
  onApprove,
  onDispute,
}: {
  proposal: DaoProposal;
  actioning: boolean;
  onApprove: () => void;
  onDispute: () => void;
}) {
  const statusBadge = {
    active: 'bg-web3/15 text-web3 ring-web3/30',
    passed: 'bg-neon/15 text-neon ring-neon/30',
    disputed: 'bg-danger/15 text-danger ring-danger/30',
    resolved: 'bg-slate-400/15 text-slate-300 ring-slate-400/30',
  }[proposal.status];

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Left: info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-500">{proposal.id}</span>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${statusBadge}`}>
              {proposal.status}
            </span>
            <span className="text-xs text-slate-500">· {proposal.deadline}</span>
          </div>
          <h3 className="mt-2 font-display text-base font-semibold text-white">
            {proposal.title}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{proposal.description}</p>

          {/* Stats row */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat icon={Coins} label="Stake Pool" value={`${proposal.stakePool.toLocaleString()}`} sub="KAWAL" />
            <MiniStat icon={Users} label="Stakers" value={proposal.totalStakers.toString()} />
            <MiniStat icon={TrendingUp} label="APY" value={`${proposal.apyReward}%`} accent="text-neon" />
            <MiniStat icon={ShieldAlert} label="Slash Risk" value={`${proposal.slashingRisk}%`} accent="text-danger" />
          </div>
        </div>

        {/* Right: voting + actions */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white">
              <Vote size={14} className="text-zk" /> Voting Consensus
            </p>
            {/* Progress bar */}
            <div className="relative h-3 overflow-hidden rounded-full bg-danger/20">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-neon to-emerald-500 transition-all duration-700"
                style={{ width: `${proposal.approvePct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-neon">
                <CheckCircle2 size={12} /> {proposal.approvePct}% Setuju
              </span>
              <span className="flex items-center gap-1 font-semibold text-danger">
                {proposal.disputePct}% Sanggah <XCircle size={12} />
              </span>
            </div>

            {/* Actions */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={onApprove}
                disabled={actioning}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-neon/10 px-3 py-2.5 text-xs font-bold text-neon ring-1 ring-neon/30 transition hover:bg-neon/20 disabled:opacity-60"
              >
                {actioning ? <Loader2 size={14} className="animate-spin-slow" /> : <CheckCircle2 size={14} />}
                Stake & Approve
              </button>
              <button
                onClick={onDispute}
                disabled={actioning}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-danger/10 px-3 py-2.5 text-xs font-bold text-danger ring-1 ring-danger/30 transition hover:bg-danger/20 disabled:opacity-60"
              >
                {actioning ? <Loader2 size={14} className="animate-spin-slow" /> : <Gavel size={14} />}
                Dispute & Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PoolStat({
  icon: Icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: typeof Lock;
  label: string;
  value: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className={accent} />
        <span className="text-[11px] uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <p className={`mt-2 font-display text-xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
      <div className="flex items-center gap-1">
        <Icon size={12} className="text-slate-400" />
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className={`mt-0.5 text-sm font-bold ${accent ?? 'text-white'}`}>
        {value}
        {sub && <span className="ml-0.5 text-[10px] text-slate-500">{sub}</span>}
      </p>
    </div>
  );
}
