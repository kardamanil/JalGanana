import { db } from "./index.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ====== Base Lab No ======
let baseLabNo = null;

// Counters for each calculator
let thCount = 0, chlCount = 0, alkCount = 0;

// Previous readings
let prevTH = 0.0, prevChl = 0.0, prevAlk = 0.0;

// Store readings per lab_no
let labData = {};

// ====== Apply Base Lab No ======
function applyLabNo() {
  const input = document.getElementById("lab_no").value.trim();
  const regex = /^\d{1,4}\/\d{4}$/;
  if (!regex.test(input)) {
    alert("Invalid Lab No format! Use like 125/2025");
    return;
  }
  baseLabNo = input;
  thCount = chlCount = alkCount = 0;
  labData = {};
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

// ====== Save Data to Firestore ======
async function saveData(labNo) {
  const data = labData[labNo];
  if (!data) return;

  try {
    const docRef = doc(db, "calculations", labNo);
    const existing = await getDoc(docRef);

    if (existing.exists()) {
      const overwrite = confirm(`Lab No ${labNo} पहले से मौजूद है। Overwrite करना चाहते हैं?`);
      if (!overwrite) return;
    }

    await setDoc(docRef, {
      lab_no: labNo,
      th_v: data.th_v || null,
      th: data.th || null,
      ca_v: data.ca_v || null,
      ca: data.ca || null,
      mg_v: data.mg_v || null,
      mg: data.mg || null,
      chl_v: data.chl_v || null,
      chl: data.chl || null,
      alk_v: data.alk_v || null,
      alk: data.alk || null,
      tds: data.tds || null
    });

    console.log("✅ Saved:", labNo);
  } catch (err) {
    console.error("❌ Error saving:", err);
  }
}

// ====== TH Calculator ======
function calcTH() {
  const labNo = getLabNo("th");
  if (!labNo) { alert("Apply Base Lab No first!"); return; }

  const newVal = parseFloat(document.getElementById("th_new").value);
  if (Number.isNaN(newVal)) return;

  let THv = newVal - prevTH;
  if (THv < 0) THv = 0;

  let percentage = 50 + Math.random() * 10; 
  let CaV = parseFloat(((THv * percentage)/100).toFixed(1));
  let MgV = THv - CaV;
  const TH = Math.round(THv * 40);
  const Ca = Math.round(CaV * 16);
  const Mg = Math.round(MgV * 9.6);

  if (!labData[labNo]) labData[labNo] = {};
  labData[labNo].th_v = THv; labData[labNo].th = TH;
  labData[labNo].ca_v = CaV; labData[labNo].ca = Ca;
  labData[labNo].mg_v = MgV; labData[labNo].mg = Mg;

  appendRow("th_table", labNo, [THv.toFixed(1), TH, CaV.toFixed(1), Ca, MgV.toFixed(1), Mg]);

  prevTH = newVal;
  document.getElementById("th_prev_set").placeholder = prevTH.toFixed(1);
  document.getElementById("th_new").value = "";

  incrementCount("th");
  updateTDS(labNo);
  saveData(labNo);
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

  appendRow("chl_table", labNo, [ChlV.toFixed(1), Chl]);

  prevChl = newVal;
  document.getElementById("chl_prev_set").placeholder = prevChl.toFixed(1);
  document.getElementById("chl_new").value = "";

  incrementCount("chl");
  updateTDS(labNo);
  saveData(labNo);
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

  appendRow("alk_table", labNo, [AlkV.toFixed(1), Alk]);

  prevAlk = newVal;
  document.getElementById("alk_prev_set").placeholder = prevAlk.toFixed(1);
  document.getElementById("alk_new").value = "";

  incrementCount("alk");
  updateTDS(labNo);
  saveData(labNo);
}

// ====== Append Row Helper ======
function appendRow(tableId, labNo, values) {
  const table = document.getElementById(tableId);
  let existingRow = Array.from(table.rows).find(r => r.cells[0].innerText === labNo);
  if (existingRow) {
    for (let i=0; i<values.length; i++) existingRow.cells[i+1].innerText = values[i];
  } else {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${labNo}</td>${values.map(v=>`<td>${v}</td>`).join("")}`;
    table.appendChild(row);
  }
}

// ====== Update Previous Reading Buttons ======
function setPrevTH() { setPrev("th_prev_set", "th"); }
function setPrevChl() { setPrev("chl_prev_set", "chl"); }
function setPrevAlk() { setPrev("alk_prev_set", "alk"); }

function setPrev(inputId, type) {
  const v = parseFloat(document.getElementById(inputId).value);
  if (Number.isNaN(v)) return;
  if (type === "th") prevTH = v < 0 ? 0 : v;
  else if (type === "chl") prevChl = v < 0 ? 0 : v;
  else if (type === "alk") prevAlk = v < 0 ? 0 : v;
  document.getElementById(inputId).value = "";
  document.getElementById(inputId).placeholder = v.toFixed(1);
  alert(`Previous ${type.toUpperCase()} updated to ${v.toFixed(1)}`);
}

// ====== TDS Auto-update per lab_no ======
function updateTDS(labNo) {
  const data = labData[labNo];
  if (data && data.th !== undefined && data.chl !== undefined && data.alk !== undefined) {
    const TDS = data.th + data.chl + data.alk;
    data.tds = TDS;
    appendRow("tds_table", labNo, [TDS]);
  }
}

// ====== Fetch Lab Data ======
async function fetchLabData() {
  if (!baseLabNo) { alert("Apply Base Lab No first!"); return; }
  const labNo = baseLabNo;
  try {
    const docRef = doc(db, "calculations", labNo);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      labData[labNo] = data;

      prevTH = data.th_v || 0;
      prevChl = data.chl_v || 0;
      prevAlk = data.alk_v || 0;

      document.getElementById("th_prev_set").placeholder = prevTH.toFixed(1);
      document.getElementById("chl_prev_set").placeholder = prevChl.toFixed(1);
      document.getElementById("alk_prev_set").placeholder = prevAlk.toFixed(1);

      appendRow("th_table", labNo, [prevTH.toFixed(1), data.th, data.ca_v, data.ca, data.mg_v, data.mg]);
      appendRow("chl_table", labNo, [prevChl.toFixed(1), data.chl]);
      appendRow("alk_table", labNo, [prevAlk.toFixed(1), data.alk]);
      appendRow("tds_table", labNo, [data.tds]);

      alert("Lab Data fetched successfully!");
    } else {
      alert("No data found for Lab No " + labNo);
    }
  } catch (err) {
    console.error(err);
    alert("Error fetching data");
  }
}

// ====== Bind Buttons ======
document.getElementById("btn-apply-lab").addEventListener("click", applyLabNo);
document.getElementById("btn-fetch-lab").addEventListener("click", fetchLabData);
document.getElementById("btn-calc-th").addEventListener("click", calcTH);
document.getElementById("btn-set-th").addEventListener("click", setPrevTH);
document.getElementById("btn-calc-chl").addEventListener("click", calcChloride);
document.getElementById("btn-set-chl").addEventListener("click", setPrevChl);
document.getElementById("btn-calc-alk").addEventListener("click", calcAlkalinity);
document.getElementById("btn-set-alk").addEventListener("click", setPrevAlk);
