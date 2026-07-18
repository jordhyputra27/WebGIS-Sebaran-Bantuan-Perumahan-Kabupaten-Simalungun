(function(){
  'use strict';

  var INFO_TEXT = 'Peta Sebaran Bantuan Perumahan Kabupaten Simalungun merupakan WebGIS yang menyajikan informasi spasial mengenai distribusi bantuan perumahan berdasarkan desa/kelurahan di Kabupaten Simalungun. Data yang ditampilkan meliputi bantuan yang bersumber dari APBD Kabupaten, APBD Provinsi, dan BSPS, serta dapat difilter berdasarkan tahun pelaksanaan. WebGIS ini bertujuan mendukung penyajian informasi, monitoring, evaluasi, dan pengambilan keputusan dalam pelaksanaan program bantuan perumahan.';

  function setAttrIf(el, name, value){
    if (el) el.setAttribute(name, value);
  }

  function bindOnce(el, event, key, handler){
    if (!el || el.dataset[key]) return;
    el.addEventListener(event, handler);
    el.dataset[key] = '1';
  }

  function initMeasureControl(){
    if (typeof measureControl === 'undefined' || !measureControl || !measureControl._container) return;

    var container = measureControl._container;
    var toggle = measureControl.$toggle || container.querySelector('.leaflet-control-measure-toggle');
    container.classList.add('custom-measure-control');

    try {
      L.DomEvent.off(container, 'mouseenter', measureControl._expand, measureControl);
      L.DomEvent.off(container, 'mouseleave', measureControl._collapse, measureControl);
    } catch (e) {}

    if (measureControl.$interaction) {
      measureControl.$interaction.style.display = 'none';
    }
    setAttrIf(toggle, 'title', 'Ukur jarak dan area');

    bindOnce(toggle, 'click', 'measureClickBound', function(e){
      e.preventDefault();
      e.stopPropagation();
      var expanded = measureControl.$interaction && measureControl.$interaction.style.display !== 'none';
      if (expanded) {
        if (!measureControl._locked) measureControl._collapse();
      } else {
        measureControl._expand();
      }
    });

    bindOnce(document, 'pointerdown', 'measureOutsideBound', function(event){
      if (!container.contains(event.target) && !measureControl._locked) {
        measureControl._collapse();
      }
    });
  }

  function initPhotonControl(){
    var control = document.querySelector('.leaflet-photon.leaflet-control');
    if (!control) return;

    var button = document.getElementById('gcd-button-control');
    var panel = control.lastElementChild;
    var input = control.querySelector('input');

    if (!button || !panel) return;

    control.classList.add('custom-photon-control');
    panel.classList.add('custom-photon-panel');
    panel.style.display = 'none';

    setAttrIf(button, 'title', 'Cari alamat');
    setAttrIf(button, 'aria-label', 'Cari alamat');
    button.style.pointerEvents = 'auto';
    button.style.cursor = 'pointer';
    if (input) {
      input.placeholder = 'Search address...';
      setAttrIf(input, 'title', 'Masukkan alamat');
    }

    function openPanel(){
      panel.style.display = 'block';
      control.classList.add('is-open');
      if (input) {
        window.setTimeout(function(){ input.focus(); }, 40);
      }
    }

    function closePanel(){
      panel.style.display = 'none';
      control.classList.remove('is-open');
    }

    bindOnce(button, 'click', 'photonToggleBound', function(e){
      e.preventDefault();
      e.stopPropagation();
      if (control.classList.contains('is-open')) closePanel();
      else openPanel();
    });

    bindOnce(control, 'click', 'photonStopBound', function(e){
      e.stopPropagation();
    });

    bindOnce(document, 'pointerdown', 'photonOutsideBound', function(event){
      if (!control.contains(event.target)) closePanel();
    });
  }

  function initDesaSearchControl(){
    var controls = document.querySelectorAll('.leaflet-control-search:not(.leaflet-photon)');
    controls.forEach(function(control){
      control.classList.add('custom-desa-search');
      var button = control.querySelector('.search-button');
      var input = control.querySelector('.search-input');
      if (button) {
        setAttrIf(button, 'title', 'Cari desa/kelurahan');
        setAttrIf(button, 'aria-label', 'Cari desa/kelurahan');
      }
      if (input) {
        input.placeholder = 'Search...';
        setAttrIf(input, 'title', 'Masukkan nama desa/kelurahan');
      }
    });
  }

  function initLayerControl(){
    var layer = document.querySelector('.leaflet-control-layers');
    if (!layer) return;
    layer.classList.add('custom-layer-control');
    setAttrIf(layer.querySelector('.leaflet-control-layers-toggle'), 'title', 'Pilih layer peta');
  }

  function initTitles(){
    setAttrIf(document.querySelector('.leaflet-control-zoom-in'), 'title', 'Perbesar peta');
    setAttrIf(document.querySelector('.leaflet-control-zoom-out'), 'title', 'Perkecil peta');
    setAttrIf(document.querySelector('.leaflet-control-locate a'), 'title', 'Lacak lokasi saya');
    setAttrIf(document.querySelector('.fullscreen-map-button'), 'title', 'Mode layar penuh');

    var legendToggle = document.querySelector('.map-legend-toggle');
    if (legendToggle) {
      setAttrIf(legendToggle, 'title', 'Buka / tutup legenda');
      legendToggle.setAttribute('data-hover-label', 'Buka legenda');
    }
  }

  function initAbstractControl(){
    var control = document.getElementById('abstract');
    if (!control) return;

    control.removeAttribute('onmouseenter');
    control.removeAttribute('onmouseleave');
    control.className = 'leaflet-control abstract clickable-abstract-control';
    control.setAttribute('role', 'button');
    setAttrIf(control, 'title', 'Informasi peta');
    control.setAttribute('data-hover-label', 'Informasi peta');

    function renderCollapsed(){
      control.className = 'leaflet-control abstract clickable-abstract-control';
      control.innerHTML = '<span class="abstract-info-mark">i</span>';
    }

    function renderExpanded(){
      control.className = 'leaflet-control abstract clickable-abstract-control is-open';
      control.innerHTML = '' +
        '<div class="abstract-panel">' +
          '<div class="abstract-panel-header">' +
            '<span class="abstract-panel-title">Informasi</span>' +
            '<button type="button" class="abstract-panel-close" aria-label="Tutup informasi">&times;</button>' +
          '</div>' +
          '<div class="abstract-panel-body">' + INFO_TEXT + '</div>' +
        '</div>';

      var closeBtn = control.querySelector('.abstract-panel-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          renderCollapsed();
        }, { once: true });
      }
    }

    renderCollapsed();

    if (!control.dataset.abstractClickBound) {
      control.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        if (control.classList.contains('is-open')) renderCollapsed();
        else renderExpanded();
      });
      control.dataset.abstractClickBound = '1';
    }

    bindOnce(document, 'pointerdown', 'abstractOutsideBound', function(event){
      if (!control.contains(event.target) && control.classList.contains('is-open')) {
        renderCollapsed();
      }
    });
  }

  function init(){
    initMeasureControl();
    initPhotonControl();
    initDesaSearchControl();
    initLayerControl();
    initTitles();
    initAbstractControl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ window.setTimeout(init, 350); });
  } else {
    window.setTimeout(init, 350);
  }
  window.addEventListener('load', function(){ window.setTimeout(init, 700); });
})();
