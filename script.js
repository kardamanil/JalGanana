// ---------------- Shared Lab Number ----------------
let currentLabNo = "";   // active lab number
let labYear = "";        // year part

function applyLabNo() {
  const input = document.getElementById("lab_no").value.trim();
  const regex = /^\d{1,4}\/\d{4}$/;

  if (!regex.test(input)) {
    alert("Invalid Lab No format! Please use x/yyyy to xxxx/yyyy");
    return;
  }

  currentLabNo = input;
  labYear = input.split("/")[1]; // year fix ho gaya
  alert("Lab No applied: " + currentLabNo);
}

function nextLabNo() {
  if (!currentLabNo) {
    alert("Please apply a valid Lab No first!");
    return;
  }

  let [num, year] = currentLabNo.split("/");
  num = parseInt(num) + 1;
  currentLabNo = num + "/" + year;
  document.getElementById("lab_no").value = currentLabNo;
  alert("Next Lab No: " + currentLabNo);
}

// ---------------- TH–Ca–Mg Calculator ----------------
let th_prev = 0;

function calcTH() {
  if (!currentLabNo) {
    alert("Apply Lab No first!");
    return;
  }

  let newReading = parseFloat(document.getElementById("th_new").value);
  if (isNaN(newReading)) {
    alert("Enter a valid TH new reading");
    return;
  }

  let th_v = newReading - th_prev;
  let th = th_v * 40;
  let ca_v = th_v / 2;
  let ca = ca_v * 40;
  let mg_v = th_v / 2;
  let mg = mg_v * 40;

  // update table
  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${th_v.toFixed(2)}</td>
    <td>${th.toFixed(2)}</td>
    <td>${ca_v.toFixed(2)}</td>
    <td>${ca.toFixed(2)}</td>
    <td>${mg_v.toFixed(2)}</td>
    <td>${mg.toFixed(2)}</td>
  </tr>`;
  document.getElementById("th_table").innerHTML += row;

  // auto update prev
  th_prev = newReading;
}

// ---------------- Chloride Calculator ----------------
let chl_prev = 0;

function calcChl() {
  if (!currentLabNo) {
    alert("Apply Lab No first!");
    return;
  }

  let newReading = parseFloat(document.getElementById("chl_new").value);
  if (isNaN(newReading)) {
    alert("Enter a valid Chloride new reading");
    return;
  }

  let chl_v = newReading - chl_prev;
  let chl = chl_v * 40;

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${chl_v.toFixed(2)}</td>
    <td>${chl.toFixed(2)}</td>
  </tr>`;
  document.getElementById("chl_table").innerHTML += row;

  chl_prev = newReading;
}

// ---------------- Alkalinity Calculator ----------------
let alk_prev = 0;

function calcAlk() {
  if (!currentLabNo) {
    alert("Apply Lab No first!");
    return;
  }

  let newReading = parseFloat(document.getElementById("alk_new").value);
  if (isNaN(newReading)) {
    alert("Enter a valid Alkalinity new reading");
    return;
  }

  let alk_v = newReading - alk_prev;
  let alk = alk_v * 200;

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${alk_v.toFixed(2)}</td>
    <td>${alk.toFixed(2)}</td>
  </tr>`;
  document.getElementById("alk_table").innerHTML += row;

  alk_prev = newReading;
}

// ---------------- TDS Calculator ----------------
function calcTDS() {
  if (!currentLabNo) {
    alert("Apply Lab No first!");
    return;
  }

  // last row values निकालना
  let thTable = document.getElementById("th_table").rows;
  let chlTable = document.getElementById("chl_table").rows;
  let alkTable = document.getElementById("alk_table").rows;

  if (thTable.length < 2 || chlTable.length < 2 || alkTable.length < 2) {
    alert("Please calculate TH, Chloride and Alkalinity first!");
    return;
  }

  let th = parseFloat(thTable[thTable.length - 1].cells[2].innerText);
  let chl = parseFloat(chlTable[chlTable.length - 1].cells[2].innerText);
  let alk = parseFloat(alkTable[alkTable.length - 1].cells[2].innerText);

  let tds = th + chl + alk;

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${tds.toFixed(2)}</td>
  </tr>`;
  document.getElementById("tds_table").innerHTML += row;
}

// ---------------- Firestore Placeholder ----------------
function fetchLabData() {
  let labNo = document.getElementById("fetch_lab").value.trim();
  alert("Fetching from Firestore: " + labNo + " (to be implemented in Step 3)");
}
