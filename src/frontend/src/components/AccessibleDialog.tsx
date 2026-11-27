import React, { useEffect, useRef } from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & { label: string; onDismiss: () => void };

/** Keep keyboard focus in a modal and restore its trigger on dismissal. */
export function AccessibleDialog({ label, onDismiss, children, ...props }: Props) {
  const element = useRef<HTMLDivElement>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = element.current;
    if (!dialog) return;
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
    )).filter(node => node.getClientRects().length > 0);
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
    return () => { dialog.removeEventListener('keydown', handle); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <div {...props} ref={element} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>{children}</div>;
}
