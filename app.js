// localStorage key
var STORAGE_KEY = "my_kanban_cards_v1";

var COLUMNS = ["todo", "inprogress", "done"];

var defaultCards = [
  { id: "c1", title: "Finish CSS Grid homework", priority: "high", column: "todo" },
  { id: "c2", title: "Read MDN docs on drag and drop", priority: "medium", column: "inprogress" },
  { id: "c3", title: "Set up GitHub repo", priority: "low", column: "done" }
];

var cards = loadCards();
var draggedId = null;

var form = document.getElementById("add-card-form");
var titleInput = document.getElementById("new-title");
var priorityInput = document.getElementById("new-priority");
var columnInput = document.getElementById("new-column");
var searchInput = document.getElementById("search-input");
var filterSelect = document.getElementById("priority-filter");
var boardEl = document.querySelector(".board");

function loadCards() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.log("could not read localStorage", err);
  }
  return defaultCards.slice();
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function renderBoard() {
  var searchText = searchInput.value.trim().toLowerCase();
  var prioFilter = filterSelect.value;

  COLUMNS.forEach(function (colName) {
    var listEl = document.getElementById("list-" + colName);
    var countEl = document.getElementById("count-" + colName);
    listEl.innerHTML = "";

    var colCards = cards.filter(function (c) {
      if (c.column !== colName) return false;
      if (prioFilter !== "all" && c.priority !== prioFilter) return false;
      if (searchText && c.title.toLowerCase().indexOf(searchText) === -1) return false;
      return true;
    });

    countEl.textContent = colCards.length;

    if (colCards.length === 0) {
      var empty = document.createElement("p");
      empty.className = "empty-msg";
      empty.textContent = "No cards here";
      listEl.appendChild(empty);
      return;
    }

    colCards.forEach(function (card) {
      listEl.appendChild(createCardElement(card));
    });
  });
}

function createCardElement(card) {
  var el = document.createElement("article");
  el.className = "task-card";
  el.draggable = true;
  el.dataset.id = card.id;

  var colIdx = COLUMNS.indexOf(card.column);

  el.innerHTML =
    '<div class="card-top">' +
      '<span class="priority-tag prio-' + card.priority + '">' + card.priority + "</span>" +
      '<button type="button" class="card-btn edit-btn">Edit</button>' +
    "</div>" +
    '<p class="card-title"></p>' +
    '<div class="card-actions">' +
      "<div>" +
        (colIdx > 0 ? '<button type="button" class="card-btn move-left">&larr;</button> ' : "") +
        (colIdx < COLUMNS.length - 1 ? '<button type="button" class="card-btn move-right">&rarr;</button>' : "") +
      "</div>" +
      '<button type="button" class="card-btn delete-btn">Delete</button>' +
    "</div>";

  el.querySelector(".card-title").textContent = card.title;

  // drag events
  el.addEventListener("dragstart", function () {
    draggedId = card.id;
    el.classList.add("dragging");
  });

  el.addEventListener("dragend", function () {
    draggedId = null;
    el.classList.remove("dragging");
  });

  return el;
}

// add new card
form.addEventListener("submit", function (e) {
  e.preventDefault();
  var title = titleInput.value.trim();
  if (!title) return;

  cards.push({
    id: "c" + Date.now(),
    title: title,
    priority: priorityInput.value,
    column: columnInput.value
  });

  titleInput.value = "";
  saveCards();
  renderBoard();
});

// event delegation for edit, move, delete
boardEl.addEventListener("click", function (e) {
  var btn = e.target.closest("button");
  if (!btn) return;
  var cardEl = btn.closest(".task-card");
  if (!cardEl) return;

  var id = cardEl.dataset.id;
  var card = cards.find(function (c) { return c.id === id; });
  if (!card) return;

  if (btn.classList.contains("delete-btn")) {
    cards = cards.filter(function (c) { return c.id !== id; });
    saveCards();
    renderBoard();
  } else if (btn.classList.contains("move-left")) {
    var prevIdx = COLUMNS.indexOf(card.column) - 1;
    if (prevIdx >= 0) {
      card.column = COLUMNS[prevIdx];
      saveCards();
      renderBoard();
    }
  } else if (btn.classList.contains("move-right")) {
    var nextIdx = COLUMNS.indexOf(card.column) + 1;
    if (nextIdx < COLUMNS.length) {
      card.column = COLUMNS[nextIdx];
      saveCards();
      renderBoard();
    }
  } else if (btn.classList.contains("edit-btn")) {
    startInlineEdit(cardEl, card);
  }
});

function startInlineEdit(cardEl, card) {
  var titleP = cardEl.querySelector(".card-title");
  if (!titleP) return;

  var input = document.createElement("input");
  input.type = "text";
  input.className = "edit-input";
  input.value = card.title;
  titleP.replaceWith(input);
  input.focus();

  function finishEdit() {
    var updated = input.value.trim();
    if (updated) {
      card.title = updated;
      saveCards();
    }
    renderBoard();
  }

  input.addEventListener("blur", finishEdit);
  input.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") {
      finishEdit();
    } else if (ev.key === "Escape") {
      renderBoard();
    }
  });
}

// drag-and-drop on columns
