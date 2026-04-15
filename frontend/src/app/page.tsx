"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mealsAPI } from "@/lib/api";
import type { MealFilters } from "@/lib/api";
import { AllergyTag, MealList, PaginatedResponse } from "@/lib/types";
import MealCard from "@/components/MealCard";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest" },
  { value: "discounted_price", label: "Price: Low → High" },
  { value: "-discounted_price", label: "Price: High → Low" },
  { value: "pickup_start", label: "Pickup Time" },
];

export default function MealsPage() {
  const [filters, setFilters] = useState<MealFilters>({
    status: "available",
    ordering: "-created_at",
  });
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<MealList>, Error>({
    queryKey: ["meals", filters, search, page],
    queryFn: () =>
      mealsAPI.list({ ...filters, search: search || undefined, page }).then((r) => r.data) as Promise<PaginatedResponse<MealList>>,
  });

  const { data: tags } = useQuery<AllergyTag[], Error>({
    queryKey: ["allergy-tags"],
    queryFn: () => mealsAPI.allergyTags().then((r) => r.data) as Promise<AllergyTag[]>,
  });

  const set = (key: keyof MealFilters, val: any) => {
    setFilters((prev) => ({ ...prev, [key]: val || undefined }));
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.count / 12) : 1;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Page header */}
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "32px 24px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: 8 }}>
            Available Now
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 36,
              fontWeight: 900,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}
          >
            Today&apos;s Last Bites
          </h1>

          {/* Search + filter bar */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                className="input"
                placeholder="Search meals, restaurants…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ paddingLeft: 38 }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <select
                className="input"
                value={filters.ordering ?? "-created_at"}
                onChange={(e) => set("ordering", e.target.value)}
                style={{ paddingRight: 32, cursor: "pointer" }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={showFilters ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} />
              Filters
              {(filters.min_price || filters.max_price || filters.allergy_tag) && (
                <span
                  style={{
                    background: "white",
                    color: "var(--primary)",
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  !
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div
              style={{
                marginTop: 16,
                padding: 20,
                background: "var(--cream)",
                borderRadius: 12,
                border: "1px solid var(--border)",
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <div style={{ flex: "1 1 160px" }}>
                <label
                  className="section-label"
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Min Price (฿)
                </label>
                <input
                  className="input"
                  type="number"
                  placeholder="0"
                  value={filters.min_price ?? ""}
                  onChange={(e) => set("min_price", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div style={{ flex: "1 1 160px" }}>
                <label
                  className="section-label"
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Max Price (฿)
                </label>
                <input
                  className="input"
                  type="number"
                  placeholder="999"
                  value={filters.max_price ?? ""}
                  onChange={(e) => set("max_price", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div style={{ flex: "1 1 200px" }}>
                <label
                  className="section-label"
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Dietary Tag
                </label>
                <select
                  className="input"
                  value={filters.allergy_tag ?? ""}
                  onChange={(e) => set("allergy_tag", e.target.value)}
                >
                  <option value="">All</option>
                  {tags?.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: "1 1 160px" }}>
                <label
                  className="section-label"
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Status
                </label>
                <select
                  className="input"
                  value={filters.status ?? "available"}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="">All</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => {
                    setFilters({ status: "available", ordering: "-created_at" });
                    setSearch("");
                    setPage(1);
                  }}
                >
                  <X size={13} /> Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Count */}
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 20,
            fontWeight: 500,
          }}
        >
          {isLoading ? (
            "Loading meals…"
          ) : (
            <>
              <strong style={{ color: "var(--text-primary)" }}>{data?.count ?? 0}</strong>{" "}
              meal{data?.count !== 1 ? "s" : ""} found
            </>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ height: 180, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 24, width: "40%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: "80%" }} />
              </div>
            ))}
          </div>
        ) : data?.results.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}></div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                marginBottom: 8,
                color: "var(--text-secondary)",
              }}
            >
              No meals found
            </h3>
            <p style={{ fontSize: 14 }}>
              Try adjusting your filters or check back soon.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {data?.results.map((meal, i) => (
              <MealCard
                key={meal.id}
                meal={meal}
                animationDelay={`${i * 60}ms`}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 40,
            }}
          >
            <button
              className="btn-ghost btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: `1.5px solid ${p === page ? "var(--primary)" : "var(--border)"}`,
                    background: p === page ? "var(--primary)" : "transparent",
                    color: p === page ? "white" : "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            <button
              className="btn-ghost btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
