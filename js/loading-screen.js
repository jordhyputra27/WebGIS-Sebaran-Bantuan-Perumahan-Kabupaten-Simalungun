/* Loading Screen WebGIS - Revisi 33 */
(function () {
    'use strict';

    var screen = document.getElementById('webgis-loading-screen');
    if (!screen) {
        document.documentElement.classList.remove('webgis-loading');
        return;
    }

    var startedAt = window.__webgisLoadingStartedAt || Date.now();
    var minimumVisibleTime = 4000;
    var isClosing = false;

    if (window.__webgisLoadingSafetyTimer) {
        window.clearTimeout(window.__webgisLoadingSafetyTimer);
    }

    function finishLoading() {
        if (isClosing) return;
        isClosing = true;

        var elapsed = Date.now() - startedAt;
        var remaining = Math.max(0, minimumVisibleTime - elapsed);

        window.setTimeout(function () {
            screen.classList.add('is-hidden');
            screen.setAttribute('aria-hidden', 'true');
            document.documentElement.classList.remove('webgis-loading');

            window.setTimeout(function () {
                if (screen.parentNode) screen.parentNode.removeChild(screen);
                if (window.map && typeof window.map.invalidateSize === 'function') {
                    window.map.invalidateSize(false);
                }
            }, 700);
        }, remaining);
    }

    if (document.readyState === 'complete') {
        finishLoading();
    } else {
        window.addEventListener('load', finishLoading, { once: true });
    }

    // Pengaman agar pengguna tidak terjebak pada layar pembuka bila aset eksternal lambat.
    window.setTimeout(finishLoading, 8000);
})();
