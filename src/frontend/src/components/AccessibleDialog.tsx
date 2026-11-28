import React, { useEffect, useRef } from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & { label: string; onDismiss: () => void; errorMessage?: string | null };

/** Keep keyboard focus in a modal and restore its trigger on dismissal. */
export function AccessibleDialog({ label, onDismiss, errorMessage, children, ...props }: Props) {
  const element = useRef<HTMLDivElement>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = element.current;
    if (!dialog) return;
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
    )).filter(node => node.tabIndex >= 0 && node.getClientRects().length > 0);
    // Keep background controls out of keyboard and accessibility navigation.
    const background: { node: HTMLElement; inert: boolean }[] = [];
    let branch: HTMLElement = dialog;
    while (branch.parentElement) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          background.push({ node: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }
    (controls()[0] || dialog).focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); dismiss.current();
      } else if (event.key === 'Tab') {
        const items = controls();
        if (!items.length) { event.preventDefault(); dialog.focus(); return; }
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
          event.preventDefault(); first.focus();
        }
      }
    };
    dialog.addEventListener('keydown', handle);
    return () => {
      dialog.removeEventListener('keydown', handle);
      background.forEach(({ node, inert }) => { node.inert = inert; });
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <div {...props} ref={element} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
    {errorMessage && <p role="alert" style={{ padding:12, color:'#A62824', background:'#FBEAE9', borderRadius:8 }}>{errorMessage}</p>}
    {children}
  </div>;
}
