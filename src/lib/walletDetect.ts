import type { Eip1193Provider } from 'ethers';

interface Eip6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo;
  provider: Eip1193Provider;
}

/**
 * Modern wallets (MetaMask, Rabby, Coinbase Wallet, dll) sering ter-install
 * bersamaan di browser yang sama. Kalau lebih dari satu wallet extension
 * aktif, mereka bisa saling menimpa `window.ethereum` sehingga deteksi
 * `!!window.ethereum` saja tidak reliable.
 *
 * EIP-6963 (https://eips.ethereum.org/EIPS/eip-6963) adalah standar resmi
 * untuk "multi wallet discovery": setiap wallet mem-broadcast dirinya lewat
 * event `eip6963:announceProvider`, dan dApp bisa minta semua wallet yang
 * aktif mengumumkan diri lewat `eip6963:requestProvider`.
 */
function discoverEip6963Providers(timeoutMs = 250): Promise<Eip6963ProviderDetail[]> {
  return new Promise((resolve) => {
    const found: Eip6963ProviderDetail[] = [];

    const onAnnounce = (event: Event) => {
      const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
      if (detail && !found.some((f) => f.info.uuid === detail.info.uuid)) {
        found.push(detail);
      }
    };

    window.addEventListener('eip6963:announceProvider', onAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce);
      resolve(found);
    }, timeoutMs);
  });
}

function isRunningInsideIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin iframe access melempar error — berarti memang di iframe.
    return true;
  }
}

/**
 * Cari provider EVM yang bisa dipakai (prioritas: MetaMask via EIP-6963,
 * lalu wallet EIP-6963 lain, lalu `window.ethereum.providers[]` — pola lama
 * dari beberapa wallet — lalu `window.ethereum` polos sebagai fallback
 * terakhir).
 *
 * Retry singkat disertakan karena beberapa extension menyuntikkan
 * `window.ethereum` sedikit *setelah* skrip halaman jalan pertama kali.
 */
export async function detectWalletProvider(): Promise<Eip1193Provider> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const providers = await discoverEip6963Providers();

    if (providers.length > 0) {
      const metamask = providers.find((p) =>
        p.info.rdns?.toLowerCase().includes('io.metamask'),
      );
      if (metamask) return metamask.provider;
      return providers[0].provider;
    }

    const injected = window.ethereum as
      | (Eip1193Provider & { providers?: Eip1193Provider[] })
      | undefined;

    if (injected?.providers?.length) {
      const metamask = injected.providers.find(
        (p) => (p as { isMetaMask?: boolean }).isMetaMask,
      );
      return metamask ?? injected.providers[0];
    }

    if (injected) return injected;

    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  if (isRunningInsideIframe()) {
    throw new Error(
      'MetaMask memblokir koneksi dari dalam preview/iframe (langkah keamanan anti-phishing bawaan MetaMask). Buka aplikasi ini di tab browser penuh (bukan di jendela preview), lalu coba connect lagi.',
    );
  }

  throw new Error(
    'MetaMask (atau wallet EVM lain) tidak terdeteksi. Pastikan extension-nya sudah terinstall dan aktif di browser ini, lalu refresh halaman.',
  );
}