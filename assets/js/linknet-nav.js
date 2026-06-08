(function () {
    function addLinknetNav() {
        const navLinks = document.querySelector(".nav-links");
        if (!navLinks || navLinks.querySelector('[data-linknet-nav]')) return;

        const contactButton = navLinks.querySelector(".nav-cta");
        const link = document.createElement("a");
        link.href = "linknet/index.html";
        link.className = "nav-link";
        link.setAttribute("data-close-nav", "");
        link.setAttribute("data-linknet-nav", "");
        link.textContent = "LINK.NET";

        if (contactButton) {
            navLinks.insertBefore(link, contactButton);
        } else {
            navLinks.appendChild(link);
        }
    }

    window.addEventListener("DOMContentLoaded", function () {
        addLinknetNav();
        setTimeout(addLinknetNav, 100);
    });
})();
