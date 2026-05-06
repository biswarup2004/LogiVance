export function EmptyState({ title = "No data", message = "Nothing to show right now." }) {
  return (
    <div className="state-card">
      <h3 className="state-title">{title}</h3>
      <p className="state-message">{message}</p>
    </div>
  );
}
