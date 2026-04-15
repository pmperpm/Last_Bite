"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { mealsAPI } from "@/lib/api";
import { AllergyTag } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewMealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | Record<string, string[]>>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    original_price: "",
    discounted_price: "",
    quantity_total: "1",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    allergy_notes: "",
    pickup_start: "",
    pickup_end: "",
    expiry_time: "",
  });

  const { data: tags } = useQuery<AllergyTag[], Error>({
    queryKey: ["allergy-tags"],
    queryFn: () => mealsAPI.allergyTags().then((r) => r.data) as Promise<AllergyTag[]>,
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleImage = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    selectedTags.forEach((id) => fd.append("allergy_tag_ids", String(id)));
    if (imageFile) fd.append("image", imageFile);

    try {
      const { data: meal } = await mealsAPI.create(fd);
      if (publish) await mealsAPI.publish(meal.id);
      router.push("/dashboard/meals");
    } catch (err: any) {
      const d = err?.response?.data;
      setError(typeof d === "object" ? d : "Failed to create meal.");
    } finally {
      setLoading(false);
    }
  };

  const fieldErrors = typeof error === "object" && !Array.isArray(error) ? error : {};
  const globalError = typeof error === "string" ? error : "";

  const publishRef = useRef(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", paddingBottom: 60 }}>
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "24px 24px 20px",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link href="/dashboard/meals" className="btn-ghost" style={{ display: "inline-flex", marginBottom: 12 }}>
            <ArrowLeft size={15} /> Back
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 900,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Post a New Meal
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
        <form onSubmit={(e) => handleSubmit(e, publishRef.current)}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 22,
              marginBottom: 20,
            }}
          >
            <h2 className="section-label" style={{ marginBottom: 14 }}>
              Meal Photo
            </h2>
            <div
              style={{
                border: `2px dashed ${imagePreview ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                transition: "border-color 0.2s",
                minHeight: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--cream)",
                position: "relative",
              }}
              onClick={() => document.getElementById("meal-image")?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f?.type.startsWith("image/")) handleImage(f);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100%", maxHeight: 280, objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <ImageIcon size={32} style={{ color: "var(--muted)", marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Drop a photo here or click to browse
                  </p>
                </div>
              )}
            </div>
            <input
              id="meal-image"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImage(f);
              }}
            />
          </div>

          {/* Basic Info */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 22,
              marginBottom: 20,
            }}
          >
            <h2 className="section-label" style={{ marginBottom: 14 }}>
              Basic Info
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                  Meal Title *
                </label>
                <input
                  className="input"
                  placeholder="e.g. Thai Green Curry with Rice"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                />
                {fieldErrors.title && (
                  <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 4 }}>
                    {fieldErrors.title[0]}
                  </div>
                )}
              </div>
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  className="input"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Quantity */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 22,
              marginBottom: 20,
            }}
          >
            <h2 className="section-label" style={{ marginBottom: 14 }}>
              Pricing & Quantity
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                  Original Price (฿) *
                </label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder="180"
                  value={form.original_price}
                  onChange={(e) => set("original_price", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                  Discounted Price (฿) *
                </label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder="59"
                  value={form.discounted_price}
                  onChange={(e) => set("discounted_price", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                  Portions Available *
                </label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="5"
                  value={form.quantity_total}
                  onChange={(e) => set("quantity_total", e.target.value)}
                  required
                />
              </div>
            </div>
            {form.original_price && form.discounted_price && (
              <div
                style={{
                  marginTop: 12,
                  padding: "8px 14px",
                  background: "#DCFCE7",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#166534",
                  fontWeight: 600,
                }}
              >
                That&apos;s a{" "}
                {Math.round(
                  (1 - Number(form.discounted_price) / Number(form.original_price)) * 100
                )}
                % discount!
              </div>
            )}
          </div>

          {/* Pickup Times */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 22,
              marginBottom: 20,
            }}
          >
            <h2 className="section-label" style={{ marginBottom: 14 }}>
              Pickup Window & Expiry
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                  Pickup From *
                </label>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.pickup_start}
                  onChange={(e) => set("pickup_start", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                  Pickup Until *
                </label>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.pickup_end}
                  onChange={(e) => set("pickup_end", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                  Food Expires At *
                </label>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.expiry_time}
                  onChange={(e) => set("expiry_time", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 22,
              marginBottom: 20,
            }}
          >
            <h2 className="section-label" style={{ marginBottom: 6 }}>
              Nutrition Info
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
              Optional
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {[
                { key: "calories", label: "Calories (kcal)", placeholder: "450" },
                { key: "protein_g", label: "Protein (g)", placeholder: "25" },
                { key: "carbs_g", label: "Carbs (g)", placeholder: "60" },
                { key: "fat_g", label: "Fat (g)", placeholder: "12" },
              ].map((n) => (
                <div key={n.key}>
                  <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                    {n.label}
                  </label>
                  <input
                    className="input"
                    type="number"
                    step="0.1"
                    placeholder={n.placeholder}
                    value={(form as any)[n.key]}
                    onChange={(e) => set(n.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Allergy / Dietary */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 22,
              marginBottom: 24,
            }}
          >
            <h2 className="section-label" style={{ marginBottom: 14 }}>
              Dietary Tags & Allergy Notes
            </h2>
            {tags && tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      border: `1.5px solid ${selectedTags.includes(tag.id) ? "var(--primary)" : "var(--border)"}`,
                      background: selectedTags.includes(tag.id)
                        ? "rgba(222,44,0,0.08)"
                        : "var(--cream)",
                      color: selectedTags.includes(tag.id)
                        ? "var(--primary)"
                        : "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: selectedTags.includes(tag.id) ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
            <textarea
              className="input"
              placeholder="Any allergy notes? e.g. Contains nuts, made in a kitchen that handles dairy…"
              value={form.allergy_notes}
              onChange={(e) => set("allergy_notes", e.target.value)}
              rows={2}
              style={{ resize: "vertical" }}
            />
          </div>

          {globalError && (
            <div
              style={{
                background: "#FEE2E2",
                color: "#991B1B",
                padding: "10px 16px",
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {globalError}
            </div>
          )}

          {/* Submit buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              className="btn-secondary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => { publishRef.current = false; }}
              disabled={loading}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, justifyContent: "center" }}
              onClick={() => { publishRef.current = true; }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                  Posting…
                </>
              ) : (
                "Publish Meal"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
