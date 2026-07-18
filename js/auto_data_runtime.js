/* =========================================================
   Revisi 30 - Runtime data otomatis dan visual kompatibel Revisi 28
   - Seluruh filter, grafik, informasi, dan style membaca data hasil
     UPDATE_DATA.bat.
   - Tahun baru otomatis muncul tanpa mengubah HTML/JavaScript.
   - Jenis bantuan dan warna mengikuti sheet KONFIGURASI.
   ========================================================= */
(function(){
'use strict';

function config(){
  return window.WEBGIS_CONFIG || {
    totalDesa: 0,
    totalKecamatan: 0,
    years: [],
    yearColors: {},
    jenis: [],
    jenisColors: {}
  };
}

function rawRows(){
  return (window.dataDashboardAsli && Array.isArray(window.dataDashboardAsli.rawDesa))
    ? window.dataDashboardAsli.rawDesa : [];
}

function clean(value, fallback){
  if(value === null || typeof value === 'undefined' || String(value).trim() === ''){
    return typeof fallback === 'undefined' ? '-' : fallback;
  }
  return String(value).trim();
}

function escapeHtml(value){
  return String(value == null ? '' : value)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function row(label,value){
  return '<div class="info-row"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(clean(value)) + '</strong></div>';
}

function getFilters(){
  var year = document.getElementById('filterTahun');
  var type = document.getElementById('filterJenis');
  return {
    tahun: year ? year.value : 'all',
    jenis: type ? type.value : 'all'
  };
}

function eventsOf(data){
  return data && Array.isArray(data._events) ? data._events : [];
}

function matchingEvents(data, filters){
  return eventsOf(data).filter(function(event){
    if(filters.tahun !== 'all' && String(event.tahun) !== String(filters.tahun)) return false;
    if(filters.jenis !== 'all' && String(event.jenis) !== String(filters.jenis)) return false;
    return true;
  });
}

function rowMap(){
  var map = Object.create(null);
  rawRows().forEach(function(item){
    if(item && item.Kode_Wilayah) map[String(item.Kode_Wilayah)] = item;
  });
  return map;
}

function syncGeoJsonProperties(){
  var byCode = rowMap();

  if(window.json_InformasiWilayah_12 && Array.isArray(window.json_InformasiWilayah_12.features)){
    window.json_InformasiWilayah_12.features.forEach(function(feature){
      var props = feature && feature.properties ? feature.properties : {};
      var current = byCode[String(props.Kode_Wilayah || '')];
      if(current) feature.properties = Object.assign({}, current);
    });
  }

  if(window.layer_InformasiWilayah_12 && typeof window.layer_InformasiWilayah_12.eachLayer === 'function'){
    window.layer_InformasiWilayah_12.eachLayer(function(layer){
      var props = layer.feature && layer.feature.properties ? layer.feature.properties : {};
      var current = byCode[String(props.Kode_Wilayah || '')];
      if(current && layer.feature) layer.feature.properties = Object.assign({}, current);
    });
  }
}

function findRow(props){
  props = props || {};
  var code = clean(props.Kode_Wilayah, '');
  var village = clean(props.Desa_Kelurahan, '').toLowerCase();
  var district = clean(props.Kecamatan, '').toLowerCase();
  return rawRows().find(function(item){
    if(code && clean(item.Kode_Wilayah, '') === code) return true;
    return clean(item.Desa_Kelurahan, '').toLowerCase() === village &&
      clean(item.Kecamatan, '').toLowerCase() === district;
  }) || props;
}

window.showInfoDesa = function showInfoDesaAuto(props){
  var data = findRow(props);
  var filters = getFilters();
  var allEvents = eventsOf(data);
  var selectedEvents = matchingEvents(data, filters);
  var useEvents = (filters.tahun === 'all' && filters.jenis === 'all') ? allEvents : selectedEvents;
  var years = Array.from(new Set(useEvents.map(function(event){ return String(event.tahun); }))).sort();
  var types = [];
  (config().jenis || []).forEach(function(item){
    if(useEvents.some(function(event){ return event.jenis === item.label; })) types.push(item.label);
  });

  var status = selectedEvents.length > 0 || (filters.tahun === 'all' && filters.jenis === 'all' && allEvents.length > 0)
    ? 'Menerima Bantuan' : 'Tidak Menerima';
  var html = '';
  html += row('Desa/Kelurahan', data.Desa_Kelurahan);
  html += row('Kode Wilayah', data.Kode_Wilayah);
  html += row('Kecamatan', data.Kecamatan);
  html += row('Status Bantuan', status);
  html += row('Tahun Bantuan', filters.tahun !== 'all' ? filters.tahun : (years.join(', ') || '-'));
  html += row('Jenis Bantuan', filters.jenis !== 'all' ? filters.jenis : (types.join(', ') || '-'));
  html += row('Total Bantuan', useEvents.length + ' Kali');
  html += row('Jumlah Penerima Kumulatif', Number(data.Jumlah_Penerima_Angka || 0) + ' Orang');

  var box = document.getElementById('infoDesa');
  var title = document.getElementById('infoTitle');
  if(box) box.innerHTML = '<div class="desa-detail">' + html + '</div>';
  if(title) title.textContent = 'Informasi Desa';
};

window.WebGISDataModel = {
  config: config,
  rows: rawRows,
  eventsOf: eventsOf,
  matchingEvents: matchingEvents,
  getFilters: getFilters,
  sync: syncGeoJsonProperties
};

function init(){
  syncGeoJsonProperties();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
}else{
  init();
}
window.addEventListener('load', function(){ window.setTimeout(init, 0); });
})();
