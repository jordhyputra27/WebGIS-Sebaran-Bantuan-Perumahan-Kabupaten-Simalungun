/* Grafik awal dinamis. Data bersumber dari data_dashboard_asli.js. */
var chartKecamatanAsli;
var chartTahunAsli;
var chartJenisAsli;

(function(){
'use strict';

function cfg(){ return window.WEBGIS_CONFIG || {years:[],jenis:[],jenisColors:{}}; }
function rows(){
  return (window.dataDashboardAsli && Array.isArray(window.dataDashboardAsli.rawDesa))
    ? window.dataDashboardAsli.rawDesa : [];
}
function eventsOf(row){ return row && Array.isArray(row._events) ? row._events : []; }

function summarize(){
  var byDistrict = Object.create(null);
  var byType = Object.create(null);
  var byYearVillages = Object.create(null);
  var configuration = cfg();

  (configuration.jenis || []).forEach(function(item){ byType[item.label] = 0; });
  (configuration.years || []).forEach(function(year){ byYearVillages[String(year)] = new Set(); });

  rows().forEach(function(row){
    var district = row.Kecamatan || '-';
    var events = eventsOf(row);
    if(events.length) byDistrict[district] = (byDistrict[district] || 0) + events.length;
    events.forEach(function(event){
      byType[event.jenis] = (byType[event.jenis] || 0) + 1;
      var year = String(event.tahun);
      if(!byYearVillages[year]) byYearVillages[year] = new Set();
      byYearVillages[year].add(row.Kode_Wilayah || row.Desa_Kelurahan);
    });
  });

  var districts = Object.keys(byDistrict)
    .map(function(name){ return [name, byDistrict[name]]; })
    .sort(function(a,b){ return b[1] - a[1] || a[0].localeCompare(b[0]); });
  var typeLabels = (configuration.jenis || []).map(function(item){ return item.label; });
  var yearLabels = (configuration.years || []).map(String);

  return {
    districts: districts.slice(0, 7),
    typeLabels: typeLabels,
    typeValues: typeLabels.map(function(label){ return byType[label] || 0; }),
    yearLabels: yearLabels,
    yearValues: yearLabels.map(function(year){ return byYearVillages[year] ? byYearVillages[year].size : 0; })
  };
}

window.loadChartDataAsli = function(){
  if(typeof Chart === 'undefined') return;
  var districtCanvas = document.getElementById('chartKecamatan');
  var typeCanvas = document.getElementById('chartJenis');
  var yearCanvas = document.getElementById('chartTahun');
  if(!districtCanvas || !typeCanvas || !yearCanvas) return;
  var summary = summarize();
  var configuration = cfg();

  if(chartKecamatanAsli) chartKecamatanAsli.destroy();
  if(chartTahunAsli) chartTahunAsli.destroy();
  if(chartJenisAsli) chartJenisAsli.destroy();

  chartKecamatanAsli = new Chart(districtCanvas, {
    type:'bar',
    data:{
      labels:summary.districts.map(function(item){ return item[0]; }),
      datasets:[{label:'Jumlah Bantuan',data:summary.districts.map(function(item){ return item[1]; })}]
    },
    options:{indexAxis:'y',maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}
  });

  chartJenisAsli = new Chart(typeCanvas, {
    type:'doughnut',
    data:{
      labels:summary.typeLabels,
      datasets:[{
        data:summary.typeValues,
        backgroundColor:summary.typeLabels.map(function(label){ return configuration.jenisColors[label] || '#7f8c8d'; }),
        borderColor:'#ffffff',borderWidth:2
      }]
    },
    options:{maintainAspectRatio:false}
  });

  chartTahunAsli = new Chart(yearCanvas, {
    type:'line',
    data:{labels:summary.yearLabels,datasets:[{label:'Jumlah Desa Penerima',data:summary.yearValues,tension:0.3}]},
    options:{maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}
  });
};

window.addEventListener('load', function(){ window.setTimeout(window.loadChartDataAsli, 650); });
})();
