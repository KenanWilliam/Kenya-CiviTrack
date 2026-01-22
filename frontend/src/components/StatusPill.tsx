export default function StatusPill({ status }: { status: string }) {
  const s = (status || "").toUpperCase();

  let cls = "pill";
  if (s === "PLANNED") cls += " pillPlanned";
  else if (s === "ONGOING") cls += " pillOngoing";
  else if (s === "COMPLETED") cls += " pillCompleted";
  else if (s === "STALLED") cls += " pillStalled";

  return <span className={cls}>{s || "UNKNOWN"}</span>;
}
