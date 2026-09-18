export function IconeModalidade({ icon, className = "" }) {
  if (typeof icon === "string" && icon.startsWith("/")) {
    return <img src={icon} alt="" className={`inline-block object-contain ${className}`} />;
  }
  return <span className={className}>{icon}</span>;
}