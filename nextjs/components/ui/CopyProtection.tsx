'use client';

import { useEffect } from 'react';
import './copy-protection.css';

/* ------------------------------------------------------------------ */
/*  Anti-copy / anti-inspect shield                                    */
/*  — блокирует контекстное меню, горячие клавиши, drag, print, copy  */
/*  — НЕ мешает работе форм (input / textarea / contentEditable)      */
/* ------------------------------------------------------------------ */

const isFormEl = (el: HTMLElement) =>
  el.tagName === 'INPUT' ||
  el.tagName === 'TEXTAREA' ||
  el.isContentEditable;

export function CopyProtection() {
  useEffect(() => {
    /* ---- right-click ---- */
    const onCtx = (e: MouseEvent) => e.preventDefault();

    /* ---- keyboard shortcuts ---- */
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      // F12
      if (e.key === 'F12') { e.preventDefault(); return; }

      // Ctrl+U  view-source
      // Ctrl+S  save page
      // Ctrl+P  print
      if (ctrl && !e.shiftKey && ['u', 's', 'p'].includes(k)) {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I  devtools
      // Ctrl+Shift+J  console
      // Ctrl+Shift+C  inspect element
      if (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(k)) {
        e.preventDefault();
        return;
      }

      // Ctrl+C  copy  (allow in form fields)
      if (ctrl && k === 'c' && !isFormEl(e.target as HTMLElement)) {
        e.preventDefault();
        return;
      }

      // Ctrl+A  select-all  (allow in form fields)
      if (ctrl && k === 'a' && !isFormEl(e.target as HTMLElement)) {
        e.preventDefault();
        return;
      }
    };

    /* ---- image drag ---- */
    const onDrag = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') e.preventDefault();
    };

    /* ---- copy event ---- */
    const onCopy = (e: ClipboardEvent) => {
      if (!isFormEl(e.target as HTMLElement)) e.preventDefault();
    };

    /* ---- selectstart ---- */
    const onSelect = (e: Event) => {
      if (!isFormEl(e.target as HTMLElement)) e.preventDefault();
    };

    /* ---- print blocking ---- */
    const onBeforePrint = () => {
      document.body.style.visibility = 'hidden';
    };
    const onAfterPrint = () => {
      document.body.style.visibility = '';
    };

    /* ---- console warning (prod only) ---- */
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.log('%c⛔ Стоп!', 'color:red;font-size:48px;font-weight:bold');
      // eslint-disable-next-line no-console
      console.log(
        '%cЭто инструмент разработчика. Содержимое сайта защищено авторским правом. etis.kz',
        'font-size:14px;color:#888',
      );
    }

    /* ---- mount ---- */
    document.addEventListener('contextmenu', onCtx);
    document.addEventListener('keydown', onKey, true);   // capture phase
    document.addEventListener('dragstart', onDrag);
    document.addEventListener('copy', onCopy);
    document.addEventListener('selectstart', onSelect);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    return () => {
      document.removeEventListener('contextmenu', onCtx);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('dragstart', onDrag);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('selectstart', onSelect);
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  return null;
}
