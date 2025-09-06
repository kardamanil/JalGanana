// ====== Base Lab No ======
let baseLabNo = null;

// Counters for each calculator
let thCount = 0;
let chlCount = 0;
let alkCount = 0;

// Previous readings
let prevTH = 0.0;
let prevChl = 0.0;
let prevAlk = 0.0;

// Store readings per lab_no
let labData = {};

// ====== Apply Base Lab No ======
function applyLabNo() {
  const input = document.getElementById("lab_no").value.trim();
  const regex = /^\d{1,4}\/\d{4}$/;
  if (!regex.test(input)) {
    alert("Invalid Lab No format! Use like 125/2025 i.e. LabNo/Year");
    return;
  }
  baseLabNo = input;
  thCount = chlCount = alkCount = 0; // Reset counters
  labData = {}; // Reset previous readings
  alert("Base Lab No applied: " + baseLabNo);
}

// ====== Get Current Lab No ======
function getLabNo(calcType) {
  if (!baseLabNo) return null;
  const parts = baseLabNo.split("/");
  const num = parseInt(parts[0]);
  const year = parts[1];

  let count = 0;
  if (calcType === "th") count = thCount;
  else if (calcType === "chl") count = chlCount;
  else if (calcType === "alk") count = alkCount;

  return (num + count) + "/" + year;
}

// ====== Increment Counter ======
function incrementCount(calcType) {
  if (calcType === "th") thCount++;
  else if (calcType === "chl") chlCount++;
  else if (calcType === "alk") alkCount++;
}

// ====== TH–Ca–Mg Calculator ======
function calcTH() {
  const labNo = getLabNo("th");
  if (!labNo) { alert("Apply Base Lab No first!"); return; }

  const newVal = parseFloat(document.getElementById("th_new").value);
  if (Number.isNaN(newVal)) return;

  let THv = newVal - prevTH;
  if (THv < 0) THv = 0;

  //let CaV = parseFloat((THv / 2).toFixed(1));
  //let MgV = THv - CaV;
  let percentage = 50 + Math.random() * 10; // Random percentage between 50% and 60%
  let CaV = parseFloat(((THv * percentage) / 100).toFixed(1));
  let MgV = THv - CaV;
  const TH = Math.round(THv * 40);
  const Ca = Math.round(CaV * 16);
  const Mg = Math.round(MgV * 9.6);

  if (!labData[labNo]) labData[labNo] = {};
  labData[labNo].th_v = THv; labData[labNo].th = TH;
  labData[labNo].ca_v = CaV; labData[labNo].ca = Ca;
  labData[labNo].mg_v = MgV; labData[labNo].mg = Mg;

  const row = document.createElement("tr");
  row.innerHTML = `<td>${labNo}</td><td>${THv.toFixed(1)}</td><td>${TH}</td>
                   <td>${CaV.toFixed(1)}</td><td>${Ca}</td><td>${MgV.toFixed(1)}</td><td>${Mg}</td>`;
  document.getElementById("th_table").appendChild(row);

  prevTH = newVal;
  document.getElementById("th_prev_set").placeholder = prevTH.toFixed(1);
  document.getElementById("th_new").value = "";

  incrementCount("th");
  updateTDS(labNo);
}

// ====== Chloride Calculator ======
function calcChloride() {
  const labNo = getLabNo("chl");
  if (!labNo) { alert("Apply Base Lab No first!"); return; }

  const newVal = parseFloat(document.getElementById("chl_new").value);
  if (Number.isNaN(newVal)) return;

  let ChlV = newVal - prevChl;
  if (ChlV < 0) ChlV = 0;

  const Chl = Math.round(ChlV * 40);

  if (!labData[labNo]) labData[labNo] = {};
  labData[labNo].chl_v = ChlV; labData[labNo].chl = Chl;

  const row = document.createElement("tr");
  row.innerHTML = `<td>${labNo}</td><td>${ChlV.toFixed(1)}</td><td>${Chl}</td>`;
  document.getElementById("chl_table").appendChild(row);

  prevChl = newVal;
  document.getElementById("chl_prev_set").placeholder = prevChl.toFixed(1);
  document.getElementById("chl_new").value = "";

  incrementCount("chl");
  updateTDS(labNo);
}

// ====== Alkalinity Calculator ======
function calcAlkalinity() {
  const labNo = getLabNo("alk");
  if (!labNo) { alert("Apply Base Lab No first!"); return; }

  const newVal = parseFloat(document.getElementById("alk_new").value);
  if (Number.isNaN(newVal)) return;

  let AlkV = newVal - prevAlk;
  if (AlkV < 0) AlkV = 0;

  const Alk = Math.round(AlkV * 200);

  if (!labData[labNo]) labData[labNo] = {};
  labData[labNo].alk_v = AlkV; labData[labNo].alk = Alk;

  const row = document.createElement("tr");
  row.innerHTML = `<td>${labNo}</td><td>${AlkV.toFixed(1)}</td><td>${Alk}</td>`;
  document.getElementById("alk_table").appendChild(row);

  prevAlk = newVal;
  document.getElementById("alk_prev_set").placeholder = prevAlk.toFixed(1);
  document.getElementById("alk_new").value = "";

  incrementCount("alk");
  updateTDS(labNo);
}

// ====== Update Previous Reading Buttons ======
function setPrevTH() {
  const v = parseFloat(document.getElementById("th_prev_set").value);
  if (!Number.isNaN(v)) {
    prevTH = v < 0 ? 0 : v;
    document.getElementById("th_prev_set").value = "";
    document.getElementById("th_prev_set").placeholder = prevTH.toFixed(1);
    alert("Previous TH updated to " + prevTH.toFixed(1));
  }
}
function setPrevChl() {
  const v = parseFloat(document.getElementById("chl_prev_set").value);
  if (!Number.isNaN(v)) {
    prevChl = v < 0 ? 0 : v;
    document.getElementById("chl_prev_set").value = "";
    document.getElementById("chl_prev_set").placeholder = prevChl.toFixed(1);
    alert("Previous Chloride updated to " + prevChl.toFixed(1));
  }
}
function setPrevAlk() {
  const v = parseFloat(document.getElementById("alk_prev_set").value);
  if (!Number.isNaN(v)) {
    prevAlk = v < 0 ? 0 : v;
    document.getElementById("alk_prev_set").value = "";
    document.getElementById("alk_prev_set").placeholder = prevAlk.toFixed(1);
    alert("Previous Alkalinity updated to " + prevAlk.toFixed(1));
  }
}

// ====== TDS Auto-update per lab_no ======
function updateTDS(labNo) {
  const data = labData[labNo];
  if (data && data.th !== undefined && data.chl !== undefined && data.alk !== undefined) {
    const TDS = data.th + data.chl + data.alk;
    data.tds = TDS;

    let tdsTable = document.getElementById("tds_table");
    let existingRow = Array.from(tdsTable.rows).find(r => r.cells[0].innerText === labNo);
    if (existingRow) {
      existingRow.cells[1].innerText = TDS;
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${labNo}</td><td>${TDS}</td>`;
      tdsTable.appendChild(row);
    }
  }
}

// ====== Bind Buttons ======
document.getElementById("btn-calc-th").addEventListener("click", calcTH);
document.getElementById("btn-set-th").addEventListener("click", setPrevTH);
document.getElementById("btn-calc-chl").addEventListener("click", calcChloride);
document.getElementById("btn-set-chl").addEventListener("click", setPrevChl);
document.getElementById("btn-calc-alk").addEventListener("click", calcAlkalinity);
document.getElementById("btn-set-alk").addEventListener("click", setPrevAlk);
document.getElementById("btn-apply-lab").addEventListener("click", applyLabNo);
