let currentLabNo = "";  // Shared Lab No
let prevTH = 0, prevChl = 0, prevAlk = 0;

// ---------------- Lab No ----------------
function applyLabNo() {
  let val = document.getElementById("lab_no").value.trim();
  let regex = /^\d{1,4}\/\d{4}$/;
  if (!regex.test(val)) {
    alert("Invalid Lab No format! Use x/yyyy, xx/yyyy, xxx/yyyy or xxxx/yyyy");
    return;
  }
  currentLabNo = val;
  alert("Applied Lab No: " + currentLabNo);
}

function incrementLabNo() {
  if (!currentLabNo) return;
  let [num, year] = currentLabNo.split("/");
  num = parseInt(num) + 1;
  currentLabNo = num + "/" + year;
  document.getElementById("lab_no").value = currentLabNo;
}

// ---------------- TH–Ca–Mg ----------------
function calcTH() {
  if (!currentLabNo) { alert("Apply Lab No first!"); return; }
  let newVal = parseFloat(document.getElementById("th_new").value);
  if (isNaN(newVal)) return;

  let THv = newVal - prevTH; if (THv < 0) THv = 0;
  let CaV = parseFloat((THv/2).toFixed(1));
  let MgV = THv - CaV;

  const TH = Math.round(THv*40);
  const Ca = Math.round(CaV*16);
  const Mg = Math.round(MgV*9.6);

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${THv.toFixed(1)}</td>
    <td>${TH}</td>
    <td>${CaV.toFixed(1)}</td>
    <td>${Ca}</td>
    <td>${MgV.toFixed(1)}</td>
    <td>${Mg}</td>
  </tr>`;
  document.getElementById("th_table").innerHTML += row;

  prevTH = newVal;
  document.getElementById("th_prev_set").placeholder = prevTH.toFixed(1);
  document.getElementById("th_new").value = "";

  incrementLabNo();  // Auto-increment Lab No after TH
}

// ---------------- Chloride ----------------
function calcChloride() {
  if (!currentLabNo) { alert("Apply Lab No first!"); return; }
  let newVal = parseFloat(document.getElementById("chl_new").value);
  if (isNaN(newVal)) return;

  let ChlV = newVal - prevChl; if (ChlV < 0) ChlV = 0;
  const Chl = ChlV*40;

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${ChlV.toFixed(1)}</td>
    <td>${Chl.toFixed(1)}</td>
  </tr>`;
  document.getElementById("chl_table").innerHTML += row;

  prevChl = newVal;
  document.getElementById("chl_prev_set").placeholder = prevChl.toFixed(1);
  document.getElementById("chl_new").value = "";

  incrementLabNo(); // Auto-increment Lab No after Cl
}

// ---------------- Alkalinity ----------------
function calcAlkalinity() {
  if (!currentLabNo) { alert("Apply Lab No first!"); return; }
  let newVal = parseFloat(document.getElementById("alk_new").value);
  if (isNaN(newVal)) return;

  let AlkV = newVal - prevAlk; if (AlkV < 0) AlkV = 0;
  const Alk = AlkV*200;

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${AlkV.toFixed(1)}</td>
    <td>${Alk.toFixed(1)}</td>
  </tr>`;
  document.getElementById("alk_table").innerHTML += row;

  prevAlk = newVal;
  document.getElementById("alk_prev_set").placeholder = prevAlk.toFixed(1);
  document.getElementById("alk_new").value = "";

  incrementLabNo(); // Auto-increment Lab No after Alk
}

// ---------------- TDS ----------------
function calcTDS() {
  if (!currentLabNo) { alert("Apply Lab No first!"); return; }

  let thRows = document.querySelectorAll("#th_table tr");
  let chlRows = document.querySelectorAll("#chl_table tr");
  let alkRows = document.querySelectorAll("#alk_table tr");

  if (thRows.length < 2 || chlRows.length < 2 || alkRows.length < 2) {
    alert("पहले TH, Cl और Alk add करें");
    return;
  }

  let TH = parseFloat(thRows[thRows.length-1].cells[2].innerText);
  let Chl = parseFloat(chlRows[chlRows.length-1].cells[2].innerText);
  let Alk = parseFloat(alkRows[alkRows.length-1].cells[2].innerText);

  let TDS = TH + Chl + Alk;

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${TDS.toFixed(1)}</td>
  </tr>`;
  document.getElementById("tds_table").innerHTML += row;

  incrementLabNo(); // Auto-increment Lab No after TDS
}
