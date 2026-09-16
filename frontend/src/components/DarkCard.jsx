export default function DarkCard({ children, className = '' }) {
  return <section className={`panel ${className}`}>{children}</section>;
}
