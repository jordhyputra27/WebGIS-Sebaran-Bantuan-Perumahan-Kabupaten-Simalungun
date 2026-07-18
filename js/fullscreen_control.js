document.addEventListener("DOMContentLoaded", function () {
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    const fullscreenTarget = document.getElementById("dashboard") || document.documentElement;
    const dashboard = document.getElementById("dashboard");

    function getFullscreenElement() {
        return document.fullscreenElement ||
               document.webkitFullscreenElement ||
               document.mozFullScreenElement ||
               document.msFullscreenElement;
    }

    function requestFullscreen(element) {
        if (element.requestFullscreen) return element.requestFullscreen();
        if (element.webkitRequestFullscreen) return element.webkitRequestFullscreen();
        if (element.mozRequestFullScreen) return element.mozRequestFullScreen();
        if (element.msRequestFullscreen) return element.msRequestFullscreen();
        return null;
    }

    function exitFullscreen() {
        if (document.exitFullscreen) return document.exitFullscreen();
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
        if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
        if (document.msExitFullscreen) return document.msExitFullscreen();
        return null;
    }

    function isMobileView() {
        return window.matchMedia && window.matchMedia('(max-width: 600px)').matches;
    }

    function isPseudoFullscreen() {
        return !!(dashboard && dashboard.classList.contains('mobile-pseudo-fullscreen'));
    }

    function refreshMapSize() {
        if (window.map && typeof window.map.invalidateSize === "function") {
            setTimeout(function () { window.map.invalidateSize(); }, 120);
            setTimeout(function () { window.map.invalidateSize(); }, 450);
        }
    }

    function setPseudoFullscreen(active) {
        if (!dashboard) return;
        dashboard.classList.toggle('mobile-pseudo-fullscreen', active);
        if (active) {
            dashboard.classList.add('top-panel-collapsed', 'bottom-panel-collapsed', 'filter-panel-collapsed');
            dashboard.classList.remove('filter-panel-expanded');
            const stat = document.getElementById('stat-card-container');
            const bottom = document.getElementById('dashboard-bottom');
            const topBtn = document.getElementById('toggleTopPanel');
            const bottomBtn = document.getElementById('toggleBottomPanel');
            const filterBtn = document.getElementById('toggleFilterPanel');
            if (stat) stat.classList.add('stat-hidden');
            if (bottom) bottom.classList.add('bottom-hidden');
            if (topBtn) topBtn.innerHTML = '▼';
            if (bottomBtn) bottomBtn.innerHTML = '▲';
            if (filterBtn) {
                filterBtn.innerHTML = '☰ Filter Data';
                filterBtn.setAttribute('aria-expanded', 'false');
            }
        }
        updateButtonState();
        refreshMapSize();
    }

    function updateButtonState() {
        if (!fullscreenBtn) return;
        const active = !!getFullscreenElement() || isPseudoFullscreen();
        fullscreenBtn.classList.toggle("is-fullscreen", active);
        fullscreenBtn.innerHTML = active ? "×" : "⛶";
        fullscreenBtn.setAttribute("title", active ? "Keluar mode peta penuh" : "Tampilkan mode peta penuh");
        fullscreenBtn.setAttribute("aria-label", active ? "Keluar mode peta penuh" : "Tampilkan mode peta penuh");
        refreshMapSize();
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (isPseudoFullscreen()) {
                setPseudoFullscreen(false);
                return;
            }

            if (getFullscreenElement()) {
                const result = exitFullscreen();
                if (result && typeof result.catch === "function") result.catch(function () {});
                return;
            }

            const result = requestFullscreen(fullscreenTarget);

            if (!result) {
                if (isMobileView()) setPseudoFullscreen(true);
                return;
            }

            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (isMobileView()) setPseudoFullscreen(true);
                });
            }
        });

        document.addEventListener("fullscreenchange", updateButtonState);
        document.addEventListener("webkitfullscreenchange", updateButtonState);
        document.addEventListener("mozfullscreenchange", updateButtonState);
        document.addEventListener("MSFullscreenChange", updateButtonState);
        updateButtonState();
    }
});
