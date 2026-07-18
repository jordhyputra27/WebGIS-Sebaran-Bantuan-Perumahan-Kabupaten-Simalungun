
(function(){
function fixStatistics(){
 try{
  if(typeof dataDashboardAsli==='undefined'||!dataDashboardAsli.rawDesa)return;
  const data=dataDashboardAsli.rawDesa;
  const penerima=data.filter(x=>Number(x.Jumlah_Bantuan||0)>0);
  const desa=[...new Set(penerima.map(x=>x.Desa_Kelurahan).filter(Boolean))];
  const kec=[...new Set(penerima.map(x=>x.Kecamatan).filter(Boolean))];
  const sekali=desa.filter(d=>penerima.filter(x=>x.Desa_Kelurahan===d).reduce((a,b)=>a+Number(b.Jumlah_Bantuan||0),0)==1).length;
  const multi=desa.filter(d=>penerima.filter(x=>x.Desa_Kelurahan===d).reduce((a,b)=>a+Number(b.Jumlah_Bantuan||0),0)>1).length;
  const total=penerima.reduce((a,b)=>a+Number(b.Jumlah_Bantuan||0),0);
  function set(id,v){let e=document.getElementById(id);if(e)e.textContent=v;}
  set('desaPenerimaTotal',desa.length+' / 413');
  set('desaPersen',((desa.length/413)*100).toFixed(1)+'% desa menerima bantuan');
  set('kecamatanPenerimaTotal',kec.length+' / 32');
  set('kecamatanPersen',((kec.length/32)*100).toFixed(1)+'% kecamatan menerima bantuan');
  set('totalBantuan',total);
  set('sekaliBantuan',sekali);
  set('multiBantuan',multi);
 }catch(e){console.error(e);}
}
window.addEventListener('load',()=>setTimeout(fixStatistics,500));
window.fixStatistics=fixStatistics;
})();
