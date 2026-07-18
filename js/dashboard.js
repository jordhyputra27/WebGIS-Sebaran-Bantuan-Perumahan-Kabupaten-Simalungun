function resetDashboard(){
 document.getElementById('filterTahun').value='all';
 document.getElementById('filterJenis').value='all';
 
 if(typeof updateStatistic==='function') updateStatistic();
 if(typeof updateCharts==='function') updateCharts();
}

function updateStatistic(){
    let data = (typeof dataDashboardAsli !== 'undefined' && dataDashboardAsli.rawDesa)
        ? dataDashboardAsli.rawDesa : [];

    let penerima = data.filter(x => Number(x.Jumlah_Bantuan || 0) > 0);
    let kecamatan = [...new Set(penerima.map(x=>x.Kecamatan).filter(Boolean))];
    let sekali = penerima.filter(x=>Number(x.Jumlah_Bantuan||0)==1).length;
    let multi = penerima.filter(x=>Number(x.Jumlah_Bantuan||0)>1).length;

    const set=(id,val)=>{let e=document.getElementById(id); if(e)e.innerHTML=val;};
    set('desaPenerimaTotal', penerima.length+' / 413');
    set('desaPersen', ((penerima.length/413)*100).toFixed(1)+'% desa menerima bantuan');
    set('kecamatanPenerimaTotal', kecamatan.length+' / 32');
    set('kecamatanPersen', ((kecamatan.length/32)*100).toFixed(1)+'% kecamatan menerima bantuan');
    set('sekaliBantuan', sekali);
    set('multiBantuan', multi);
    set('totalBantuan', penerima.reduce((a,b)=>a+Number(b.Jumlah_Bantuan||0),0));
}

window.addEventListener('load',()=>{
 updateStatistic();
});
