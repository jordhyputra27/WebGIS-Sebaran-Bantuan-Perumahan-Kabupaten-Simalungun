document.addEventListener('DOMContentLoaded',function(){
let modal=document.createElement('div');
modal.id='chartModal';
modal.innerHTML=`<div class="modal-chart-box"><button id="closeChart">×</button><h3 id="modalTitle"></h3><div class="modal-chart-area"><canvas id="modalCanvas"></canvas></div></div>`;
document.body.appendChild(modal);
let activeChart=null;

function deepClone(value){
  return JSON.parse(JSON.stringify(value));
}

function buildExpandedConfig(canvas){
  const original=Chart.getChart(canvas);
  if(!original)return null;

  let type=original.config.type;
  let data=deepClone(original.data);
  let options=deepClone(original.options || {});

  options.responsive=true;
  options.maintainAspectRatio=false;
  options.plugins=options.plugins || {};
  options.plugins.legend=options.plugins.legend || {};
  options.plugins.legend.display=true;
  options.plugins.legend.position='top';

  if(canvas.id==='chartKecamatan' && typeof window.getDashboardChartPayload==='function'){
    const payload=window.getDashboardChartPayload('chartKecamatan', true);
    if(payload){
      data.labels=payload.labels;
      data.datasets[0].data=payload.values;
      data.datasets[0].label=payload.label || data.datasets[0].label;
    }
    options.indexAxis='y';
    options.scales=options.scales || {};
    options.scales.x=Object.assign({}, options.scales.x || {}, {beginAtZero:true});
  }else if((canvas.id==='chartJenis' || canvas.id==='chartTahun') && typeof window.getDashboardChartPayload==='function'){
    const payload=window.getDashboardChartPayload(canvas.id, true);
    if(payload){
      data.labels=payload.labels;
      data.datasets[0].data=payload.values;
      data.datasets[0].label=payload.label || data.datasets[0].label;
    }
  }

  return {type:type,data:data,options:options};
}

function closeModal(){
  modal.style.display='none';
  if(activeChart){
    activeChart.destroy();
    activeChart=null;
  }
}

document.querySelectorAll('.chart-box').forEach(panel=>{
 panel.addEventListener('click',function(){
  let canvas=panel.querySelector('canvas');
  if(!canvas)return;
  let cfg=buildExpandedConfig(canvas);
  if(!cfg)return;
  modal.style.display='flex';
  document.getElementById('modalTitle').innerHTML=(panel.querySelector('h3,h4')||{}).innerText || 'Grafik Dashboard';
  if(activeChart)activeChart.destroy();
  activeChart=new Chart(document.getElementById('modalCanvas').getContext('2d'),cfg);
 });
});

document.getElementById('closeChart').onclick=closeModal;
modal.addEventListener('click',function(e){
  if(e.target===modal) closeModal();
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape' && modal.style.display==='flex') closeModal();
});
});
