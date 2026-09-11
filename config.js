// ============================================================
// BAM DIGITAL — Konfigurasi Global
// File ini hanya berisi data global yang dibutuhkan semua halaman.
// Daftar project dibaca dari /projects.json (fetch async).
// ============================================================

window.BAM_CONFIG = {
  // Brand
  brand: {
    name: "BAM DIGITAL",
    logo: "/assets/Logo_BAM_Transparant.png"
  },

  // Social Media
  social: {
    whatsapp: "https://api.whatsapp.com/send/?phone=6289697523717",
    tiktok:   "https://www.tiktok.com/@bam.digital",
    youtube:  "https://www.youtube.com/@project_bam_yt",
    discord:  "https://discord.gg/rRAAYrYwPq"
  },

  // Tampilan ikon sosial
  socialLinks: [
    { id: "whatsapp", icon: "fa-whatsapp", label: "WhatsApp", color: "#25d366" },
    { id: "discord",  icon: "fa-discord",  label: "Discord",  color: "#5865f2" },
    { id: "tiktok",   icon: "fa-tiktok",   label: "TikTok",   color: "#111827" },
    { id: "youtube",  icon: "fa-youtube",  label: "YouTube",  color: "#ff0000" }
  ],

  // Navigasi global — dipakai otomatis di semua halaman (homepage & project)
  nav: {
    logoHref: "/index.html",
    links: [
      { label: "Home", href: "/index.html" }
    ],
    cta: { label: "Kontak Admin" }
  },

  // Sumber data testimoni dari GitHub
  testimonialSource: {
    githubUser:   "bam-source",
    githubRepo:   "BAM_PROJECT",
    githubFolder: "testimoni"
  }
};
