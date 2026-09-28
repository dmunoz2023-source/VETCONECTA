
interface StatusBadgeProps {
  label: string;
  background: string;
  color: string;
}

export default function StatusBadge({ label, background, color }: StatusBadgeProps) {
  return (
    <span className="vc-badge" style={{ background, color }}>
      {label}
    </span>
  );
}
