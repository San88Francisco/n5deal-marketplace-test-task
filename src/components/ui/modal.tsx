"use client";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, label, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-navy-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] rounded-card bg-white p-6 shadow-lift">{children}</div>
    </div>
  );
}
