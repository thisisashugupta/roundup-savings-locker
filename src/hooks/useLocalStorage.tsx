'use client';

const isServer = typeof window === 'undefined' ? false : true;

export function useLocalStorage() {
  function setInLocalStorage(key: string, value: string) {
    if (isServer) return;
    localStorage.setItem(key, value);
  }

  function getFromLocalStorage(key: string) {
    if (isServer) return '';
    return localStorage.getItem(key);
  }

  function removeFromLocalStorage(key: string) {
    if (isServer) return;
    return localStorage.removeItem(key);
  }

  return { setInLocalStorage, getFromLocalStorage, removeFromLocalStorage };
}
