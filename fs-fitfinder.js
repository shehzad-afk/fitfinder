(function () {
  function initFitFinder() {
    try {
      var root = document.getElementById("fs-fitfinder");
      if (!root) return;

      // DEBUG: confirm script is running
      if (window.console && console.log) {
        console.log("FS Fit Finder: script loaded ✅");
      }

      // Inject CSS (same as before)
      var css =
        "#fs-fitfinder{--card:#151924;--muted:#98a2b3;--text:#e6e8ee;--brand:#f5c542;--brand2:#f0b000;--danger:#ff6b6b;--radius:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif!important;color:var(--text);}"+
        "#fs-fitfinder .fs-container{max-width:820px;margin:0 auto;padding:8px 0;}"+
        "#fs-fitfinder .fs-card{background:var(--card);border:1px solid #20263a;border-radius:var(--radius);padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.25);}"+
        "#fs-fitfinder h1{font-size:30px;margin:0 0 8px;}"+
        "#fs-fitfinder .fs-lead{color:var(--muted);margin:0 0 18px;font-size:15px;}"+
        "#fs-fitfinder .fs-progress{height:8px;background:#0b0e16;border-radius:999px;overflow:hidden;margin:12px 0 22px;}"+
        "#fs-fitfinder .fs-progress>div{height:100%;background:linear-gradient(90deg,var(--brand),var(--brand2));width:0%;transition:width .25s ease;}"+
        "#fs-fitfinder .fs-step{display:none!important;}"+
        "#fs-fitfinder .fs-step.fs-active{display:block!important;}"+
        "#fs-fitfinder .fs-q-title{font-size:19px;margin:8px 0 10px;font-weight:700;}"+
        "#fs-fitfinder .fs-muted{color:var(--muted);font-size:14px;display:block;}"+
        "#fs-fitfinder .fs-row{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:8px;}"+
        "@media(max-width:700px){#fs-fitfinder .fs-row{grid-template-columns:1fr;gap:12px;}}"+
        "#fs-fitfinder label{display:block;font-size:14px;color:var(--muted);margin:0 0 6px;}"+
        "#fs-fitfinder input,#fs-fitfinder select{width:100%;padding:12px;border-radius:12px;border:1px solid #2a324a;background:#0e1320;color:var(--text);font-size:16px;box-sizing:border-box;}"+
        "#fs-fitfinder input:focus,#fs-fitfinder select:focus{border-color:var(--brand);outline:none;}"+
        "#fs-fitfinder .fs-error{color:var(--danger);font-size:14px;margin-top:8px;display:none;}"+
        "#fs-fitfinder .fs-actions{display:flex;justify-content:space-between;margin-top:20px;gap:10px;}"+
        "#fs-fitfinder button{padding:12px 16px;border-radius:12px;border:0;cursor:pointer;font-weight:700;font-size:15px;}"+
        "#fs-fitfinder .fs-btn-secondary{background:#232a40;color:var(--text);}"+
        "#fs-fitfinder .fs-btn-primary{background:linear-gradient(90deg,var(--brand),var(--brand2));color:#111;}"+
        "#fs-fitfinder .fs-btn-primary:disabled{opacity:.6;cursor:not-allowed;}"+
        "#fs-fitfinder .fs-result{display:none;margin-top:14px;padding:16px;border-radius:14px;background:#0e1320;border:1px solid #2a324a;}"+
        "#fs-fitfinder .fs-size-pill{display:inline-block;font-size:22px;font-weight:800;padding:6px 12px;border-radius:999px;background:#121a2e;border:1px solid #2a324a;margin:6px 0 10px;}"+
        "#fs-fitfinder .fs-links a{display:inline-block;margin:6px 8px 0 0;padding:10px 12px;border-radius:10px;background:#1a2236;color:var(--text);text-decoration:none;border:1px solid #2a324a;}"+
        "#fs-fitfinder .fs-fineprint{font-size:12px;color:var(--muted);margin-top:10px;line-height:1.5;}";

      var styleEl = document.createElement("style");
      styleEl.type = "text/css";
      styleEl.appendChild(document.createTextNode(css));
      document.head.appendChild(styleEl);

      var steps = root.querySelectorAll(".fs-step");
      var progressBar = root.querySelector("#fs-progressBar");
      var nextBtn = root.querySelector("#fs-nextBtn");
      var backBtn = root.querySelector("#fs-backBtn");
      var resultBox = root.querySelector("#fs-resultBox");

      if (!steps.length || !nextBtn || !backBtn || !progressBar) {
        console.log("FS Fit Finder: missing elements ❌");
        return;
      }

      // FORCE-hide/show steps inline (even if CSS failed)
      function forceShow(index) {
        for (var i = 0; i < steps.length; i++) {
          steps[i].style.display = (i === index) ? "block" : "none";
          steps[i].className = steps[i].className.replace(" fs-active","").replace("fs-active","");
          if (i === index) steps[i].className += " fs-active";
        }
      }

      var current = 0;
      var state = { chestIn:null, height:null, weight:null, fit:null, style:null, layer:null };

      function showStep(index){
        forceShow(index);
        current = index;

        var pct = Math.round((index) / steps.length * 100);
        progressBar.style.width = pct + "%";

        backBtn.style.visibility = index === 0 ? "hidden" : "visible";
        nextBtn.innerHTML = (index === steps.length - 1) ? "See my size" : "Next";

        resultBox.style.display = "none";
      }

      function chestToInches(){
        var inVal = parseFloat(root.querySelector("#fs-chestIn").value);
        var cmVal = parseFloat(root.querySelector("#fs-chestCm").value);
        if (!isNaN(inVal)) return inVal;
        if (!isNaN(cmVal)) return cmVal / 2.54;
        return null;
      }

      function baseSizeFromChest(chest){
        var table = [
          {min:34, max:35.9, size:"XS / 34–36"},
          {min:36, max:37.9, size:"S / 36–38"},
          {min:38, max:39.9, size:"M / 38–40"},
          {min:40, max:41.9, size:"L / 40–42"},
          {min:42, max:43.9, size:"XL / 42–44"},
          {min:44, max:45.9, size:"2XL / 44–46"},
          {min:46, max:47.9, size:"3XL / 46–48"},
          {min:48, max:49.9, size:"4XL / 48–50"},
          {min:50, max:52.9, size:"5XL / 50–53"},
          {min:53, max:60,   size:"6XL / 53–60"}
        ];
        for (var i=0; i<table.length; i++){
          if (chest >= table[i].min && chest <= table[i].max) return table[i];
        }
        return null;
      }

      function adjustForPreferences(baseIndex, chest){
        var idx = baseIndex;
        if (state.fit === "slim") idx -= 0.25;
        if (state.fit === "relaxed") idx += 0.5;
        if (state.layer === "sometimes") idx += 0.25;
        if (state.layer === "yes") idx += 0.75;
        if (state.style === "aviator") idx -= 0.25;

        var nearTop = (chest % 2) > 1.6;
        if (nearTop && state.fit !== "slim") idx += 0.25;
        return idx;
      }

      function getSizeRecommendation(){
        var chest = state.chestIn;
        var base = baseSizeFromChest(chest);
        if (!base) return {size:"Contact us", explain:"Your measurement is outside our standard range."};

        var sizes = [
          "XS / 34–36","S / 36–38","M / 38–40","L / 40–42","XL / 42–44",
          "2XL / 44–46","3XL / 46–48","4XL / 48–50","5XL / 50–53","6XL / 53–60"
        ];

        var baseIndex = sizes.indexOf(base.size);
        var adjusted = adjustForPreferences(baseIndex, chest);
        var finalIndex = Math.round(adjusted);
        if (finalIndex < 0) finalIndex = 0;
        if (finalIndex > sizes.length - 1) finalIndex = sizes.length - 1;

        var finalSize = sizes[finalIndex];
        var explain = "Based on a chest of " + chest.toFixed(1) + '\".';
        if (state.fit) explain += " Fit: " + state.fit + ".";
        if (state.layer) explain += " Layering: " + state.layer + ".";
        if (state.style) explain += " Style: " + state.style + ".";
        if (finalIndex !== baseIndex) explain += " Adjusted from " + sizes[baseIndex] + " for comfort.";

        return {size: finalSize, explain: explain};
      }

      function validateStep(index){
        var errs = root.querySelectorAll(".fs-error");
        for (var i=0; i<errs.length; i++) errs[i].style.display="none";

        if (index === 0){
          var chest = chestToInches();
          if (!chest){ root.querySelector("#fs-errChest").style.display="block"; return false; }
          state.chestIn = chest;
        }

        if (index === 1){
          var h = parseFloat(root.querySelector("#fs-height").value);
          var w = parseFloat(root.querySelector("#fs-weight").value);
          if (!isNaN(h)) state.height = h;
          if (!isNaN(w)) state.weight = w;
        }

        if (index === 2){
          state.fit = root.querySelector("#fs-fitPref").value;
          if (!state.fit){ root.querySelector("#fs-errFit").style.display="block"; return false; }
        }
        if (index === 3){
          state.style = root.querySelector("#fs-stylePref").value;
          if (!state.style){ root.querySelector("#fs-errStyle").style.display="block"; return false; }
        }
        if (index === 4){
          state.layer = root.querySelector("#fs-layerPref").value;
          if (!state.layer){ root.querySelector("#fs-errLayer").style.display="block"; return false; }
        }

        return true;
      }

      function renderResult(){
        var rec = getSizeRecommendation();
        root.querySelector("#fs-sizeOut").innerHTML = rec.size;
        root.querySelector("#fs-explainOut").innerHTML = rec.explain;

        var linksOut = root.querySelector("#fs-linksOut");
        linksOut.innerHTML = "";

        var sizeSlug = rec.size.split("/")[0].replace(/\s/g,"").toLowerCase();
        var sizeLinks = [
          {label:"Shop " + sizeSlug.toUpperCase() + " Jackets", url:"https://www.feather-skin.com/search?size=" + encodeURIComponent(sizeSlug)},
          {label:"All Men’s Leather Jackets", url:"https://www.feather-skin.com/mens-leather-jackets/"},
          {label:"Need help? Contact us", url:"https://www.feather-skin.com/contact-us/"}
        ];

        for (var i=0; i<sizeLinks.length; i++){
          var a = document.createElement("a");
          a.href = sizeLinks[i].url;
          a.innerHTML = sizeLinks[i].label;
          a.rel = "nofollow";
          linksOut.appendChild(a);
        }

        resultBox.style.display = "block";
        progressBar.style.width = "100%";
      }

      nextBtn.onclick = function(){
        if (!validateStep(current)) return;

        if (current === steps.length - 1){
          renderResult();
          nextBtn.disabled = true;
          nextBtn.innerHTML = "Done";
          return;
        }
        showStep(current + 1);
      };

      backBtn.onclick = function(){
        if (current === 0) return;
        nextBtn.disabled = false;
        nextBtn.innerHTML = "Next";
        showStep(current - 1);
      };

      showStep(0);
    } catch (e) {
      if (window.console && console.error) {
        console.error("FS Fit Finder crashed:", e);
      }
    }
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initFitFinder);
  } else {
    initFitFinder();
  }
})();
