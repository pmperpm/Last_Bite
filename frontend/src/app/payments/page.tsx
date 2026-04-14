"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { paymentsAPI } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { Package } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { PaginatedResponse, Payment } from "@/lib/types";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Payment>, Error>({
    queryKey: ["payments", page],
    queryFn: () => paymentsAPI.list({ page }).then((r) => r.data) as Promise<PaginatedResponse<Payment>>,
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "32px 24px 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: 8 }}>
            My Account
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 34,
              fontWeight: 900,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Payment History
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px" }}>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90, borderRadius: 16 }} />
            ))}
          </div>
        ) : data?.results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <Package size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                marginBottom: 8,
                color: "var(--text-secondary)",
              }}
            >
              No payments yet
            </h3>
            <p style={{ fontSize: 14 }}>
              Once you book and upload a slip, your payments will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data?.results.map((payment) => (
              <div
                key={payment.id}
                className="card"
                style={{ padding: "16px 20px", cursor: "default" }}
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
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      {payment.meal_title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Booking #{payment.booking_id} ·{" "}
                      {format(new Date(payment.created_at), "MMM d, yyyy h:mm a")}
                    </div>
                    {payment.status === "rejected" && payment.rejection_reason && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "6px 12px",
                          background: "#FEE2E2",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#991B1B",
                        }}
                      >
                        Reason: {payment.rejection_reason}
                      </div>
                    )}
                    {payment.verified_by_email && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        Reviewed by {payment.verified_by_email}
                        {payment.verified_at && (
                          <> · {format(new Date(payment.verified_at), "MMM d, h:mm a")}</>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <StatusBadge status={payment.status} showDot />
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 22,
                        fontWeight: 800,
                        color: "var(--primary)",
                      }}
                    >
                      ฿{Number(payment.amount).toFixed(0)}
                    </span>
                    {payment.slip_image && (
                      <a
                        href={payment.slip_image}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost btn-sm"
                        style={{ fontSize: 12 }}
                      >
                        View Slip →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
