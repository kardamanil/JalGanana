import { db } from "./index.html";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Base Lab No
let baseLabNo = null;
let thCount = 0, chlCount = 0, alkCount = 0;
let prevTH = 0, prevChl = 0, prevAlk = 0;
let labData = {};

// ===== Apply Lab No =====
function applyLabNo() {
  const input = document.getElementById("lab_no").value.trim();
  if (!/^\d{1,4}\/\d{4}$/.test(input)) { alert("Invalid Lab No!"); return; }
  baseLabNo = input;
  thCount = chlCount = alkCount = 0;
  labData = {};
  alert("Base Lab No applied: " + baseLabNo);
}

// ===== Get Current Lab No =====
function getLabNo(type) {
  if (!baseLabNo) return null;
  const [num, year] = baseLabNo.split("/");
  let count = type==="th"?thCount:type==="chl"?chlCount:alkCount;
  return (parseInt(num)+count)+"/"+year;
}
function increment(type){ if(type==="th") thCount++; else if(type==="chl") chlCount++; else alkCount++; }

// ===== Save to Firestore =====
async function saveData(labNo) {
  const data = labData[labNo]; if(!data) return;
  try {
    const ref = doc(db, "calculations", labNo);
    const existing = await getDoc(ref);
    if(existing.exists()){
      if(!confirm(`Lab No ${labNo} already exists. Overwrite?`)) return;
    }
    await setDoc(ref, {
      lab_no: labNo,
      th_v:data.th_v||null, th:data.th||null,
      ca_v:data.ca_v||null, ca:data.ca||null,
      mg_v:data.mg_v||null, mg:data.mg||null,
      chl_v:data.chl_v||null, chl:data.chl||null,
      alk_v:data.alk_v||null, alk:data.alk||null,
      tds:data.tds||null
    });
    console.log("Saved:", labNo);
  } catch(err){ console.error("Error saving:", err);}
}

// ===== TH Calc =====
function calcTH(){
  const labNo = getLabNo("th"); if(!labNo){ alert("Apply Lab No"); return; }
  const newVal = parseFloat(document.getElementById("th_new").value); if(isNaN(newVal)) return;
  let THv = Math.max(newVal-prevTH,0);
  let percentage = 50 + Math.random()*10;
  let CaV = parseFloat(((THv*percentage)/100).toFixed(1)), MgV=THv-CaV;
  const TH = Math.round(THv*40), Ca=Math.round(CaV*16), Mg=Math.round(MgV*9.6);

  labData[labNo] = labData[labNo]||{};
  Object.assign(labData[labNo],{th_v:THv,th:TH,ca_v:CaV,ca:Ca,mg_v:MgV,mg:Mg});

  const row = document.createElement("tr");
  row.innerHTML=`<td>${labNo}</td><td>${THv.toFixed(1)}</td><td>${TH}</td><td>${CaV.toFixed(1)}</td><td>${Ca}</td><td>${MgV.toFixed(1)}</td><td>${Mg}</td>`;
  document.getElementById("th_table").appendChild(row);

  prevTH=newVal; document.getElementById("th_prev_set").placeholder=prevTH.toFixed(1); document.getElementById("th_new").value="";
  increment("th"); updateTDS(labNo); saveData(labNo);
}

// ===== Chloride Calc =====
function calcChloride(){
  const labNo = getLabNo("chl"); if(!labNo){ alert("Apply Lab No"); return; }
  const newVal=parseFloat(document.getElementById("chl_new").value); if(isNaN(newVal)) return;
  let ChlV=Math.max(newVal-prevChl,0), Chl=Math.round(ChlV*40);
  labData[labNo]=labData[labNo]||{}; Object.assign(labData[labNo],{chl_v:ChlV,chl:Chl});

  const row=document.createElement("tr");
  row.innerHTML=`<td>${labNo}</td><td>${ChlV.toFixed(1)}</td><td>${Chl}</td>`;
  document.getElementById("chl_table").appendChild(row);

  prevChl=newVal; document.getElementById("chl_prev_set").placeholder=prevChl.toFixed(1); document.getElementById("chl_new").value="";
  increment("chl"); updateTDS(labNo); saveData(labNo);
}

// ===== Alkalinity Calc =====
function calcAlkalinity(){
  const labNo=getLabNo("alk"); if(!labNo){ alert("Apply Lab No"); return; }
  const newVal=parseFloat(document.getElementById("alk_new").value); if(isNaN(newVal)) return;
  let AlkV=Math.max(newVal-prevAlk,0), Alk=Math.round(AlkV*200);
  labData[labNo]=labData[labNo]||{}; Object.assign(labData[labNo],{alk_v:AlkV,alk:Alk});

  const row=document.createElement("tr");
  row.innerHTML=`<td>${labNo}</td><td>${AlkV.toFixed(1)}</td><td>${Alk}</td>`;
  document.getElementById("alk_table").appendChild(row);

  prevAlk=newVal; document.getElementById("alk_prev_set").placeholder=prevAlk.toFixed(1); document.getElementById("alk_new").value="";
  increment("alk"); updateTDS(labNo); saveData(labNo);
}

// ===== Update Previous =====
function setPrevTH(){ const v=parseFloat(document.getElementById("th_prev_set").value); if(!isNaN(v)){prevTH=Math.max(v,0);document.getElementById("th_prev_set").value=""; document.getElementById("th_prev_set").placeholder=prevTH.toFixed(1);alert("Previous TH updated: "+prevTH.toFixed(1));}}
function setPrevChl(){ const v=parseFloat(document.getElementById("chl_prev_set").value); if(!isNaN(v)){prevChl=Math.max(v,0);document.getElementById("chl_prev_set").value=""; document.getElementById("chl_prev_set").placeholder=prevChl.toFixed(1);alert("Previous Chloride updated: "+prevChl.toFixed(1));}}
function setPrevAlk(){ const v=parseFloat(document.getElementById("alk_prev_set").value); if(!isNaN(v)){prevAlk=Math.max(v,0);document.getElementById("alk_prev_set").value=""; document.getElementById("alk_prev_set").placeholder=prevAlk.toFixed(1);alert("Previous Alkalinity updated: "+prevAlk.toFixed(1));}}

// ===== Update TDS =====
function updateTDS(labNo){
  const data=labData[labNo]; if(data && data.th!==undefined && data.chl!==undefined && data.alk!==undefined){
    const TDS=data.th+data.chl+data.alk; data.tds=TDS;
    let tdsTable=document.getElementById("tds_table");
    let existing=Array.from(tdsTable.rows).find(r=>r.cells[0].innerText===labNo);
    if(existing){ existing.cells[1].innerText=TDS; } else{ const row=document.createElement("tr"); row.innerHTML=`<td>${labNo}</td><td>${TDS}</td>`; tdsTable.appendChild(row); }
  }
}

// ===== Bind Buttons =====
document.getElementById("btn-apply-lab").addEventListener("click",applyLabNo);
document.getElementById("btn-calc-th").addEventListener("click",calcTH);
document.getElementById("btn-set-th").addEventListener("click",setPrevTH);
document.getElementById("btn-calc-chl").addEventListener("click",calcChloride);
document.getElementById("btn-set-chl").addEventListener("click",setPrevChl);
document.getElementById("btn-calc-alk").addEventListener("click",calcAlkalinity);
document.getElementById("btn-set-alk").addEventListener("click",setPrevAlk);
