(function () {
    let currentCategory = null;
    let activeProduct = null;

    function productPrice(product) {
        if (!product.price || product.price === "-") return "Info";
        return product.price;
    }

    function pickVideoSource(primary, fallback) {
        return window.BAM.isValidVideoId(primary) ? primary : fallback;
    }

    function openVideoUrl(url) {
        const video = window.BAM.normalizeVideo(url);
        if (video) window.open(video.url, "_blank", "noopener");
    }

    function getProductVideos(product) {
        return [
            {
                slot: 1,
                source: pickVideoSource(product.videoUrl, product.videoId),
                label: product.video1Label || "Cek Video",
                thumbnail: product.video1Thumbnail || product.image
            },
            {
                slot: 2,
                source: pickVideoSource(product.videoUrl2, product.videoId2),
                label: product.video2Label || "Cek Video",
                thumbnail: product.video2Thumbnail || product.image
            }
        ].map(item => {
            const video = window.BAM.normalizeVideo(item.source);
            if (!video) return null;
            return {
                ...item,
                video,
                thumbnail: window.BAM.videoThumb(item.source, item.thumbnail)
            };
        }).filter(Boolean);
    }

    function renderHero(category) {
        const eyebrow = document.getElementById("hero-eyebrow");
        const title = document.getElementById("hero-title");
        const desc = document.getElementById("hero-description");
        const stats = document.getElementById("hero-stats");

        if (eyebrow) eyebrow.textContent = category.hero?.eyebrow || "Kategori";
        if (title) {
            const lines = category.hero?.title || [category.name];
            title.innerHTML = lines.map((line, index) =>
                `<span${index === 1 ? ' class="text-red"' : ""}>${window.BAM.escapeHtml(line)}</span>`
            ).join("");
        }
        if (desc) desc.textContent = category.hero?.description || "";
        if (stats) {
            stats.innerHTML = (category.hero?.stats || []).map(item => {
                const value = item.value === "auto" ? (category.products || []).length : item.value;
                return `
                    <div class="hero-stat-card">
                        <div class="hero-stat-num">${window.BAM.escapeHtml(value)}</div>
                        <div class="hero-stat-label">${window.BAM.escapeHtml(item.label)}</div>
                    </div>
                `;
            }).join("");
        }
    }

    function renderNews(news = [], badge = "") {
        const visible = [...news].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
        if (!visible.length) return "";
        return `
            <div class="info-panel">
                <div class="info-panel-header">
                    <div class="info-panel-title"><i class="fa-solid fa-newspaper" style="color:var(--red-bright);"></i> Info & Update</div>
                    <span class="info-panel-badge">${window.BAM.escapeHtml(badge || `${visible.length} baru`)}</span>
                </div>
                <div class="news-list">
                    ${visible.map(item => `
                        <div class="news-item">
                            <div class="news-dot"></div>
                            <div>
                                <div class="news-meta">
                                    <span>${window.BAM.escapeHtml(item.tag || "Info")}</span>
                                    <span>${window.BAM.escapeHtml(item.date || "")}</span>
                                    ${item.pinned ? '<i class="fa-solid fa-thumbtack" style="font-size:8px;color:var(--red-bright);"></i>' : ""}
                                </div>
                                <div class="news-title">${window.BAM.escapeHtml(item.title)}</div>
                                <div class="news-desc">${window.BAM.escapeHtml(item.description || "")}</div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function renderInfoCards(cards = [], badge = "") {
        if (!cards.length) return "";
        return `
            <div class="info-panel">
                <div class="info-panel-header">
                    <div class="info-panel-title"><i class="fa-solid fa-newspaper" style="color:var(--red-bright);"></i> Info & Update</div>
                    <span class="info-panel-badge">${window.BAM.escapeHtml(badge)}</span>
                </div>
                <div class="info-card-grid">
                    ${cards.map(card => `
                        <div class="info-card">
                            <strong>${window.BAM.escapeHtml(card.title)}</strong>
                            <span>${window.BAM.escapeHtml(card.description)}</span>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function renderVideoPanel(title, videos = []) {
        const visible = videos.map(video => {
            const source = pickVideoSource(video.url, video.id);
            const normalized = window.BAM.normalizeVideo(source);
            if (!normalized) return null;
            return {
                ...video,
                source,
                normalized,
                thumbnail: window.BAM.videoThumb(source, video.thumbnail || video.image || window.BAM.config.brand.logo)
            };
        }).filter(Boolean);
        if (!visible.length) return "";
        return `
            <div class="info-panel">
                <div class="info-panel-header">
                    <div class="info-panel-title"><i class="fa-solid fa-video" style="color:var(--red-bright);"></i> ${window.BAM.escapeHtml(title)}</div>
                </div>
                <div class="video-grid">
                    ${visible.map(video => `
                        <div class="video-card" data-video-url="${window.BAM.escapeHtml(video.normalized.url)}">
                            <div class="video-thumb">
                                <img src="${window.BAM.escapeHtml(video.thumbnail)}" alt="${window.BAM.escapeHtml(video.title)}" loading="lazy">
                                <div class="video-play"><i class="${window.BAM.escapeHtml(video.normalized.icon)}"></i></div>
                            </div>
                            <div class="video-body">
                                <strong>${window.BAM.escapeHtml(video.title)}</strong>
                                <span>${window.BAM.escapeHtml(video.description || "Cek Video Sekarang")}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function renderLogoPanel(enabled) {
        if (!enabled) return "";
        return `
            <div class="logo-panel" aria-label="${window.BAM.escapeHtml(window.BAM.config.brand.name)}">
                <img src="${window.BAM.config.brand.logo}" alt="${window.BAM.escapeHtml(window.BAM.config.brand.name)}">
            </div>
        `;
    }

    function renderInfoUpdate(category) {
        const target = document.getElementById("category-info");
        if (!target) return;
        const info = category.infoUpdate || {};
        target.innerHTML = [
            renderNews(info.news, info.badge),
            renderInfoCards(info.cards, info.badge),
            renderVideoPanel("Video Demo", info.demoVideos),
            renderLogoPanel(info.logoPanel)
        ].join("");
    }

    function renderProducts(category) {
        const target = document.getElementById("product-list");
        if (!target) return;
        const getProductThumb = product => {
            if (category.productThumbnail === "image") return product.image;
            return window.BAM.videoThumb(pickVideoSource(product.videoUrl, product.videoId), product.image);
        };
        target.innerHTML = (category.products || []).map(product => `
            <button class="product-card" type="button" data-product-id="${window.BAM.escapeHtml(product.id)}">
                <div class="product-media">
                    <img src="${getProductThumb(product)}" alt="${window.BAM.escapeHtml(product.name)}" loading="lazy">
                </div>
                <div class="product-body">
                    <div class="product-title">${window.BAM.escapeHtml(product.name)}</div>
                    <div class="product-subtitle">${window.BAM.escapeHtml(product.subtitle || product.tag || "")}</div>
                    <div class="product-foot">
                        <span class="product-price">${window.BAM.escapeHtml(productPrice(product))}</span>
                        <span class="product-link">Detail <i class="fa-solid fa-chevron-right"></i></span>
                    </div>
                </div>
            </button>
        `).join("");
    }

    function renderCta(category) {
        const title = document.getElementById("category-cta-title");
        const desc = document.getElementById("category-cta-desc");
        if (title) title.innerHTML = window.BAM.escapeHtml(category.cta?.title || `Siap pilih ${category.name} terbaik?`).replace(category.name, `<span>${category.name}</span>`);
        if (desc) desc.textContent = category.cta?.description || "Hubungi admin untuk konsultasi dan order langsung";
        window.BAM.renderSocialPills("footer-social-container");
    }

    function renderModalVideos(product) {
        const videos = getProductVideos(product);
        const videoBlock = video => `
            <div class="video-card" data-product-video="${video.slot}">
                <div class="video-thumb">
                    <img src="${window.BAM.escapeHtml(video.thumbnail)}" alt="${window.BAM.escapeHtml(video.label)}">
                    <div class="video-play"><i class="${window.BAM.escapeHtml(video.video.icon)}"></i></div>
                </div>
            </div>
        `;
        const emptyBlock = `
            <div class="modal-video-empty">
                <i class="fa-solid fa-clapperboard"></i>
                <strong>Preview Tambahan</strong>
                <span>Tersedia melalui admin</span>
            </div>
        `;
        if (!videos.length) return emptyBlock;
        return videos.map(videoBlock).join("");
    }

    function openProduct(productId) {
        const product = (currentCategory.products || []).find(item => item.id === productId);
        if (!product) return;
        activeProduct = product;
        const modal = document.getElementById("product-modal");
        const details = product.details?.length ? product.details : [product.description].filter(Boolean);
        const specs = product.specs || [];
        modal.innerHTML = `
            <button class="modal-close" type="button" data-close-product><i class="fa-solid fa-xmark"></i></button>
            <div class="product-modal-media">
                <div class="modal-video-grid">${renderModalVideos(product)}</div>
            </div>
            <div class="product-modal-content">
                <div>
                    <h2 class="modal-title">${window.BAM.escapeHtml(product.name)}</h2>
                    <p class="modal-subtitle">${window.BAM.escapeHtml(product.description || product.subtitle || "")}</p>
                </div>
                <div class="modal-meta">
                    <div class="modal-meta-item">
                        <div class="modal-meta-label">Kategori</div>
                        <div class="modal-meta-value">${window.BAM.escapeHtml(currentCategory.name)}</div>
                    </div>
                    <div class="modal-meta-item">
                        <div class="modal-meta-label">Harga</div>
                        <div class="modal-meta-value modal-price">${window.BAM.escapeHtml(productPrice(product))}</div>
                    </div>
                    <div class="modal-meta-item">
                        <div class="modal-meta-label">Status</div>
                        <div class="modal-meta-value">${product.status === "soon" ? "Dalam Proses" : "Aktif"}</div>
                    </div>
                </div>
                <ul class="modal-list">
                    ${details.map(item => `<li><i class="fa-solid fa-check"></i><span>${window.BAM.escapeHtml(item)}</span></li>`).join("")}
                    ${specs.map(item => `<li><i class="fa-solid fa-circle-check"></i><span>${window.BAM.escapeHtml(item)}</span></li>`).join("")}
                </ul>
                <div class="modal-actions">
                    <button class="btn-primary" type="button" data-open-contact><i class="fa-solid fa-headset"></i> Kontak Admin</button>
                    <button class="btn-ghost" type="button" data-active-product-video><i class="fa-solid fa-play"></i> Cek Video</button>
                </div>
            </div>
        `;
        document.getElementById("product-modal-overlay")?.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeProduct() {
        document.getElementById("product-modal-overlay")?.classList.remove("open");
        activeProduct = null;
        if (!document.querySelector(".modal-overlay.open, .lightbox.open")) {
            document.body.style.overflow = "";
        }
    }

    function openProductVideo(slot = 1) {
        if (!activeProduct) return window.BAM.goTo("youtube");
        const video = getProductVideos(activeProduct).find(item => item.slot === slot) || getProductVideos(activeProduct)[0];
        if (video) {
            openVideoUrl(video.video.url);
            return;
        }
        window.BAM.goTo("youtube");
    }

    function bindCategoryEvents() {
        document.addEventListener("click", event => {
            const productCard = event.target.closest("[data-product-id]");
            if (productCard) {
                openProduct(productCard.dataset.productId);
                return;
            }
            if (event.target.closest("[data-close-product]")) {
                closeProduct();
                return;
            }
            if (event.target.id === "product-modal-overlay") {
                closeProduct();
                return;
            }
            const video = event.target.closest("[data-video-url]");
            if (video) {
                openVideoUrl(video.dataset.videoUrl);
                return;
            }
            const productVideo = event.target.closest("[data-product-video]");
            if (productVideo) {
                openProductVideo(Number(productVideo.dataset.productVideo));
                return;
            }
            if (event.target.closest("[data-active-product-video]")) {
                openProductVideo(1);
            }
        });
    }

    async function initCategoryPage() {
        const categoryId = document.body.dataset.categoryId;
        currentCategory = window.BAM.getCategory(categoryId);
        if (!currentCategory) return;
        window.BAM.initCommon(categoryId);
        renderHero(currentCategory);
        renderInfoUpdate(currentCategory);
        renderProducts(currentCategory);
        renderCta(currentCategory);
        bindCategoryEvents();
        await window.BAM.renderTestimonials();
    }

    window.addEventListener("DOMContentLoaded", initCategoryPage);
})();
