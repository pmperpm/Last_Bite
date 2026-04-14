"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingsAPI } from "@/lib/api";
import { PaginatedResponse, Booking } from "@/lib/types";
import BookingCard from "@/components/BookingCard";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "ready_for_pickup", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Booking>, Error>({
    queryKey: ["bookings", activeTab, page],
    queryFn: () => bookingsAPI.list({ page }).then((r) => r.data) as Promise<PaginatedResponse<Booking>>,
  });

  const filtered = activeTab
    ? data?.results.filter((b) => b.status === activeTab)
    : data?.results;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "32px 24px 0",
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
              marginBottom: 24,
            }}
          >
            My Bookings
          </h1>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 0 }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color:
                    activeTab === tab.key
                      ? "var(--primary)"
                      : "var(--text-muted)",
                  borderBottom:
                    activeTab === tab.key
                      ? "2px solid var(--primary)"
                      : "2px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                }}
              >
                {tab.label}
                {tab.key === "" && data && (
                  <span
                    style={{
                      marginLeft: 6,
                      background: "var(--cream-dark)",
                      color: "var(--text-muted)",
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 11,
                    }}
                  >
                    {data.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px" }}>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-muted)",
            }}
          >
            <ShoppingBag size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                marginBottom: 8,
                color: "var(--text-secondary)",
              }}
            >
              No bookings yet
            </h3>
            <p style={{ fontSize: 14, marginBottom: 24 }}>
              Browse today&apos;s meals and make your first reservation!
            </p>
            <Link href="/" className="btn-primary">
              Browse Meals
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered?.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
