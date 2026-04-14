"use client";

import type { Booking } from "@/lib/types";
import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Upload, CheckCircle, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsAPI } from "@/lib/api";
import StatusBadge from "./StatusBadge";
import PaymentModal from "./PaymentModal";
import Link from "next/link";

interface Props {
  booking: Booking;
  isBusinessView?: boolean;
}

export default function BookingCard({ booking, isBusinessView = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["bookings"] });
    qc.invalidateQueries({ queryKey: ["payments"] });
  };

  const confirmReceived = useMutation({
    mutationFn: () => bookingsAPI.confirmReceived(booking.id) as Promise<any>,
    onSuccess: invalidate,
  });

  const confirmPayment = useMutation({
    mutationFn: () => bookingsAPI.confirmPayment(booking.id) as Promise<any>,
    onSuccess: invalidate,
  });

  const markReady = useMutation({
    mutationFn: () => bookingsAPI.markReady(booking.id) as Promise<any>,
    onSuccess: invalidate,
  });

  const finish = useMutation({
    mutationFn: () => bookingsAPI.finish(booking.id) as Promise<any>,
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: () => bookingsAPI.cancel(booking.id) as Promise<any>,
    onSuccess: invalidate,
  });

  const statusFlow = [
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "ready_for_pickup", label: "Ready" },
    { key: "completed", label: "Completed" },
  ];
  const stepIndex = statusFlow.findIndex((s) => s.key === booking.status);

  return (
    <>
      <div
        className="card"
        style={{
          animation: "fadeUp 0.4s ease both",
          padding: 0,
          overflow: "visible",
          background: "var(--surface)",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: expanded ? "1px solid var(--border)" : "none",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Meal image placeholder */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 10,
                background: booking.meal.image
                  ? "transparent"
                  : "linear-gradient(135deg, #7A2E0E 0%, #DE2C00 100%)",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {booking.meal.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={booking.meal.image}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                " No Image"
              )}
            </div>

            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--text-primary)",
                }}
              >
                {booking.meal.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {isBusinessView ? `By ${booking.user_full_name || booking.user_email}` : booking.meal.posted_by_name} ·{" "}
                {format(new Date(booking.created_at), "MMM d, yyyy")}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusBadge status={booking.status} showDot />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 18,
                color: "var(--primary)",
              }}
            >
              ฿{Number(booking.total_price).toFixed(0)}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-ghost"
              style={{ padding: 6 }}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div style={{ padding: "16px 20px 20px", animation: "fadeIn 0.25s ease" }}>
            {/* Progress bar */}
            {booking.status !== "cancelled" && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                  }}
                >
                  {statusFlow.map((step, i) => (
                    <div
                      key={step.key}
                      style={{ display: "flex", alignItems: "center", flex: i < statusFlow.length - 1 ? 1 : undefined }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background:
                            i <= stepIndex ? "var(--primary)" : "var(--cream-dark)",
                          border: `2px solid ${i <= stepIndex ? "var(--primary)" : "var(--border)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.3s",
                        }}
                      >
                        {i < stepIndex && (
                          <CheckCircle size={14} color="white" fill="white" />
                        )}
                        {i === stepIndex && (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "white",
                            }}
                          />
                        )}
                      </div>
                      {i < statusFlow.length - 1 && (
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            background:
                              i < stepIndex ? "var(--primary)" : "var(--border)",
                            transition: "background 0.3s",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {statusFlow.map((step, i) => (
                    <span
                      key={step.key}
                      style={{
                        fontSize: 10,
                        fontWeight: i === stepIndex ? 700 : 500,
                        color: i <= stepIndex ? "var(--primary)" : "var(--text-muted)",
                        flex: i < statusFlow.length - 1 ? 1 : undefined,
                      }}
                    >
                      {step.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ background: "var(--cream)", borderRadius: 10, padding: "10px 14px" }}>
                <div className="section-label" style={{ marginBottom: 2 }}>Quantity</div>
                <div style={{ fontWeight: 700, fontSize: 20, fontFamily: "var(--font-display)" }}>
                  ×{booking.quantity}
                </div>
              </div>
              <div style={{ background: "var(--cream)", borderRadius: 10, padding: "10px 14px" }}>
                <div className="section-label" style={{ marginBottom: 2 }}>Pickup</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {format(new Date(booking.meal.pickup_start), "MMM d, h:mm a")}
                </div>
              </div>
              <div style={{ background: "var(--cream)", borderRadius: 10, padding: "10px 14px" }}>
                <div className="section-label" style={{ marginBottom: 2 }}>Booking #</div>
                <div style={{ fontWeight: 700, fontSize: 20, fontFamily: "var(--font-display)", color: "var(--brown)" }}>
                  {booking.id}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* Student: Upload payment slip */}
              {!isBusinessView && booking.status === "pending" && (
                <button
                  className="btn-primary btn-sm"
                  onClick={() => setShowPayment(true)}
                >
                  <Upload size={14} />
                  Upload Payment Slip
                </button>
              )}

              {/* Student: Confirm received */}
              {!isBusinessView && booking.status === "ready_for_pickup" && (
                <button
                  className="btn-primary btn-sm"
                  onClick={() => confirmReceived.mutate()}
                  disabled={confirmReceived.isPending}
                >
                  <CheckCircle size={14} />
                  {confirmReceived.isPending ? "Confirming…" : "Confirm Received"}
                </button>
              )}

              {/* Business: Confirm payment */}
              {isBusinessView && booking.status === "pending" && (
                <button
                  className="btn-primary btn-sm"
                  onClick={() => confirmPayment.mutate()}
                  disabled={confirmPayment.isPending}
                >
                  <CheckCircle size={14} />
                  Confirm Payment
                </button>
              )}

              {/* Business: Mark ready */}
              {isBusinessView && booking.status === "confirmed" && (
                <button
                  className="btn-primary btn-sm"
                  onClick={() => markReady.mutate()}
                  disabled={markReady.isPending}
                >
                  Mark Ready for Pickup
                </button>
              )}

              {/* Business: Finish */}
              {isBusinessView && booking.status === "completed" && !booking.business_marked_finished && (
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => finish.mutate()}
                  disabled={finish.isPending}
                >
                  <CheckCircle size={14} />
                  Mark Finished
                </button>
              )}

              {/* Cancel */}
              {!["completed", "cancelled"].includes(booking.status) && (
                <button
                  className="btn-ghost btn-sm"
                  style={{ color: "var(--primary)" }}
                  onClick={() => cancel.mutate()}
                  disabled={cancel.isPending}
                >
                  <X size={14} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentModal
          bookingId={booking.id}
          bookingTotal={booking.total_price}
          mealTitle={booking.meal.title}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            invalidate();
          }}
        />
      )}
    </>
  );
}
