
function updateStatisticInteractive(){
 const totalDesa=413,totalKec=32;
 const data=(typeof dataDashboardAsli!=='undefined' && dataDashboardAsli.rawDesa)?dataDashboardAsli.rawDesa:[];
 const penerima=data.filter(x=>Number(x.Jumlah_Bantuan)>0);
 const kec=[...new Set(penerima.map(x=>x.Kecamatan).filter(Boolean))];
 const sekali=penerima.filter(x=>Number(x.Jumlah_Bantuan)==1).length;
 const multi=penerima.filter(x=>Number(x.Jumlah_Bantuan)>1).length;
 const set=(i,v)=>{let e=document.getElementById(i);if(e)e.textContent=v;};
 set('desaPenerimaTotal',`${penerima.length} / ${totalDesa}`);
 set('desaPersen',`${(penerima.length/totalDesa*100).toFixed(1)}% cakupan desa`);
 set('kecamatanPenerimaTotal',`${kec.length} / ${totalKec}`);
 set('kecamatanPersen',`${(kec.length/totalKec*100).toFixed(1)}% cakupan kecamatan`);
 set('totalBantuan',penerima.reduce((a,b)=>a+Number(b.Jumlah_Bantuan||0),0));
 set('sekaliBantuan',sekali);
 set('multiBantuan',multi);
}
window.addEventListener('load',()=>setTimeout(updateStatisticInteractive,1500));
