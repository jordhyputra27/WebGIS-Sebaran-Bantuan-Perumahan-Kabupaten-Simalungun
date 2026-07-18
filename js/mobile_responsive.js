/* =========================================================
   REVISI 28 - Orkestrasi panel mobile
   - kondisi awal langsung tertutup sebelum first paint;
   - panel statistik dan panel informasi tidak dibuka bersamaan;
   - klik wilayah membuka bottom sheet pada kartu informasi;
   - bottom sheet hanya setinggi satu kartu dan dapat discroll.
   ========================================================= */
(function () {
    'use strict';

    var MOBILE_QUERY = '(max-width: 600px), (max-height: 520px) and (max-width: 950px)';
    var mobileMql = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : { matches: false };
    var mobileInitialized = false;

    function isMobile() {
        return !!(mobileMql && mobileMql.matches);
    }

    function refreshCharts() {
        if (typeof window.Chart === 'undefined') return;

        ['chartKecamatan', 'chartJenis', 'chartTahun'].forEach(function (id) {
            var canvas = document.getElementById(id);
            var chart = canvas ? Chart.getChart(canvas) : null;
            if (!chart) return;

            chart.options.responsive = true;
            chart.options.maintainAspectRatio = false;
            chart.options.layout = chart.options.layout || {};
            chart.options.layout.padding = { top: 3, right: 6, bottom: 5, left: 4 };
            chart.options.plugins = chart.options.plugins || {};
            chart.options.plugins.legend = chart.options.plugins.legend || {};

            if (id === 'chartKecamatan') {
                chart.options.plugins.legend.display = false;
                chart.options.scales = chart.options.scales || {};
                chart.options.scales.x = chart.options.scales.x || {};
                chart.options.scales.y = chart.options.scales.y || {};
                chart.options.scales.x.ticks = chart.options.scales.x.ticks || {};
                chart.options.scales.y.ticks = chart.options.scales.y.ticks || {};
                chart.options.scales.x.ticks.font = { size: 10 };
                chart.options.scales.y.ticks.font = { size: 10 };
                chart.options.scales.y.ticks.autoSkip = false;
            }

            if (id === 'chartJenis') {
                chart.options.plugins.legend.display = true;
                chart.options.plugins.legend.position = 'top';
                chart.options.plugins.legend.maxHeight = 64;
                chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
                chart.options.plugins.legend.labels.boxWidth = 16;
                chart.options.plugins.legend.labels.boxHeight = 8;
                chart.options.plugins.legend.labels.padding = 8;
                chart.options.plugins.legend.labels.font = { size: 11 };
                chart.options.cutout = '58%';
                chart.options.radius = '78%';
            }

            if (id === 'chartTahun') {
                chart.options.plugins.legend.display = true;
                chart.options.plugins.legend.position = 'top';
                chart.options.plugins.legend.maxHeight = 46;
                chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
                chart.options.plugins.legend.labels.boxWidth = 18;
                chart.options.plugins.legend.labels.font = { size: 11 };
                chart.options.scales = chart.options.scales || {};
                chart.options.scales.x = chart.options.scales.x || {};
                chart.options.scales.y = chart.options.scales.y || {};
                chart.options.scales.x.ticks = chart.options.scales.x.ticks || {};
                chart.options.scales.y.ticks = chart.options.scales.y.ticks || {};
                chart.options.scales.x.ticks.font = { size: 10 };
                chart.options.scales.y.ticks.font = { size: 10 };
            }

            chart.resize();
            chart.update('none');
        });
    }

    function refreshMapSize() {
        if (window.map && typeof window.map.invalidateSize === 'function') {
            window.setTimeout(function () { window.map.invalidateSize(); }, 80);
            window.setTimeout(function () { window.map.invalidateSize(); }, 300);
        }
        window.setTimeout(refreshCharts, 120);
        window.setTimeout(refreshCharts, 380);
    }

    function setMobileViewportHeight() {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    }

    function rawSetPanelState(panelName, closed) {
        var dashboard = document.getElementById('dashboard');
        if (!dashboard) return;

        if (panelName === 'top') {
            var stat = document.getElementById('stat-card-container');
            var topBtn = document.getElementById('toggleTopPanel');
            if (stat) stat.classList.toggle('stat-hidden', closed);
            dashboard.classList.toggle('top-panel-collapsed', closed);
            if (topBtn) {
                topBtn.innerHTML = closed ? '▼' : '▲';
                topBtn.setAttribute('aria-label', closed ? 'Buka panel statistik' : 'Tutup panel statistik');
                topBtn.setAttribute('aria-expanded', closed ? 'false' : 'true');
            }
        }

        if (panelName === 'bottom') {
            var bottom = document.getElementById('dashboard-bottom');
            var bottomBtn = document.getElementById('toggleBottomPanel');
            if (bottom) bottom.classList.toggle('bottom-hidden', closed);
            dashboard.classList.toggle('bottom-panel-collapsed', closed);
            if (bottomBtn) {
                bottomBtn.innerHTML = closed ? '▲' : '▼';
                bottomBtn.setAttribute('aria-label', closed ? 'Buka panel grafik dan informasi' : 'Tutup panel grafik dan informasi');
                bottomBtn.setAttribute('aria-expanded', closed ? 'false' : 'true');
            }
        }
    }

    function rawSetFilterState(closed) {
        var dashboard = document.getElementById('dashboard');
        var btn = document.getElementById('toggleFilterPanel');
        if (!dashboard) return;

        dashboard.classList.toggle('filter-panel-collapsed', closed);
        dashboard.classList.toggle('filter-panel-expanded', !closed);

        if (btn) {
            btn.innerHTML = closed ? '☰ Filter Data' : '× Tutup Filter';
            btn.setAttribute('aria-label', closed ? 'Buka filter data' : 'Tutup filter data');
            btn.setAttribute('aria-expanded', closed ? 'false' : 'true');
        }
    }

    function setPanelState(panelName, closed) {
        /* Mobile memakai pola eksklusif: membuka satu panel menutup panel lain.
           Ini menjaga peta tetap terlihat dan mencegah panel bertumpuk. */
        if (isMobile() && !closed) {
            if (panelName === 'top') {
                rawSetPanelState('bottom', true);
                rawSetFilterState(true);
            } else if (panelName === 'bottom') {
                rawSetPanelState('top', true);
                rawSetFilterState(true);
            }
        }

        rawSetPanelState(panelName, closed);
        refreshMapSize();
    }

    function setFilterState(closed) {
        if (isMobile() && !closed) {
            /* Filter boleh terbuka di atas peta, tetapi panel statistik ditutup
               agar pilihan tidak bertumpuk dengan kartu statistik. */
            rawSetPanelState('top', true);
        }
        rawSetFilterState(closed);
        refreshMapSize();
    }

    function togglePanel(panelName) {
        var closed;
        if (panelName === 'top') {
            var stat = document.getElementById('stat-card-container');
            closed = !!(stat && stat.classList.contains('stat-hidden'));
        } else {
            var bottom = document.getElementById('dashboard-bottom');
            closed = !!(bottom && bottom.classList.contains('bottom-hidden'));
        }
        setPanelState(panelName, !closed);
    }

    function scrollInformationToTop() {
        var bottom = document.getElementById('dashboard-bottom');
        var info = document.getElementById('infoDesa');
        if (bottom) bottom.scrollTop = 0;
        if (info) info.scrollTop = 0;
    }

    function openInformationPanel() {
        if (!isMobile()) return false;

        rawSetPanelState('top', true);
        rawSetFilterState(true);
        rawSetPanelState('bottom', false);

        window.requestAnimationFrame(function () {
            scrollInformationToTop();
            refreshMapSize();
        });
        window.setTimeout(scrollInformationToTop, 80);
        window.setTimeout(refreshCharts, 140);
        return true;
    }

    function closeInitialMobilePanels() {
        rawSetPanelState('top', true);
        rawSetPanelState('bottom', true);
        rawSetFilterState(true);
    }

    function restoreDesktopPanels() {
        var dashboard = document.getElementById('dashboard');
        var stat = document.getElementById('stat-card-container');
        var bottom = document.getElementById('dashboard-bottom');
        if (!dashboard) return;

        dashboard.classList.remove(
            'mobile-layout',
            'top-panel-collapsed',
            'bottom-panel-collapsed',
            'filter-panel-collapsed',
            'filter-panel-expanded',
            'mobile-pseudo-fullscreen'
        );
        if (stat) stat.classList.remove('stat-hidden');
        if (bottom) bottom.classList.remove('bottom-hidden');

        var topBtn = document.getElementById('toggleTopPanel');
        var bottomBtn = document.getElementById('toggleBottomPanel');
        var filterBtn = document.getElementById('toggleFilterPanel');
        if (topBtn) topBtn.innerHTML = '▲';
        if (bottomBtn) bottomBtn.innerHTML = '▼';
        if (filterBtn) {
            filterBtn.innerHTML = '☰ Filter Data';
            filterBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function removePreinitGuard() {
        document.documentElement.classList.remove('webgis-mobile-preinit');
    }

    function initMobileDashboard() {
        var dashboard = document.getElementById('dashboard');
        if (!dashboard) {
            removePreinitGuard();
            return;
        }

        setMobileViewportHeight();

        if (isMobile()) {
            dashboard.classList.add('mobile-layout');
            if (!mobileInitialized) {
                closeInitialMobilePanels();
                mobileInitialized = true;
            }
        } else {
            mobileInitialized = false;
            restoreDesktopPanels();
        }

        /* Kelas awal dilepas hanya setelah status tertutup sudah diterapkan,
           sehingga tidak ada frame yang menampilkan kedua panel terbuka. */
        removePreinitGuard();
        refreshMapSize();
    }

    function hideEmptyQgisInfoControl() {
        document.querySelectorAll('.leaflet-control.info').forEach(function (el) {
            if (!el.textContent || !el.textContent.trim()) {
                el.style.display = 'none';
                el.style.width = '0';
                el.style.height = '0';
                el.style.padding = '0';
                el.style.margin = '0';
            }
        });
    }

    function bindFilterToggle() {
        var btn = document.getElementById('toggleFilterPanel');
        var dashboard = document.getElementById('dashboard');
        if (!btn || !dashboard || btn._webgisMobileBound) return;

        btn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isMobile()) return;
            var isExpanded = dashboard.classList.contains('filter-panel-expanded');
            setFilterState(isExpanded);
        });
        btn._webgisMobileBound = true;
    }

    window.WebGISMobilePanels = {
        isMobile: isMobile,
        setPanelState: setPanelState,
        setFilterState: setFilterState,
        togglePanel: togglePanel,
        openInformationPanel: openInformationPanel,
        refresh: refreshMapSize
    };

    document.addEventListener('DOMContentLoaded', function () {
        bindFilterToggle();
        initMobileDashboard();
        hideEmptyQgisInfoControl();
        window.setTimeout(refreshCharts, 160);
        window.setTimeout(refreshCharts, 800);
    });

    if (mobileMql && typeof mobileMql.addEventListener === 'function') {
        mobileMql.addEventListener('change', initMobileDashboard);
    } else if (mobileMql && typeof mobileMql.addListener === 'function') {
        mobileMql.addListener(initMobileDashboard);
    }

    window.addEventListener('resize', function () {
        setMobileViewportHeight();
        initMobileDashboard();
    }, { passive: true });

    window.addEventListener('orientationchange', function () {
        window.setTimeout(initMobileDashboard, 220);
        window.setTimeout(initMobileDashboard, 650);
    }, { passive: true });

    window.addEventListener('load', function () {
        hideEmptyQgisInfoControl();
        window.setTimeout(refreshCharts, 240);
        window.setTimeout(refreshCharts, 1000);
    });
})();
