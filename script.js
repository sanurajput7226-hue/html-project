// ---------------- DATA (sample data stored in arrays) ----------------

// Stages every product goes through
var stages = ["Cutting", "Assembly", "Painting", "Quality Check", "Packing"];

// Products and the raw material they use
var products = [
  { name: "Wooden Chair", material: "Wood",  perUnit: 5 },
  { name: "Steel Table",  material: "Steel", perUnit: 8 },
  { name: "Plastic Bottle", material: "Plastic", perUnit: 1 }
];

// Machines (status is worked out automatically from orders)
var machines = ["Cutting Machine", "Assembly Line", "Paint Booth", "Packing Unit"];

// Raw material stock
var materials = [
  { name: "Wood",    stock: 500 },
  { name: "Steel",   stock: 200 },
  { name: "Plastic", stock: 1000 }
];

// Production orders. stageDone = number of stages completed (0 to 5)
var orders = [
  { id: 101, product: "Wooden Chair",   qty: 50,  start: "2026-11-20", due: "2026-12-05", machine: "Cutting Machine", stageDone: 2 },
  { id: 102, product: "Steel Table",    qty: 20,  start: "2026-11-15", due: "2026-11-22", machine: "Assembly Line",   stageDone: 3 },
  { id: 103, product: "Plastic Bottle", qty: 300, start: "2026-11-01", due: "2026-11-10", machine: "Packing Unit",    stageDone: 5 }
];

var nextId = 104;

// ---------------- HELPER FUNCTIONS ----------------

// Returns today's date as text like "2026-11-26"
function today() {
  return new Date().toISOString().split("T")[0];
}

// Order is finished when all stages are done
function isCompleted(order) {
  return order.stageDone == stages.length;
}

// Decide status of an order
function getStatus(order) {
  if (isCompleted(order)) return "Completed";
  if (order.due < today()) return "Delayed";      // past due date and not finished
  if (order.stageDone == 0) return "Pending";
  return "In Progress";
}

// Progress percentage from completed stages
function getProgress(order) {
  return Math.round((order.stageDone / stages.length) * 100);
}

// Find a product by name
function findProduct(name) {
  for (var i = 0; i < products.length; i++) {
    if (products[i].name == name) return products[i];
  }
}

// ---------------- SHOW DATA ON SCREEN ----------------

function showProducts() {
  var html = "";
  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    html += "<tr><td>" + p.name + "</td><td>" + p.material + "</td><td>" +
            p.perUnit + "</td><td>" + stages.join(" > ") + "</td></tr>";
  }
  document.getElementById("productTable").innerHTML = html;
}

function fillDropdowns() {
  var p = "";
  for (var i = 0; i < products.length; i++) {
    p += "<option>" + products[i].name + "</option>";
  }
  document.getElementById("product").innerHTML = p;

  var m = "";
  for (var j = 0; j < machines.length; j++) {
    m += "<option>" + machines[j] + "</option>";
  }
  document.getElementById("machine").innerHTML = m;
}

function showOrders() {
  var html = "";
  for (var i = 0; i < orders.length; i++) {
    var o = orders[i];
    var status = getStatus(o);

    var colour = "good";
    if (status == "Delayed") colour = "bad";
    if (status == "Pending") colour = "warning";

    var stageName = isCompleted(o) ? "All done" : stages[o.stageDone];
    var button = isCompleted(o) ? "-" : "<button onclick='nextStage(" + i + ")'>Finish Stage</button>";

    html += "<tr>" +
      "<td>" + o.id + "</td>" +
      "<td>" + o.product + "</td>" +
      "<td>" + o.qty + "</td>" +
      "<td>" + o.start + "</td>" +
      "<td>" + o.due + "</td>" +
      "<td>" + o.machine + "</td>" +
      "<td>" + stageName + "</td>" +
      "<td><div class='bar'><div style='width:" + getProgress(o) + "%'></div></div>" + getProgress(o) + "%</td>" +
      "<td class='" + colour + "'>" + status + "</td>" +
      "<td>" + button + "</td>" +
      "</tr>";
  }
  document.getElementById("orderTable").innerHTML = html;
}

function showMachines() {
  var html = "";
  for (var i = 0; i < machines.length; i++) {
    var assigned = "-";
    var status = "Free";
    var colour = "good";

    // a machine is busy if an unfinished order uses it
    for (var j = 0; j < orders.length; j++) {
      if (orders[j].machine == machines[i] && !isCompleted(orders[j])) {
        assigned = "Order " + orders[j].id;
        status = "Busy";
        colour = "warning";
      }
    }
    html += "<tr><td>" + machines[i] + "</td><td class='" + colour + "'>" + status +
            "</td><td>" + assigned + "</td></tr>";
  }
  document.getElementById("machineTable").innerHTML = html;
}

function showMaterials() {
  var html = "";
  for (var i = 0; i < materials.length; i++) {
    var m = materials[i];
    var required = 0;

    // add up material needed by unfinished orders
    for (var j = 0; j < orders.length; j++) {
      var p = findProduct(orders[j].product);
      if (p.material == m.name && !isCompleted(orders[j])) {
        required += orders[j].qty * p.perUnit;
      }
    }

    var status = "OK";
    var colour = "good";
    if (m.stock < required) {
      status = "Shortage!";
      colour = "bad";
    }
    html += "<tr><td>" + m.name + "</td><td>" + m.stock + "</td><td>" + required +
            "</td><td class='" + colour + "'>" + status + "</td></tr>";
  }
  document.getElementById("materialTable").innerHTML = html;
}

function showSummary() {
  var running = 0, delayed = 0, completed = 0;
  for (var i = 0; i < orders.length; i++) {
    var s = getStatus(orders[i]);
    if (s == "Completed") completed++;
    else if (s == "Delayed") delayed++;
    else running++;
  }
  document.getElementById("totalOrders").innerHTML = orders.length;
  document.getElementById("runningOrders").innerHTML = running;
  document.getElementById("delayedOrders").innerHTML = delayed;
  document.getElementById("completedOrders").innerHTML = completed;
}

// Refresh everything on the page
function refresh() {
  showSummary();
  showOrders();
  showMachines();
  showMaterials();
}

// ---------------- USER ACTIONS ----------------

// Add a new order from the form
function addOrder() {
  var product = document.getElementById("product").value;
  var qty = Number(document.getElementById("qty").value);
  var start = document.getElementById("start").value;
  var due = document.getElementById("due").value;
  var machine = document.getElementById("machine").value;

  // check inputs
  if (qty <= 0 || start == "" || due == "") {
    alert("Please fill all the fields.");
    return;
  }
  if (due < start) {
    alert("Due date cannot be before start date.");
    return;
  }

  // do not allow one machine for two running orders
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].machine == machine && !isCompleted(orders[i])) {
      alert(machine + " is already busy with Order " + orders[i].id);
      return;
    }
  }

  orders.push({ id: nextId, product: product, qty: qty, start: start, due: due, machine: machine, stageDone: 0 });
  nextId++;

  document.getElementById("qty").value = "";
  refresh();
}

// Move an order to its next stage
function nextStage(index) {
  orders[index].stageDone++;
  refresh();
}

// ---------------- START ----------------
showProducts();
fillDropdowns();
refresh();
