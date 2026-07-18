/* =========================================================
   Revisi 38 - Filter berantai dua arah tahun dan jenis bantuan
   Tahun/jenis bantuan dibaca dari WEBGIS_CONFIG hasil UPDATE_DATA.bat.
   ========================================================= */
(function(){
'use strict';

function getEl(id){ return document.getElementById(id); }
function cfg(){
  return window.WEBGIS_CONFIG || {
    totalDesa:413,totalKecamatan:32,years:[],yearColors:{},jenis:[],jenisColors:{}
  };
}
function rawRows(){
  return (window.dataDashboardAsli && Array.isArray(window.dataDashboardAsli.rawDesa))
    ? window.dataDashboardAsli.rawDesa : [];
}
function eventsOf(row){ return row && Array.isArray(row._events) ? row._events : []; }
function filters(){
  var year = getEl('filterTahun');
  var type = getEl('filterJenis');
  return {tahun:year ? year.value : 'all', jenis:type ? type.value : 'all'};
}
function matchingEvents(row, selected){
  return eventsOf(row).filter(function(event){
    if(selected.tahun !== 'all' && String(event.tahun) !== String(selected.tahun)) return false;
    if(selected.jenis !== 'all' && String(event.jenis) !== String(selected.jenis)) return false;
    return true;
  });
}
function rowMatches(row, selected){ return matchingEvents(row, selected).length > 0; }
function setText(id,value){ var el=getEl(id); if(el) el.textContent=String(value); }

function populateFilters(){
  var configuration = cfg();
  var year = getEl('filterTahun');
  var type = getEl('filterJenis');
  var oldYear = year ? year.value : 'all';
  var oldType = type ? type.value : 'all';

  if(year){
    year.innerHTML = '';
    var allYearOption = document.createElement('option');
    allYearOption.value = 'all';
    allYearOption.textContent = 'Semua Tahun';
    year.appendChild(allYearOption);

    (configuration.years || []).forEach(function(item){
      var option = document.createElement('option');
      option.value = String(item);
      option.textContent = String(item);
      option.setAttribute('data-base-label', String(item));
      year.appendChild(option);
    });

    year.value = (configuration.years || []).map(String).indexOf(String(oldYear)) !== -1 ? String(oldYear) : 'all';
  }

  if(type){
    type.innerHTML = '';
    var allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Semua Jenis Bantuan';
    type.appendChild(allOption);

    (configuration.jenis || []).forEach(function(item){
      var option = document.createElement('option');
      option.value = String(item.label);
      option.textContent = String(item.label);
      option.setAttribute('data-base-label', String(item.label));
      type.appendChild(option);
    });

    var validTypes = (configuration.jenis || []).map(function(item){ return String(item.label); });
    type.value = validTypes.indexOf(String(oldType)) !== -1 ? String(oldType) : 'all';
  }

  updateTypeAvailability();
  updateYearAvailability();
}

/* Jenis bantuan yang tersedia dihitung langsung dari pasangan tahun-jenis
   pada setiap event. Dengan demikian, jenis dari tahun lain tidak ikut aktif. */
function availableTypesForYear(selectedYear){
  var available = new Set();
  if(String(selectedYear) === 'all'){
    (cfg().jenis || []).forEach(function(item){ available.add(String(item.label)); });
    return available;
  }

  rawRows().forEach(function(row){
    eventsOf(row).forEach(function(event){
      if(String(event.tahun) === String(selectedYear) && event.jenis){
        available.add(String(event.jenis));
      }
    });
  });
  return available;
}

/* Tahun yang tersedia dihitung dari pasangan tahun-jenis yang sama.
   Fungsi ini membuat filter tetap berantai saat jenis dipilih lebih dahulu. */
function availableYearsForType(selectedType){
  var available = new Set();
  if(String(selectedType) === 'all'){
    (cfg().years || []).forEach(function(year){ available.add(String(year)); });
    return available;
  }

  rawRows().forEach(function(row){
    eventsOf(row).forEach(function(event){
      if(String(event.jenis) === String(selectedType) && event.tahun !== undefined && event.tahun !== null){
        available.add(String(event.tahun));
      }
    });
  });
  return available;
}

function updateYearAvailability(){
  var year = getEl('filterTahun');
  var type = getEl('filterJenis');
  if(!year) return false;

  var selectedType = type ? type.value : 'all';
  var available = availableYearsForType(selectedType);
  var selectionWasReset = false;

  Array.prototype.forEach.call(year.options || [], function(option){
    if(option.value === 'all'){
      option.disabled = false;
      option.textContent = 'Semua Tahun';
      return;
    }

    var baseLabel = option.getAttribute('data-base-label') || option.value;
    var isAvailable = selectedType === 'all' || available.has(String(option.value));
    option.disabled = !isAvailable;
    option.textContent = isAvailable ? baseLabel : baseLabel + ' — tidak ada';
    option.title = isAvailable
      ? baseLabel
      : 'Tidak ada bantuan dari ' + selectedType + ' pada tahun ' + baseLabel;
  });

  var selectedOption = year.options && year.selectedIndex >= 0
    ? year.options[year.selectedIndex] : null;
  if(selectedOption && selectedOption.disabled){
    year.value = 'all';
    selectionWasReset = true;
  }

  year.setAttribute('aria-label', selectedType === 'all'
    ? 'Pilih tahun bantuan'
    : 'Pilih tahun yang memiliki bantuan ' + selectedType);
  return selectionWasReset;
}

function updateTypeAvailability(){
  var year = getEl('filterTahun');
  var type = getEl('filterJenis');
  if(!type) return false;

  var selectedYear = year ? year.value : 'all';
  var available = availableTypesForYear(selectedYear);
  var selectionWasReset = false;

  Array.prototype.forEach.call(type.options || [], function(option){
    if(option.value === 'all'){
      option.disabled = false;
      option.textContent = 'Semua Jenis Bantuan';
      return;
    }

    var baseLabel = option.getAttribute('data-base-label') || option.value;
    var isAvailable = selectedYear === 'all' || available.has(String(option.value));
    option.disabled = !isAvailable;
    option.textContent = isAvailable ? baseLabel : baseLabel + ' — tidak ada';
    option.title = isAvailable
      ? baseLabel
      : 'Tidak ada bantuan dari ' + baseLabel + ' pada tahun ' + selectedYear;
  });

  var selectedOption = type.options && type.selectedIndex >= 0
    ? type.options[type.selectedIndex] : null;
  if(selectedOption && selectedOption.disabled){
    type.value = 'all';
    selectionWasReset = true;
  }

  type.setAttribute('aria-label', selectedYear === 'all'
    ? 'Pilih jenis bantuan'
    : 'Pilih jenis bantuan yang tersedia pada tahun ' + selectedYear);
  return selectionWasReset;
}

function filteredRows(selected){
  return rawRows().filter(function(row){ return rowMatches(row, selected); });
}

function updateStatistics(){
  var configuration = cfg();
  var selected = filters();
  var rows = filteredRows(selected);
  var villageSet = new Set();
  var districtSet = new Set();
  var contributionByVillage = Object.create(null);

  rows.forEach(function(row){
    var code = row.Kode_Wilayah || row.Desa_Kelurahan;
    var count = matchingEvents(row, selected).length;
    if(code) villageSet.add(code);
    if(row.Kecamatan) districtSet.add(row.Kecamatan);
    if(code) contributionByVillage[code] = count;
  });

  var totalHelp=0, once=0, multiple=0;
  Object.keys(contributionByVillage).forEach(function(code){
    var count = contributionByVillage[code];
    totalHelp += count;
    if(count === 1) once++;
    if(count > 1) multiple++;
  });

  var totalVillage = Number(configuration.totalDesa || rawRows().length || 1);
  var totalDistrict = Number(configuration.totalKecamatan || 1);
  setText('desaPenerimaTotal', villageSet.size + ' / ' + totalVillage);
  setText('desaPersen', ((villageSet.size / totalVillage) * 100).toFixed(1) + '% cakupan desa');
  setText('kecamatanPenerimaTotal', districtSet.size + ' / ' + totalDistrict);
  setText('kecamatanPersen', ((districtSet.size / totalDistrict) * 100).toFixed(1) + '% cakupan kecamatan');
  setText('totalBantuan', totalHelp);
  setText('sekaliBantuan', once);
  setText('multiBantuan', multiple);
}

function aggregateDistrict(rows, selected, limit){
  var result = Object.create(null);
  rows.forEach(function(row){
    var district = row.Kecamatan || '-';
    result[district] = (result[district] || 0) + matchingEvents(row, selected).length;
  });
  var sorted = Object.keys(result).map(function(name){ return [name,result[name]]; })
    .sort(function(a,b){ return b[1]-a[1] || a[0].localeCompare(b[0]); });
  return isFinite(limit) ? sorted.slice(0,Math.max(0,limit)) : sorted;
}

function aggregateTypes(rows, selected){
  var result = Object.create(null);
  (cfg().jenis || []).forEach(function(item){ result[item.label]=0; });
  rows.forEach(function(row){
    matchingEvents(row, selected).forEach(function(event){
      result[event.jenis]=(result[event.jenis]||0)+1;
    });
  });
  return result;
}

function aggregateYears(rows, selected){
  var villageSets = Object.create(null);
  (cfg().years || []).forEach(function(year){ villageSets[String(year)] = new Set(); });
  rows.forEach(function(row){
    matchingEvents(row, selected).forEach(function(event){
      var year=String(event.tahun);
      if(!villageSets[year]) villageSets[year]=new Set();
      villageSets[year].add(row.Kode_Wilayah || row.Desa_Kelurahan);
    });
  });
  var result=Object.create(null);
  Object.keys(villageSets).forEach(function(year){ result[year]=villageSets[year].size; });
  return result;
}

function updateChart(canvasId,labels,values,labelText,colors){
  var canvas=getEl(canvasId);
  if(!canvas || typeof Chart==='undefined') return;
  var chart=Chart.getChart(canvas);
  if(!chart) return;
  chart.data.labels=labels;
  if(!chart.data.datasets.length) chart.data.datasets.push({});
  chart.data.datasets[0].data=values;
  if(labelText) chart.data.datasets[0].label=labelText;
  if(Array.isArray(colors)){
    chart.data.datasets[0].backgroundColor=colors;
    chart.data.datasets[0].borderColor=colors.map(function(){return '#ffffff';});
    chart.data.datasets[0].borderWidth=2;
  }
  chart.update();
}

function chartPayload(chartId,expanded){
  var selected=filters();
  var rows=filteredRows(selected);
  var configuration=cfg();

  if(chartId==='chartKecamatan'){
    var districts=aggregateDistrict(rows,selected,expanded?Infinity:7);
    return {labels:districts.map(function(x){return x[0];}),values:districts.map(function(x){return x[1];}),label:'Jumlah Bantuan'};
  }
  if(chartId==='chartJenis'){
    var types=aggregateTypes(rows,selected);
    var labels=(configuration.jenis||[]).map(function(item){return item.label;});
    return {
      labels:labels,
      values:labels.map(function(label){return types[label]||0;}),
      label:'Jenis Bantuan',
      colors:labels.map(function(label){return configuration.jenisColors[label]||'#7f8c8d';})
    };
  }
  if(chartId==='chartTahun'){
    var years=aggregateYears(rows,selected);
    var labels=(configuration.years||[]).map(String).filter(function(year){return selected.tahun==='all'||year===selected.tahun;});
    return {labels:labels,values:labels.map(function(year){return years[year]||0;}),label:'Jumlah Desa Penerima'};
  }
  return null;
}

function updateCharts(){
  var p=chartPayload('chartKecamatan',false); if(p) updateChart('chartKecamatan',p.labels,p.values,p.label);
  p=chartPayload('chartJenis',false); if(p) updateChart('chartJenis',p.labels,p.values,p.label,p.colors);
  p=chartPayload('chartTahun',false); if(p) updateChart('chartTahun',p.labels,p.values,p.label);
}

function hexToRgb(hex){
  var match=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex||'');
  return match?{r:parseInt(match[1],16),g:parseInt(match[2],16),b:parseInt(match[3],16)}:null;
}
function rgbaFromHex(hex,alpha){
  var rgb=hexToRgb(hex);
  if(!rgb) return hex||'rgba(51,136,255,'+(alpha==null?0.85:alpha)+')';
  return 'rgba('+rgb.r+','+rgb.g+','+rgb.b+','+(alpha==null?0.85:alpha)+')';
}
function mixWithWhite(hex,ratio){
  var rgb=hexToRgb(hex); if(!rgb) return hex;
  function part(value){return Math.round(value+(255-value)*ratio).toString(16).padStart(2,'0');}
  return '#'+part(rgb.r)+part(rgb.g)+part(rgb.b);
}

/* Profil visual Revisi 28 dipertahankan walaupun data sekarang dinamis.
   Tahun/jenis baru tetap memperoleh warna dari sheet KONFIGURASI. */
var LEGACY_VISUAL_PROFILE={
  main:{
    border:'rgba(158,158,158,0.85)',
    none:'rgba(240,240,240,0.85)',
    once:'rgba(255,213,79,0.85)',
    multiple:'rgba(251,140,0,0.85)'
  },
  years:{
    '2023':{none:'rgba(240,240,240,0.85)',receive:'rgba(186,104,200,0.85)'},
    '2024':{none:'rgba(255,255,255,0.85)',receive:'rgba(236,64,122,0.85)'},
    '2025':{none:'rgba(240,240,240,0.85)',receive:'rgba(92,107,192,0.85)'},
    '2026':{none:'rgba(240,240,240,0.85)',receive:'rgba(166,118,29,0.85)'}
  },
  types:{
    'BSPS':{
      none:'rgba(240,240,240,0.85)',
      once:'rgba(253,193,192,0.85)',
      multiple:'rgba(255,0,3,0.85)'
    },
    'APBD Provinsi':{
      none:'rgba(240,240,240,0.85)',
      once:'rgba(194,232,255,0.85)',
      multiple:'rgba(31,120,180,0.85)'
    },
    'APBD Kabupaten':{
      none:'rgba(240,240,240,0.85)',
      once:'rgba(116,196,118,0.85)',
      multiple:'rgba(116,196,118,0.85)'
    }
  },
  filterBorder:'rgba(240,240,240,0.85)',
  legendBorder:'rgba(158,158,158,0.85)'
};

function yearProfile(year){
  var legacy=LEGACY_VISUAL_PROFILE.years[String(year)];
  if(legacy) return legacy;
  var base=(cfg().yearColors||{})[String(year)]||'#7f8c8d';
  return {none:'rgba(240,240,240,0.85)',receive:rgbaFromHex(base,0.85)};
}
function typeProfile(label){
  var legacy=LEGACY_VISUAL_PROFILE.types[String(label)];
  if(legacy) return legacy;
  var base=(cfg().jenisColors||{})[String(label)]||'#7f8c8d';
  return {
    none:'rgba(240,240,240,0.85)',
    once:rgbaFromHex(mixWithWhite(base,0.55),0.85),
    multiple:rgbaFromHex(base,0.85)
  };
}

function styleFor(feature, selected){
  var props=feature&&feature.properties?feature.properties:{};
  var count=matchingEvents(props,selected).length;
  var allMode=selected.tahun==='all'&&selected.jenis==='all';
  var fill, border;

  if(allMode){
    var total=eventsOf(props).length;
    fill=total===0?LEGACY_VISUAL_PROFILE.main.none:
      (total===1?LEGACY_VISUAL_PROFILE.main.once:LEGACY_VISUAL_PROFILE.main.multiple);
    border=LEGACY_VISUAL_PROFILE.main.border;
  }else if(selected.jenis!=='all'){
    var typeVisual=typeProfile(selected.jenis);
    fill=count===0?typeVisual.none:(count===1?typeVisual.once:typeVisual.multiple);
    border=LEGACY_VISUAL_PROFILE.filterBorder;
  }else{
    var yearVisual=yearProfile(selected.tahun);
    fill=count===0?yearVisual.none:yearVisual.receive;
    border=LEGACY_VISUAL_PROFILE.filterBorder;
  }

  return {
    pane:'pane_InformasiWilayah_12',
    opacity:1,
    color:border,
    dashArray:'',
    lineCap:'butt',
    lineJoin:'miter',
    weight:1,
    fill:true,
    fillOpacity:1,
    fillColor:fill,
    interactive:true
  };
}

window.getWebGISVisualProfile=function(){return LEGACY_VISUAL_PROFILE;};
window.getWebGISYearProfile=yearProfile;
window.getWebGISTypeProfile=typeProfile;

function removeLegacyLayers(){
  if(!window.map) return;
  [
    'layer_Tahun2023_8','layer_Tahun2024_7','layer_Tahun2025_6','layer_Tahun2026_5',
    'layer_BSPS_9','layer_APBDProvinsi_10','layer_APBDKabupaten_11'
  ].forEach(function(name){
    var layer=window[name];
    if(layer&&window.map.hasLayer(layer)) window.map.removeLayer(layer);
  });
}

function applyMapFilter(){
  if(typeof window.clearWebGISSelection==='function') window.clearWebGISSelection();
  if(!window.map || !window.layer_InformasiWilayah_12) return;
  removeLegacyLayers();
  if(!window.map.hasLayer(window.layer_InformasiWilayah_12)) window.map.addLayer(window.layer_InformasiWilayah_12);
  var selected=filters();
  window._webgisStyleRevision=(window._webgisStyleRevision||0)+1;
  var revision=window._webgisStyleRevision;
  window.style_InformasiWilayah_12_0=function(feature){ return styleFor(feature,selected); };

  var pane=window.map.getPane&&window.map.getPane('pane_InformasiWilayah_12');
  if(pane) pane.style.zIndex='412';

  window.layer_InformasiWilayah_12.eachLayer(function(layer){
    if(!layer.setStyle) return;
    var style=styleFor(layer.feature,selected);
    layer._webgisStyleRevision=revision;
    layer._webgisHoverActive=false;
    layer._webgisDistrictHoverActive=false;
    layer._webgisSelectedActive=false;
    layer._webgisBaseStyle=Object.assign({},style);
    layer.setStyle(style);
    layer.options.interactive=true;
    if(layer._path){
      layer._path.style.pointerEvents='auto';
      layer._path.style.mixBlendMode='normal';
    }
  });
  window.map.closePopup();
  window.setTimeout(function(){
    if(typeof window.refreshWebGISThematicContrast==='function'){
      window.refreshWebGISThematicContrast();
    }
    window.map.invalidateSize();
  },60);
}

function updateInfoPanel(){
  var selected=filters();
  var rows=filteredRows(selected);
  var info=getEl('infoDesa');
  var title=getEl('infoTitle');
  if(!info||!title) return;
  var village=new Set(rows.map(function(row){return row.Kode_Wilayah||row.Desa_Kelurahan;})).size;
  var district=new Set(rows.map(function(row){return row.Kecamatan;}).filter(Boolean)).size;
  title.textContent='Informasi Filter';
  info.innerHTML=
    '<div class="info-row"><span>Tahun Bantuan</span><strong>'+(selected.tahun==='all'?'Semua Tahun':selected.tahun)+'</strong></div>'+ 
    '<div class="info-row"><span>Jenis Bantuan</span><strong>'+(selected.jenis==='all'?'Semua Jenis Bantuan':selected.jenis)+'</strong></div>'+ 
    '<div class="info-row"><span>Desa Sesuai Filter</span><strong>'+village+' Desa</strong></div>'+ 
    '<div class="info-row"><span>Kecamatan Sesuai Filter</span><strong>'+district+' Kecamatan</strong></div>';
}

function applyDashboardFilter(){
  updateStatistics();
  updateCharts();
  applyMapFilter();
  updateInfoPanel();
  if(typeof window.updateDynamicLegend==='function') window.setTimeout(window.updateDynamicLegend,20);
}

function resetDashboard(){
  var year=getEl('filterTahun'); var type=getEl('filterJenis');
  if(year) year.value='all';
  if(type) type.value='all';
  updateTypeAvailability();
  updateYearAvailability();
  applyDashboardFilter();
}

function attach(){
  populateFilters();
  var year=getEl('filterTahun');
  var type=getEl('filterJenis');

  if(year&&!year._webgisAutoBound){
    year.addEventListener('change',function(){
      /* Pilihan tahun menjadi prioritas. Jenis yang tidak cocok direset. */
      updateTypeAvailability();
      updateYearAvailability();
      applyDashboardFilter();
    });
    year._webgisAutoBound=true;
  }
  if(type&&!type._webgisAutoBound){
    type.addEventListener('change',function(){
      /* Pilihan jenis menjadi prioritas. Tahun yang tidak cocok direset. */
      updateYearAvailability();
      updateTypeAvailability();
      applyDashboardFilter();
    });
    type._webgisAutoBound=true;
  }
}

window.updateStatistic=updateStatistics;
window.updateCharts=updateCharts;
window.applyDashboardFilter=applyDashboardFilter;
window.resetDashboard=resetDashboard;
window.getDashboardChartPayload=chartPayload;
window.getWebGISFilters=filters;
window.getWebGISMapStyle=styleFor;
window.populateWebGISFilters=populateFilters;
window.updateWebGISTypeAvailability=updateTypeAvailability;
window.updateWebGISYearAvailability=updateYearAvailability;
window.getWebGISAvailableTypesForYear=availableTypesForYear;
window.getWebGISAvailableYearsForType=availableYearsForType;

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',attach); else attach();
window.addEventListener('load',function(){
  window.setTimeout(function(){
    populateFilters();
    applyDashboardFilter();
  },900);
});
})();
