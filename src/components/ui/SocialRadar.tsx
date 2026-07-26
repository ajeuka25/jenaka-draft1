import { useState } from 'react';
import {
  Radar,
  RefreshCw,
  Loader2,
  Twitter,
  Newspaper,
  Megaphone,
  TrendingUp,
  Link2,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import {
  initialSocialPosts,
  scrapedSocialPosts,
  type SocialPost,
  type SocialSource,
  avatarClass,
  SENTIMENT_STYLE,
  STATUS_STYLE,
  formatReach,
} from '@/data/social';

const SOURCE_ICON: Record<SocialSource, typeof Twitter> = {
  'Twitter/X': Twitter,
  'News Portal': Newspaper,
  TikTok: Megaphone,
  Instagram: Megaphone,
};

export function SocialRadar() {
  const [posts, setPosts] = useState<SocialPost[]>(initialSocialPosts);
  const [scraping, setScraping] = useState(false);
  const [scraped, setScraped] = useState(false);

  const runScraping = () => {
    setScraping(true);
    setTimeout(() => {
      setPosts(scrapedSocialPosts);
      setScraping(false);
      setScraped(true);
    }, 2000);
  };

  const totalReach = posts.reduce((s, p) => s + p.reach, 0);
  const flaggedCount = posts.filter(
    (p) => p.status === 'Auto-Flagged to Audit',
  ).length;

  return (
    <div className="rounded-2xl glass p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Radar size={20} className="text-neon" />
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Social Media &amp; News AI Radar
            </h3>
            <p className="text-xs text-slate-400">
              AI NLP memindai postingan &amp; berita viral yang berkaitan dengan
              proyek anggaran publik.
            </p>
          </div>
        </div>
        <button
          onClick={runScraping}
          disabled={scraping}
          className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10 disabled:opacity-60"
        >
          {scraping ? (
            <Loader2 size={16} className="animate-spin-slow text-neon" />
          ) : (
            <RefreshCw size={16} className="text-neon" />
          )}
          {scraping ? 'Scraping…' : 'Run Manual Scraping Simulation'}
        </button>
      </div>

      {scraping && (
        <div className="mb-4 overflow-hidden rounded-xl border border-neon/30 bg-neon/5 p-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon to-transparent animate-scan" />
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin-slow text-neon" />
            <p className="text-sm text-slate-200">
              AI sedang memindai Twitter, portal berita, TikTok &amp; Instagram
              untuk indikasi anomali anggaran…
            </p>
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          label="Post Terdeteksi"
          value={posts.length.toString()}
          icon={Megaphone}
          accent="text-sky-400"
        />
        <StatTile
          label="Total Jangkauan"
          value={formatReach(totalReach)}
          icon={TrendingUp}
          accent="text-neon"
        />
        <StatTile
          label="Auto-Flagged"
          value={flaggedCount.toString()}
          icon={ShieldAlert}
          accent="text-danger"
        />
      </div>

      <div className="space-y-3">
        {posts.map((post) => {
          const Icon = SOURCE_ICON[post.source];
          return (
            <div
              key={post.id}
              className={`rounded-xl border bg-white/5 p-4 transition animate-fade-in ${
                post.sentiment === 'Sangat Negatif'
                  ? 'border-danger/20'
                  : post.sentiment === 'Indikasi Penggelembungan'
                    ? 'border-amber-400/20'
                    : 'border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ring-1 ${avatarClass(post.source)}`}
                >
                  {post.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <Icon size={14} className="text-slate-400" />
                      {post.handle}
                    </span>
                    <span className="text-xs text-slate-500">· {post.timestamp}</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                      <TrendingUp size={12} /> {formatReach(post.reach)} jangkauan
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                    {post.content}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${SENTIMENT_STYLE[post.sentiment]}`}
                    >
                      Sentimen: {post.sentiment}
                    </span>
                    <span
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${STATUS_STYLE[post.status]}`}
                    >
                      {post.status.startsWith('Linked') ? (
                        <Link2 size={10} />
                      ) : post.status === 'Monitoring' ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <ShieldAlert size={10} />
                      )}
                      {post.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {scraped && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-neon">
          <CheckCircle2 size={12} /> Scraping selesai — feed diperbarui dengan
          postingan terbaru.
        </p>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2">
        <Icon size={15} className={accent} />
        <span className="text-[11px] uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <p className={`mt-1 font-display text-xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
