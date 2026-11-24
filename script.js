const STORAGE_KEY = "todo-tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyMsg = document.getElementById("empty");
const countEl = document.getElementById("count");
const clearBtn = document.getElementById("clear-done");
const filterBtns = document.querySelectorAll(".filter");

let tasks = load();
let filter = "all";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text) {
  tasks.push({ id: Date.now(), text, done: false });
  save();
  render();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) t.done = !t.done;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

function editTask(id, text) {
  const t = tasks.find(t => t.id === id);
  if (t && text.trim()) t.text = text.trim();
  save();
  render();
}

function startEdit(li, task) {
  const title = li.querySelector(".title");
  const editor = document.createElement("input");
  editor.className = "edit-input";
  editor.value = task.text;
  title.replaceWith(editor);
  editor.focus();
  editor.select();

  let finished = false;
  const finish = commit => {
    if (finished) return;
    finished = true;
    commit ? editTask(task.id, editor.value) : render();
  };
  editor.addEventListener("keydown", e => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  editor.addEventListener("blur", () => finish(true));
}

function render() {
  const visible = tasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  list.innerHTML = "";
  visible.forEach(task => {
    const li = document.createElement("li");
    if (task.done) li.classList.add("done");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = task.done;
    cb.addEventListener("change", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = task.text;
    title.title = "Double-click to edit";
    title.addEventListener("dblclick", () => startEdit(li, task));

    const del = document.createElement("button");
    del.className = "delete";
    del.setAttribute("aria-label", "Delete task");
    del.textContent = "×";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(cb, title, del);
    list.appendChild(li);
  });

  const left = tasks.filter(t => !t.done).length;
  countEl.textContent = `${left} task${left === 1 ? "" : "s"} left`;
  emptyMsg.hidden = visible.length > 0;
  clearBtn.hidden = !tasks.some(t => t.done);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

filterBtns.forEach(btn =>
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.toggle("active", b === btn));
    render();
  })
);

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
});

render();
