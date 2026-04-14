"use client";

import { useState, useRef } from "react";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { paymentsAPI } from "@/lib/api";

interface Props {
  bookingId: number;
  bookingTotal: string;
  mealTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  bookingId,
  bookingTotal,
  mealTitle,
  onClose,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      await paymentsAPI.upload(bookingId, file);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,8,0,0.6)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 440,
          boxShadow: "var(--shadow-lg)",
          animation: "fadeUp 0.3s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Upload Payment Slip
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {mealTitle} · <strong style={{ color: "var(--primary)" }}>฿{Number(bookingTotal).toFixed(0)}</strong>
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Instructions */}
        <div
          style={{
            background: "var(--cream)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          Take a screenshot or photo of your bank transfer slip, then upload it here. The business owner will verify your payment.
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${preview ? "var(--primary)" : "var(--border)"}`,
            borderRadius: 14,
            padding: preview ? 0 : 32,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s, background 0.2s",
            background: preview ? "transparent" : "var(--cream)",
            overflow: "hidden",
            minHeight: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Payment slip preview"
              style={{ width: "100%", maxHeight: 280, objectFit: "contain" }}
            />
          ) : (
            <div>
              <ImageIcon size={32} style={{ color: "var(--muted)", marginBottom: 10 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Drop your slip here, or click to browse
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>PNG, JPG, WEBP up to 10MB</p>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {preview && (
          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            className="btn-ghost btn-sm"
            style={{ marginBottom: 12, color: "var(--text-muted)" }}
          >
            <X size={13} /> Remove
          </button>
        )}

        {error && (
          <div
            style={{
              background: "#FEE2E2",
              color: "#991B1B",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{ flex: 2 }}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                Uploading…
              </>
            ) : (
              <>
                <Upload size={14} />
                Submit Slip
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
