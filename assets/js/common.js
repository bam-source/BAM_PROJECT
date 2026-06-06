(function () {
    const config = window.BAM_CONFIG;

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function hasVideoValue(value) {
        const text = String(value ?? "").trim();
        return Boolean(text && text !== "-");
    }

    function getYoutubeIdFromUrl(url) {
        const host = url.hostname.replace(/^www\./, "").toLowerCase();
        if (host === "youtu.be") {
            return url.pathname.split("/").filter(Boolean)[0] || "";
        }
        if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
            const queryId = url.searchParams.get("v");
            if (queryId) return queryId;
            const parts = url.pathname.split("/").filter(Boolean);
            const marker = parts.findIndex(part => ["embed", "shorts", "live"].includes(part));
            if (marker >= 0 && parts[marker + 1]) return parts[marker + 1];
        }
        return "";
    }

    function getVideoPlatform(url) {
        const host = url.hostname.replace(/^www\./, "").toLowerCase();
        if (host === "youtu.be" || host.includes("youtube.com") || host.includes("youtube-nocookie.com")) return "youtube";
        if (host.includes("tiktok.com")) return "tiktok";
        if (host.includes("instagram.com")) return "instagram";
        return "link";
    }

    function videoIcon(platform) {
        if (platform === "youtube") return "fa-brands fa-youtube";
        if (platform === "tiktok") return "fa-brands fa-tiktok";
        if (platform === "instagram") return "fa-brands fa-instagram";
        return "fa-solid fa-play";
    }

    function normalizeVideo(value) {
        if (!hasVideoValue(value)) return null;
        const raw = String(value).trim();
        const withProtocol = raw.startsWith("www.") ? `https://${raw}` : raw;
        const knownHostWithoutProtocol = /^(youtube\.com|youtu\.be|tiktok\.com|instagram\.com)\//i.test(withProtocol);
        const candidate = knownHostWithoutProtocol ? `https://${withProtocol}` : withProtocol;

        if (/^https?:\/\//i.test(candidate)) {
            try {
                const parsed = new URL(candidate);
                if (!["http:", "https:"].includes(parsed.protocol)) return null;
                const platform = getVideoPlatform(parsed);
                const youtubeId = getYoutubeIdFromUrl(parsed);
                return {
                    raw,
                    url: parsed.href,
                    platform,
                    youtubeId,
                    icon: videoIcon(platform)
                };
            } catch (error) {
                return null;
            }
        }

        if (!/^[A-Za-z0-9_-]{6,}$/.test(raw)) return null;
        return {
            raw,
            url: `https://youtube.com/watch?v=${raw}`,
            platform: "youtube",
            youtubeId: raw,
            icon: videoIcon("youtube")
        };
    }

    function isValidVideoId(videoId) {
        return Boolean(normalizeVideo(videoId));
    }

    function videoThumb(source, fallback = "") {
        const video = normalizeVideo(source);
        if (video?.youtubeId) return `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
        return fallback || config.brand.logo || "";
    }

    function youtubeThumb(videoId, fallback = "") {
        return videoThumb(videoId, fallback);
    }

    function getCategory(id) {
        return window.BAM_CATEGORIES?.[id] || null;
    }

    function getCategories() {
        return (config.categories || [])
            .map(category => ({ ...category, ...(getCategory(category.id) || {}) }))
            .filter(category => category.id);
    }

    function getAllProducts() {
        return getCategories().flatMap(category =>
            (category.products || []).map(product => ({ ...product, category }))
        );
    }

    function renderNav(activeId = "") {
        const nav = document.getElementById("site-nav");
        if (!nav) return;
        nav.className = "site-nav";
        nav.innerHTML = `
            <div class="nav-inner">
                <a href="index.html" class="nav-logo" data-close-nav>
                    <span class="logo-icon"><img src="${config.brand.logo}" alt="${escapeHtml(config.brand.name)}"></span>
                    <span class="logo-text">BAM<span>PROJECT</span></span>
                </a>
                <button class="nav-menu-btn" type="button" data-nav-toggle aria-label="Buka menu navigasi">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <div class="nav-links">
                    <a href="index.html" class="nav-link${!activeId ? " is-active" : ""}" data-close-nav>Home</a>
                    ${getCategories().map(category => `
                        <a href="${category.href}" class="nav-link${activeId === category.id ? " is-active" : ""}" data-close-nav>
                            ${escapeHtml(category.name)}
                        </a>
                    `).join("")}
                    <button class="nav-cta" type="button" data-open-contact>
                        <i class="fa-solid fa-headset"></i> Kontak Admin
                    </button>
                </div>
            </div>
        `;
    }

    function renderGlobalModals() {
        const mount = document.getElementById("global-modals");
        if (!mount) return;
        mount.innerHTML = `
            <div id="contact-modal" class="modal-overlay" data-modal-overlay="contact">
                <div class="contact-box">
                    <button class="modal-close" type="button" data-close-contact><i class="fa-solid fa-xmark"></i></button>
                    <div class="contact-title">Kontak <span class="text-red">Admin</span></div>
                    <div class="contact-list" id="contact-list"></div>
                </div>
            </div>
            <div id="lightbox" class="lightbox">
                <img id="lightbox-img" src="" alt="Testimoni Preview">
            </div>
        `;
        renderContactList();
    }

    function renderContactList() {
        const list = document.getElementById("contact-list");
        if (!list) return;
        list.innerHTML = config.socialLinks.map(link => `
            <a class="contact-item" href="${config.social[link.id]}" target="_blank" rel="noopener">
                <i class="fa-brands ${link.icon}" style="color:${link.color};"></i>
                ${escapeHtml(link.label)}
            </a>
        `).join("");
    }

    function renderSocialPills(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;
        target.innerHTML = config.socialLinks.map(link => `
            <button class="social-pill" type="button" data-social="${link.id}">
                <i class="fa-brands ${link.icon}" style="color:${link.color};"></i>
                <span>${escapeHtml(link.label)}</span>
            </button>
        `).join("");
    }

    async function renderTestimonials(targetId = "testi-scroll-container") {
        const container = document.getElementById(targetId);
        if (!container) return;
        const source = config.testimonialSource;
        container.innerHTML = `<div style="padding:16px;color:var(--dim);font-family:'Rajdhani',sans-serif;font-size:13px;">Memuat testimoni...</div>`;
        try {
            const url = `https://api.github.com/repos/${source.githubUser}/${source.githubRepo}/contents/${source.githubFolder}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Gagal fetch testimoni");
            const files = await res.json();
            const images = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name));
            if (!images.length) {
                container.innerHTML = `<div style="padding:16px;color:var(--dim);font-family:'Rajdhani',sans-serif;font-size:13px;">Testimoni tersedia melalui Discord resmi.</div>`;
                return;
            }
            const stars = '<i class="fa-solid fa-star" style="color:var(--red-bright);font-size:7px;"></i>'.repeat(5);
            container.innerHTML = images.map(file => {
                const proxied = "https://images.weserv.nl/?url=" + encodeURIComponent(file.download_url);
                return `
                    <div class="testi-card" data-lightbox="${proxied}">
                        <img src="${proxied}" alt="Testimoni" loading="lazy">
                        <div class="testi-overlay"></div>
                        <div class="testi-info">
                            <div class="testi-verified"><div class="testi-verified-dot"></div><span>Verified</span></div>
                            <div class="testi-stars">${stars}</div>
                        </div>
                    </div>
                `;
            }).join("");
        } catch (error) {
            container.innerHTML = `<div style="padding:16px;color:var(--dim);font-family:'Rajdhani',sans-serif;font-size:13px;">Gagal memuat testimoni.</div>`;
        }
    }

    function openContact() {
        document.getElementById("contact-modal")?.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeContact() {
        document.getElementById("contact-modal")?.classList.remove("open");
        if (!document.querySelector(".modal-overlay.open, .lightbox.open")) {
            document.body.style.overflow = "";
        }
    }

    function openLightbox(url) {
        const img = document.getElementById("lightbox-img");
        const lightbox = document.getElementById("lightbox");
        if (!img || !lightbox) return;
        img.src = url;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        document.getElementById("lightbox")?.classList.remove("open");
        if (!document.querySelector(".modal-overlay.open, .lightbox.open")) {
            document.body.style.overflow = "";
        }
    }

    function goTo(key) {
        const url = config.social[key];
        if (url) window.open(url, "_blank", "noopener");
    }

    function bindCommonEvents() {
        document.addEventListener("click", event => {
            const toggle = event.target.closest("[data-nav-toggle]");
            if (toggle) {
                document.getElementById("site-nav")?.classList.toggle("nav-open");
                return;
            }
            if (event.target.closest("[data-close-nav]")) {
                document.getElementById("site-nav")?.classList.remove("nav-open");
            }
            if (event.target.closest("[data-open-contact]")) {
                openContact();
                document.getElementById("site-nav")?.classList.remove("nav-open");
                return;
            }
            if (event.target.closest("[data-close-contact]")) {
                closeContact();
                return;
            }
            if (event.target.matches('[data-modal-overlay="contact"]')) {
                closeContact();
                return;
            }
            const social = event.target.closest("[data-social]");
            if (social) {
                goTo(social.dataset.social);
                return;
            }
            const lightboxCard = event.target.closest("[data-lightbox]");
            if (lightboxCard) {
                openLightbox(lightboxCard.dataset.lightbox);
                return;
            }
            if (event.target.closest("#lightbox")) {
                closeLightbox();
            }
        });
    }

    function initCommon(activeId = "") {
        renderNav(activeId);
        renderGlobalModals();
        bindCommonEvents();
    }

    window.BAM = {
        config,
        escapeHtml,
        isValidVideoId,
        normalizeVideo,
        videoThumb,
        youtubeThumb,
        getCategory,
        getCategories,
        getAllProducts,
        renderNav,
        renderSocialPills,
        renderTestimonials,
        initCommon,
        openContact,
        closeContact,
        goTo
    };
})();
