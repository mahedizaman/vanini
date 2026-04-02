import { HiXMark } from "react-icons/hi2";

export default function Modal({ isOpen, onClose, title, children, wide }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${wide ? "max-w-3xl" : "max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          {title ? <h3 className="font-display text-lg font-bold text-primary">{title}</h3> : <span />}
          <button type="button" className="rounded-md p-2 hover:bg-neutral-100" aria-label="Close" onClick={onClose}>
            <HiXMark className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
