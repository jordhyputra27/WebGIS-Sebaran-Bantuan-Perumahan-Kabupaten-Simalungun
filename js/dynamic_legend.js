/* =========================================================
   Revisi 34 - Legenda dinamis untuk filter berantai tahun dan jenis.
   Data tetap otomatis; simbol, warna, istilah, dan urutan legenda lama
   dipertahankan untuk layer utama maupun layer filter.
   ========================================================= */
(function(){
'use strict';
var legendControl=null, legendContainer=null, legendBody=null, legendToggleButton=null, userToggled=false;

function cfg(){return window.WEBGIS_CONFIG||{yearColors:{},jenisColors:{}};}
function filters(){
  if(typeof window.getWebGISFilters==='function') return window.getWebGISFilters();
  var y=document.getElementById('filterTahun'), j=document.getElementById('filterJenis');
  return {tahun:y?y.value:'all',jenis:j?j.value:'all'};
}
function rows(){
  return window.dataDashboardAsli&&Array.isArray(window.dataDashboardAsli.rawDesa)
    ? window.dataDashboardAsli.rawDesa:[];
}
function eventsOf(row){return row&&Array.isArray(row._events)?row._events:[];}
function escapeHtml(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function hexToRgba(hex,alpha){
  var m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex||'');
  return m?'rgba('+parseInt(m[1],16)+','+parseInt(m[2],16)+','+parseInt(m[3],16)+','+(alpha==null?0.85:alpha)+')':hex;
}
function mixWhite(hex,ratio){
  var m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex||'');
  if(!m)return hex;
  var rgb=[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)];
  return '#'+rgb.map(function(v){return Math.round(v+(255-v)*ratio).toString(16).padStart(2,'0');}).join('');
}
function fallbackProfile(){
  return {
    main:{border:'rgba(158,158,158,0.85)',none:'rgba(240,240,240,0.85)',once:'rgba(255,213,79,0.85)',multiple:'rgba(251,140,0,0.85)'},
    legendBorder:'rgba(158,158,158,0.85)'
  };
}
function visual(){return typeof window.getWebGISVisualProfile==='function'?window.getWebGISVisualProfile():fallbackProfile();}
function yearVisual(year){
  if(typeof window.getWebGISYearProfile==='function')return window.getWebGISYearProfile(year);
  var base=(cfg().yearColors||{})[String(year)]||'#7f8c8d';
  return {none:'rgba(240,240,240,0.85)',receive:hexToRgba(base,0.85)};
}
function typeVisual(label){
  if(typeof window.getWebGISTypeProfile==='function')return window.getWebGISTypeProfile(label);
  var base=(cfg().jenisColors||{})[String(label)]||'#7f8c8d';
  return {none:'rgba(240,240,240,0.85)',once:hexToRgba(mixWhite(base,0.55),0.85),multiple:hexToRgba(base,0.85)};
}
function item(color,label,border){
  return '<div class="map-legend-item"><span class="map-legend-swatch" style="background:'+escapeHtml(color)+';border-color:'+escapeHtml(border)+'"></span><span>'+escapeHtml(label)+'</span></div>';
}
function maxTotalHelp(){
  return rows().reduce(function(max,row){return Math.max(max,eventsOf(row).length);},0);
}
function maxTypeHelp(label,year){
  return rows().reduce(function(max,row){
    var n=eventsOf(row).filter(function(event){
      if(String(event.jenis)!==String(label)) return false;
      return String(year)==='all' || String(event.tahun)===String(year);
    }).length;
    return Math.max(max,n);
  },0);
}
function thematicHtml(){
  var f=filters(), profile=visual(), border=profile.legendBorder||'rgba(158,158,158,0.85)';
  var title='Informasi Wilayah', html='';

  if(f.tahun==='all'&&f.jenis==='all'){
    html+=item(profile.main.none,'Belum Pernah Menerima',border);
    html+=item(profile.main.once,'1 Kali Menerima',border);
    html+=item(profile.main.multiple,maxTotalHelp()>2?'≥2 Kali Menerima':'2 Kali Menerima',border);
  }else if(f.jenis!=='all'){
    var type=typeVisual(f.jenis), maxCount=maxTypeHelp(f.jenis,f.tahun);
    if(f.tahun!=='all'){
      title=f.jenis+' — Tahun '+f.tahun;
      html+=item(type.none,'Tidak Menerima',border);
      html+=item(type.once,'Menerima',border);
      if(maxCount>=2) html+=item(type.multiple,'≥2 Kali Menerima',border);
    }else{
      title=f.jenis;
      html+=item(type.none,'Belum Pernah',border);
      html+=item(type.once,'Sekali Menerima',border);
      if(maxCount>=2) html+=item(type.multiple,'Dua Kali Menerima',border);
    }
  }else{
    var year=yearVisual(f.tahun);
    title='Tahun '+f.tahun;
    html+=item(year.none,'Tidak Menerima',border);
    html+=item(year.receive,'Menerima',border);
  }

  return '<div class="map-legend-section"><div class="map-legend-subtitle">'+escapeHtml(title)+'</div>'+html+'</div>';
}
function boundaryHtml(){
  return '<div class="map-legend-section map-legend-boundary">'+
    '<div class="map-legend-subtitle">Batas Administrasi</div>'+
    '<div class="map-legend-item"><span class="map-legend-line map-legend-line-village"></span><span>Batas Desa/Kelurahan</span></div>'+
    '<div class="map-legend-item"><span class="map-legend-line map-legend-line-district"></span><span>Batas Kecamatan</span></div>'+
    '</div>';
}
function render(){if(legendBody)legendBody.innerHTML=thematicHtml()+boundaryHtml();}
function sync(){if(legendContainer&&legendToggleButton)legendToggleButton.setAttribute('aria-expanded',legendContainer.classList.contains('is-collapsed')?'false':'true');}
function collapse(){if(legendContainer){legendContainer.classList.add('is-collapsed');sync();}}
function toggle(){if(legendContainer){userToggled=true;legendContainer.classList.toggle('is-collapsed');sync();}}

function init(){
  if(!window.map||typeof L==='undefined'||legendControl)return;
  legendControl=L.control({position:'topright'});
  legendControl.onAdd=function(){
    var container=L.DomUtil.create('div','map-dynamic-legend leaflet-bar');
    var header=L.DomUtil.create('div','map-legend-header',container);
    legendToggleButton=L.DomUtil.create('button','map-legend-toggle',header);
    legendToggleButton.type='button';legendToggleButton.title='Buka / tutup legenda';legendToggleButton.setAttribute('data-hover-label','Buka legenda');
    legendToggleButton.innerHTML='<span class="map-legend-icon">▤</span><span>Legenda</span>';
    var close=L.DomUtil.create('button','map-legend-close',header);close.type='button';close.innerHTML='&times;';close.title='Sembunyikan legenda';close.setAttribute('aria-label','Tutup legenda');
    legendBody=L.DomUtil.create('div','map-legend-body',container);legendContainer=container;
    if(window.innerWidth<=700)container.classList.add('is-collapsed');sync();
    L.DomEvent.disableClickPropagation(container);L.DomEvent.disableScrollPropagation(container);
    L.DomEvent.on(container,'pointerdown mousedown touchstart',L.DomEvent.stopPropagation);
    L.DomEvent.on(legendToggleButton,'pointerdown mousedown touchstart',L.DomEvent.stopPropagation);
    L.DomEvent.on(close,'pointerdown mousedown touchstart',L.DomEvent.stopPropagation);
    L.DomEvent.on(legendToggleButton,'click',function(e){L.DomEvent.stop(e);toggle();});
    L.DomEvent.on(close,'click',function(e){L.DomEvent.stop(e);userToggled=true;collapse();});
    render();return container;
  };
  legendControl.addTo(window.map);
  ['filterTahun','filterJenis'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('change',function(){setTimeout(render,20);});});
  window.map.on('layeradd layerremove',function(){setTimeout(render,0);});
  window.addEventListener('resize',function(){if(!legendContainer||userToggled)return;if(window.innerWidth<=700)legendContainer.classList.add('is-collapsed');else legendContainer.classList.remove('is-collapsed');sync();});
  window.updateDynamicLegend=render;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.addEventListener('load',function(){setTimeout(init,100);});
})();
