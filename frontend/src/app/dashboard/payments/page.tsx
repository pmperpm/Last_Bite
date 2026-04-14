"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsAPI } from "@/lib/api";
import type { Payment, PaginatedResponse } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import { CheckCircle, XCircle, Eye, X } from "lucide-react";
import { format } from "date-fns";

function RejectModal({
  payment,
  onClose,
  onConfirm,
}: {
  payment: Payment;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(26,8,0,0.6)",
        zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--surface)", borderRadius: 20, padding: 28,
          width: "100%", maxWidth: 420, boxShadow: "var(--shadow-lg)",
          animation: "fadeUp 0.3s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>
            Reject Payment
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Rejecting payment for <strong>{payment.meal_title}</strong> from {payment.user_email}.
        </p>
        <label className="section-label" style={{ display: "block", marginBottom: 8 }}>
          Reason for rejection
        </label>
        <textarea
          className="input"
          placeholder="e.g. Slip is blurry or amount doesn't match…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          style={{ marginBottom: 16 }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="btn-primary"
            style={{ flex: 2, justifyContent: "center", background: "#991B1B" }}
          >
            <XCircle size={14} /> Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "uploaded", label: "Pending Review" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
];

export default function BusinessPaymentsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("uploaded");
  const [rejectTarget, setRejectTarget] = useState<Payment | null>(null);
  const [slipView, setSlipView] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Payment>, Error>({
    queryKey: ["payments", "business"],
    queryFn: () => paymentsAPI.list().then((r) => r.data) as Promise<PaginatedResponse<Payment>>,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["payments"] });

  const verify = useMutation({
    mutationFn: (id: number) => paymentsAPI.verify(id) as Promise<unknown>,
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      paymentsAPI.reject(id, reason) as Promise<unknown>,
    onSuccess: () => {
      setRejectTarget(null);
      invalidate();
    },
  });

  const filtered = activeTab
    ? data?.results.filter((p: Payment) => p.status === activeTab)
    : data?.results;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "32px 24px 0",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: 8 }}>
            Business Dashboard
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 900,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: 24,
            }}
          >
            Payment Slips
          </h1>
          <div style={{ display: "flex", gap: 4 }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: activeTab === tab.key ? "var(--primary)" : "var(--text-muted)",
                  borderBottom:
                    activeTab === tab.key ? "2px solid var(--primary)" : "2px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                  position: "relative",
                }}
              >
                {tab.label}
                {tab.key === "uploaded" &&
                  data?.results.filter((p: Payment) => p.status === "uploaded").length! > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 4, right: 4,
                        background: "var(--primary)", color: "white",
                        borderRadius: "50%", width: 14, height: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700,
                      }}
                    >
                      {data?.results.filter((p: Payment) => p.status === "uploaded").length}
                    </span>
                  )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8, color: "var(--text-secondary)" }}>
              No {activeTab || ""} payments
            </h3>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered?.map((payment: Payment, i: number) => (
              <div
                key={payment.id}
                style={{
                  background: "var(--surface)",
                  border:
                    payment.status === "uploaded"
                      ? "1.5px solid #FDE68A"
                      : "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  animation: `fadeUp 0.4s ease both`,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: 16,
                          color: "var(--text-primary)",
                        }}
                      >
                        {payment.meal_title}
                      </div>
                      <StatusBadge status={payment.status} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span>{payment.user_email}</span>
                      <span>Booking #{payment.booking_id}</span>
                      <span>{format(new Date(payment.created_at), "MMM d, h:mm a")}</span>
                    </div>
                    {payment.rejection_reason && (
                      <div style={{ marginTop: 8, padding: "6px 12px", background: "#FEE2E2", borderRadius: 8, fontSize: 12, color: "#991B1B" }}>
                        Rejected: {payment.rejection_reason}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 24,
                        fontWeight: 900,
                        color: "var(--primary)",
                      }}
                    >
                      ฿{Number(payment.amount).toFixed(0)}
                    </span>

                    <div style={{ display: "flex", gap: 8 }}>
                      {payment.slip_image && (
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => setSlipView(payment.slip_image)}
                        >
                          <Eye size={13} /> View Slip
                        </button>
                      )}
                      {payment.status === "uploaded" && (
                        <>
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => verify.mutate(payment.id)}
                            disabled={verify.isPending}
                          >
                            <CheckCircle size={13} />
                            Verify
                          </button>
                          <button
                            className="btn-ghost btn-sm"
                            style={{ color: "var(--primary)" }}
                            onClick={() => setRejectTarget(payment)}
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slip lightbox */}
      {slipView && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(26,8,0,0.85)",
            zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setSlipView(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slipView}
            alt="Payment slip"
            style={{
              maxWidth: "90vw", maxHeight: "85vh",
              borderRadius: 12, boxShadow: "var(--shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSlipView(null)}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(255,255,255,0.15)", border: "none",
              color: "white", cursor: "pointer", borderRadius: "50%",
              width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          payment={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) =>
            reject.mutate({ id: rejectTarget.id, reason })
          }
        />
      )}
    </div>
  );
}
