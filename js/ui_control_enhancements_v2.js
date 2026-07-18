(function(){
  'use strict';

  var INFO_TEXT = 'Peta Sebaran Bantuan Perumahan Kabupaten Simalungun merupakan WebGIS yang menyajikan informasi spasial mengenai distribusi bantuan perumahan berdasarkan desa/kelurahan di Kabupaten Simalungun. Data yang ditampilkan meliputi bantuan yang bersumber dari APBD Kabupaten, APBD Provinsi, dan BSPS, serta dapat difilter berdasarkan tahun pelaksanaan. WebGIS ini bertujuan mendukung penyajian informasi, monitoring, evaluasi, dan pengambilan keputusan dalam pelaksanaan program bantuan perumahan.';

  function qs(sel, root){ return (root || document).querySelector(sel); }
  function on(el, ev, fn, options){ if (el) el.addEventListener(ev, fn, options || false); }

  function injectStyles(){
    var oldStyle = document.getElementById('final-control-style-v2');
    if (oldStyle) oldStyle.remove();

    var style = document.createElement('style');
    style.id = 'final-control-style-v2';
    style.textContent = `
      :root{
        --cblue:#1f4e79;
        --cblue-dark:#173a5a;
        --cblue-soft:#eaf2f8;
        --cborder:rgba(0,0,0,.28);
        --cshadow:0 1px 5px rgba(0,0,0,.28);
        --btn:40px;
        --radius:10px;
        --panel:#234f7d;
      }

      /* Ukuran dan efek dasar seluruh kontrol peta */
      #dashboard .leaflet-control-zoom a,
      #dashboard .leaflet-control-locate a,
      #dashboard .leaflet-control-measure .leaflet-control-measure-toggle,
      #dashboard .leaflet-control-search .search-button,
      #dashboard #gcd-button-control,
      #dashboard .leaflet-control-layers-toggle,
      #dashboard #abstract,
      #dashboard .fullscreen-map-button{
        width:var(--btn)!important;
        height:var(--btn)!important;
        min-width:var(--btn)!important;
        min-height:var(--btn)!important;
        max-width:var(--btn)!important;
        max-height:var(--btn)!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        box-sizing:border-box!important;
        margin:0!important;
        padding:0!important;
        border:1px solid var(--cborder)!important;
        border-radius:var(--radius)!important;
        background-color:#fff!important;
        color:var(--cblue)!important;
        box-shadow:var(--cshadow)!important;
        opacity:1!important;
        cursor:pointer!important;
        transform:none!important;
        transition:background-color .16s ease,color .16s ease,border-color .16s ease,box-shadow .16s ease!important;
      }

      #dashboard .leaflet-control-zoom,
      #dashboard .leaflet-control-locate,
      #dashboard .leaflet-control-measure,
      #dashboard .leaflet-control-search,
      #dashboard .leaflet-control-layers,
      #dashboard .leaflet-photon.leaflet-control{
        background:transparent!important;
        border:0!important;
        box-shadow:none!important;
        overflow:visible!important;
      }

      #dashboard .leaflet-control-zoom a + a{margin-top:4px!important;}

      #dashboard .leaflet-control-zoom a:hover,
      #dashboard .leaflet-control-zoom a:focus-visible,
      #dashboard .leaflet-control-locate a:hover,
      #dashboard .leaflet-control-locate a:focus-visible,
      #dashboard .leaflet-control-measure .leaflet-control-measure-toggle:hover,
      #dashboard .leaflet-control-measure .leaflet-control-measure-toggle:focus-visible,
      #dashboard .leaflet-control-search .search-button:hover,
      #dashboard .leaflet-control-search .search-button:focus-visible,
      #dashboard #gcd-button-control:hover,
      #dashboard #gcd-button-control:focus-visible,
      #dashboard .leaflet-control-layers-toggle:hover,
      #dashboard .leaflet-control-layers-toggle:focus-visible,
      #dashboard .fullscreen-map-button:hover,
      #dashboard .fullscreen-map-button:focus-visible,
      #dashboard #abstract:hover,
      #dashboard #abstract:focus-visible,
      #dashboard .map-dynamic-legend.is-collapsed .map-legend-toggle:hover,
      #dashboard .map-dynamic-legend.is-collapsed .map-legend-toggle:focus-visible{
        background-color:var(--cblue)!important;
        color:#fff!important;
        border-color:var(--cblue)!important;
        box-shadow:0 4px 12px rgba(0,0,0,.22)!important;
        filter:none!important;
        transform:none!important;
        outline:none!important;
      }

      /* Ikon ukur vektor: tajam dan mengikuti warna currentColor saat hover */
      #dashboard .leaflet-control-measure .leaflet-control-measure-toggle{
        position:relative!important;
        background-image:none!important;
        text-indent:0!important;
        overflow:hidden!important;
        font-size:0!important;
        line-height:1!important;
      }
      #dashboard .leaflet-control-measure .leaflet-control-measure-toggle::before{
        content:""!important;
        display:block!important;
        width:22px!important;
        height:22px!important;
        background-color:currentColor!important;
        -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4 16.5 16.5 4 20 7.5 7.5 20H4v-3.5Z' fill='none' stroke='black' stroke-width='2' stroke-linejoin='round'/%3E%3Cpath d='m13.2 7.4 3.4 3.4M10.5 10.1l2.1 2.1M7.9 12.7l2 2' fill='none' stroke='black' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat!important;
        mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4 16.5 16.5 4 20 7.5 7.5 20H4v-3.5Z' fill='none' stroke='black' stroke-width='2' stroke-linejoin='round'/%3E%3Cpath d='m13.2 7.4 3.4 3.4M10.5 10.1l2.1 2.1M7.9 12.7l2 2' fill='none' stroke='black' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat!important;
      }

      /* Ikon layer vektor: tidak buram dan berubah putih saat hover */
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-toggle{
        position:relative!important;
        background-image:none!important;
        text-indent:0!important;
        overflow:hidden!important;
        font-size:0!important;
        line-height:1!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-toggle::before,
      #dashboard .gs-layer-title-icon::before{
        content:""!important;
        display:block!important;
        width:21px!important;
        height:21px!important;
        background-color:currentColor!important;
        -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='m12 3 9 5-9 5-9-5 9-5Zm-7.8 9.2L12 16.5l7.8-4.3L21 14l-9 5-9-5 1.2-1.8Zm0 4L12 20.5l7.8-4.3L21 18l-9 5-9-5 1.2-1.8Z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat!important;
        mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='m12 3 9 5-9 5-9-5 9-5Zm-7.8 9.2L12 16.5l7.8-4.3L21 14l-9 5-9-5 1.2-1.8Zm0 4L12 20.5l7.8-4.3L21 18l-9 5-9-5 1.2-1.8Z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat!important;
      }

      #dashboard .leaflet-control-locate a,
      #dashboard .leaflet-control-locate a .fa,
      #dashboard .leaflet-control-locate a span{
        opacity:1!important;
        color:var(--cblue)!important;
      }
      #dashboard .leaflet-control-locate a:hover .fa,
      #dashboard .leaflet-control-locate a:focus-visible .fa,
      #dashboard .leaflet-control-locate a:hover span,
      #dashboard .leaflet-control-locate a:focus-visible span{
        color:#fff!important;
        opacity:1!important;
      }

      /* Search desa */
      #dashboard .leaflet-control-search.gs-search-control{
        position:relative!important;
        display:block!important;
        width:var(--btn)!important;
        min-height:var(--btn)!important;
        overflow:visible!important;
      }
      #dashboard .leaflet-control-search.gs-search-control .search-button{
        float:none!important;
        position:relative!important;
        z-index:2!important;
      }
      #dashboard .leaflet-control-search.gs-search-control .search-input{
        position:absolute!important;
        left:calc(var(--btn) + 8px)!important;
        top:0!important;
        width:250px!important;
        min-width:250px!important;
        height:var(--btn)!important;
        margin:0!important;
        padding:0 32px 0 12px!important;
        box-sizing:border-box!important;
        border:1px solid var(--cborder)!important;
        border-radius:10px!important;
        background:#fff!important;
        box-shadow:0 4px 12px rgba(0,0,0,.16)!important;
        opacity:0!important;
        pointer-events:none!important;
      }
      #dashboard .leaflet-control-search.gs-search-control.search-exp .search-input,
      #dashboard .leaflet-control-search.gs-search-control .search-input:focus{
        opacity:1!important;
        pointer-events:auto!important;
      }
      #dashboard .leaflet-control-search.gs-search-control .search-cancel{
        right:auto!important;
        left:276px!important;
        top:11px!important;
        margin:0!important;
      }
      #dashboard .leaflet-control-search.gs-search-control .search-tooltip{
        top:calc(var(--btn) + 8px)!important;
        left:calc(var(--btn) + 8px)!important;
        min-width:250px!important;
        max-width:250px!important;
        max-height:190px!important;
        border-radius:10px!important;
        background:#fff!important;
        box-shadow:0 4px 12px rgba(0,0,0,.16)!important;
      }

      /* Search alamat */
      #dashboard .leaflet-photon.leaflet-control.gs-address-control{
        position:relative!important;
        width:var(--btn)!important;
        min-height:var(--btn)!important;
        z-index:3600!important;
        pointer-events:auto!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control #gcd-button-control{
        position:relative!important;
        z-index:2!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control .gs-address-panel{
        position:absolute!important;
        left:calc(var(--btn) + 8px)!important;
        top:0!important;
        min-width:250px!important;
        max-width:250px!important;
        background:#fff!important;
        border:1px solid var(--cborder)!important;
        border-radius:10px!important;
        box-shadow:0 4px 12px rgba(0,0,0,.16)!important;
        overflow:visible!important;
        z-index:3601!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control .photon-input{
        width:248px!important;
        max-width:248px!important;
        height:var(--btn)!important;
        border:0!important;
        border-radius:10px!important;
        padding:0 12px!important;
        box-sizing:border-box!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control ul.photon-autocomplete{
        top:calc(var(--btn) + 6px)!important;
        left:0!important;
        min-width:250px!important;
        max-width:250px!important;
        border-radius:10px!important;
        background:#fff!important;
        box-shadow:0 4px 12px rgba(0,0,0,.16)!important;
      }

      /* Panel ukur */
      #dashboard .leaflet-control-measure.gs-measure-control{position:relative!important;}
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction{
        position:absolute!important;
        top:0!important;
        left:calc(var(--btn) + 8px)!important;
        width:260px!important;
        padding:12px 14px!important;
        background:#fff!important;
        border:1px solid var(--cborder)!important;
        border-radius:12px!important;
        box-shadow:0 4px 12px rgba(0,0,0,.16)!important;
        z-index:3600!important;
      }
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction h3{
        margin:0 0 10px!important;
        padding-bottom:8px!important;
        font-size:15px!important;
        color:var(--cblue-dark)!important;
      }
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction .tasks{
        display:flex!important;
        flex-direction:column!important;
        gap:8px!important;
        margin:10px 0 0!important;
        padding-top:10px!important;
      }
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction .tasks a{
        display:block!important;
        padding:8px 10px!important;
        border:1px solid rgba(31,78,121,.18)!important;
        border-radius:8px!important;
        background:#f5f8fb!important;
        color:var(--cblue)!important;
        opacity:1!important;
      }
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction .tasks a:hover{
        background:var(--cblue)!important;
        color:#fff!important;
        text-decoration:none!important;
      }

      /* Panel layer: klik untuk buka, tidak pernah melebar karena hover */
      #dashboard .leaflet-control-layers.gs-layer-control{
        position:relative!important;
        width:var(--btn)!important;
        min-width:var(--btn)!important;
        max-width:var(--btn)!important;
        min-height:var(--btn)!important;
        padding:0!important;
        background:transparent!important;
        border:0!important;
        border-radius:12px!important;
        box-shadow:none!important;
        overflow:visible!important;
        transform:none!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control:hover,
      #dashboard .leaflet-control-layers.gs-layer-control.leaflet-control-layers-expanded:not(.gs-open){
        width:var(--btn)!important;
        min-width:var(--btn)!important;
        max-width:var(--btn)!important;
        min-height:var(--btn)!important;
        padding:0!important;
        background:transparent!important;
        box-shadow:none!important;
        transform:none!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control:not(.gs-open) .leaflet-control-layers-list,
      #dashboard .leaflet-control-layers.gs-layer-control:not(.gs-open) .gs-layer-panel-header{
        display:none!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open{
        width:214px!important;
        min-width:214px!important;
        max-width:214px!important;
        min-height:0!important;
        padding:0!important;
        background:var(--panel)!important;
        border:1px solid rgba(255,255,255,.14)!important;
        border-radius:13px!important;
        box-shadow:0 7px 22px rgba(0,0,0,.24)!important;
        overflow:hidden!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open > .leaflet-control-layers-toggle{
        display:none!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open .gs-layer-panel-header{
        height:42px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:8px!important;
        padding:0 8px 0 11px!important;
        box-sizing:border-box!important;
        border-bottom:1px solid rgba(255,255,255,.14)!important;
        background:rgba(0,0,0,.06)!important;
      }
      #dashboard .gs-layer-panel-title{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        min-width:0!important;
        color:#fff!important;
        font:700 13px/1.2 Arial,Helvetica,sans-serif!important;
        letter-spacing:.1px!important;
      }
      #dashboard .gs-layer-title-icon{
        width:20px!important;
        height:20px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        color:#fff!important;
        flex:0 0 20px!important;
      }
      #dashboard .gs-layer-close{
        width:28px!important;
        height:28px!important;
        min-width:28px!important;
        min-height:28px!important;
        padding:0!important;
        border:0!important;
        border-radius:7px!important;
        background:rgba(255,255,255,.10)!important;
        color:#fff!important;
        font:400 22px/1 Arial,Helvetica,sans-serif!important;
        cursor:pointer!important;
        box-shadow:none!important;
        transform:none!important;
        transition:background-color .16s ease!important;
      }
      #dashboard .gs-layer-close:hover,
      #dashboard .gs-layer-close:focus-visible{
        background:rgba(255,255,255,.23)!important;
        outline:none!important;
        transform:none!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open .leaflet-control-layers-list{
        display:block!important;
        position:static!important;
        margin:0!important;
        padding:6px 7px 7px!important;
        max-height:250px!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        background:transparent!important;
        color:#fff!important;
        box-sizing:border-box!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-overlays,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-node{
        margin:0!important;
        padding:0!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header{
        margin:1px 0!important;
        padding:0!important;
        border-radius:8px!important;
        transition:background-color .14s ease!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header:hover{
        background:rgba(255,255,255,.12)!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header label,
      #dashboard .leaflet-control-layers.gs-layer-control label{
        width:100%!important;
        min-height:31px!important;
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        margin:0!important;
        padding:6px 7px!important;
        box-sizing:border-box!important;
        cursor:pointer!important;
        line-height:1.2!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control label input,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-selector{
        width:15px!important;
        height:15px!important;
        flex:0 0 15px!important;
        margin:0!important;
        top:0!important;
        accent-color:#dcecff!important;
        cursor:pointer!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control label span,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header-name{
        min-width:0!important;
        display:flex!important;
        align-items:center!important;
        gap:6px!important;
        color:#fff!important;
        font:500 12.5px/1.25 Arial,Helvetica,sans-serif!important;
        word-break:normal!important;
        overflow-wrap:anywhere!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control label img{
        width:17px!important;
        height:17px!important;
        flex:0 0 17px!important;
        object-fit:contain!important;
        margin:0!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-list::-webkit-scrollbar{width:5px!important;}
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-list::-webkit-scrollbar-track{background:transparent!important;}
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.35)!important;border-radius:999px!important;}

      /* Legenda tidak bergeser saat hover dan tetap independen dari panel layer */
      #dashboard .map-dynamic-legend,
      #dashboard .map-dynamic-legend .map-legend-toggle,
      #dashboard .map-dynamic-legend .map-legend-close,
      #dashboard .map-dynamic-legend .map-legend-header{
        transform:none!important;
      }
      #dashboard .map-dynamic-legend .map-legend-toggle:hover,
      #dashboard .map-dynamic-legend .map-legend-close:hover{
        transform:none!important;
      }
      #dashboard .map-dynamic-legend.is-collapsed .map-legend-header{background:transparent!important;}
      #dashboard .map-dynamic-legend.is-collapsed .map-legend-toggle{
        width:var(--btn)!important;
        height:var(--btn)!important;
        min-width:var(--btn)!important;
        min-height:var(--btn)!important;
        padding:0!important;
        border:1px solid var(--cborder)!important;
        border-radius:var(--radius)!important;
        background:#fff!important;
        color:var(--cblue)!important;
        box-shadow:var(--cshadow)!important;
      }
      #dashboard .map-dynamic-legend.is-collapsed .map-legend-close{display:none!important;}

      /* Hover/highlight filter dan reset filter tanpa mengubah ukuran */
      #dashboard #filter-dashboard select,
      #dashboard #filter-dashboard button,
      #dashboard #toggleFilterPanel{
        box-sizing:border-box!important;
        transition:background-color .16s ease,color .16s ease,border-color .16s ease,box-shadow .16s ease!important;
        transform:none!important;
      }
      #dashboard #filter-dashboard select:hover{
        border-color:var(--cblue)!important;
        background-color:#f3f8fc!important;
        box-shadow:0 0 0 2px rgba(31,78,121,.13)!important;
        transform:none!important;
      }
      #dashboard #filter-dashboard select:focus{
        border-color:var(--cblue)!important;
        background-color:#fff!important;
        box-shadow:0 0 0 3px rgba(31,78,121,.18)!important;
        outline:none!important;
      }
      #dashboard #filter-dashboard button{
        border:1px solid var(--cblue)!important;
        background:#fff!important;
        color:var(--cblue)!important;
        font-weight:700!important;
        cursor:pointer!important;
      }
      #dashboard #filter-dashboard button:hover,
      #dashboard #filter-dashboard button:focus-visible,
      #dashboard #toggleFilterPanel:hover,
      #dashboard #toggleFilterPanel:focus-visible{
        border-color:var(--cblue)!important;
        background:var(--cblue)!important;
        color:#fff!important;
        box-shadow:0 3px 9px rgba(31,78,121,.24)!important;
        outline:none!important;
        transform:none!important;
      }

      /* Informasi peta */
      #dashboard #abstract.gs-info-control{
        background:var(--cblue)!important;
        color:#fff!important;
        font:700 18px/1 'Lucida Console',Monaco,monospace!important;
        text-indent:0!important;
        cursor:pointer!important;
        position:relative!important;
        overflow:visible!important;
      }
      #dashboard #abstract.gs-info-control:not(.is-open)::after{
        content:attr(data-hover-label);
        position:absolute;
        right:calc(100% + 8px);
        top:50%;
        transform:translateY(-50%);
        padding:6px 10px;
        border-radius:8px;
        background:rgba(27,52,82,.95);
        color:#fff;
        font:600 11px/1.2 Arial,Helvetica,sans-serif;
        white-space:nowrap;
        opacity:0;
        pointer-events:none;
        box-shadow:0 4px 12px rgba(0,0,0,.18);
      }
      #dashboard #abstract.gs-info-control:not(.is-open):hover::after{opacity:1;}
      #dashboard #abstract.gs-info-control.is-open{
        width:290px!important;
        max-width:min(290px,calc(100vw - 24px))!important;
        height:auto!important;
        max-height:none!important;
        padding:0!important;
        border-radius:14px!important;
        background:var(--panel)!important;
        color:#fff!important;
      }
      #dashboard #abstract.gs-info-control .abstract-panel-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:12px 14px 0;
      }
      #dashboard #abstract.gs-info-control .abstract-panel-title{
        font:700 15px/1.2 Arial,Helvetica,sans-serif!important;
        color:#fff;
      }
      #dashboard #abstract.gs-info-control .abstract-panel-close{
        border:0!important;
        background:transparent!important;
        color:#fff!important;
        font-size:24px!important;
        line-height:1!important;
        cursor:pointer!important;
        padding:0!important;
      }
      #dashboard #abstract.gs-info-control .abstract-panel-body{
        padding:8px 14px 14px;
        font:12px/1.5 Arial,Helvetica,sans-serif!important;
        color:#fff!important;
        text-align:justify!important;
      }

      /* =========================================================
         REVISI 16 - panel layer lebih ramping, legenda tertutup utuh,
         ikon zoom tebal, dan tombol X pada kedua panel pencarian.
         ========================================================= */

      /* Simbol zoom dibuat lebih tebal dan konsisten. */
      #dashboard .leaflet-control-zoom-in,
      #dashboard .leaflet-control-zoom-out{
        font-size:0!important;
        line-height:1!important;
        text-indent:0!important;
        overflow:hidden!important;
      }
      #dashboard .leaflet-control-zoom-in::before,
      #dashboard .leaflet-control-zoom-out::before{
        display:block!important;
        color:currentColor!important;
        font:800 27px/1 Arial,Helvetica,sans-serif!important;
        transform:translateY(-1px)!important;
      }
      #dashboard .leaflet-control-zoom-in::before{content:"+"!important;}
      #dashboard .leaflet-control-zoom-out::before{content:"−"!important;}

      /* Panel layer mengikuti pola legenda: header biru dan isi putih. */
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open{
        width:196px!important;
        min-width:196px!important;
        max-width:196px!important;
        background:#fff!important;
        border:1px solid rgba(0,0,0,.16)!important;
        border-radius:12px!important;
        box-shadow:0 4px 16px rgba(0,0,0,.18)!important;
        box-sizing:border-box!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open .gs-layer-panel-header{
        height:38px!important;
        min-height:38px!important;
        padding:0 7px 0 10px!important;
        background:#2e5c8a!important;
        border-bottom:0!important;
      }
      #dashboard .gs-layer-panel-title{
        gap:7px!important;
        font-size:13px!important;
      }
      #dashboard .gs-layer-title-icon{
        width:18px!important;
        height:18px!important;
        flex-basis:18px!important;
      }
      #dashboard .gs-layer-title-icon::before{
        width:18px!important;
        height:18px!important;
      }
      #dashboard .gs-layer-close{
        width:27px!important;
        height:27px!important;
        min-width:27px!important;
        min-height:27px!important;
        border-radius:7px!important;
        font-size:21px!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open .leaflet-control-layers-list{
        padding:4px 5px 5px!important;
        max-height:190px!important;
        background:#fff!important;
        color:#263238!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-children,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-children-nopad{
        padding-left:0!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header{
        margin:0!important;
        border-radius:7px!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header:hover{
        background:#eaf2f8!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header label,
      #dashboard .leaflet-control-layers.gs-layer-control label{
        min-height:27px!important;
        gap:6px!important;
        padding:4px 5px!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control label input,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-selector{
        width:14px!important;
        height:14px!important;
        flex-basis:14px!important;
        accent-color:#2e5c8a!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control label span,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header-name{
        gap:5px!important;
        color:#263238!important;
        font:500 12px/1.15 Arial,Helvetica,sans-serif!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control label img{
        width:15px!important;
        height:15px!important;
        flex-basis:15px!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-list::-webkit-scrollbar-thumb{
        background:rgba(46,92,138,.38)!important;
      }

      /* Saat ditutup, tombol legenda kembali tampil penuh dan tidak terpotong. */
      #dashboard .map-dynamic-legend.is-collapsed{
        width:96px!important;
        min-width:96px!important;
        max-width:96px!important;
        height:var(--btn)!important;
        min-height:var(--btn)!important;
        overflow:visible!important;
        background:transparent!important;
        box-shadow:none!important;
      }
      #dashboard .map-dynamic-legend.is-collapsed .map-legend-header{
        width:96px!important;
        min-width:96px!important;
        height:var(--btn)!important;
        overflow:visible!important;
      }
      #dashboard .map-dynamic-legend.is-collapsed .map-legend-toggle{
        width:96px!important;
        min-width:96px!important;
        max-width:96px!important;
        height:var(--btn)!important;
        gap:7px!important;
        padding:0 9px!important;
        justify-content:flex-start!important;
        white-space:nowrap!important;
        overflow:hidden!important;
      }
      #dashboard .map-dynamic-legend.is-collapsed .map-legend-toggle::after{display:none!important;}
      #dashboard .map-dynamic-legend.is-collapsed .map-legend-icon{flex:0 0 auto!important;}

      /* Tombol X pencarian desa dan pencarian alamat. */
      #dashboard .leaflet-control-search.gs-search-control .search-cancel{display:none!important;}
      #dashboard .gs-search-close,
      #dashboard .gs-address-close{
        position:absolute!important;
        width:28px!important;
        height:28px!important;
        min-width:28px!important;
        min-height:28px!important;
        display:none!important;
        align-items:center!important;
        justify-content:center!important;
        padding:0!important;
        border:0!important;
        border-radius:7px!important;
        background:transparent!important;
        color:#36536d!important;
        font:500 22px/1 Arial,Helvetica,sans-serif!important;
        cursor:pointer!important;
        z-index:3705!important;
        box-shadow:none!important;
      }
      #dashboard .gs-search-close:hover,
      #dashboard .gs-search-close:focus-visible,
      #dashboard .gs-address-close:hover,
      #dashboard .gs-address-close:focus-visible{
        background:#eaf2f8!important;
        color:#1f4e79!important;
        outline:none!important;
      }
      #dashboard .leaflet-control-search.gs-search-control.search-exp .gs-search-close{
        display:flex!important;
        left:270px!important;
        top:6px!important;
      }
      #dashboard .leaflet-control-search.gs-search-control .search-input{
        padding-right:40px!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control.is-open .gs-address-close{
        display:flex!important;
        right:6px!important;
        top:6px!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control .photon-input{
        padding-right:40px!important;
      }

      @media (max-width:700px){
        #dashboard .leaflet-control-search.gs-search-control.search-exp .search-input,
        #dashboard .leaflet-control-search.gs-search-control .search-input:focus{
          width:210px!important;
          min-width:210px!important;
        }
        #dashboard .leaflet-control-search.gs-search-control .search-cancel{left:236px!important;}
        #dashboard .leaflet-control-search.gs-search-control.search-exp .gs-search-close{left:230px!important;}
        #dashboard .leaflet-control-search.gs-search-control .search-tooltip,
        #dashboard .leaflet-photon.leaflet-control.gs-address-control .gs-address-panel,
        #dashboard .leaflet-photon.leaflet-control.gs-address-control ul.photon-autocomplete,
        #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction{
          min-width:210px!important;
          max-width:210px!important;
          width:210px!important;
        }
        #dashboard .leaflet-photon.leaflet-control.gs-address-control .photon-input{
          width:208px!important;
          max-width:208px!important;
        }
        #dashboard .leaflet-control-layers.gs-layer-control.gs-open{
          width:190px!important;
          min-width:190px!important;
          max-width:190px!important;
        }
        #dashboard #abstract.gs-info-control.is-open{
          width:240px!important;
          max-width:240px!important;
        }
      }

      /* =========================================================
         REVISI 17 - koordinat measurement terlihat, panel layer
         tanpa ruang kosong, tombol X alamat selalu tersedia, dan
         hasil pencarian alamat dibersihkan saat panel ditutup.
         ========================================================= */

      /* Teks hasil measurement tidak lagi mewarisi warna putih qgis2web. */
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction,
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction p,
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction .results p{
        color:#263238!important;
      }
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction .results .heading{
        color:#7a858e!important;
      }
      #dashboard .leaflet-control-measure.gs-measure-control .leaflet-control-measure-interaction .results .coorddivider{
        color:#8a949c!important;
      }

      /* qgis2web memberi display:flex + align-items:flex-end pada layer.
         Itu membuat header/list menyusut ke kanan dan meninggalkan bidang kosong. */
      #dashboard .leaflet-control-layers.gs-layer-control,
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open{
        display:block!important;
        flex-direction:initial!important;
        align-items:stretch!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open{
        width:186px!important;
        min-width:186px!important;
        max-width:186px!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open .gs-layer-panel-header,
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open .leaflet-control-layers-list,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-control-layers-overlays,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-node,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header{
        width:100%!important;
        max-width:100%!important;
        margin-left:0!important;
        margin-right:0!important;
        align-self:stretch!important;
        box-sizing:border-box!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control.gs-open .leaflet-control-layers-list{
        padding:3px 4px 4px!important;
        max-height:184px!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-header label,
      #dashboard .leaflet-control-layers.gs-layer-control label{
        min-height:26px!important;
        padding:3px 4px!important;
      }
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-children,
      #dashboard .leaflet-control-layers.gs-layer-control .leaflet-layerstree-children-nopad{
        width:100%!important;
        margin:0!important;
        padding-left:0!important;
        box-sizing:border-box!important;
      }

      /* Panel alamat kini wrapper nyata, sehingga tombol X selalu terlihat. */
      #dashboard .leaflet-photon.leaflet-control.gs-address-control .gs-address-panel{
        display:none;
        width:250px!important;
        min-width:250px!important;
        max-width:250px!important;
        height:var(--btn)!important;
        box-sizing:border-box!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control.is-open .gs-address-panel{
        display:block!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control .gs-address-panel .photon-input{
        display:block!important;
        width:100%!important;
        max-width:100%!important;
        padding-right:42px!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control.is-open .gs-address-close{
        display:flex!important;
        right:6px!important;
        top:6px!important;
      }

      /* REVISI 19 - satu tombol X pada Search Address. */
      #dashboard .leaflet-photon.leaflet-control.gs-address-control .photon-input{
        -webkit-appearance:none!important;
        appearance:none!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control .photon-input::-webkit-search-cancel-button,
      #dashboard .leaflet-photon.leaflet-control.gs-address-control .photon-input::-webkit-search-decoration{
        -webkit-appearance:none!important;
        appearance:none!important;
        display:none!important;
      }
      #dashboard .leaflet-photon.leaflet-control.gs-address-control.is-open .gs-address-close{
        right:8px!important;
      }

      @media (max-width:700px){
        #dashboard .leaflet-control-layers.gs-layer-control.gs-open{
          width:180px!important;
          min-width:180px!important;
          max-width:180px!important;
        }
        #dashboard .leaflet-photon.leaflet-control.gs-address-control .gs-address-panel{
          width:210px!important;
          min-width:210px!important;
          max-width:210px!important;
        }
      }

    `;
    document.head.appendChild(style);
  }

  function closeVillageSearch(){
    var search = qs('.leaflet-control-search.gs-search-control');
    if (!search) return;
    if (window.villageSearchControl && typeof window.villageSearchControl.collapse === 'function') {
      window.villageSearchControl.collapse();
    } else {
      search.classList.remove('search-exp');
      var input = qs('.search-input', search);
      var tooltip = qs('.search-tooltip', search);
      if (input) { input.style.display = 'none'; input.blur(); }
      if (tooltip) tooltip.style.display = 'none';
    }
  }

  function clearAddressResult(){
    try {
      if (typeof map !== 'undefined' && map) {
        if (typeof obj3 !== 'undefined' && obj3 && obj3.marker) {
          try { if (map.hasLayer(obj3.marker)) map.removeLayer(obj3.marker); } catch(e) {}
          try { obj3.marker = null; } catch(e) {}
        }
        if (typeof x !== 'undefined' && x) {
          try { if (map.hasLayer(x)) map.removeLayer(x); } catch(e) {}
          try { x = null; } catch(e) {}
        }
      }
    } catch(e) {}

    var control = qs('.leaflet-photon.leaflet-control.gs-address-control');
    var input = control ? qs('.photon-input', control) : null;
    if (input) input.value = '';

    try {
      if (typeof photonControl !== 'undefined' && photonControl && photonControl.search && photonControl.search.resultsContainer) {
        photonControl.search.resultsContainer.style.display = 'none';
        photonControl.search.resultsContainer.innerHTML = '';
      }
    } catch(e) {}
  }

  function closeAddressSearch(){
    var control = qs('.leaflet-photon.leaflet-control.gs-address-control');
    if (!control) return;
    var panel = qs('.gs-address-panel', control);
    var btn = qs('#gcd-button-control', control);
    if (panel) panel.style.display = 'none';
    control.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    clearAddressResult();
  }

  function setupSearch(){
    var search = qs('.leaflet-control-search:not(.leaflet-photon)');
    if (!search) return;
    search.classList.add('gs-search-control');
    var btn = qs('.search-button', search);
    var input = qs('.search-input', search);
    var close = qs('.gs-search-close', search);

    if (!close) {
      close = document.createElement('button');
      close.type = 'button';
      close.className = 'gs-search-close';
      close.setAttribute('aria-label', 'Tutup pencarian desa');
      close.title = 'Tutup pencarian';
      close.innerHTML = '&times;';
      search.appendChild(close);
    }

    if (btn) {
      btn.title = 'Cari desa/kelurahan';
      btn.setAttribute('aria-label', 'Cari desa/kelurahan');
      if (!btn.dataset.boundExclusiveSearchV16) {
        on(btn, 'click', function(){ closeAddressSearch(); }, true);
        btn.dataset.boundExclusiveSearchV16 = '1';
      }
    }
    if (input) {
      input.placeholder = 'Search...';
      input.title = 'Masukkan nama desa/kelurahan';
    }
    if (close && !close.dataset.boundCloseSearchV16) {
      on(close, 'pointerdown', function(e){ e.preventDefault(); e.stopPropagation(); });
      on(close, 'click', function(e){
        e.preventDefault();
        e.stopPropagation();
        closeVillageSearch();
        if (btn) btn.focus();
      });
      close.dataset.boundCloseSearchV16 = '1';
    }
  }

  function setupAddressSearch(){
    var control = qs('.leaflet-photon.leaflet-control');
    if (!control) return;
    control.classList.add('gs-address-control');

    var btn = qs('#gcd-button-control', control) || document.getElementById('gcd-button-control');
    var input = qs('input.photon-input', control) || qs('input', control);
    if (!btn || !input) return;

    /* Revisi 16 menjadikan input sebagai "panel". Input tidak dapat merender
       tombol anak, sehingga X baru terlihat setelah mekanisme plugin aktif.
       Buat wrapper panel yang benar dan pindahkan input ke dalamnya. */
    var panel = qs('.gs-address-panel', control);
    if (panel && panel.tagName && panel.tagName.toLowerCase() === 'input') {
      panel.classList.remove('gs-address-panel');
      panel = null;
    }
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'gs-address-panel';
      control.appendChild(panel);
    }
    if (input.parentNode !== panel) panel.insertBefore(input, panel.firstChild);

    panel.style.display = control.classList.contains('is-open') ? 'block' : 'none';
    btn.title = 'Cari alamat';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-expanded', control.classList.contains('is-open') ? 'true' : 'false');
    // Gunakan input teks biasa agar Chrome tidak menampilkan tombol hapus bawaan.
    // Hanya tombol X kustom yang menutup panel sekaligus menghapus marker hasil alamat.
    input.type = 'text';
    input.setAttribute('inputmode', 'search');
    input.placeholder = 'Search address...';
    input.title = 'Masukkan alamat';

    var close = qs('.gs-address-close', panel);
    if (!close) {
      close = document.createElement('button');
      close.type = 'button';
      close.className = 'gs-address-close';
      close.setAttribute('aria-label', 'Tutup pencarian alamat');
      close.title = 'Tutup pencarian';
      close.innerHTML = '&times;';
      panel.appendChild(close);
    }

    function openPanel(){
      closeVillageSearch();
      panel.style.display = 'block';
      control.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      setTimeout(function(){ input.focus(); }, 40);
    }
    function closePanel(){
      panel.style.display = 'none';
      control.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      clearAddressResult();
    }
    function togglePanel(e){
      if (e) { e.preventDefault(); e.stopPropagation(); }
      control.classList.contains('is-open') ? closePanel() : openPanel();
    }

    if (!btn.dataset.boundOpenV2){
      on(btn, 'click', togglePanel);
      on(btn, 'keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') togglePanel(e);
      });
      btn.dataset.boundOpenV2 = '1';
    }
    if (close && !close.dataset.boundAddressCloseV17) {
      on(close, 'pointerdown', function(e){ e.preventDefault(); e.stopPropagation(); });
      on(close, 'click', function(e){
        e.preventDefault();
        e.stopPropagation();
        closePanel();
        btn.focus();
      });
      close.dataset.boundAddressCloseV17 = '1';
    }
    if (!control.dataset.boundInsideV2){
      on(control, 'pointerdown', function(e){ e.stopPropagation(); });
      on(control, 'click', function(e){ e.stopPropagation(); });
      control.dataset.boundInsideV2 = '1';
    }
    if (!document.documentElement.dataset.boundAddressOutsideV2){
      on(document, 'pointerdown', function(e){
        var current = qs('.leaflet-photon.leaflet-control.gs-address-control');
        if (!current || current.contains(e.target)) return;

        // Daftar hasil Photon ditempel langsung ke <body>, bukan di dalam control.
        // Jangan tutup/bersihkan pencarian sebelum item hasil sempat dipilih.
        if (e.target.closest && e.target.closest('.photon-autocomplete')) return;

        closeAddressSearch();
      });
      document.documentElement.dataset.boundAddressOutsideV2 = '1';
    }
  }

  function setupMeasure(){
    if (typeof measureControl === 'undefined' || !measureControl || !measureControl._container) return;

    var box = measureControl._container;
    var toggle = measureControl.$toggle || qs('.leaflet-control-measure-toggle', box);
    box.classList.add('gs-measure-control');

    try {
      // Remove every automatic hover/focus opener registered by the plugin.
      L.DomEvent.off(box, 'mouseenter mouseleave mouseover mouseout');
      if (toggle) L.DomEvent.off(toggle, 'focus');
      L.DomEvent.off(toggle, 'click', measureControl._expand, measureControl);
    } catch(e) {}

    if (measureControl.$interaction && !measureControl._locked) {
      measureControl.$interaction.style.display = 'none';
      if (toggle) toggle.style.display = 'flex';
    }

    if (toggle) {
      toggle.title = 'Ukur jarak dan area';
      toggle.setAttribute('aria-label', 'Ukur jarak dan area');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function isExpanded(){
      return !!(measureControl.$interaction && measureControl.$interaction.style.display !== 'none');
    }
    function openMeasure(){
      measureControl._expand();
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }
    function closeMeasure(){
      if (!measureControl._locked) {
        measureControl._collapse();
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    }

    if (toggle && !toggle.dataset.boundMeasureV2){
      on(toggle, 'click', function(e){
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        isExpanded() ? closeMeasure() : openMeasure();
      }, true);
      toggle.dataset.boundMeasureV2 = '1';
    }

    if (!box.dataset.boundMeasureInsideV2){
      on(box, 'pointerdown', function(e){ e.stopPropagation(); });
      box.dataset.boundMeasureInsideV2 = '1';
    }

    if (!document.documentElement.dataset.boundMeasureOutsideV2){
      on(document, 'pointerdown', function(e){
        var currentBox = qs('.leaflet-control-measure.gs-measure-control');
        if (!currentBox || currentBox.contains(e.target)) return;
        if (typeof measureControl !== 'undefined' && measureControl && !measureControl._locked) {
          measureControl._collapse();
          var currentToggle = measureControl.$toggle || qs('.leaflet-control-measure-toggle', currentBox);
          if (currentToggle) currentToggle.setAttribute('aria-expanded', 'false');
        }
      });
      document.documentElement.dataset.boundMeasureOutsideV2 = '1';
    }
  }

  function setupLayer(){
    var control = qs('.leaflet-control-layers');
    if (!control) return;

    control.classList.add('gs-layer-control');
    control.classList.remove('leaflet-control-layers-expanded');
    var toggle = qs('.leaflet-control-layers-toggle', control);
    var list = qs('.leaflet-control-layers-list', control);

    if (typeof lay !== 'undefined' && lay && lay._container) {
      try {
        // Remove every automatic hover/focus opener registered by Leaflet.
        // Using the two-argument form clears the wrapped Leaflet handlers too.
        L.DomEvent.off(lay._container, 'mouseenter mouseleave mouseover mouseout');
        if (toggle) L.DomEvent.off(toggle, 'focus');
      } catch(e) {}
    }

    var header = qs('.gs-layer-panel-header', control);
    if (!header) {
      header = document.createElement('div');
      header.className = 'gs-layer-panel-header';
      header.innerHTML = '<div class="gs-layer-panel-title"><span class="gs-layer-title-icon" aria-hidden="true"></span><span>Layer Peta</span></div><button type="button" class="gs-layer-close" aria-label="Tutup layer">&times;</button>';
      if (list) control.insertBefore(header, list);
      else control.appendChild(header);
    }
    var closeButton = qs('.gs-layer-close', header);

    function openPanel(){
      control.classList.add('gs-open');
      control.classList.remove('leaflet-control-layers-expanded');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }
    function closePanel(){
      control.classList.remove('gs-open');
      control.classList.remove('leaflet-control-layers-expanded');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    if (toggle) {
      toggle.title = 'Buka layer peta';
      toggle.setAttribute('aria-label', 'Buka layer peta');
      toggle.setAttribute('aria-expanded', control.classList.contains('gs-open') ? 'true' : 'false');
    }

    if (toggle && !toggle.dataset.boundLayerV2){
      on(toggle, 'click', function(e){
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        control.classList.contains('gs-open') ? closePanel() : openPanel();
      }, true);
      toggle.dataset.boundLayerV2 = '1';
    }

    if (closeButton && !closeButton.dataset.boundLayerCloseV2){
      on(closeButton, 'pointerdown', function(e){ e.preventDefault(); e.stopPropagation(); });
      on(closeButton, 'click', function(e){
        e.preventDefault();
        e.stopPropagation();
        closePanel();
        if (toggle) toggle.focus();
      });
      closeButton.dataset.boundLayerCloseV2 = '1';
    }

    if (!control.dataset.boundLayerInsideV2){
      on(control, 'pointerdown', function(e){ e.stopPropagation(); });
      on(control, 'click', function(e){ e.stopPropagation(); });
      control.dataset.boundLayerInsideV2 = '1';
    }

    if (!document.documentElement.dataset.boundLayerOutsideV2){
      on(document, 'pointerdown', function(e){
        var current = qs('.leaflet-control-layers.gs-layer-control');
        if (!current || current.contains(e.target)) return;

        /* Legenda merupakan panel independen: interaksi di legenda tidak menutup layer. */
        if (e.target.closest && e.target.closest('.map-dynamic-legend')) return;

        current.classList.remove('gs-open');
        current.classList.remove('leaflet-control-layers-expanded');
        var currentToggle = qs('.leaflet-control-layers-toggle', current);
        if (currentToggle) currentToggle.setAttribute('aria-expanded', 'false');
      });
      document.documentElement.dataset.boundLayerOutsideV2 = '1';
    }
  }

  function setupLegendIsolation(){
    var legend = qs('.map-dynamic-legend');
    if (!legend || legend.dataset.boundIsolationV2) return;

    on(legend, 'pointerdown', function(e){ e.stopPropagation(); });
    on(legend, 'click', function(e){ e.stopPropagation(); });
    legend.dataset.boundIsolationV2 = '1';
  }

  function setupFilterHover(){
    var panel = document.getElementById('filter-dashboard');
    if (!panel) return;

    var selects = panel.querySelectorAll('select');
    for (var i = 0; i < selects.length; i++) {
      selects[i].setAttribute('title', 'Pilih filter data');
    }
    var reset = panel.querySelector('button');
    if (reset) reset.setAttribute('title', 'Kembalikan semua filter');
  }

  function setupInfo(){
    var box = document.getElementById('abstract');
    if (!box) return;

    box.removeAttribute('onmouseenter');
    box.removeAttribute('onmouseleave');
    box.className = 'leaflet-control abstract gs-info-control';
    box.setAttribute('data-hover-label', 'Informasi peta');
    box.setAttribute('role', 'button');
    box.setAttribute('tabindex', '0');
    box.title = 'Informasi peta';

    function renderClosed(){
      box.className = 'leaflet-control abstract gs-info-control';
      box.innerHTML = 'i';
      box.setAttribute('aria-expanded', 'false');
    }
    function renderOpen(){
      box.className = 'leaflet-control abstract gs-info-control is-open';
      box.innerHTML = '<div class="abstract-panel"><div class="abstract-panel-header"><span class="abstract-panel-title">Informasi</span><button type="button" class="abstract-panel-close" aria-label="Tutup informasi">&times;</button></div><div class="abstract-panel-body">'+INFO_TEXT+'</div></div>';
      box.setAttribute('aria-expanded', 'true');
      var close = qs('.abstract-panel-close', box);
      if (close) on(close, 'click', function(e){ e.preventDefault(); e.stopPropagation(); renderClosed(); }, {once:true});
    }

    if (!box.dataset.boundInfoV2){
      renderClosed();
      on(box, 'click', function(e){
        e.preventDefault();
        e.stopPropagation();
        box.classList.contains('is-open') ? renderClosed() : renderOpen();
      });
      on(box, 'keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          box.classList.contains('is-open') ? renderClosed() : renderOpen();
        }
      });
      box.dataset.boundInfoV2 = '1';
    }

    if (!document.documentElement.dataset.boundInfoOutsideV2){
      on(document, 'pointerdown', function(e){
        var current = document.getElementById('abstract');
        if (current && !current.contains(e.target) && current.classList.contains('is-open')) {
          current.className = 'leaflet-control abstract gs-info-control';
          current.innerHTML = 'i';
          current.setAttribute('aria-expanded', 'false');
        }
      });
      document.documentElement.dataset.boundInfoOutsideV2 = '1';
    }
  }

  function setupTitles(){
    var items = [
      ['.leaflet-control-zoom-in','Perbesar peta'],
      ['.leaflet-control-zoom-out','Perkecil peta'],
      ['.leaflet-control-locate a','Lacak lokasi saya'],
      ['.fullscreen-map-button','Mode layar penuh']
    ];
    items.forEach(function(item){
      var el = qs(item[0]);
      if (el) el.title = item[1];
    });
  }

  function init(){
    injectStyles();
    setupTitles();
    setupSearch();
    setupAddressSearch();
    setupMeasure();
    setupLayer();
    setupLegendIsolation();
    setupFilterHover();
    setupInfo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 350); });
  } else {
    setTimeout(init, 350);
  }
  window.addEventListener('load', function(){
    setTimeout(init, 900);
    setTimeout(setupLegendIsolation, 1300);
  });
})();
