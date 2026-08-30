import { supabase, IS_SUPABASE_CONFIGURED } from '@/lib/supabase';

export interface Profile {
  walletAddress: string;
  loginMethod: 'wallet' | 'social' | 'passkey';
  kawal: number;
  rewards: number;
}

interface ProfileRow {
  wallet_address: string;
  login_method: string;
  kawal: number;
  rewards: number;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    walletAddress: row.wallet_address,
    loginMethod: row.login_method as Profile['loginMethod'],
    kawal: row.kawal,
    rewards: row.rewards,
  };
}

const STARTING_KAWAL = 0;
const STARTING_REWARDS = 0;

/**
 * Loads the profile for a connected wallet address, creating it with a
 * zero balance on first login. This is what makes each connected
 * account "real" — its own row, its own balance, persisted across
 * reconnects — instead of a shared hardcoded dummy balance.
 *
 * If Supabase isn't configured, falls back to a fresh in-memory profile
 * so the wallet connection itself still works (data just won't persist).
 */
export async function getOrCreateProfile(
  address: string,
  method: Profile['loginMethod'],
): Promise<Profile> {
  const walletAddress = address.toLowerCase();

  if (!IS_SUPABASE_CONFIGURED) {
    return {
      walletAddress,
      loginMethod: method,
      kawal: STARTING_KAWAL,
      rewards: STARTING_REWARDS,
    };
  }

  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Gagal memuat profil akun: ${selectError.message}`);
  }

  if (existing) {
    const { error: touchError } = await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString(), login_method: method })
      .eq('wallet_address', walletAddress);
    if (touchError) {
      // Non-fatal — bisa tetap dipakai walau gagal update timestamp login.
      console.warn('[profiles] gagal update last_login_at:', touchError.message);
    }
    return mapProfile(existing as ProfileRow);
  }

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({
      wallet_address: walletAddress,
      login_method: method,
      kawal: STARTING_KAWAL,
      rewards: STARTING_REWARDS,
    })
    .select('*')
    .single();

  if (insertError) {
    throw new Error(`Gagal membuat profil akun: ${insertError.message}`);
  }

  return mapProfile(created as ProfileRow);
}

export async function persistKawal(address: string, kawal: number): Promise<void> {
  if (!IS_SUPABASE_CONFIGURED) return;
  const { error } = await supabase
    .from('profiles')
    .update({ kawal })
    .eq('wallet_address', address.toLowerCase());
  if (error) console.warn('[profiles] gagal menyimpan kawal:', error.message);
}

export async function persistRewards(address: string, rewards: number): Promise<void> {
  if (!IS_SUPABASE_CONFIGURED) return;
  const { error } = await supabase
    .from('profiles')
    .update({ rewards })
    .eq('wallet_address', address.toLowerCase());
  if (error) console.warn('[profiles] gagal menyimpan rewards:', error.message);
}