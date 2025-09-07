// ====== Firebase Imports ======
import { db } from "./index.js"; 
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ====== Constants ======
const MULTIPLIERS = {
    TH: 40,
    CA: 16,
    MG: 9.6,
    CHL: 40,
    ALK: 200
};

const CA_PERCENTAGE_RANGE = { min: 50, max: 60 }; // Ca percentage range

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

// ====== Utility Functions ======
function showMessage(message, type = 'info') {
    const alertType = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : 'ℹ️ ';
    alert(alertType + message);
}

function validateInput(value, min = 0, max = 1000) {
    if (isNaN(value)) {
        showMessage("कृपया valid number enter करें!", 'error');
        return false;
    }
    if (value < min || value > max) {
        showMessage(`Value ${min} से ${max} के बीच होनी चाहिए!`, 'error');
        return false;
    }
    return true;
}

function validateLabNo(input) {
    const regex = /^\d{1,4}\/\d{4}$/;
    if (!regex.test(input)) {
        showMessage("Invalid Lab No format! Use like 125/2025 i.e. LabNo/Year", 'error');
        return false;
    }
    return true;
}

// ====== Apply Base Lab No ======
function applyLabNo() {
    const input = document.getElementById("lab_no").value.trim();
    
    if (!validateLabNo(input)) return;
    
    baseLabNo = input;
    thCount = chlCount = alkCount = 0; // Reset counters
    labData = {}; // Reset previous readings
    
    // Reset all previous reading displays
    document.getElementById("th_prev_set").placeholder = "0.0";
    document.getElementById("chl_prev_set").placeholder = "0.0";
    document.getElementById("alk_prev_set").placeholder = "0.0";
    
    // Reset previous readings
    prevTH = prevChl = prevAlk = 0.0;
    
    showMessage("Base Lab No applied: " + baseLabNo, 'success');
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

// ====== Save Data to Firestore with Better Error Handling ======
async function saveData(labNo) {
    const data = labData[labNo];
    if (!data) return;

    try {
        showMessage("Saving data...", 'info');
        
        const docRef = doc(db, "calculations", labNo);
        const existing = await getDoc(docRef);

        if (existing.exists()) {
            const overwrite = confirm(`Lab No ${labNo} पहले से मौजूद है। Overwrite करना चाहते हैं?`);
            if (!overwrite) {
                showMessage("Data save cancelled", 'info');
                return;
            }
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
            tds: data.tds || null,
            timestamp: new Date().toISOString()
        });

        showMessage(`Data saved successfully for ${labNo}!`, 'success');
        console.log("✅ Saved:", labNo);
    } catch (err) {
        showMessage(`Error saving data: ${err.message}`, 'error');
        console.error("❌ Error saving:", err);
    }
}

// ====== TH–Ca–Mg Calculator ======
function calcTH() {
    const labNo = getLabNo("th");
    if (!labNo) { 
        showMessage("Apply Base Lab No first!", 'error'); 
        return; 
    }

    const newVal = parseFloat(document.getElementById("th_new").value);
    if (!validateInput(newVal, 0, 50)) return;

    let THv = newVal - prevTH;
    if (THv < 0) {
        showMessage("Warning: Negative volume detected, setting to 0", 'error');
        THv = 0;
    }

    // Ca percentage calculation (50-60% range as required)
    let percentage = CA_PERCENTAGE_RANGE.min + Math.random() * (CA_PERCENTAGE_RANGE.max - CA_PERCENTAGE_RANGE.min);
    let CaV = parseFloat(((THv * percentage) / 100).toFixed(1));
    let MgV = parseFloat((THv - CaV).toFixed(1));
    
    const TH = Math.round(THv * MULTIPLIERS.TH);
    const Ca = Math.round(CaV * MULTIPLIERS.CA);
    const Mg = Math.round(MgV * MULTIPLIERS.MG);

    if (!labData[labNo]) labData[labNo] = {};
    labData[labNo].th_v = THv; 
    labData[labNo].th = TH;
    labData[labNo].ca_v = CaV; 
    labData[labNo].ca = Ca;
    labData[labNo].mg_v = MgV; 
    labData[labNo].mg = Mg;

    const row = document.createElement("tr");
    row.innerHTML = `<td>${labNo}</td><td>${THv.toFixed(1)}</td><td>${TH}</td>
                     <td>${CaV.toFixed(1)}</td><td>${Ca}</td><td>${MgV.toFixed(1)}</td><td>${Mg}</td>`;
    document.getElementById("th_table").appendChild(row);

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
    if (!labNo) { 
        showMessage("Apply Base Lab No first!", 'error'); 
        return; 
    }

    const newVal = parseFloat(document.getElementById("chl_new").value);
    if (!validateInput(newVal, 0, 20)) return;

    let ChlV = newVal - prevChl;
    if (ChlV < 0) {
        showMessage("Warning: Negative volume detected, setting to 0", 'error');
        ChlV = 0;
    }

    const Chl = Math.round(ChlV * MULTIPLIERS.CHL);

    if (!labData[labNo]) labData[labNo] = {};
    labData[labNo].chl_v = ChlV; 
    labData[labNo].chl = Chl;

    const row = document.createElement("tr");
    row.innerHTML = `<td>${labNo}</td><td>${ChlV.toFixed(1)}</td><td>${Chl}</td>`;
    document.getElementById("chl_table").appendChild(row);

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
    if (!labNo) { 
        showMessage("Apply Base Lab No first!", 'error'); 
        return; 
    }

    const newVal = parseFloat(document.getElementById("alk_new").value);
    if (!validateInput(newVal, 0, 10)) return;

    let AlkV = newVal - prevAlk;
    if (AlkV < 0) {
        showMessage("Warning: Negative volume detected, setting to 0", 'error');
        AlkV = 0;
    }

    const Alk = Math.round(AlkV * MULTIPLIERS.ALK);

    if (!labData[labNo]) labData[labNo] = {};
    labData[labNo].alk_v = AlkV; 
    labData[labNo].alk = Alk;

    const row = document.createElement("tr");
    row.innerHTML = `<td>${labNo}</td><td>${AlkV.toFixed(1)}</td><td>${Alk}</td>`;
    document.getElementById("alk_table").appendChild(row);

    prevAlk = newVal;
    document.getElementById("alk_prev_set").placeholder = prevAlk.toFixed(1);
    document.getElementById("alk_new").value = "";

    incrementCount("alk");
    updateTDS(labNo);
    saveData(labNo);
}

// ====== Update Previous Reading Buttons with Better Validation ======
function setPrevTH() {
    const v = parseFloat(document.getElementById("th_prev_set").value);
    if (!validateInput(v, 0, 50)) return;
    
    prevTH = v;
    document.getElementById("th_prev_set").value = "";
    document.getElementById("th_prev_set").placeholder = prevTH.toFixed(1);
    showMessage("Previous TH updated to " + prevTH.toFixed(1), 'success');
}

function setPrevChl() {
    const v = parseFloat(document.getElementById("chl_prev_set").value);
    if (!validateInput(v, 0, 20)) return;
    
    prevChl = v;
    document.getElementById("chl_prev_set").value = "";
    document.getElementById("chl_prev_set").placeholder = prevChl.toFixed(1);
    showMessage("Previous Chloride updated to " + prevChl.toFixed(1), 'success');
}

function setPrevAlk() {
    const v = parseFloat(document.getElementById("alk_prev_set").value);
    if (!validateInput(v, 0, 10)) return;
    
    prevAlk = v;
    document.getElementById("alk_prev_set").value = "";
    document.getElementById("alk_prev_set").placeholder = prevAlk.toFixed(1);
    showMessage("Previous Alkalinity updated to " + prevAlk.toFixed(1), 'success');
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

// ====== Clear All Data Function (Optional) ======
function clearAllData() {
    if (confirm("सभी data clear करना चाहते हैं? यह action undo नहीं हो सकता!")) {
        // Clear tables
        document.querySelectorAll('table').forEach(table => {
            while(table.rows.length > 1) {
                table.deleteRow(1);
            }
        });
        
        // Reset variables
        labData = {};
        thCount = chlCount = alkCount = 0;
        prevTH = prevChl = prevAlk = 0.0;
        
        // Reset inputs
        document.getElementById("lab_no").value = "";
        document.getElementById("th_prev_set").placeholder = "0.0";
        document.getElementById("chl_prev_set").placeholder = "0.0";
        document.getElementById("alk_prev_set").placeholder = "0.0";
        
        baseLabNo = null;
        showMessage("All data cleared!", 'success');
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

// Optional: Add clear button if needed in HTML
// document.getElementById("btn-clear-all").addEventListener("click", clearAllData);
