
let chartKec;
let chartTahun;
let chartJenis;

function initDashboardChart(){

    console.log("Dashboard chart aktif");

    // Data agregasi sementara dashboard
    const kecamatanData = [
        ["Bandar",10],
        ["Gunung Maligas",8],
        ["Raya",7],
        ["Purba",5],
        ["Bosar Maligas",4]
    ];

    const tahunData = [
        ["2023",18],
        ["2024",22],
        ["2025",28],
        ["2026",50]
    ];

    if(chartKec) chartKec.destroy();
    if(chartTahun) chartTahun.destroy();
    if(chartJenis) chartJenis.destroy();


    chartKec = new Chart(
        document.getElementById("chartKecamatan"),
        {
            type:"bar",
            data:{
                labels:kecamatanData.map(x=>x[0]),
                datasets:[{
                    label:"Desa Penerima",
                    data:kecamatanData.map(x=>x[1])
                }]
            },
            options:{
                indexAxis:"y",
                maintainAspectRatio:false,
                plugins:{
                    legend:{display:false}
                }
            }
        }
    );


    chartJenis = new Chart(
        document.getElementById("chartJenis"),
        {
            type:"doughnut",
            data:{
                labels:["BSPS","APBD Provinsi","APBD Kabupaten"],
                datasets:[{
                    data:[52,18,30]
                }]
            },
            options:{
                maintainAspectRatio:false
            }
        }
    );


    chartTahun = new Chart(
        document.getElementById("chartTahun"),
        {
            type:"line",
            data:{
                labels:tahunData.map(x=>x[0]),
                datasets:[{
                    label:"Jumlah Desa Penerima",
                    data:tahunData.map(x=>x[1]),
                    tension:0.3
                }]
            },
            options:{
                maintainAspectRatio:false,
                scales:{
                    y:{
                        beginAtZero:true
                    }
                }
            }
        }
    );
}

window.addEventListener("load",()=>{
    setTimeout(initDashboardChart,1500);
});
