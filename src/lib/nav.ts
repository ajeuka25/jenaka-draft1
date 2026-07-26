import {
  LayoutDashboard,
  ScanSearch,
  MessageSquareWarning,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

export type ViewKey = 'dashboard' | 'audit' | 'mbg' | 'reports';

export interface NavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'audit', label: 'AI Audit LPJ', icon: ScanSearch },
  { key: 'mbg', label: 'Audit MBG Vision', icon: Utensils },
  { key: 'reports', label: 'Laporan MBG & Warga', icon: MessageSquareWarning },
];
