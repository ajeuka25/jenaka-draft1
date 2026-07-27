import {
  LayoutDashboard,
  ScanSearch,
  MessageSquareWarning,
  Utensils,
  Map,
  Vote,
  type LucideIcon,
} from 'lucide-react';

export type ViewKey =
  | 'dashboard'
  | 'audit'
  | 'mbg'
  | 'reports'
  | 'map'
  | 'dao';

export interface NavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'audit', label: 'AI Audit LPJ', icon: ScanSearch },
  { key: 'mbg', label: 'Audit MBG Vision', icon: Utensils },
  { key: 'map', label: 'Peta Risiko Spasial', icon: Map },
  { key: 'reports', label: 'Laporan Warga', icon: MessageSquareWarning },
  { key: 'dao', label: 'DAO Oversight', icon: Vote },
];
