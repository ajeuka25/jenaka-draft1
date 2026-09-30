/**
 * Membungkus sebuah promise dengan batas waktu. Kalau promise-nya tidak
 * selesai dalam `timeoutMs`, langsung kembalikan `fallback` alih-alih
 * menggantung selamanya menunggu jaringan (mis. RPC publik atau Supabase
 * yang lambat/tidak terjangkau dari sandbox tertentu).
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T,
  onTimeout?: () => void,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      onTimeout?.();
      resolve(fallback);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}