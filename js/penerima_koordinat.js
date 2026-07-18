/* =========================================================
   Revisi 39 - Lokasi rumah penerima bantuan
   - Marker memakai pin rumah yang selaras dengan identitas WebGIS.
   - Tooltip nama penerima memakai latar solid agar mudah dibaca.
   - Popup dirapikan menjadi kartu informasi yang jelas dan tidak transparan.
   - Filter tahun/jenis tetap memfilter titik penerima.
   ========================================================= */
(function(){
'use strict';

function cfg(){ return window.WEBGIS_CONFIG || {}; }
function geojson(){
  return window.json_PenerimaBantuan_14 && Array.isArray(window.json_PenerimaBantuan_14.features)
    ? window.json_PenerimaBantuan_14 : {type:'FeatureCollection',features:[]};
}
function escapeHtml(value){
  return String(value == null ? '' : value)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function safePhotoUrl(value){
  var raw=String(value||'').trim().replace(/\\/g,'/');
  if(!raw) return '';
  if(/^https:\/\//i.test(raw)) return raw;
  if(/^\//.test(raw)||/\.\./.test(raw)||/^[A-Za-z]:/.test(raw)) return '';
  return raw.replace(/^\.\//,'');
}
function safeCssColor(value){
  var color=String(value||'').trim();
  return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%a-z-]+\))$/i.test(color)
    ? color : '#1f78b4';
}
function currentFilters(){
  var year=document.getElementById('filterTahun');
  var type=document.getElementById('filterJenis');
  return {tahun:year?year.value:'all',jenis:type?type.value:'all'};
}
function featureMatches(feature){
  var p=feature&&feature.properties?feature.properties:{};
  var f=currentFilters();
  if(f.tahun!=='all' && String(p.Tahun_Bantuan)!==String(f.tahun)) return false;
  if(f.jenis!=='all' && String(p.Jenis_Bantuan)!==String(f.jenis)) return false;
  return true;
}
function typeColor(label){
  var colors=cfg().jenisColors||{};
  return safeCssColor(colors[label]||'#1f78b4');
}
function row(label,value){
  return '<div class="info-row"><span>'+escapeHtml(label)+'</span><strong>'+escapeHtml(value||'-')+'</strong></div>';
}
function openInformationPanel(){
  if(window.WebGISMobilePanels && typeof window.WebGISMobilePanels.openInformationPanel==='function'){
    if(window.WebGISMobilePanels.openInformationPanel()) return;
  }
  var dashboard=document.getElementById('dashboard');
  var bottom=document.getElementById('dashboard-bottom');
  var button=document.getElementById('toggleBottomPanel');
  if(bottom){
    bottom.classList.remove('bottom-hidden');
    if(dashboard) dashboard.classList.remove('bottom-panel-collapsed');
    if(button){
      button.innerHTML='▼';
      button.setAttribute('aria-expanded','true');
    }
  }
}
function showRecipientInfo(properties){
  var p=properties||{};
  var box=document.getElementById('infoDesa');
  var title=document.getElementById('infoTitle');
  if(!box) return;
  var photo=safePhotoUrl(p.Foto_Rumah);
  var html='<div class="recipient-detail">';
  if(photo){
    html+='<figure class="recipient-photo-wrap"><img class="recipient-photo" src="'+escapeHtml(photo)+'" alt="Foto rumah penerima '+escapeHtml(p.Nama_Penerima||'')+'" loading="lazy" onerror="this.closest(\'figure\').classList.add(\'photo-error\');this.remove();"><figcaption>Foto rumah penerima bantuan</figcaption></figure>';
  }
  html+='<div class="desa-detail">';
  html+=row('Nama Penerima',p.Nama_Penerima);
  html+=row(cfg().penerimaPrivacyMode==='INTERNAL'?'NIK':'NIK (disamarkan)',p.NIK);
  html+=row('Jenis Kelamin',p.Jenis_Kelamin);
  html+=row('Alamat',p.Alamat);
  html+=row('Desa/Kelurahan',p.Desa_Kelurahan);
  html+=row('Kecamatan',p.Kecamatan);
  html+=row('Jenis Bantuan',p.Jenis_Bantuan);
  html+=row('Tahun Bantuan',p.Tahun_Bantuan);
  if(p.Keterangan&&p.Keterangan!=='-') html+=row('Keterangan',p.Keterangan);
  html+='</div></div>';
  box.innerHTML=html;
  if(title) title.textContent='Informasi Penerima Bantuan';
  openInformationPanel();
  box.scrollTop=0;
}
window.showRecipientInfo=showRecipientInfo;

function markerIcon(properties){
  var p=properties||{};
  var color=typeColor(p.Jenis_Bantuan);
  return L.divIcon({
    className:'recipient-pin-icon',
    html:'<div class="recipient-pin-marker" style="--recipient-pin-color:'+escapeHtml(color)+'">'+
      '<span class="recipient-pin-pulse" aria-hidden="true"></span>'+
      '<span class="recipient-pin-symbol" aria-hidden="true"><i class="fas fa-home"></i></span>'+
      '</div>',
    iconSize:[38,48],
    iconAnchor:[19,46],
    popupAnchor:[0,-42],
    tooltipAnchor:[0,-38]
  });
}

function popupMarkup(properties){
  var p=properties||{};
  var photo=safePhotoUrl(p.Foto_Rumah);
  var html='<article class="recipient-popup-card">';
  html+='<header class="recipient-popup-header">'+
    '<span class="recipient-popup-header-icon"><i class="fas fa-home" aria-hidden="true"></i></span>'+
    '<span class="recipient-popup-heading"><small>Penerima Bantuan</small><strong>'+escapeHtml(p.Nama_Penerima||'-')+'</strong></span>'+
    '</header>';
  if(photo){
    html+='<div class="recipient-popup-photo-wrap"><img class="recipient-popup-photo" src="'+escapeHtml(photo)+'" alt="Foto rumah penerima '+escapeHtml(p.Nama_Penerima||'')+'" loading="lazy" onerror="this.closest(\'.recipient-popup-photo-wrap\').style.display=\'none\'"></div>';
  }
  html+='<div class="recipient-popup-body">'+
    '<div class="recipient-popup-location"><i class="fas fa-map-marker-alt" aria-hidden="true"></i><span>'+escapeHtml(p.Desa_Kelurahan||'-')+', '+escapeHtml(p.Kecamatan||'-')+'</span></div>'+
    '<div class="recipient-popup-badges"><span>'+escapeHtml(p.Jenis_Bantuan||'-')+'</span><span>'+escapeHtml(p.Tahun_Bantuan||'-')+'</span></div>'+
    '<p>Klik titik untuk melihat informasi lengkap pada panel WebGIS.</p>'+
    '</div></article>';
  return html;
}

function init(){
  if(!window.map || !window.L) return;
  var configuration=cfg();
  var collection=geojson();
  var features=collection.features||[];
  var enabled=configuration.penerimaEnabled!==false;
  var minZoom=Number(configuration.penerimaMinZoom||15);
  if(!isFinite(minZoom)) minZoom=15;

  if(!window.map.getPane('pane_PenerimaBantuan_14')){
    window.map.createPane('pane_PenerimaBantuan_14');
    window.map.getPane('pane_PenerimaBantuan_14').style.zIndex=650;
    window.map.getPane('pane_PenerimaBantuan_14').style.pointerEvents='auto';
  }

  var cluster=typeof L.markerClusterGroup==='function'
    ? L.markerClusterGroup({
        showCoverageOnHover:false,
        spiderfyOnMaxZoom:true,
        disableClusteringAtZoom:17,
        maxClusterRadius:38,
        removeOutsideVisibleBounds:true,
        chunkedLoading:true
      })
    : L.layerGroup();
  var markerById=Object.create(null);

  function makeMarker(feature){
    var p=feature.properties||{};
    var coordinates=feature.geometry&&feature.geometry.coordinates;
    if(!coordinates||coordinates.length<2) return null;
    var lng=Number(coordinates[0]);
    var lat=Number(coordinates[1]);
    if(!isFinite(lat)||!isFinite(lng)) return null;

    var marker=L.marker([lat,lng],{
      pane:'pane_PenerimaBantuan_14',
      icon:markerIcon(p),
      bubblingMouseEvents:false,
      keyboard:true,
      riseOnHover:true,
      title:String(p.Nama_Penerima||'Penerima bantuan')
    });
    marker.feature=feature;
    marker.bindTooltip(escapeHtml(p.Nama_Penerima||'Penerima bantuan'),{
      direction:'top',
      offset:[0,-8],
      opacity:1,
      sticky:false,
      className:'recipient-tooltip'
    });
    marker.bindPopup(popupMarkup(p),{
      maxWidth:320,
      minWidth:230,
      closeButton:true,
      className:'recipient-leaflet-popup',
      autoPanPadding:[24,24]
    });
    marker.on('click',function(e){
      if(e&&e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
      showRecipientInfo(p);
    });
    var key=String(p.ID_Penerima||L.stamp(marker));
    markerById[key]=marker;
    marker._recipientFeature=feature;
    return marker;
  }

  features.forEach(makeMarker);

  function filteredMarkers(){
    return Object.keys(markerById).map(function(key){return markerById[key];})
      .filter(function(marker){return featureMatches(marker._recipientFeature||marker.feature);});
  }

  function focusFilteredRecipients(){
    var markers=filteredMarkers();
    if(!markers.length) return;
    var bounds=L.latLngBounds(markers.map(function(marker){return marker.getLatLng();}));
    var center=bounds.getCenter();
    window.map.setView(center,Math.max(minZoom,window.map.getZoom()),{animate:true});
    window.setTimeout(syncVisibility,250);
  }

  function rebuild(){
    cluster.clearLayers();
    filteredMarkers().forEach(function(marker){cluster.addLayer(marker);});
    syncVisibility();
  }

  function syncVisibility(){
    var count=filteredMarkers().length;
    var shouldShow=enabled && count>0 && window.map.getZoom()>=minZoom;
    if(shouldShow){
      if(!window.map.hasLayer(cluster)) window.map.addLayer(cluster);
    }else if(window.map.hasLayer(cluster)){
      window.map.removeLayer(cluster);
    }
  }

  window.map.on('zoomend',syncVisibility);
  ['filterTahun','filterJenis'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.addEventListener('change',rebuild);
  });
  window.addEventListener('webgis:dataupdated',rebuild);

  window.layer_PenerimaBantuan_14=cluster;
  window.WebGISRecipientLayer={
    refresh:rebuild,
    focus:focusFilteredRecipients,
    showInfo:showRecipientInfo,
    count:function(){return features.length;},
    minZoom:minZoom
  };
  rebuild();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(init,0);});
else setTimeout(init,0);
})();
