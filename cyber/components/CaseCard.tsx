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
      ? <span className="badge badgeOk">DONE</span>
      : status === "LOCKED"
        ? <span className="badge badgeLocked">LOCKED</span>
        : <span className="badge">OPEN</span>;

  return (
    <a className="card" href={href}>
      <div className="cardTop">
        <div>
          <h3>{title}</h3>
          {tag ? <div style={{ marginTop: 8 }} className="badge">{tag}</div> : null}
        </div>
        {badge}
      </div>
      <p>{subtitle}</p>
      <p className="mono" style={{ marginTop: 10, color: "rgba(255,255,255,0.55)" }}>
        เปิดแฟ้ม →
      </p>
    </a>
  );
}
