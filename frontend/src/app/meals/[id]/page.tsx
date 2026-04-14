"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { mealsAPI, bookingsAPI, authAPI } from "@/lib/api";
import { MealDetail, Booking, AllergyTag } from "@/lib/types";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import {
  Clock, Tag, Flame, ChefHat, ArrowLeft,
  ShoppingBag, Minus, Plus, Loader2, AlertCircle,
} from "lucide-react";

export default function MealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [qty, setQty] = useState(1);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { data: meal, isLoading } = useQuery<MealDetail, Error>({
    queryKey: ["meal", id],
    queryFn: () => mealsAPI.detail(Number(id)).then((r) => r.data) as Promise<MealDetail>,
  });

  const { mutate: bookMeal, isPending: isBooking } = useMutation({
    mutationFn: () => bookingsAPI.create(Number(id), qty) as Promise<unknown>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal", id] });
      setBookingSuccess(true);
      toast.success("Meal booked successfully!");
    },
    onError: (err: any) => {
      setBookingError(err?.response?.data?.detail ?? "Booking failed. Please try again.");
    },
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 800, margin: "60px auto", padding: "0 24px" }}>
        <div className="skeleton" style={{ height: 360, borderRadius: 20, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 28, width: "50%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: "80%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: "70%" }} />
      </div>
    );
  }

  if (!meal) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 8 }}>
          Meal not found
        </h2>
        <Link href="/" className="btn-primary" style={{ marginTop: 16 }}>
          Browse other meals
        </Link>
      </div>
    );
  }

  const canBook =
    user?.role === "student_worker" && meal.status === "available";
  const maxQty = Math.min(meal.quantity_remaining, 10);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", paddingBottom: 60 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        {/* Back */}
        <div style={{ padding: "20px 0 0" }}>
          <Link href="/" className="btn-ghost" style={{ display: "inline-flex" }}>
            <ArrowLeft size={15} /> Back to meals
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 28,
            marginTop: 16,
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <div>
            {/* Image */}
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                height: 340,
                background: meal.image
                  ? "transparent"
                  : "linear-gradient(135deg, #7A2E0E 0%, #DE2C00 60%, #F4A435 100%)",
                position: "relative",
                marginBottom: 24,
                boxShadow: "var(--shadow-md)",
              }}
            >
              {meal.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={meal.image}
                  alt={meal.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--cream)",
                  color: "var(--text-muted)",
                  fontSize: 14,
                }}
              >
                No image
              </div>
              )}
              {meal.discount_percent > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    background: "var(--amber)",
                    color: "var(--dark)",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "5px 14px",
                    borderRadius: 20,
                  }}
                >
                  -{meal.discount_percent}% OFF
                </div>
              )}
              <div style={{ position: "absolute", top: 16, right: 16 }}>
                <StatusBadge status={meal.status} showDot />
              </div>
            </div>

            {/* Info */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {meal.posted_by_name}
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 36,
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  lineHeight: 1.1,
                  marginBottom: 12,
                  letterSpacing: "-0.02em",
                }}
              >
                {meal.title}
              </h1>
              {meal.description && (
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    marginBottom: 16,
                  }}
                >
                  {meal.description}
                </p>
              )}
            </div>

            {/* Time info */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: 14,
                padding: 18,
                border: "1px solid var(--border)",
                marginBottom: 20,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Pickup Window
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  <Clock size={16} style={{ color: "var(--primary)" }} />
                  {format(new Date(meal.pickup_start), "EEEE, MMM d · h:mm a")} –{" "}
                  {format(new Date(meal.pickup_end), "h:mm a")}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13,
                    color: "var(--text-muted)",
                  }}
                >
                  <AlertCircle size={14} />
                  Expires: {format(new Date(meal.expiry_time), "MMM d, h:mm a")}
                </div>
              </div>
            </div>

            {/* Nutrition */}
            {(meal.calories || meal.protein_g || meal.carbs_g || meal.fat_g) && (
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: 14,
                  padding: 18,
                  border: "1px solid var(--border)",
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Flame size={14} /> Nutrition Info
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 10,
                  }}
                >
                  {[
                    { label: "Calories", value: meal.calories ? `${meal.calories} kcal` : "—" },
                    { label: "Protein", value: meal.protein_g ? `${meal.protein_g}g` : "—" },
                    { label: "Carbs", value: meal.carbs_g ? `${meal.carbs_g}g` : "—" },
                    { label: "Fat", value: meal.fat_g ? `${meal.fat_g}g` : "—" },
                  ].map((n) => (
                    <div
                      key={n.label}
                      style={{
                        background: "var(--cream)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          fontFamily: "var(--font-display)",
                          color: "var(--primary)",
                          marginBottom: 2,
                        }}
                      >
                        {n.value}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {n.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergy tags */}
            {(meal.allergy_tags.length > 0 || meal.allergy_notes) && (
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: 14,
                  padding: 18,
                  border: "1px solid var(--border)",
                }}
              >
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Tag size={14} /> Dietary Info
                </h3>
                {meal.allergy_tags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: meal.allergy_notes ? 10 : 0,
                    }}
                  >
                    {meal.allergy_tags.map((tag) => (
                      <span
                        key={tag.id}
                        style={{
                          background: "var(--cream-dark)",
                          color: "var(--brown)",
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "4px 12px",
                          borderRadius: 20,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                {meal.allergy_notes && (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {meal.allergy_notes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: booking card */}
          <div style={{ position: "sticky", top: 80 }}>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: 24,
                boxShadow: "var(--shadow-md)",
              }}
            >
              {/* Pricing */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 40,
                      fontWeight: 900,
                      color: "var(--primary)",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    ฿{Number(meal.discounted_price).toFixed(0)}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: "var(--text-muted)",
                      textDecoration: "line-through",
                    }}
                  >
                    ฿{Number(meal.original_price).toFixed(0)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {meal.quantity_remaining} portion{meal.quantity_remaining !== 1 ? "s" : ""}{" "}
                  remaining
                </div>
              </div>

              {/* Divider */}
              <div className="divider" style={{ marginBottom: 20 }} />

              {bookingSuccess ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 20,
                      fontWeight: 800,
                      marginBottom: 8,
                      color: "var(--text-primary)",
                    }}
                  >
                    Booking Confirmed!
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                    Now upload your payment slip to complete the process.
                  </p>
                  <Link href="/bookings" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    <ShoppingBag size={15} />
                    View My Bookings
                  </Link>
                </div>
              ) : (
                <>
                  {/* Quantity selector */}
                  {canBook && (
                    <div style={{ marginBottom: 16 }}>
                      <label className="section-label" style={{ display: "block", marginBottom: 8 }}>
                        Quantity
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0,
                          border: "1.5px solid var(--border)",
                          borderRadius: 10,
                          overflow: "hidden",
                          width: "fit-content",
                        }}
                      >
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          style={{
                            width: 40,
                            height: 40,
                            border: "none",
                            background: "var(--cream)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          style={{
                            width: 48,
                            textAlign: "center",
                            fontWeight: 700,
                            fontSize: 18,
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                          style={{
                            width: 40,
                            height: 40,
                            border: "none",
                            background: "var(--cream)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  {canBook && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                        padding: "12px 14px",
                        background: "var(--cream)",
                        borderRadius: 10,
                      }}
                    >
                      <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                        Total ({qty}×)
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 22,
                          color: "var(--primary)",
                        }}
                      >
                        ฿{(Number(meal.discounted_price) * qty).toFixed(0)}
                      </span>
                    </div>
                  )}

                  {bookingError && (
                    <div
                      style={{
                        background: "#FEE2E2",
                        color: "#991B1B",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      {bookingError}
                    </div>
                  )}

                  {!user ? (
                    <Link href="/login" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                      Sign in to reserve
                    </Link>
                  ) : canBook ? (
                    <button
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => bookMeal()}
                      disabled={isBooking}
                    >
                      {isBooking ? (
                        <>
                          <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                          Reserving…
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={15} />
                          Reserve Now
                        </>
                      )}
                    </button>
                  ) : meal.status !== "available" ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "12px",
                        background: "var(--cream-dark)",
                        borderRadius: 10,
                        fontSize: 14,
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      This meal is {meal.status.replace("_", " ")}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "12px",
                        background: "var(--cream-dark)",
                        borderRadius: 10,
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      Only students and workers can reserve meals.
                    </div>
                  )}

                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      textAlign: "center",
                      marginTop: 12,
                    }}
                  >
                    You&apos;ll upload a payment slip after reserving.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
