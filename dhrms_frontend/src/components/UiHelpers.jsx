export const StatusBadge = ({ status }) => {
  const normalized = `${status || ""}`.toLowerCase();
  const variants = {
    active: "status-badge status-active",
    inactive: "status-badge status-inactive",
    suspended: "status-badge status-suspended",
    pending: "status-badge status-pending",
  };

  return (
    <span className={variants[normalized] || "status-badge"}>
      {status || "Unknown"}
    </span>
  );
};

export const EmptyState = ({ title, message }) => (
  <div className="empty-state-card">
    <p className="empty-state-title">{title}</p>
    <p>{message}</p>
  </div>
);
