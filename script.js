// ====== Firebase Imports ======
import { db } from "./index.js"; 
import { 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    collection, 
    query, 
    orderBy, 
    limit 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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

function showLoading(buttonId, isLoading = true) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = isLoading;
        button.style.opacity = isLoading ? '0.6' : '1';
        if (isLoading) {
            button.originalText = button.textContent;
            button.textContent = 'Loading...';
        } else {
            button.textContent = button.originalText || button.textContent;
        }
    }
}

// ====== Firebase Connection Test ======
async function testFirebaseConnection() {
    try {
        // Test connection by trying to read from a test document
        const testDoc = doc(db, "test", "connection-test");
        await getDoc(testDoc);
        window.firebaseConnected = true;
        updateFirebaseStatus('online');
        console.log("✅ Firebase connection successful!");
        return true;
    } catch (error) {
        window.firebaseConnected = false;
        updateFirebaseStatus('offline');
        console.error("❌ Firebase connection failed:", error);
        return false;
    }
}

// ====== Update Firebase Status in UI ======
function updateFirebaseStatus(status) {
    const statusEl = document.getElementById('firebase-status');
    if (!statusEl) return;
    
    if (status === 'online') {
        statusEl.textContent = '✅ Firebase Connected - Auto-save enabled';
        statusEl.className = 'firebase-status online';
    } else if (status === 'offline') {
        statusEl.textContent = '❌ Firebase Offline - Data will not be saved';
        statusEl.className = 'firebase-status offline';
    } else if (status === 'saving') {
        statusEl.textContent = '💾 Saving to Firebase...';
        statusEl.className = 'firebase-status';
    } else {
        statusEl.textContent = '🔄 Connecting to Firebase...';
        statusEl.className = 'firebase-status';
    }
}

// ====== Firebase Functions ======

// Save single lab data
async function saveLabData(labNo, data) {
    try {
        updateFirebaseStatus('saving');
        showLoading('btn-calc-th', true);
        showLoading('btn-calc-chl', true);
        showLoading('btn-calc-alk', true);
        
        // Convert lab number to Firebase-safe document ID (replace / with -)
        const docId = labNo.replace('/', '-');
        const docRef = doc(db, "lab_calculations", docId);
        
        // Check if document already exists
        const existing = await getDoc(docRef);
        if (existing.exists()) {
            const overwrite = confirm(`⚠️ Lab No ${labNo} पहले से मौजूद है।\n\n📊 Existing data:\nTH: ${existing.data().th || 'N/A'}, Ca: ${existing.data().ca || 'N/A'}, Mg: ${existing.data().mg || 'N/A'}\nChl: ${existing.data().chl || 'N/A'}, Alk: ${existing.data().alk || 'N/A'}, TDS: ${existing.data().tds || 'N/A'}\n\nOverwrite करना चाहते हैं?`);
            if (!overwrite) {
                showMessage("Data save cancelled", 'info');
                updateFirebaseStatus('online');
                return false;
            }
        }

        // Prepare data to save
        const saveData = {
            lab_no: labNo,
            th: data.th || null,
            th_volume: data.th_v || null,
            ca: data.ca || null,
            ca_volume: data.ca_v || null,
            mg: data.mg || null,
            mg_volume: data.mg_v || null,
            chl: data.chl || null,
            chl_volume: data.chl_v || null,
            alk: data.alk || null,
            alk_volume: data.alk_v || null,
            tds: data.tds || null,
            created_at: existing.exists() ? existing.data().created_at : new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await setDoc(docRef, saveData);
        showMessage(`✅ Lab ${labNo} data saved successfully!`, 'success');
        updateFirebaseStatus('online');
        console.log("✅ Saved to Firebase:", labNo, saveData);
        return true;

    } catch (error) {
        console.error("❌ Firebase Save Error:", error);
        showMessage(`Error saving data: ${error.message}`, 'error');
        updateFirebaseStatus('offline');
        return false;
    } finally {
        showLoading('btn-calc-th', false);
        showLoading('btn-calc-chl', false);
        showLoading('btn-calc-alk', false);
    }
}

// Fetch single lab data
async function fetchLabData(labNo) {
    try {
        // Convert lab number to Firebase-safe document ID (replace / with -)
        const docId = labNo.replace('/', '-');
        const docRef = doc(db, "lab_calculations", docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            showMessage(`✅ Lab ${labNo} data loaded from server!`, 'success');
            return {
                lab_no: data.lab_no,
                th: data.th,
                th_v: data.th_volume,
                ca: data.ca,
                ca_v: data.ca_volume,
                mg: data.mg,
                mg_v: data.mg_volume,
                chl: data.chl,
                chl_v: data.chl_volume,
                alk: data.alk,
                alk_v: data.alk_volume,
                tds: data.tds
            };
        } else {
            showMessage(`❌ Lab ${labNo} not found in database!`, 'error');
            return null;
        }
    } catch (error) {
        console.error("❌ Firebase Fetch Error:", error);
        showMessage(`Error fetching data: ${error.message}`, 'error');
        return null;
    }
}

// Fetch multiple lab data
async function fetchMultipleLabData(labNos) {
    try {
        const results = [];
        for (const labNo of labNos) {
            const data = await fetchLabData(labNo);
            if (data) results.push(data);
        }
        return results;
    } catch (error) {
        console.error("❌ Fetch Multiple Error:", error);
        return [];
    }
}

// Fetch all lab data (optional - for reports)
async function fetchAllLabData() {
    try {
        showMessage("Loading all lab data...", 'info');
        const q = query(collection(db, "lab_calculations"), orderBy("created_at", "desc"));
        const querySnapshot = await getDocs(q);
        
        const allData = [];
        querySnapshot.forEach((doc) => {
            allData.push(doc.data());
        });
        
        showMessage(`✅ Loaded ${allData.length} lab records!`, 'success');
        return allData;
    } catch (error) {
        console.error("❌ Fetch All Error:", error);
        showMessage(`Error loading all data: ${error.message}`, 'error');
        return [];
    }
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

// ====== TH–Ca–Mg Calculator ======
async function calcTH() {
    const labNo = getLabNo("th");
    if (!labNo) { 
        showMessage("Apply Base Lab No first!", 'error'); 
        return; 
    }

    const newVal = parseFloat(document.getElementById("th_new").value);
    if (!validateInput(newVal, 0, 100)) return;

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
    
    // Save to Firebase
    await saveLabData(labNo, labData[labNo]);
}

// ====== Chloride Calculator ======
async function calcChloride() {
    const labNo = getLabNo("chl");
    if (!labNo) { 
        showMessage("Apply Base Lab No first!", 'error'); 
        return; 
    }

    const newVal = parseFloat(document.getElementById("chl_new").value);
    if (!validateInput(newVal, 0, 100)) return;

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
    
    // Save to Firebase
    await saveLabData(labNo, labData[labNo]);
}

// ====== Alkalinity Calculator ======
async function calcAlkalinity() {
    const labNo = getLabNo("alk");
    if (!labNo) { 
        showMessage("Apply Base Lab No first!", 'error'); 
        return; 
    }

    const newVal = parseFloat(document.getElementById("alk_new").value);
    if (!validateInput(newVal, 0, 100)) return;

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
    
    // Save to Firebase
    await saveLabData(labNo, labData[labNo]);
}

// ====== Update Previous Reading Buttons ======
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

// ====== Load/Fetch Functions for UI ======
async function loadSingleLab() {
    const labNo = prompt("Enter Lab No to load (e.g., 125/2025):");
    if (!labNo || !validateLabNo(labNo)) return;
    
    const data = await fetchLabData(labNo);
    if (data) {
        displayLoadedData(data);
    }
}

function displayLoadedData(data) {
    // Display in tables
    if (data.th !== null) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${data.lab_no}</td><td>${data.th_v}</td><td>${data.th}</td>
                         <td>${data.ca_v}</td><td>${data.ca}</td><td>${data.mg_v}</td><td>${data.mg}</td>`;
        document.getElementById("th_table").appendChild(row);
    }
    
    if (data.chl !== null) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${data.lab_no}</td><td>${data.chl_v}</td><td>${data.chl}</td>`;
        document.getElementById("chl_table").appendChild(row);
    }
    
    if (data.alk !== null) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${data.lab_no}</td><td>${data.alk_v}</td><td>${data.alk}</td>`;
        document.getElementById("alk_table").appendChild(row);
    }
    
    if (data.tds !== null) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${data.lab_no}</td><td>${data.tds}</td>`;
        document.getElementById("tds_table").appendChild(row);
    }
    
    // Store in memory
    labData[data.lab_no] = data;
}

// ====== Export Functions ======
async function exportAllData() {
    const allData = await fetchAllLabData();
    if (allData.length === 0) return;
    
    let csvContent = "Lab No,TH,Ca,Mg,Chloride,Alkalinity,TDS\n";
    allData.forEach(data => {
        csvContent += `${data.lab_no},${data.th||''},${data.ca||''},${data.mg||''},${data.chl||''},${data.alk||''},${data.tds||''}\n`;
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showMessage(`✅ ${allData.length} records exported!`, 'success');
}

// ====== Clear All Data Function ======
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

// Firebase control buttons - ACTIVE NOW!
document.getElementById("btn-load-lab").addEventListener("click", loadSingleLab);
document.getElementById("btn-export-all").addEventListener("click", exportAllData);
document.getElementById("btn-clear-all").addEventListener("click", clearAllData);

// ====== Initialize App ======
document.addEventListener('DOMContentLoaded', async function() {
    console.log("🔥 Firebase integrated JalGanana loading...");
    
    // Test Firebase connection
    updateFirebaseStatus('connecting');
    const connected = await testFirebaseConnection();
    
    if (connected) {
        console.log("🎉 JalGanana ready with Firebase integration!");
    } else {
        console.log("⚠️ JalGanana loaded but Firebase is offline");
        showMessage("Firebase connection failed. Data will not be saved automatically.", 'error');
    }
});
