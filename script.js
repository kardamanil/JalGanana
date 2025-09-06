// Base Lab No (user input)
let baseLabNo = null;

// Counters for each calculator
let thCount = 0;
let chlCount = 0;
let alkCount = 0;
let tdsCount = 0;

// Previous readings
let prevTH = 0.0;
let prevChl = 0.0;
let prevAlk = 0.0;

// Apply base lab no
function applyLabNo() {
  const input = document.getElementById("lab_no").value.trim();
  const regex = /^\d{1,4}\/\d{4}$/;
  if (!regex.test(input)) {
    alert("Invalid Lab No format! Use x/yyyy, xx/yyyy, xxx/yyyy, or xxxx/yyyy");
    return;
  }
  baseLabNo = input;
  thCount = chlCount = alkCount = tdsCount = 0; // Reset counters
  alert("Base Lab No applied: " + baseLabNo);
}

// Get current lab no for a calculator
function getLabNo(calcType) {
  if (!baseLabNo) return null;
  const parts = baseLabNo.split("/");
  const num = parseInt(parts[0]);
  const year = parts[1];

  let count = 0;
  if (calcType === "th") count = thCount;
  else if (calcType === "chl") count = chlCount;
  else if (calcType === "alk") count = alkCount;
  else if (calcType === "tds") count = tdsCount;

  return (num + count) + "/" + year;
}

// Increment counter after adding a row
function incrementCount(calcType) {
  if (calcType === "th") thCount++;
  else if (calcType === "chl") chlCount++;
  else if (calcType === "alk") alkCount++;
  else if (calcType === "tds") tdsCount++;
}

// TH–Ca–Mg Calculator
function calcTH() {
  const labNo = getLabNo("th");
  if (!labNo) { alert("Apply Base Lab No first!"); return; }

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

  incrementCount("th");
}

// Chloride Calculator
function calcChloride() {
  const labNo = getLabNo("chl");
  if (!labNo) { alert("Apply Base Lab No first!"); return; }

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

  incrementCount("chl");
}

// Alkalinity Calculator
function calcAlkalinity() {
  const labNo = getLabNo("alk");
  if (!labNo) { alert("Apply Base Lab No first!"); return; }

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

  incrementCount("alk");
}

// TDS Calculator
function calcTDS() {
  const labNo = getLabNo("tds");
  if (!labNo) { alert("Apply Base Lab No first!"); return; }

  const TH = parseInt(document.querySelector("#th_table tr:last-child td:nth-child(3)")?.innerText || 0);
  const Chl = parseInt(document.querySelector("#chl_table tr:last-child td:nth-child(3)")?.innerText || 0);
  const Alk = parseInt(document.querySelector("#alk_table tr:last-child td:nth-child(3)")?.innerText || 0);

  const TDS = TH + Chl + Alk;

  const row = document.createElement("tr");
  row.innerHTML = `<td>${labNo}</td><td>${TDS}</td>`;
  document.getElementById("tds_table").appendChild(row);

  incrementCount("tds");
}
