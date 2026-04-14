import type { MealList } from "@/lib/types";
import Link from "next/link";
import { Clock, MapPin, Tag, Flame } from "lucide-react";
import { format } from "date-fns";

interface Props {
  meal: MealList;
  style?: React.CSSProperties;
  animationDelay?: string;
}

export default function MealCard({ meal, style, animationDelay }: Props) {
  const pickupTime = `${format(new Date(meal.pickup_start), "h:mm a")} – ${format(
    new Date(meal.pickup_end),
    "h:mm a"
  )}`;

  const isSoldOut = meal.status !== "available";

  return (
    <Link
      href={`/meals/${meal.id}`}
      className="card"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        opacity: isSoldOut ? 0.7 : 1,
        animation: `fadeUp 0.5s ease both`,
        animationDelay: animationDelay ?? "0ms",
        ...style,
      }}
    >
      {/* Image area */}
      <div
        style={{
          position: "relative",
          height: 180,
          background: meal.image
            ? "transparent"
            : `linear-gradient(135deg, #7A2E0E 0%, #DE2C00 50%, #F4A435 100%)`,
          overflow: "hidden",
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

        {/* Discount badge */}
        {meal.discount_percent > 0 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "var(--amber)",
              color: "var(--dark)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 12,
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.02em",
            }}
          >
            -{meal.discount_percent}% OFF
          </div>
        )}

        {/* Status overlay */}
        {isSoldOut && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(26,8,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                background: "white",
                color: "var(--dark)",
                fontWeight: 700,
                fontSize: 13,
                padding: "6px 18px",
                borderRadius: 20,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {meal.status === "sold_out" ? "Sold Out" : meal.status}
            </span>
          </div>
        )}

        {/* Qty badge */}
        {!isSoldOut && meal.quantity_remaining <= 5 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(26,8,0,0.7)",
              color: "white",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 20,
            }}
          >
            {meal.quantity_remaining} left!
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ marginBottom: 4 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {meal.posted_by_name}
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            {meal.title}
          </h3>
        </div>

        {/* Pricing */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--primary)",
            }}
          >
            ฿{Number(meal.discounted_price).toFixed(0)}
          </span>
          <span
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              textDecoration: "line-through",
            }}
          >
            ฿{Number(meal.original_price).toFixed(0)}
          </span>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 12 }}>
            <Clock size={12} />
            <span>Pickup {pickupTime}</span>
          </div>
          {meal.allergy_tags.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Tag size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              {meal.allergy_tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  style={{
                    fontSize: 11,
                    padding: "1px 7px",
                    background: "var(--cream-dark)",
                    color: "var(--brown)",
                    borderRadius: 10,
                    fontWeight: 500,
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {meal.allergy_tags.length > 3 && (
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  +{meal.allergy_tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
