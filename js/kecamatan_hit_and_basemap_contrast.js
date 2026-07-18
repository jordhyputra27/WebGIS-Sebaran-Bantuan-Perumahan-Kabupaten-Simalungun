/* =========================================================
   Revisi 40
   1) Kontras layer pada basemap terang tetap lembut dan terbaca.
   2) Area interaksi batas kecamatan diperlebar secara transparan.
   3) Saat kursor mendekati batas, seluruh garis kecamatan terkait
      diberi highlight; klik tetap membuka informasi kecamatan.
   4) Perangkat sentuh tetap memakai interaksi klik tanpa hover semu.
   ========================================================= */
(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        } else {
            callback();
        }
    }

    ready(function () {
        if (typeof window.L === 'undefined' || typeof window.map === 'undefined') return;

        var map = window.map;
        var thematicConfigs = [
            { layer: 'layer_InformasiWilayah_12', style: 'style_InformasiWilayah_12_0', pane: 'pane_InformasiWilayah_12' }
        ];

        var lightBasemaps = [
            window.layer_ESRITopo_3,
            window.layer_OSMStandard_2,
            window.layer_GoogleRoad_0
        ].filter(Boolean);

        var satelliteBasemaps = [
            window.layer_ESRISatellite_4,
            window.layer_GoogleSatellite_1
        ].filter(Boolean);

        /* Warna untuk basemap terang: cukup kontras, tetapi tidak terlalu pekat. */
        var lightColorMap = {
            '240,240,240': '#f1f3f5',
            '255,255,255': '#f1f3f5',
            '255,213,79': '#f3c94b',
            '251,140,0': '#ee922f',
            '166,118,29': '#b47a22',
            '92,107,192': '#6978c9',
            '236,64,122': '#df5b8b',
            '186,104,200': '#ad62bf',
            '253,193,192': '#efaaa8',
            '255,0,3': '#e34b4d',
            '194,232,255': '#8dd2f1',
            '31,120,180': '#3f8fc4',
            '116,196,118': '#6fbd74'
        };

        function isLayerActive(layer) {
            return !!(layer && map.hasLayer(layer));
        }

        function getBasemapMode() {
            /* Basemap satelit mempertahankan style asli. */
            if (satelliteBasemaps.some(isLayerActive)) return 'satellite';
            if (lightBasemaps.some(isLayerActive)) return 'light';
            return 'satellite';
        }

        function rgbKey(color) {
            var match = String(color || '').match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            return match ? [match[1], match[2], match[3]].join(',') : '';
        }

        function adaptStyle(original, mode) {
            var style = Object.assign({}, original || {});
            if (mode !== 'light') return style;

            var key = rgbKey(style.fillColor);
            if (lightColorMap[key]) style.fillColor = lightColorMap[key];

            /* Jangan menebalkan polygon. Garis dibuat tipis dan semi-transparan. */
            style.fillOpacity = 0.78;
            style.opacity = 0.72;
            style.weight = 0.72;
            style.color = '#66717b';
            style.lineCap = 'round';
            style.lineJoin = 'round';
            return style;
        }

        function applyThematicContrast() {
            var mode = getBasemapMode();

            thematicConfigs.forEach(function (config) {
                var group = window[config.layer];
                var styleFn = window[config.style];
                var pane = map.getPane(config.pane);

                /* Gunakan compositing normal pada semua basemap. Hard-light dapat membuat
                   warna layer lama seolah muncul ketika overlay hover bergerak. */
                if (pane) pane.style.mixBlendMode = 'normal';
                if (!group || typeof group.eachLayer !== 'function' || typeof styleFn !== 'function') return;

                group.eachLayer(function (featureLayer) {
                    if (!featureLayer || typeof featureLayer.setStyle !== 'function' || !featureLayer.feature) return;

                    var applyToFeature = function () {
                        /* Jangan menimpa style interaksi yang sedang aktif.
                           Timer kontras awal sebelumnya dapat menghapus hover
                           pertama beberapa milidetik setelah kursor masuk. */
                        if (featureLayer._webgisHoverActive ||
                            featureLayer._webgisSelectedActive ||
                            featureLayer._webgisDistrictHoverActive) return;
                        var original = styleFn(featureLayer.feature) || {};
                        var adapted = adaptStyle(original, getBasemapMode());
                        /* Simpan style visual aktif sebagai satu-satunya style dasar.
                           Dengan demikian mouseout tidak dapat mengembalikan warna
                           layer utama ketika filter sedang aktif. */
                        featureLayer._webgisBaseStyle = Object.assign({}, adapted);
                        featureLayer._webgisStyleRevision = window._webgisStyleRevision || 0;
                        featureLayer.setStyle(adapted);
                    };

                    applyToFeature();

                    /* Revisi 40: jangan pasang pemulihan style pada mouseout.
                       Hover sekarang digambar pada overlay SVG terpisah dan sama sekali
                       tidak mengubah polygon sumber. Listener lama di sini menyimpan
                       styleFn saat halaman pertama dibuka; setelah filter aktif,
                       mouseout kemudian mengembalikan warna layer utama yang sudah
                       kedaluwarsa. Kontras cukup diperbarui saat basemap/filter berubah. */
                    if (featureLayer._webgisAdaptiveMouseoutHandler) {
                        featureLayer.off('mouseout', featureLayer._webgisAdaptiveMouseoutHandler);
                        featureLayer._webgisAdaptiveMouseoutHandler = null;
                    }
                    featureLayer._adaptiveContrastBound = false;
                });
            });

            /* Batas kecamatan tetap tegas, tetapi tidak dibuat lebih tebal. */
            if (window.layer_BatasKecamatan_13 && typeof window.layer_BatasKecamatan_13.eachLayer === 'function') {
                window.layer_BatasKecamatan_13.eachLayer(function (districtLayer) {
                    if (!districtLayer || typeof districtLayer.setStyle !== 'function') return;
                    if (districtLayer._webgisDistrictHoverActive || districtLayer._webgisSelectedActive) return;
                    districtLayer.setStyle(getBasemapMode() === 'light'
                        ? { color: '#343a40', opacity: 0.88, weight: 1.0, fill: false }
                        : { color: 'rgba(35,35,35,1.0)', opacity: 1, weight: 1.0, fill: false });
                });
            }
        }

        var contrastTimer = null;
        function scheduleContrast() {
            window.clearTimeout(contrastTimer);
            contrastTimer = window.setTimeout(applyThematicContrast, 35);
        }

        window.refreshWebGISThematicContrast = function () {
            window.clearTimeout(contrastTimer);
            applyThematicContrast();
        };

        map.on('layeradd layerremove', scheduleContrast);
        ['filterTahun', 'filterJenis'].forEach(function (id) {
            var element = document.getElementById(id);
            if (element) element.addEventListener('change', scheduleContrast);
        });

        function cleanValue(value, fallback) {
            if (value === null || typeof value === 'undefined' || value === '') return fallback || '-';
            return String(value).trim();
        }

        function numberFrom(value) {
            var match = String(value === null || typeof value === 'undefined' ? '' : value).match(/[\d.,]+/);
            if (!match) return 0;
            var number = Number(match[0].replace(/\./g, '').replace(',', '.'));
            return isFinite(number) ? number : 0;
        }

        function districtProperty(props, fragment) {
            var wanted = String(fragment || '').toLowerCase();
            for (var key in props) {
                if (Object.prototype.hasOwnProperty.call(props, key) && key.toLowerCase().indexOf(wanted) !== -1) {
                    return props[key];
                }
            }
            return null;
        }

        function openBottomInformationPanel() {
            /* Mobile memakai pengelola panel tunggal agar panel statistik, filter,
               dan bottom sheet tidak saling menumpuk. */
            if (window.WebGISMobilePanels &&
                typeof window.WebGISMobilePanels.openInformationPanel === 'function' &&
                window.WebGISMobilePanels.openInformationPanel()) {
                return;
            }

            var dashboard = document.getElementById('dashboard');
            var bottom = document.getElementById('dashboard-bottom');
            var button = document.getElementById('toggleBottomPanel');

            if (bottom && bottom.classList.contains('bottom-hidden')) {
                bottom.classList.remove('bottom-hidden');
                if (dashboard) dashboard.classList.remove('bottom-panel-collapsed');
                if (button) {
                    button.innerHTML = '▼';
                    button.setAttribute('aria-label', 'Tutup panel grafik dan informasi');
                }
                window.setTimeout(function () {
                    if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
                }, 100);
            }
        }

        window.showInfoKecamatan = function (props) {
            props = props || {};
            var box = document.getElementById('infoDesa');
            var title = document.getElementById('infoTitle');
            if (!box) return;

            var name = cleanValue(props.WADMKC || props.Kecamatan, '-');
            var totalNagoriRaw = districtProperty(props, 'total_nagori');
            var penerimaRaw = districtProperty(props, 'jumlah_nagori_penerima');
            var bantuanRaw = districtProperty(props, 'jumlah bantuan');
            var totalNagori = numberFrom(totalNagoriRaw);
            var penerima = numberFrom(penerimaRaw);
            var belumMenerima = Math.max(totalNagori - penerima, 0);
            var cakupan = totalNagori > 0 ? ((penerima / totalNagori) * 100).toFixed(1) + '%' : '-';

            function row(label, value) {
                return '<div class="info-row"><span>' + label + '</span><strong>' + cleanValue(value, '-') + '</strong></div>';
            }

            var html = '';
            html += row('Kecamatan', name);
            html += row('Total Desa/Nagori', totalNagori ? totalNagori + ' Nagori' : cleanValue(totalNagoriRaw, '-'));
            html += row('Desa/Nagori Penerima', penerima + ' Nagori');
            html += row('Belum Menerima', belumMenerima + ' Nagori');
            html += row('Cakupan Desa Penerima', cakupan);
            html += row('Jumlah Bantuan', cleanValue(bantuanRaw, '0 Kali'));

            box.innerHTML = '<div class="desa-detail kecamatan-detail">' + html + '</div>';
            if (title) title.textContent = 'Informasi Kecamatan';
            openBottomInformationPanel();
        };

        /*
         * Area interaksi batas kecamatan diperlebar secara transparan.
         * Highlight diterapkan pada layer batas yang terlihat, sehingga
         * area tangkap tetap 10 px dan efek hover tidak berkedip.
         */
        if (window.json_BatasKecamatan_13 && window.layer_BatasKecamatan_13) {
            if (!map.getPane('pane_BatasKecamatanHit')) {
                map.createPane('pane_BatasKecamatanHit');
            }
            var hitPane = map.getPane('pane_BatasKecamatanHit');
            hitPane.style.zIndex = 414;
            hitPane.style.mixBlendMode = 'normal';
            hitPane.style.cursor = 'inherit';

            var visibleDistrictByName = {};
            window.layer_BatasKecamatan_13.eachLayer(function (districtLayer) {
                var props = districtLayer.feature && districtLayer.feature.properties;
                var name = props && props.WADMKC;
                if (name) visibleDistrictByName[String(name)] = districtLayer;

                /* Interaksi kecamatan hanya melalui hit-layer transparan.
                   Garis sumber tidak menangkap pointer agar tidak terjadi dua
                   rangkaian mouseover/mouseout pada posisi yang sama. */
                districtLayer.options = districtLayer.options || {};
                districtLayer.options.interactive = false;
                if (districtLayer._path) districtLayer._path.style.pointerEvents = 'none';
            });

            var activeDistrictHoverLayer = null;

            function districtBaseStyle() {
                return getBasemapMode() === 'light'
                    ? { color: '#343a40', opacity: 0.88, weight: 1.0, fill: false }
                    : { color: 'rgba(35,35,35,1.0)', opacity: 1, weight: 1.0, fill: false };
            }

            function resetDistrictHoverLayer(layer) {
                if (!layer) return;
                layer._webgisDistrictHoverActive = false;
                if (typeof window.clearWebGISHoverFeature === 'function') {
                    window.clearWebGISHoverFeature(layer);
                }
                if (activeDistrictHoverLayer === layer) activeDistrictHoverLayer = null;
            }

            var districtHitLayer = L.geoJSON(window.json_BatasKecamatan_13, {
                pane: 'pane_BatasKecamatanHit',
                interactive: true,
                bubblingMouseEvents: false,
                style: function () {
                    return {
                        color: '#000000',
                        opacity: 0.001,
                        weight: 10,
                        fill: false,
                        fillOpacity: 0,
                        lineCap: 'round',
                        lineJoin: 'round',
                        className: 'kecamatan-hit-path'
                    };
                },
                onEachFeature: function (feature, hitLayer) {
                    var props = feature.properties || {};
                    var name = cleanValue(props.WADMKC, 'Kecamatan');
                    var visibleLayer = visibleDistrictByName[String(name)];

                    var supportsHover = window.matchMedia &&
                        window.matchMedia('(hover: hover) and (pointer: fine)').matches;
                    var isPointerOver = false;

                    function applyDistrictHover() {
                        isPointerOver = true;
                        window.clearTimeout(contrastTimer);
                        if (!supportsHover || !visibleLayer || typeof visibleLayer.setStyle !== 'function') return;

                        /* Pastikan hanya satu kecamatan berstatus hover. Ini juga
                           membersihkan jejak bila mouseout sebelumnya terlewat. */
                        if (activeDistrictHoverLayer && activeDistrictHoverLayer !== visibleLayer) {
                            resetDistrictHoverLayer(activeDistrictHoverLayer);
                        }

                        activeDistrictHoverLayer = visibleLayer;
                        visibleLayer._webgisDistrictHoverActive = true;

                        /* Highlight kecamatan digambar sebagai overlay tunggal.
                           Garis batas sumber tidak pernah diubah, sehingga tidak
                           mungkin meninggalkan garis cyan dari hover sebelumnya. */
                        if (typeof window.showWebGISHoverFeature === 'function') {
                            window.showWebGISHoverFeature(feature, 'kecamatan', visibleLayer);
                        }
                    }

                    function clearDistrictHover() {
                        isPointerOver = false;
                        if (!supportsHover) return;
                        resetDistrictHoverLayer(visibleLayer);
                        scheduleContrast();
                    }

                    hitLayer.on({
                        mouseover: applyDistrictHover,
                        mouseout: clearDistrictHover,
                        click: function (event) {
                            if (event && event.originalEvent) {
                                event.originalEvent._webgisFeatureHandled = true;
                                if (L.DomEvent && typeof L.DomEvent.stop === 'function') {
                                    L.DomEvent.stop(event.originalEvent);
                                } else {
                                    L.DomEvent.stopPropagation(event.originalEvent);
                                    L.DomEvent.preventDefault(event.originalEvent);
                                }
                            }

                            window.showInfoKecamatan(props);

                            /* Gunakan polygon batas yang terlihat sebagai umpan balik langsung,
                               lalu gambar overlay seleksi pada pane paling atas. */
                            if (typeof window.selectWebGISFeature === 'function') {
                                window.selectWebGISFeature(feature, 'kecamatan', visibleLayer);
                            }
                            scheduleContrast();
                        }
                    });
                }
            });

            var mapContainer = map.getContainer && map.getContainer();
            if (mapContainer && !mapContainer._webgisDistrictHoverCleanupBound) {
                mapContainer.addEventListener('pointerleave', function () {
                    if (activeDistrictHoverLayer) resetDistrictHoverLayer(activeDistrictHoverLayer);
                }, true);
                mapContainer._webgisDistrictHoverCleanupBound = true;
            }

            window.layer_BatasKecamatanHit_21 = districtHitLayer;

            function syncDistrictHitLayer() {
                var boundaryVisible = map.hasLayer(window.layer_BatasKecamatan_13);
                var hitVisible = map.hasLayer(districtHitLayer);
                if (boundaryVisible && !hitVisible) map.addLayer(districtHitLayer);
                if (!boundaryVisible && hitVisible) map.removeLayer(districtHitLayer);
            }

            map.on('layeradd layerremove', function (event) {
                if (event.layer === window.layer_BatasKecamatan_13) {
                    window.setTimeout(syncDistrictHitLayer, 0);
                }
            });
            syncDistrictHitLayer();
        }

        scheduleContrast();
        window.setTimeout(scheduleContrast, 600);
        window.setTimeout(scheduleContrast, 1900);
    });
})();
