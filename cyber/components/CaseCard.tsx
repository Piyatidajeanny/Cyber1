type Props = {
  title: string;
  subtitle: string;
  href: string;
  status?: "LOCKED" | "OPEN" | "DONE";
  tag?: string;
};

export default function CaseCard({ title, subtitle, href, status = "OPEN", tag }: Props) {
  const badge =
    status === "DONE"
      ? <span className="badge badgeOk">✅ DONE</span>
      : status === "LOCKED"
        ? <span className="badge badgeLocked">🔒 LOCKED</span>
        : <span className="badge">📂 OPEN</span>;

  return (
    <a
      className="card"
      href={href}
      style={{
        textDecoration: 'none',
        opacity: status === "LOCKED" ? 0.7 : 1,
        pointerEvents: status === "LOCKED" ? "none" : "auto",
        filter: status === "LOCKED" ? "grayscale(1)" : "none"
      }}
    >
      <div className="cardTop">
        <div>
          {tag && <span className="badge" style={{ fontSize: 11, marginBottom: 8, display: 'inline-block' }}>{tag}</span>}
          <h3 style={{ marginTop: 4 }}>{title}</h3>
        </div>
        <div>{badge}</div>
      </div>
      <p style={{ minHeight: 48 }}>{subtitle}</p>

      <div style={{
        marginTop: 20,
        paddingTop: 16,
        borderTop: "1px solid var(--border)",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: "var(--accent)",
        fontWeight: 600,
        fontSize: 14
      }}>
        <span>{status === "LOCKED" ? "Requires previous case" : "Access File"}</span>
        <span>→</span>
      </div>
    </a>
  );
}
