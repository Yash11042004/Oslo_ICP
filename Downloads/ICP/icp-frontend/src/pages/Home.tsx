// src/pages/Home.tsx
import React from "react";

/** Pixel-accurate recreation of the provided Oslo AI home screen (desktop 1440).
 * TailwindCSS required. All icons are inline SVG for visual parity.
 */

const Purple = "#6F63D6"; // sidebar icons/text (soft purple)
const Heading = "#281A59"; // big heading
const Subtle = "#A39FCA"; // subtle placeholder
const ChipBg = "#FBF6EE";
const ChipBorder = "#F2E7D4";
const ChipText = "#6F5E41";
const CardBorder = "#F0EEF8";
const CardDivider = "#EEEAFB";
const Accent = "#F59E0B"; // Import button (amber)
const AccentLight = "#FFE9B5";
const SidebarActiveBg = "#FFF4E5";
const SidebarActiveIconBg = "#FFDFA8";

const Icon = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
        stroke={Purple}
        strokeWidth="1.6"
      />
    </svg>
  ),
  rocket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12c-3.828 3.828-7 9-7 9s5.172-3.172 9-7 7-9 7-9-5.172 3.172-9 7Z"
        stroke={Purple}
        strokeWidth="1.6"
      />
      <path
        d="M9 12s.5-5 6-9"
        stroke={Purple}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  file: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3h6l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke={Purple}
        strokeWidth="1.6"
      />
      <path d="M13 3v4h4" stroke={Purple} strokeWidth="1.6" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="8" r="3" stroke={Purple} strokeWidth="1.6" />
      <path
        d="M4 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"
        stroke={Purple}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M17 4a3 3 0 0 1 0 6" stroke={Purple} strokeWidth="1.6" />
    </svg>
  ),
  pie: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v9h9" stroke={Purple} strokeWidth="1.6" />
      <path d="M20.5 15a8 8 0 1 1-12-9.3" stroke={Purple} strokeWidth="1.6" />
    </svg>
  ),
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke={Purple}
        strokeWidth="1.6"
      />
      <path d="m4 7 8 6 8-6" stroke={Purple} strokeWidth="1.6" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke={Purple}
        strokeWidth="1.6"
      />
      <path
        d="M19.4 15a8 8 0 0 0 0-6l2.1-1.6-2-3.4-2.5.9a8 8 0 0 0-3.4-2L13 1h-2l-.6 2.5a8 8 0 0 0-3.4 2l-2.5-.9-2 3.4L4 9a8 8 0 0 0 0 6l-2.1 1.6 2 3.4 2.5-.9a8 8 0 0 0 3.4 2L11 23h2l.6-2.5a8 8 0 0 0 3.4-2l2.5.9 2-3.4L19.4 15Z"
        stroke={Purple}
        strokeWidth="1.2"
      />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 7V5a2 2 0 0 0-2-2H4v18h10"
        stroke={Purple}
        strokeWidth="1.6"
      />
      <path
        d="M21 12H8m13 0-3-3m3 3-3 3"
        stroke={Purple}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={Subtle} strokeWidth="1.8" />
      <path
        d="m20 20-3-3"
        stroke={Subtle}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  mic: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="9"
        y="3"
        width="6"
        height="10"
        rx="3"
        stroke={Accent}
        strokeWidth="1.8"
      />
      <path d="M6 10a6 6 0 0 0 12 0" stroke={Accent} strokeWidth="1.8" />
      <path d="M12 17v3" stroke={Accent} strokeWidth="1.8" />
    </svg>
  ),
  uploadWhite: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3v12"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 7l4-4 4 4"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 21h16"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer select-none transition-colors
      ${active ? "bg-[#FFF4E5]" : "hover:bg-[#F8F6FF]"}`}
    >
      <div
        className={`w-9 h-9 grid place-items-center rounded-lg ${
          active ? "" : ""
        }`}
        style={{ background: active ? SidebarActiveIconBg : "transparent" }}
      >
        {icon}
      </div>
      <span
        className={`text-[15px] leading-none ${
          active ? "text-[#1F1642] font-medium" : "text-[#6B6696]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#FBFBFE]">
      <div className="mx-auto max-w-[1440px] grid grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="h-screen sticky top-0 bg-white border-r border-[#EFEFF6] px-8 pt-10 pb-8 flex flex-col">
          {/* Brand */}
          <div className="flex items-center gap-2 text-[#1F1642] text-xl font-semibold">
            <span>Oslo AI</span>
            <span className="text-[#FBBF24]">✦</span>
          </div>

          {/* Profile */}
          <div className="mt-8 flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/56?img=8"
              alt="John Doe"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="leading-tight">
              <div className="text-[15px] font-medium text-[#1F1642]">
                John Doe
              </div>
              <div className="text-[12px] text-[#A3A0C3]">
                johndoe@gmail.com
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 space-y-1">
            <SidebarItem icon={Icon.home} label="Home" active />
            <SidebarItem icon={Icon.rocket} label="Campaigns" />
            <SidebarItem icon={Icon.file} label="Drafts" />
            <SidebarItem icon={Icon.users} label="Prospects" />
            <SidebarItem icon={Icon.pie} label="Analytics" />
            <SidebarItem icon={Icon.mail} label="Mailbox" />
          </nav>

          {/* Footer nav */}
          <div className="mt-auto space-y-1 pt-6">
            <SidebarItem icon={Icon.settings} label="Settings" />
            <SidebarItem icon={Icon.logout} label="Log out" />
          </div>
        </aside>

        {/* Main */}
        <main className="px-16 py-16 relative">
          {/* soft vignette */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="w-full h-full bg-[radial-gradient(1200px_600px_at_60%_0%,#F3F2FD_0%,transparent_60%)]" />
          </div>

          <section className="text-center">
            <h1
              className="text-[44px] leading-[56px] font-bold tracking-tight"
              style={{ color: Heading }}
            >
              Welcome to Oslo AI
            </h1>
            <p className="mt-2 text-[18px]" style={{ color: Purple }}>
              Who should we target today ?
            </p>
          </section>

          {/* Search card */}
          <div className="mt-10 mx-auto max-w-[980px]">
            <div
              className="rounded-2xl bg-white border shadow-[0_20px_40px_rgba(31,22,66,0.08)]"
              style={{ borderColor: CardBorder }}
            >
              <div className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <span>{Icon.search}</span>
                  <input
                    placeholder="Tell us what you'd like or pick from one of the prompts suggested below..."
                    className="flex-1 text-[14px] placeholder-[#B5B1D0] outline-none"
                  />
                  <button
                    className="w-9 h-9 grid place-items-center rounded-full"
                    style={{ background: AccentLight }}
                    title="Voice"
                  >
                    {Icon.mic}
                  </button>
                </div>

                <div
                  className="mt-4 h-px"
                  style={{ background: CardDivider }}
                />

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Tech Companies",
                      "100+ Employees",
                      "Operating from Mumbai",
                    ].map((t) => (
                      <span
                        key={t}
                        className="px-4 py-2 text-[13px] rounded-full border"
                        style={{
                          background: ChipBg,
                          borderColor: ChipBorder,
                          color: ChipText,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    className="flex items-center gap-2 rounded-full text-white text-[14px] px-4 py-2 shadow-sm hover:brightness-95"
                    style={{ background: Accent }}
                  >
                    <span className="w-5 h-5 grid place-items-center rounded-full bg-[rgba(255,255,255,0.18)]">
                      {Icon.uploadWhite}
                    </span>
                    Import CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
