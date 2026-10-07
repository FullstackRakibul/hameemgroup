/** Single dark status pill above the composer; the parent owns the 2.5 s auto-hide. */
export default function Toast({ message }: { message: string | null }) {
  return (
    <div className="hm-assist-toast-region" role="status" aria-live="polite">
      {message && <p className="hm-assist-toast">{message}</p>}
    </div>
  );
}
