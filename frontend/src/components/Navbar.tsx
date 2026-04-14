"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Menu, X, ChevronDown, ShoppingBag, LayoutDashboard,
  LogOut, User, Utensils, Package
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Browse Meals" },
];

const STUDENT_LINKS = [
  { href: "/bookings", label: "My Bookings", icon: ShoppingBag },
  { href: "/payments", label: "My Payments", icon: Package },
];

const BUSINESS_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/meals", label: "My Meals", icon: Utensils },
  { href: "/dashboard/payments", label: "Payments", icon: Package },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Admin Panel", icon: LayoutDashboard },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const roleLinks =
    user?.role === "admin"
      ? ADMIN_LINKS
      : user?.role === "business_owner"
      ? BUSINESS_LINKS
      : STUDENT_LINKS;

  const handleLogout = () => {
    logout();
    router.push("/");
    setProfileOpen(false);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,248,242,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 8px rgba(26,8,0,0.06)",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 72,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Logo */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src="/small_logo.png"
          alt="LastBite logo"
          width={80}
          height={80}
          style={{ objectFit: "cover" }}
        />
      </div>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flex: 1,
          }}
          className="hidden-mobile"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-ghost"
              style={{
                color: pathname.startsWith(link.href)
                  ? "var(--primary)"
                  : "var(--text-secondary)",
                fontWeight: pathname.startsWith(link.href) ? 600 : 400,
              }}
            >
              {link.label}
            </Link>
          ))}

          {user &&
            roleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn-ghost"
                style={{
                  color: pathname.startsWith(link.href)
                    ? "var(--primary)"
                    : "var(--text-secondary)",
                  fontWeight: pathname.startsWith(link.href) ? 600 : 400,
                }}
              >
                {link.label}
              </Link>
            ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
          {!user ? (
            <>
              <Link href="/login" className="btn-ghost btn-sm hidden-mobile">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary btn-sm">
                Get Started
              </Link>
            </>
          ) : (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px 6px 6px",
                  background: "var(--cream-dark)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "var(--primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {user.first_name?.[0] ?? user.email[0].toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  className="hidden-mobile"
                >
                  {user.first_name || user.email.split("@")[0]}
                </span>
                <ChevronDown size={14} style={{ color: "var(--text-muted)" }} className="hidden-mobile" />
              </button>

              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-lg)",
                    minWidth: 200,
                    padding: 8,
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px 12px",
                      borderBottom: "1px solid var(--border)",
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {user.first_name} {user.last_name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
                    <div
                      className="badge"
                      style={{
                        marginTop: 6,
                        background: user.role === "admin" ? "#FEE2E2" : user.role === "business_owner" ? "#FEF3C7" : "#DBEAFE",
                        color: user.role === "admin" ? "#991B1B" : user.role === "business_owner" ? "#92400E" : "#1E3A8A",
                      }}
                    >
                      {user.role === "admin" ? "Admin" : user.role === "business_owner" ? "Business" : "Student / Worker"}
                    </div>
                  </div>

                  {roleLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="btn-ghost"
                      style={{ display: "flex", width: "100%", borderRadius: 8, fontSize: 13 }}
                      onClick={() => setProfileOpen(false)}
                    >
                      <link.icon size={15} style={{ marginRight: 8 }} />
                      {link.label}
                    </Link>
                  ))}

                  <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 4 }}>
                    <button
                      onClick={handleLogout}
                      className="btn-ghost"
                      style={{
                        width: "100%",
                        justifyContent: "flex-start",
                        color: "var(--primary)",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      <LogOut size={15} style={{ marginRight: 8 }} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn-ghost"
            style={{ display: "none", padding: 8 }}
            id="mobile-menu-btn"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--cream)",
            padding: "12px 24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-ghost"
              onClick={() => setMobileOpen(false)}
              style={{ justifyContent: "flex-start" }}
            >
              {link.label}
            </Link>
          ))}
          {user &&
            roleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn-ghost"
                onClick={() => setMobileOpen(false)}
                style={{ justifyContent: "flex-start" }}
              >
                <link.icon size={15} />
                {link.label}
              </Link>
            ))}
          {!user && (
            <>
              <Link href="/login" className="btn-ghost" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/register" className="btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
