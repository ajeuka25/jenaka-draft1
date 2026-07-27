import {
  ExternalLink,
  Link2,
  Copy,
  Check,
  FileJson,
  ArrowUpRight,
} from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  type TxDetails,
  type IpfsMetadata,
  shortenHash,
  IPFS_GATEWAY,
  BLOCK_EXPLORER,
} from '@/lib/web3';

interface TxModalProps {
  open: boolean;
  onClose: () => void;
  tx: TxDetails | null;
  metadata: IpfsMetadata | null;
  showIpfs?: boolean;
}

export function TxModal({
  open,
  onClose,
  tx,
  metadata,
  showIpfs = true,
}: TxModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!tx) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Transaction Details"
      subtitle={`${tx.network}`}
      icon={
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-web3/10 text-web3 ring-1 ring-web3/30">
          <Link2 size={20} />
        </span>
      }
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Status banner */}
        <div className="flex items-center gap-2 rounded-xl border border-neon/20 bg-neon/10 px-4 py-3">
          <Check size={18} className="text-neon" />
          <span className="text-sm font-semibold text-neon">
            Transaction Confirmed — Evidence Anchored On-Chain
          </span>
        </div>

        {/* Tx details */}
        <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/5 p-4">
          <DetailRow
            label="Transaction Hash"
            value={shortenHash(tx.txHash)}
            mono
            onCopy={() => copy(tx.txHash, 'tx')}
            copied={copied === 'tx'}
          />
          <DetailRow label="Block Number" value={`#${tx.blockNumber.toLocaleString()}`} mono />
          <DetailRow label="Gas Used" value={`${tx.gasUsed} units`} />
          <DetailRow label="Gas Price" value={tx.gasPrice} />
          <DetailRow
            label="Contract"
            value={shortenHash(tx.contractAddress)}
            mono
            onCopy={() => copy(tx.contractAddress, 'contract')}
            copied={copied === 'contract'}
          />
          <DetailRow
            label="From"
            value={shortenHash(tx.from)}
            mono
            onCopy={() => copy(tx.from, 'from')}
            copied={copied === 'from'}
          />
          <DetailRow label="Status" value="Success" accent="text-neon" />
        </div>

        {/* IPFS Metadata */}
        {showIpfs && metadata && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileJson size={16} className="text-zk" />
              <h4 className="text-sm font-semibold text-white">
                IPFS Metadata Payload (CID: {tx.cid.slice(0, 12)}…)
              </h4>
            </div>
            <div className="overflow-hidden rounded-xl border border-zk/20 bg-ink-900/60">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                <span className="font-mono text-xs text-zk">ipfs://{tx.cid}</span>
                <button
                  onClick={() => copy(`ipfs://${tx.cid}`, 'cid')}
                  className="rounded p-1 text-slate-400 transition hover:text-white"
                >
                  {copied === 'cid' ? <Check size={12} className="text-neon" /> : <Copy size={12} />}
                </button>
              </div>
              <pre className="max-h-48 overflow-auto p-3 text-[11px] leading-relaxed text-slate-300">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => copy(tx.txHash, 'fulltx')}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
          >
            {copied === 'fulltx' ? <Check size={16} className="text-neon" /> : <Copy size={16} />}
            {copied === 'fulltx' ? 'Copied!' : 'Copy Tx Hash'}
          </button>
          <a
            href={`${BLOCK_EXPLORER}${tx.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-web3 to-cyan-400 px-4 py-3 text-sm font-bold text-ink-900 transition hover:shadow-[0_0_24px_-4px_rgba(6,182,212,0.6)]"
          >
            <ExternalLink size={16} /> View on Block Explorer
          </a>
          {showIpfs && metadata && (
            <a
              href={`${IPFS_GATEWAY}${tx.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zk to-indigo-500 px-4 py-3 text-sm font-bold text-white transition hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.6)] sm:col-span-2"
            >
              <ArrowUpRight size={16} /> View Metadata on IPFS Gateway
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  mono,
  accent,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className={`text-sm font-semibold ${accent ?? 'text-white'} ${mono ? 'font-mono' : ''}`}>
          {value}
        </span>
        {onCopy && (
          <button onClick={onCopy} className="rounded p-0.5 text-slate-500 transition hover:text-white">
            {copied ? <Check size={12} className="text-neon" /> : <Copy size={12} />}
          </button>
        )}
      </span>
    </div>
  );
}
