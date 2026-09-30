interface StatusBadgeProps {
  label: string;
  background?: string;
  color?: string;
  className?: string;
}

export default function StatusBadge({ label, background, color, className = "" }: Readonly<StatusBadgeProps>) {
  return (
    <span className={`vc-badge ${className}`.trim()} style={{ background, color }}>
      {label}
    </span>
  );
}
