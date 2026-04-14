"use client";

import { useQuery } from "@tanstack/react-query";
import { mealsAPI, bookingsAPI, paymentsAPI } from "@/lib/api";
import { PaginatedResponse, MealList, Booking, Payment } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import BookingCard from "@/components/BookingCard";
import { Utensils, Package, Plus } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: meals } = useQuery<PaginatedResponse<MealList>, Error>({
    queryKey: ["meals", "dashboard"],
    queryFn: () => mealsAPI.list({ status: "available" }).then((r) => r.data) as Promise<PaginatedResponse<MealList>>,
  });

  const { data: bookings } = useQuery<PaginatedResponse<Booking>, Error>({
    queryKey: ["bookings", "dashboard"],
    queryFn: () => bookingsAPI.list().then((r) => r.data) as Promise<PaginatedResponse<Booking>>,
  });

  const { data: payments } = useQuery<PaginatedResponse<Payment>, Error>({
    queryKey: ["payments", "dashboard"],
    queryFn: () => paymentsAPI.list().then((r) => r.data) as Promise<PaginatedResponse<Payment>>,
  });

  const pendingPayments = payments?.results.filter((p) => p.status === "uploaded") ?? [];
  const pendingBookings = bookings?.results.filter((b) => b.status === "pending") ?? [];
  const confirmedBookings = bookings?.results.filter((b) => b.status === "confirmed") ?? [];

  const totalRevenue = payments?.results
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const stats = [
    {
      label: "Active Meals",
      value: meals?.count ?? 0,
      color: "var(--primary)",
      bg: "#FEF2F0",
    },
    {
      label: "Pending Bookings",
      value: pendingBookings.length,
      color: "#D97706",
      bg: "#FEF3C7",
    },
    {
      label: "Slips to Review",
      value: pendingPayments.length,
      color: "#1E40AF",
      bg: "#DBEAFE",
    },
    {
      label: "Total Revenue",
      value: `฿${totalRevenue.toFixed(0)}`,
      color: "#065F46",
      bg: "#D1FAE5",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A0800, #5C1E05)",
          padding: "36px 24px",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#F4A435",
              marginBottom: 8,
            }}
          >
            Business Dashboard
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Login
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            {mounted ? format(new Date(), "EEEE, MMMM d, yyyy") : ""}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "20px 22px",
                animation: `fadeUp 0.4s ease both`,
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: stat.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                </div>
                {stat.label === "Slips to Review" && pendingPayments.length > 0 && (
                  <span
                    style={{
                      background: "var(--primary)", color: "white",
                      borderRadius: "50%", width: 20, height: 20,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                    }}
                  >
                    !
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 30,
                  fontWeight: 900,
                  color: stat.color,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
          {/* Left: Recent bookings needing action */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                Needs Attention
              </h2>
              <Link href="/dashboard/meals" className="btn-ghost btn-sm">
                View all →
              </Link>
            </div>

            {pendingBookings.length === 0 && confirmedBookings.length === 0 ? (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "40px 24px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>All caught up!</p>
                <p style={{ fontSize: 13 }}>No bookings need your attention right now.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[...pendingBookings, ...confirmedBookings].slice(0, 5).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isBusinessView />
                ))}
              </div>
            )}
          </div>

          {/* Right: Quick actions + pending slips */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Quick actions */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 14,
                  fontFamily: "var(--font-display)",
                }}
              >
                Quick Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/dashboard/meals/new" className="btn-primary" style={{ justifyContent: "center" }}>
                  <Plus size={15} />
                  Post New Meal
                </Link>
                <Link href="/dashboard/meals" className="btn-secondary" style={{ justifyContent: "center" }}>
                  <Utensils size={15} />
                  Manage Meals
                </Link>
                <Link href="/dashboard/payments" className="btn-secondary" style={{ justifyContent: "center" }}>
                  <Package size={15} />
                  Review Payments
                  {pendingPayments.length > 0 && (
                    <span
                      style={{
                        marginLeft: 4,
                        background: "var(--primary)",
                        color: "white",
                        borderRadius: 10,
                        padding: "1px 6px",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {pendingPayments.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Pending payment slips */}
            {pendingPayments.length > 0 && (
              <div
                style={{
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#92400E",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {pendingPayments.length} Payment Slip{pendingPayments.length > 1 ? "s" : ""} Awaiting Review
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {pendingPayments.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: "white",
                        borderRadius: 10,
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                          {p.meal_title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {p.user_email}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          color: "var(--primary)",
                          fontSize: 16,
                        }}
                      >
                        ฿{Number(p.amount).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/dashboard/payments"
                  className="btn-ghost btn-sm"
                  style={{ marginTop: 10, color: "#92400E" }}
                >
                  Review all slips →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
