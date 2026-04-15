"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mealsAPI } from "@/lib/api";
import { PaginatedResponse, MealList } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Edit3, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function BusinessMealsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<MealList>, Error>({
    queryKey: ["meals", "business"],
    queryFn: () => mealsAPI.list().then((r) => r.data) as Promise<PaginatedResponse<MealList>>,
  });

  const publish = useMutation({
    mutationFn: (id: number) => mealsAPI.publish(id) as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meals"] }),
  });

  const cancel = useMutation({
    mutationFn: (id: number) => mealsAPI.cancel(id) as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meals"] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => mealsAPI.delete(id) as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meals"] }),
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
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>
              Business Dashboard
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                fontWeight: 900,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              My Meal Listings
            </h1>
          </div>
          <Link href="/dashboard/meals/new" className="btn-primary">
            <Plus size={15} />
            Post New Meal
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90, borderRadius: 16 }} />
            ))}
          </div>
        ) : data?.results.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              background: "var(--surface)",
              borderRadius: 20,
              border: "1px solid var(--border)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                marginBottom: 8,
                color: "var(--text-secondary)",
              }}
            >
              No meals posted yet
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              Start by posting your first surplus meal listing.
            </p>
            <Link href="/dashboard/meals/new" className="btn-primary">
              <Plus size={15} /> Post First Meal
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data?.results.map((meal, i) => (
              <div
                key={meal.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  animation: `fadeUp 0.4s ease both`,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {/* Meal image */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: meal.image
                      ? "transparent"
                      : "linear-gradient(135deg, #7A2E0E, #DE2C00)",
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  {meal.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={meal.image}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    " No Image"
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--text-primary)",
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {meal.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>
                      ฿{Number(meal.discounted_price).toFixed(0)}{" "}
                      <span style={{ textDecoration: "line-through" }}>
                        ฿{Number(meal.original_price).toFixed(0)}
                      </span>
                    </span>
                    <span>
                      {meal.quantity_remaining}/{(meal as any).quantity_total ?? "?"} remaining
                    </span>
                    <span>
                      Pickup: {format(new Date(meal.pickup_start), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <StatusBadge status={meal.status} />

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <Link
                    href={`/meals/${meal.id}`}
                    className="btn-ghost btn-sm"
                    style={{ padding: "6px 10px" }}
                    title="Preview"
                  >
                    <Eye size={14} />
                  </Link>
                  <Link
                    href={`/dashboard/meals/${meal.id}/edit`}
                    className="btn-ghost btn-sm"
                    style={{ padding: "6px 10px" }}
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </Link>
                  {meal.status === "draft" && (
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => publish.mutate(meal.id)}
                      disabled={publish.isPending}
                      title="Publish"
                    >
                      <CheckCircle size={14} />
                      Publish
                    </button>
                  )}
                  {meal.status === "available" && (
                    <button
                      className="btn-ghost btn-sm"
                      style={{ color: "var(--primary)" }}
                      onClick={() => cancel.mutate(meal.id)}
                      disabled={cancel.isPending}
                    >
                      <XCircle size={14} />
                      Cancel
                    </button>
                  )}
                  {["draft", "cancelled", "expired", "sold_out"].includes(meal.status) && (
                    <button
                      className="btn-ghost btn-sm"
                      style={{ color: "var(--primary)" }}
                      onClick={() => {
                        if (confirm("Delete this meal?")) remove.mutate(meal.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
