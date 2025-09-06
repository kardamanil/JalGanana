// Shared Lab Number
let labNo = null;

function applyLabNo() {
  const input = document.getElementById("lab_no").value.trim();
  const regex = /^\d{1,4}\/\d{4}$/;
  if (!regex.test(input)) {
    alert("Invalid Lab No format! Please use x/yyyy, xx/yyyy, xxx/yyyy, or xxxx/yyyy");
    return;
  }
  labNo = input;
  alert("Lab No applied: " + labNo);
}

// Previous readings
let prevTH = 0.0;
let prevChl = 0.0;
let prevAlk = 0.0;

// TH–Ca–Mg Calculator
function calcTH() {
  if (!labNo) { alert("Apply Lab No first!"); return; }
  const newVal = parseFloat(document.getElementById("th_new").value);
  if (Number.isNaN(newVal)) return;

  let THv = newVal - prevTH;
  if (THv < 0) THv = 0;

  let CaV = parseFloat((THv / 2).toFixed(1));
  let MgV = THv - CaV;

  const TH = Math.round(THv * 40);
  const Ca = Math.round(CaV * 16);
  const Mg = Math.round(MgV * 9.6);

  const row = document.createElement("tr");
  row.innerHTML = `<td>${labNo}</td><td>${THv.toFixed(1)}</td><td>${TH}</td>
                   <td>${CaV.toFixed(1)}</td><td>${Ca}</td><td>${MgV.toFixed(1)}</td><td>${Mg}</td>`;
  document.getElementById("th_table").appendChild(row);

  prevTH = newVal;
  document.getElementById("th_prev_set").placeholder = prevTH.toFixed(1);
  document.getElementById("th_new").value = "";

  incrementLabNo();
}

// Chloride Calculator
function calcChloride() {
  if (!labNo) { alert("Apply Lab No first!"); return; }
  const newVal = parseFloat(document.getElementById("chl_new").value);
  if (Number.isNaN(newVal)) return;

  let ChlV = newVal - prevChl;
  if (ChlV < 0) ChlV = 0;

  const Chl = Math.round(ChlV * 40);

  const row = document.createElement("tr");
  row.innerHTML = `<td>${labNo}</td><td>${ChlV.toFixed(1)}</td><td>${Chl}</td>`;
  document.getElementById("chl_table").appendChild(row);

  prevChl = newVal;
  document.getElementById("chl_prev_set").placeholder = prevChl.toFixed(1);
  document.getElementById("chl_new").value = "";

  incrementLabNo();
}

// Alkalinity Calculator
function calcAlkalinity() {
  if (!labNo) { alert("Apply Lab No first!"); return; }
  const newVal = parseFloat(document.getElementById("alk_new").value);
  if (Number.isNaN(newVal)) return;

  let AlkV = newVal - prevAlk;
  if (AlkV < 0) AlkV = 0;

  const Alk = Math.round(AlkV * 200);

  const row = document.createElement("tr");
  row.innerHTML = `<td>${labNo}</td><td>${AlkV.toFixed(1)}</td><td>${Alk}</td>`;
  document.getElementById("alk_table").appendChild(row);

  prevAlk = newVal;
  document.getElementById("alk_prev_set").placeholder = prevAlk.toFixed(1);
  document.getElementById("alk_new").value = "";

  incrementLabNo();
}

// TDS Calculator
function calcTDS() {
  if (!labNo) { alert("Apply Lab No first!"); return; }
  const TH = parseInt(document.querySelector("#th_table tr:last-child td:nth-child(3)")?.innerText || 0);
  const Chl = parseInt(document.querySelector("#chl_table tr:last-child td:nth-child(3)")?.innerText || 0);
  const Alk = parseInt(document.querySelector("#alk_table tr:last-child td:nth-child(3)")?.innerText || 0);

  const TDS = TH + Chl + Alk;

  const row = document.createElement("tr");
  row.innerHTML = `<td>${labNo}</td><td>${TDS}</td>`;
  document.getElementById("tds_table").appendChild(row);
}

// Auto-increment Lab No
function incrementLabNo() {
  if (!labNo) return;
  const parts = labNo.split("/");
  let num = parseInt(parts[0]);
  const year = parts[1];
  num++;
  labNo = num + "/" + year;
  document.getElementById("lab_no").value = labNo;
}
