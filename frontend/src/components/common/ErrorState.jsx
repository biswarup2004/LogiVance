export function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  actionLabel = "Retry",
  onAction,
}) {
  return (
    <div className="state-card state-card-error" role="alert">
      <h3 className="state-title">{title}</h3>
      <p className="state-message">{message}</p>
      {onAction ? (
        <button className="btn btn-secondary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
