(function () {
    function formatPrice(price) {
        if (!price || price === "-") return "Dalam Proses";
        return price;
    }

    function renderHero(categories) {
        const products = window.BAM.getAllProducts();
        const active = products.filter(product => product.status !== "soon").length;
        const stats = document.getElementById("home-stats");
        if (!stats) return;
        stats.innerHTML = `
            <div class="metric"><strong>${categories.length}</strong><span>Kategori</span></div>
            <div class="metric"><strong>${products.length}</strong><span>Produk</span></div>
            <div class="metric"><strong>${active}</strong><span>Aktif</span></div>
        `;
    }

    function renderCategories(categories) {
        const target = document.getElementById("category-list");
        if (!target) return;
        target.innerHTML = categories.map(category => `
            <a class="category-card" href="${category.href}">
                <div>
                    <div class="category-name">${window.BAM.escapeHtml(category.name)}</div>
                    <p>${window.BAM.escapeHtml(category.description || "")}</p>
                </div>
                <span class="category-badge">${window.BAM.escapeHtml(category.label)}</span>
            </a>
        `).join("");
    }

    function renderProductCard(product) {
        return `
            <a class="product-card" href="${product.category.href}">
                <div class="product-media">
                    <img src="${product.image}" alt="${window.BAM.escapeHtml(product.name)}" loading="lazy">
                </div>
                <div class="product-body">
                    <div class="product-title">${window.BAM.escapeHtml(product.name)}</div>
                    <div class="product-subtitle">${window.BAM.escapeHtml(product.subtitle || product.tag || "")}</div>
                    <div class="product-foot">
                        <span class="product-price">${window.BAM.escapeHtml(formatPrice(product.price))}</span>
                        <span class="product-link">Detail <i class="fa-solid fa-chevron-right"></i></span>
                    </div>
                </div>
            </a>
        `;
    }

    function renderProducts(categories) {
        const target = document.getElementById("product-list");
        if (!target) return;
        target.innerHTML = categories.map(category => {
            const products = category.products || [];
            return `
                <section class="category-product-section">
                    <div class="category-product-head">
                        <div class="category-product-title">
                            <i class="fa-solid ${category.icon}" style="color:var(--red-bright);"></i>
                            <div>
                                <h3>${window.BAM.escapeHtml(category.name)}</h3>
                                <span>${products.length} produk</span>
                            </div>
                        </div>
                        <a class="product-link" href="${category.href}">Buka <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                    <div class="product-grid">
                        ${products.map(product => renderProductCard({ ...product, category })).join("")}
                    </div>
                </section>
            `;
        }).join("");
    }

    async function initHome() {
        const categories = window.BAM.getCategories();
        window.BAM.initCommon("");
        window.BAM.renderSocialPills("social-row");
        renderHero(categories);
        renderCategories(categories);
        renderProducts(categories);
        await window.BAM.renderTestimonials();
    }

    window.addEventListener("DOMContentLoaded", initHome);
})();
