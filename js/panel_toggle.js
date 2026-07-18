document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var dashboard = document.getElementById('dashboard');
    var stat = document.getElementById('stat-card-container');
    var topBtn = document.getElementById('toggleTopPanel');
    var bottom = document.getElementById('dashboard-bottom');
    var bottomBtn = document.getElementById('toggleBottomPanel');

    function refreshMapSize() {
        if (window.map && typeof window.map.invalidateSize === 'function') {
            window.setTimeout(function () { window.map.invalidateSize(); }, 80);
            window.setTimeout(function () { window.map.invalidateSize(); }, 300);
        }
        if (typeof window.Chart !== 'undefined') {
            ['chartKecamatan', 'chartJenis', 'chartTahun'].forEach(function (id) {
                var canvas = document.getElementById(id);
                var chart = canvas ? Chart.getChart(canvas) : null;
                if (!chart) return;
                window.setTimeout(function () { chart.resize(); chart.update('none'); }, 120);
                window.setTimeout(function () { chart.resize(); chart.update('none'); }, 360);
            });
        }
    }

    function mobileController() {
        var controller = window.WebGISMobilePanels;
        return controller && controller.isMobile && controller.isMobile() ? controller : null;
    }

    if (topBtn && stat && dashboard) {
        topBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            var controller = mobileController();
            if (controller) {
                controller.togglePanel('top');
                return;
            }

            var isClosed = stat.classList.toggle('stat-hidden');
            dashboard.classList.toggle('top-panel-collapsed', isClosed);
            topBtn.innerHTML = isClosed ? '▼' : '▲';
            topBtn.setAttribute('aria-label', isClosed ? 'Buka panel statistik' : 'Tutup panel statistik');
            refreshMapSize();
        });
    }

    if (bottomBtn && bottom && dashboard) {
        bottomBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            var controller = mobileController();
            if (controller) {
                controller.togglePanel('bottom');
                return;
            }

            var isClosed = bottom.classList.toggle('bottom-hidden');
            dashboard.classList.toggle('bottom-panel-collapsed', isClosed);
            bottomBtn.innerHTML = isClosed ? '▲' : '▼';
            bottomBtn.setAttribute('aria-label', isClosed ? 'Buka panel grafik dan informasi' : 'Tutup panel grafik dan informasi');
            refreshMapSize();
        });
    }
});
