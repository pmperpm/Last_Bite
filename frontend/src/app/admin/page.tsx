"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI, bookingsAPI } from "@/lib/api";
import { User, Booking, PaginatedResponse } from "@/lib/types";
import { Trash2, UserPlus, Search, TrendingUp, Users, ShoppingBag, CheckCircle } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

// Line chart
function BookingLineChart({ bookings }: { bookings: Booking[] }) {
  const days = 14;
  const today = startOfDay(new Date());

  // count per day for last 14 days
  const data = Array.from({ length: days }, (_, i) => {
    const day = subDays(today, days - 1 - i);
    const label = format(day, "MMM d");
    const count = bookings.filter(
      (b) => startOfDay(new Date(b.created_at)).getTime() === day.getTime()
    ).length;
    return { label, count };
  });

  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 560;
  const H = 160;
  const padX = 36;
  const padY = 20;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i / (days - 1)) * innerW;
    const y = padY + innerH - (d.count / max) * innerH;
    return { x, y, ...d };
  });

  const pathD =
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(padY + innerH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 320 }}>
        {/* Y grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padY + innerH - t * innerH;
          return (
            <g key={t}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#EEE8E2" strokeWidth={1} />
              <text x={padX - 6} y={y + 4} fontSize={9} fill="#AAA" textAnchor="end">
                {Math.round(t * max)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGrad)" opacity={0.4} />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#C0392B" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {/* Gradient */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C0392B" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#C0392B" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Dots + labels*/}
        {points.map((p, i) => (
          <g key={i}>
            {p.count > 0 && (
              <circle cx={p.x} cy={p.y} r={4} fill="#C0392B" stroke="white" strokeWidth={1.5} />
            )}
            {i % 2 === 0 && (
              <text x={p.x} y={H - 4} fontSize={8.5} fill="#999" textAnchor="middle">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// Role badge
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    student_worker: { label: "Student", bg: "#DBEAFE", color: "#1E40AF" },
    business_owner: { label: "Business", bg: "#FEF3C7", color: "#92400E" },
    admin: { label: "Admin", bg: "#FEE2E2", color: "#991B1B" },
  };
  const s = map[role] ?? { label: role, bg: "#F3F4F6", color: "#374151" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 10px",
        borderRadius: 20,
        fontFamily: "var(--font-body)",
        letterSpacing: "0.02em",
      }}
    >
      {s.label}
    </span>
  );
}

// Stat card
function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "var(--font-display)", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// Main page
export default function AdminPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: usersData, isLoading: usersLoading } = useQuery<PaginatedResponse<User>, Error>({
    queryKey: ["admin-users"],
    queryFn: () => usersAPI.list().then((r) => r.data) as Promise<PaginatedResponse<User>>,
  });

  const { data: bookingsData } = useQuery<PaginatedResponse<Booking>, Error>({
    queryKey: ["admin-bookings"],
    queryFn: () => bookingsAPI.list().then((r) => r.data) as Promise<PaginatedResponse<Booking>>,
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => usersAPI.delete(id) as Promise<unknown>,
    onSuccess: () => {
      setDeleteConfirm(null);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const users = usersData?.results ?? [];
  const bookings = bookingsData?.results ?? [];

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.first_name + " " + u.last_name).toLowerCase().includes(search.toLowerCase()) ||
          u.role.includes(search.toLowerCase())
      ),
    [users, search]
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A0800, #4A1000)",
          padding: "32px 24px",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#F4A435",
              marginBottom: 8,
            }}
          >
            Admin Panel
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            Platform Overview
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>
            Monitor users and booking activity
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* Chart */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: 2,
                }}
              >
                Bookings — Last 14 Days
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Daily booking volume across all meals
              </p>
            </div>
            <TrendingUp size={20} color="#C0392B" />
          </div>
          {bookingsData ? (
            <BookingLineChart bookings={bookings} />
          ) : (
            <div className="skeleton" style={{ height: 160, borderRadius: 8 }} />
          )}
        </div>

        {/* User management */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              User Management
            </h2>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  className="input"
                  placeholder="Search users…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 32, fontSize: 13, height: 36 }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {usersLoading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
              <Users size={36} style={{ opacity: 0.25, marginBottom: 12 }} />
              <p style={{ fontWeight: 600 }}>No users found</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--cream)" }}>
                    {["#", "Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          borderBottom: "1px solid var(--border)",
                          fontFamily: "var(--font-body)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        background: i % 2 === 0 ? "transparent" : "var(--cream)",
                        transition: "background 0.15s",
                      }}
                    >
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                        {user.id}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                          {user.first_name} {user.last_name}
                        </div>
                        {user.business_name && (
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.business_name}</div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                        {user.email}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <RoleBadge role={user.role} />
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {deleteConfirm === user.id ? (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Sure?</span>
                            <button
                              className="btn-primary btn-sm"
                              style={{ background: "#991B1B", fontSize: 11, padding: "3px 10px" }}
                              onClick={() => deleteUser.mutate(user.id)}
                              disabled={deleteUser.isPending}
                            >
                              Yes
                            </button>
                            <button
                              className="btn-ghost btn-sm"
                              style={{ fontSize: 11, padding: "3px 10px" }}
                              onClick={() => setDeleteConfirm(null)}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-ghost btn-sm"
                            style={{ color: "#991B1B", padding: "4px 8px" }}
                            onClick={() => setDeleteConfirm(user.id)}
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          <div
            style={{
              padding: "12px 24px",
              borderTop: "1px solid var(--border)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      </div>
    </div>
  );
}