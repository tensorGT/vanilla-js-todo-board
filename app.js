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
