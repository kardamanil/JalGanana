let currentLabNo = "";

// ---------------- LAB NO ----------------
function applyLabNo() {
  let val = document.getElementById("lab_no").value.trim();
  let regex = /^\d{1,4}\/\d{4}$/;
  if (!regex.test(val)) {
    alert("Lab No format होना चाहिए: x/yyyy या xxxx/yyyy");
    return;
  }
  currentLabNo = val;
  alert("Applied Lab No: " + currentLabNo);
}

function nextLabNo() {
  if (!currentLabNo) { alert("पहले Lab No apply करें"); return; }
  let [num, year] = currentLabNo.split("/");
  num = parseInt(num) + 1;
  currentLabNo = num + "/" + year;
  document.getElementById("lab_no").value = currentLabNo;
  alert("Next Lab No: " + currentLabNo);
}

// ---------------- TH–Ca–Mg ----------------
function calcTH() {
  if (!currentLabNo) { alert("Apply Lab No first!"); return; }

  let prev = parseFloat(document.getElementById("th_prev_set").value) || 0;
  let newReading = parseFloat(document.getElementById("th_new").value);

  if (isNaN(newReading)) { alert("Enter valid TH new reading"); return; }

  let th_v = newReading - prev;
  let th = th_v * 40;
  let ca_v = th_v / 2, ca = ca_v * 40;
  let mg_v = th_v / 2, mg = mg_v * 40;

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

  document.getElementById("th_prev_set").value = newReading; // auto update
}

// ---------------- Chloride ----------------
function calcChloride() {
  if (!currentLabNo) { alert("Apply Lab No first!"); return; }

  let prev = parseFloat(document.getElementById("chl_prev_set").value) || 0;
  let newReading = parseFloat(document.getElementById("chl_new").value);

  if (isNaN(newReading)) { alert("Enter valid Chloride new reading"); return; }

  let chl_v = newReading - prev;
  let chl = chl_v * 35.45;

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${chl_v.toFixed(2)}</td>
    <td>${chl.toFixed(2)}</td>
  </tr>`;
  document.getElementById("chl_table").innerHTML += row;

  document.getElementById("chl_prev_set").value = newReading; // auto update
}

// ---------------- Alkalinity ----------------
function calcAlkalinity() {
  if (!currentLabNo) { alert("Apply Lab No first!"); return; }

  let prev = parseFloat(document.getElementById("alk_prev_set").value) || 0;
  let newReading = parseFloat(document.getElementById("alk_new").value);

  if (isNaN(newReading)) { alert("Enter valid Alkalinity new reading"); return; }

  let alk_v = newReading - prev;
  let alk = alk_v * 200;

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${alk_v.toFixed(2)}</td>
    <td>${alk.toFixed(2)}</td>
  </tr>`;
  document.getElementById("alk_table").innerHTML += row;

  document.getElementById("alk_prev_set").value = newReading; // auto update
}

// ---------------- TDS ----------------
function calcTDS() {
  if (!currentLabNo) { alert("Apply Lab No first!"); return; }

  // last TH, Cl, Alk fetch
  let th_rows = document.querySelectorAll("#th_table tr");
  let chl_rows = document.querySelectorAll("#chl_table tr");
  let alk_rows = document.querySelectorAll("#alk_table tr");

  if (th_rows.length < 2 || chl_rows.length < 2 || alk_rows.length < 2) {
    alert("पहले TH, Cl और Alk add करें");
    return;
  }

  let th = parseFloat(th_rows[th_rows.length - 1].cells[2].innerText);
  let chl = parseFloat(chl_rows[chl_rows.length - 1].cells[2].innerText);
  let alk = parseFloat(alk_rows[alk_rows.length - 1].cells[2].innerText);

  let tds = th + chl + alk;

  let row = `<tr>
    <td>${currentLabNo}</td>
    <td>${tds.toFixed(2)}</td>
  </tr>`;
  document.getElementById("tds_table").innerHTML += row;
}
