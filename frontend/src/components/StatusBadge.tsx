import type { BookingStatus, MealStatus, PaymentStatus } from "@/lib/types";

const LABELS: Record<string, string> = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  ready_for_pickup: "Ready for Pickup",
  completed:        "Completed",
  cancelled:        "Cancelled",
  uploaded:         "Slip Uploaded",
  verified:         "Verified",
  rejected:         "Rejected",
  available:        "Available",
  sold_out:         "Sold Out",
  draft:            "Draft",
  expired:          "Expired",
};

interface Props {
  status: BookingStatus | PaymentStatus | MealStatus;
  showDot?: boolean;
}

export default function StatusBadge({ status, showDot = false }: Props) {
  const label = LABELS[status] ?? status;

  return (
    <span className={`badge badge-${status}`}>
      {label}
    </span>
  );
}
