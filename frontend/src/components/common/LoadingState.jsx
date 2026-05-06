export function LoadingState({ title = "Loading...", message = "Please wait a moment." }) {
  return (
    <div className="state-card" role="status" aria-live="polite">
      <h3 className="state-title">{title}</h3>
      <p className="state-message">{message}</p>
    </div>
  );
}
