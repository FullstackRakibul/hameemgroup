type ToastProps = {
  message: string | null;
  placement: "panel" | "launcher";
};

/** Single dark status pill; the parent owns the 2.5 s auto-hide. */
export default function Toast({ message, placement }: ToastProps) {
  return (
    <div className={`hm-assist-toast-region hm-assist-toast-region--${placement}`} role="status" aria-live="polite">
      {message && <p className="hm-assist-toast">{message}</p>}
    </div>
  );
}
