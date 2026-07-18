/* =========================================================
   Revisi 41 - Panel informasi desa dibuka otomatis

   Perbaikan utama:
   - klik polygon tidak lagi langsung dibersihkan oleh event klik peta;
   - pilihan desa/kecamatan digambar pada pane khusus di atas layer tematik;
   - hover dan seleksi memakai garis luar, tanpa fill biru yang menutupi warna filter;
   - warna batas tetap menyesuaikan basemap aktif;
   - halo lembut memakai warna yang sama, tanpa garis jingga/kuning;
   - highlight tetap ada sampai wilayah lain dipilih, filter diubah,
     atau pengguna mengklik area kosong peta;
   - event hover dipasang segera setelah struktur peta tersedia, tanpa
     menunggu seluruh tile/gambar selesai dimuat;
   - style hover/seleksi dilindungi dari reset kontras basemap tertunda;
   - hanya satu polygon boleh berstatus hover dan jejak hover lama
     dipulihkan otomatis saat pointer berpindah atau keluar dari peta.
   ========================================================= */
(function(){
'use strict';

const originalStyle = new WeakMap();
let selectedLayer = null;
let hoverLayer = null;
let selectedFeature = null;
let selectedKind = null;
const activeHoverLayers = new Set();

function isActiveMapLayer(layer){
  return !!(layer && typeof window.map !== 'undefined' && window.map.hasLayer(layer));
}

function isSatelliteBasemapActive(){
  return isActiveMapLayer(window.layer_ESRISatellite_4) ||
    isActiveMapLayer(window.layer_GoogleSatellite_1);
}

function selectionPalette(kind){
  if(kind === 'kecamatan'){
    const satellite = isSatelliteBasemapActive();
    return {
      stroke: satellite ? '#00e5ff' : '#006fe6',
      fill: satellite ? '#00e5ff' : '#006fe6',
      weight: satellite ? 3.6 : 3.4,
      fillOpacity: 0
    };
  }

  return {
    stroke: '#0066ff',
    fill: '#3388ff',
    weight: 2.4,
    fillOpacity: 0.32
  };
}

function ensureSelectionManager(){
  if(window.WebGISSelection || typeof window.L === 'undefined' || typeof window.map === 'undefined'){
    return window.WebGISSelection || null;
  }

  const map = window.map;
  const haloPaneName = 'pane_WebGISSelectionHalo';
  const selectionPaneName = 'pane_WebGISSelection';
  if(!map.getPane(haloPaneName)) map.createPane(haloPaneName);
  if(!map.getPane(selectionPaneName)) map.createPane(selectionPaneName);

  const haloPane = map.getPane(haloPaneName);
  const selectionPane = map.getPane(selectionPaneName);
  haloPane.style.zIndex = '623';
  selectionPane.style.zIndex = '624';
  haloPane.style.pointerEvents = 'none';
  selectionPane.style.pointerEvents = 'none';
  haloPane.style.mixBlendMode = 'normal';
  selectionPane.style.mixBlendMode = 'normal';

  const haloRenderer = L.svg({pane:haloPaneName,padding:0.5});
  const selectionRenderer = L.svg({pane:selectionPaneName,padding:0.5});
  let activeFeature = null;
  let activeKind = null;

  const haloOverlay = L.geoJSON(null,{
    pane:haloPaneName,renderer:haloRenderer,interactive:false,bubblingMouseEvents:false,
    style:function(){
      const isKecamatan=activeKind==='kecamatan';
      const palette=selectionPalette(activeKind||'desa');
      return {color:palette.stroke,weight:palette.weight+(isKecamatan?3.0:2.4),opacity:0.22,
        fill:false,fillOpacity:0,lineCap:'round',lineJoin:'round',className:'webgis-selection-halo'};
    }
  }).addTo(map);

  const selectionOverlay = L.geoJSON(null,{
    pane:selectionPaneName,renderer:selectionRenderer,interactive:false,bubblingMouseEvents:false,
    style:function(){
      const isKecamatan=activeKind==='kecamatan';
      const palette=selectionPalette(activeKind||'desa');
      return {color:palette.stroke,weight:palette.weight,opacity:1,fill:false,fillOpacity:0,
        lineCap:'round',lineJoin:'round',className:'webgis-selected-region'};
    }
  }).addTo(map);

  function clear(){
    haloOverlay.clearLayers();
    selectionOverlay.clearLayers();
    activeFeature=null;
    activeKind=null;
  }

  function draw(feature,kind){
    haloOverlay.clearLayers();
    selectionOverlay.clearLayers();
    if(!feature||!feature.geometry){ activeFeature=null; activeKind=null; return; }
    activeFeature=feature;
    activeKind=kind||'desa';
    haloOverlay.addData(feature);
    selectionOverlay.addData(feature);
    if(haloOverlay.bringToFront) haloOverlay.bringToFront();
    if(selectionOverlay.bringToFront) selectionOverlay.bringToFront();
  }

  function redraw(){ if(activeFeature) draw(activeFeature,activeKind); }

  window.WebGISSelection={select:draw,clear:clear,redraw:redraw,hasSelection:function(){return !!activeFeature;}};

  if(!map._webgisSelectionBasemapBound){
    const basemapLayers=[window.layer_ESRISatellite_4,window.layer_GoogleSatellite_1,
      window.layer_ESRITopo_3,window.layer_OSMStandard_2,window.layer_GoogleRoad_0].filter(Boolean);
    map.on('layeradd layerremove',function(event){
      if(activeFeature&&event&&basemapLayers.indexOf(event.layer)!==-1) window.setTimeout(redraw,0);
    });
    map._webgisSelectionBasemapBound=true;
  }
  return window.WebGISSelection;
}

/* Hover digambar sebagai outline pada overlay SVG terpisah. Tidak ada fill
   hover, sehingga warna filter pada polygon utama selalu tetap terlihat dan
   tidak pernah tertutup oleh warna biru dari layer interaksi. */
function ensureHoverManager(){
  if(window.WebGISHover || typeof window.L === 'undefined' || typeof window.map === 'undefined'){
    return window.WebGISHover || null;
  }

  const map=window.map;
  const paneName='pane_WebGISHover';
  if(!map.getPane(paneName)) map.createPane(paneName);
  const pane=map.getPane(paneName);
  pane.style.zIndex='622';
  pane.style.pointerEvents='none';
  pane.style.mixBlendMode='normal';

  const renderer=L.svg({pane:paneName,padding:0.5});
  let activeFeature=null;
  let activeKind=null;
  let activeSourceLayer=null;

  /* Satu GeoJSON group dipertahankan sepanjang sesi. clearLayers()+addData()
     menghindari rangkaian layeradd/layerremove setiap mouse bergerak, yang
     sebelumnya memicu timer kontras dan dapat menampilkan jejak polygon lama. */
  const overlay=L.geoJSON(null,{
    pane:paneName,renderer:renderer,interactive:false,bubblingMouseEvents:false,
    style:function(){
      const isKecamatan=activeKind==='kecamatan';
      const palette=selectionPalette(activeKind||'desa');
      return {color:palette.stroke,weight:palette.weight+(isKecamatan?0.15:0.35),opacity:1,fill:false,fillOpacity:0,
        lineCap:'round',lineJoin:'round',className:'webgis-hover-region'};
    }
  }).addTo(map);

  function clear(sourceLayer){
    if(sourceLayer&&activeSourceLayer&&sourceLayer!==activeSourceLayer) return;
    overlay.clearLayers();
    activeFeature=null;
    activeKind=null;
    activeSourceLayer=null;
  }

  function draw(feature,kind,sourceLayer){
    overlay.clearLayers();
    if(!feature||!feature.geometry){ clear(); return; }
    activeFeature=feature;
    activeKind=kind||'desa';
    activeSourceLayer=sourceLayer||null;
    overlay.addData(feature);
    if(overlay.bringToFront) overlay.bringToFront();
  }

  function redraw(){ if(activeFeature) draw(activeFeature,activeKind,activeSourceLayer); }
  window.WebGISHover={show:draw,clear:clear,redraw:redraw,getSourceLayer:function(){return activeSourceLayer;}};

  if(!map._webgisHoverBasemapBound){
    const basemapLayers=[window.layer_ESRISatellite_4,window.layer_GoogleSatellite_1,
      window.layer_ESRITopo_3,window.layer_OSMStandard_2,window.layer_GoogleRoad_0].filter(Boolean);
    map.on('layeradd layerremove',function(event){
      if(activeFeature&&event&&basemapLayers.indexOf(event.layer)!==-1) window.setTimeout(redraw,0);
    });
    map._webgisHoverBasemapBound=true;
  }
  return window.WebGISHover;
}

function saveStyle(layer){
  if(!layer) return;
  /* Style dasar dapat berubah ketika filter tahun/jenis diganti. Simpan ulang
     style terbaru setiap hover dimulai agar mouseout tidak kembali ke filter lama. */
  originalStyle.set(layer, Object.assign({}, layer._webgisBaseStyle || layer.options));
}

function restoreStyle(layer){
  if(!layer || !layer.setStyle) return;
  var style = layer._webgisBaseStyle || originalStyle.get(layer);
  /* Cadangan terakhir selalu dihitung dari filter aktif. Ini mencegah event
     mouseout tertunda mengembalikan simbolisasi layer utama yang lama. */
  if(!style && typeof window.getWebGISMapStyle==='function' && layer.feature){
    style = window.getWebGISMapStyle(layer.feature,
      typeof window.getWebGISFilters==='function'?window.getWebGISFilters():{tahun:'all',jenis:'all'});
  }
  if(style) layer.setStyle(Object.assign({},style));
}

function clearHoverLayer(layer){
  if(!layer || layer === selectedLayer) return;
  layer._webgisHoverActive = false;
  activeHoverLayers.delete(layer);
  if(hoverLayer === layer){
    const manager = ensureHoverManager();
    if(manager) manager.clear(layer);
    hoverLayer = null;
  }
}

function clearOtherHoverLayers(exceptLayer){
  Array.from(activeHoverLayers).forEach(function(activeLayer){
    if(activeLayer !== exceptLayer && activeLayer !== selectedLayer){
      clearHoverLayer(activeLayer);
    }
  });

  /* Cadangan untuk kondisi event mouseout terlewat sebelum Set diperbarui. */
  if(hoverLayer && hoverLayer !== exceptLayer && hoverLayer !== selectedLayer){
    clearHoverLayer(hoverLayer);
  }
}

function clearAllHoverLayers(){
  Array.from(activeHoverLayers).forEach(function(activeLayer){
    if(activeLayer !== selectedLayer) clearHoverLayer(activeLayer);
  });
  if(hoverLayer && hoverLayer !== selectedLayer) clearHoverLayer(hoverLayer);
  const manager = ensureHoverManager();
  if(manager) manager.clear();
  hoverLayer = null;
  activeHoverLayers.clear();
}

function clearSelected(){
  if(selectedLayer){
    selectedLayer._webgisSelectedActive=false;
    selectedLayer._webgisHoverActive=false;
    selectedLayer=null;
  }
  clearAllHoverLayers();
  selectedFeature=null;
  selectedKind=null;
  const manager=ensureSelectionManager();
  if(manager) manager.clear();
}

function applyHover(layer, kind){
  if(!layer || !layer.feature || layer === selectedLayer) return;

  /* Hanya satu overlay hover boleh aktif. Layer tematik sumber tidak disentuh,
     sehingga resetStyle QGIS2Web dan timer kontras tidak dapat menampilkan
     kembali warna layer utama yang sudah tidak sesuai dengan filter. */
  clearOtherHoverLayers(layer);
  layer._webgisHoverActive = true;
  activeHoverLayers.add(layer);
  hoverLayer = layer;

  const manager = ensureHoverManager();
  if(manager) manager.show(layer.feature, kind || 'desa', layer);
}

function applySelected(layer, feature, kind){
  if(selectedLayer&&selectedLayer!==layer){
    selectedLayer._webgisSelectedActive=false;
    selectedLayer._webgisHoverActive=false;
  }
  clearAllHoverLayers();
  selectedLayer=layer||null;
  selectedFeature=feature||null;
  selectedKind=kind||'desa';

  /* Seleksi hanya berupa outline pada overlay. Polygon sumber tidak pernah
     diubah dan warna filter tetap terlihat penuh. */
  if(layer){
    layer._webgisHoverActive=false;
    layer._webgisSelectedActive=false;
  }
  const manager=ensureSelectionManager();
  if(manager) manager.select(selectedFeature,selectedKind);
}

function setInfo(html,title){
  const el = document.getElementById('infoDesa');
  const t = document.getElementById('infoTitle');
  if(el) el.innerHTML = html;
  if(t) t.textContent = title;
}

function row(label,value){
  return `<div class="info-row"><span>${label}</span><strong>${value||'-'}</strong></div>`;
}

function stopLeafletClick(e){
  if(!e || !e.originalEvent) return;
  e.originalEvent._webgisFeatureHandled = true;
  if(L.DomEvent && typeof L.DomEvent.stop === 'function'){
    L.DomEvent.stop(e.originalEvent);
  }else{
    L.DomEvent.stopPropagation(e.originalEvent);
    L.DomEvent.preventDefault(e.originalEvent);
  }
}

/* Membuka panel grafik dan informasi secara konsisten ketika pengguna memilih
   desa/kelurahan. Pada mobile digunakan pengelola bottom sheet; pada desktop
   status panel dipulihkan tanpa menutup panel statistik. */
function openBottomInformationPanel(){
  if(window.WebGISMobilePanels &&
     typeof window.WebGISMobilePanels.openInformationPanel === 'function' &&
     window.WebGISMobilePanels.openInformationPanel()){
    return;
  }

  const dashboard=document.getElementById('dashboard');
  const bottom=document.getElementById('dashboard-bottom');
  const button=document.getElementById('toggleBottomPanel');

  if(bottom && bottom.classList.contains('bottom-hidden')){
    bottom.classList.remove('bottom-hidden');
    if(dashboard) dashboard.classList.remove('bottom-panel-collapsed');
    if(button){
      button.innerHTML='▼';
      button.setAttribute('aria-label','Tutup panel grafik dan informasi');
      button.setAttribute('aria-expanded','true');
    }

    if(window.map && typeof window.map.invalidateSize === 'function'){
      window.setTimeout(function(){ window.map.invalidateSize(); },80);
      window.setTimeout(function(){ window.map.invalidateSize(); },300);
    }

    if(typeof window.Chart !== 'undefined'){
      ['chartKecamatan','chartJenis','chartTahun'].forEach(function(id){
        const canvas=document.getElementById(id);
        const chart=canvas ? window.Chart.getChart(canvas) : null;
        if(!chart) return;
        window.setTimeout(function(){ chart.resize(); chart.update('none'); },120);
        window.setTimeout(function(){ chart.resize(); chart.update('none'); },360);
      });
    }
  }
}

window.openWebGISBottomInformationPanel=openBottomInformationPanel;

function bindSafe(layer, callback, kind){
  if(!layer || !layer.on) return;

  layer.options = layer.options || {};
  layer.options.bubblingMouseEvents = false;
  layer.off('mouseover mouseout click');

  layer.on({
    mouseover:function(){
      applyHover(layer, kind || 'desa');
    },

    mouseout:function(){
      clearHoverLayer(layer);
    },

    click:function(e){
      stopLeafletClick(e);
      const feature = layer.feature || null;
      callback();
      applySelected(layer, feature, kind || 'desa');

      /* Desa/kelurahan sekarang mempunyai perilaku yang sama dengan kecamatan:
         panel grafik dan informasi dibuka kembali bila sebelumnya ditutup. */
      openBottomInformationPanel();
    }
  });
}

function bindDesaLayer(layerGroup){
  if(!layerGroup || !layerGroup.eachLayer) return;
  layerGroup.eachLayer(function(layer){
    bindSafe(layer,function(){
      var p = (layer.feature && layer.feature.properties) ? layer.feature.properties : {};
      if(typeof window.showInfoDesa === 'function'){
        window.showInfoDesa(p);
      }else{
        setInfo(
          row('Desa/Kelurahan',p.Desa_Kelurahan)+
          row('Kecamatan',p.Kecamatan),
          'Informasi Desa'
        );
      }
    },'desa');
  });
}

function initHierarchicalInfo(){
  ensureSelectionManager();
  ensureHoverManager();

  /* Revisi 30 tetap memakai satu layer utama agar tahun baru tidak membutuhkan
     export qgis2web/layer JavaScript baru. */
  bindDesaLayer(typeof layer_InformasiWilayah_12 !== 'undefined' ? layer_InformasiWilayah_12 : null);

  if(typeof layer_BatasKecamatan_13 !== 'undefined'){
    layer_BatasKecamatan_13.eachLayer(function(layer){
      bindSafe(layer,function(){
        var p = layer.feature.properties || {};
        var nama = p.WADMKC || '-';
        var desa = 0,total = 0,penerima = 0,totalPenerima = 0,jenis = {};

        if(typeof json_InformasiWilayah_12 !== 'undefined'){
          json_InformasiWilayah_12.features.forEach(function(f){
            var d = f.properties || {};
            if(d.Kecamatan === nama){
              desa++;
              total += Number(d.Jumlah_Bantuan || 0);
              if(Number(d.Jumlah_Bantuan || 0) > 0) penerima++;
              totalPenerima += Number(d.Jumlah_Penerima_Angka || String(d.Jumlah_Penerima || '0').replace(/[^0-9]/g,'') || 0);
              if(d.Jenis_Bantuan && String(d.Jenis_Bantuan).toLowerCase() !== 'belum pernah'){
                jenis[d.Jenis_Bantuan] = (jenis[d.Jenis_Bantuan] || 0) + 1;
              }
            }
          });
        }

        setInfo(
          row('Nama Kecamatan',nama)+
          row('Jumlah Desa',desa+' Desa')+
          row('Desa Penerima',penerima+' Desa')+
          row('Total Bantuan',total+' Kali')+
          row('Jumlah Penerima Bantuan',totalPenerima+' Orang')+
          row('Jenis Bantuan',Object.keys(jenis).join(', ')||'-'),
          'Informasi Kecamatan'
        );
      },'kecamatan');
    });
  }

  if(typeof window.map !== 'undefined' && !window.map._webgisHoverCleanupBound){
    const mapContainer = window.map.getContainer && window.map.getContainer();
    if(mapContainer){
      /* Pointer guard: bila DOM path berubah atau mouseout tidak terkirim,
         polygon yang bukan target pointer langsung dikembalikan ke style dasar. */
      mapContainer.addEventListener('pointermove', function(event){
        if(!activeHoverLayers.size) return;
        const target = event.target;
        Array.from(activeHoverLayers).forEach(function(activeLayer){
          if(activeLayer === selectedLayer) return;
          const path = activeLayer && activeLayer._path;
          if(!path || (target !== path && !(path.contains && path.contains(target)))){
            clearHoverLayer(activeLayer);
          }
        });
      }, true);

      mapContainer.addEventListener('pointerleave', clearAllHoverLayers, true);
    }
    window.map._webgisHoverCleanupBound = true;
  }

  if(typeof window.map !== 'undefined' && !window.map._webgisSelectionClearBound){
    window.map.on('click',function(e){
      const originalEvent = e && e.originalEvent;
      if(originalEvent && originalEvent._webgisFeatureHandled) return;

      const target = originalEvent && originalEvent.target;
      if(target && target.closest && target.closest('.leaflet-interactive')) return;
      clearSelected();
    });
    window.map._webgisSelectionClearBound = true;
  }

  window.clearWebGISSelection = clearSelected;
}

window.showWebGISHoverFeature = function(feature,kind,sourceLayer){
  const manager = ensureHoverManager();
  if(manager) manager.show(feature, kind || 'desa', sourceLayer || null);
};

window.clearWebGISHoverFeature = function(sourceLayer){
  const manager = ensureHoverManager();
  if(manager) manager.clear(sourceLayer || null);
};

window.selectWebGISFeature = function(feature,kind,sourceLayer){
  applySelected(sourceLayer || null, feature, kind || 'desa');
};

let hierarchyInitialized = false;
function startHierarchicalInfo(){
  if(hierarchyInitialized) return;
  hierarchyInitialized = true;
  initHierarchicalInfo();
}

/* Script berada setelah deklarasi seluruh layer. Jalankan pada task berikutnya
   agar hover terpasang sebelum pengguna sempat berinteraksi, tanpa menunggu
   tile basemap, font, atau gambar menyelesaikan event window.load. */
window.setTimeout(startHierarchicalInfo, 0);
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', startHierarchicalInfo, {once:true});
}else{
  startHierarchicalInfo();
}
})();
