'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  const el = document.documentElement;
  const mo = new MutationObserver(onStoreChange);
  mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
  return () => mo.disconnect();
}

function getSnapshot(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function getServerSnapshot(): 'light' | 'dark' {
  return 'dark';
}

/** Syncs with `html[data-theme]` (ThemeToggle + layout script). */
export function useDataTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
