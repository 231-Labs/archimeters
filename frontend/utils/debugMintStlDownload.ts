/**
 * Mint sculpt debug: trigger browser downloads of STL bytes before/after Seal.
 * Enable with NEXT_PUBLIC_DEBUG_STL_MINT_DOWNLOAD=true (files land in the OS Downloads folder).
 */
export function isMintDebugStlDownloadEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEBUG_STL_MINT_DOWNLOAD === 'true';
}

export function triggerMintDebugStlDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
