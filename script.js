const ol = document.querySelector("ol");
const input = document.querySelector("input");
const dueInput=document.querySelector("#dueInput");

let tasks = getTasks();
if (tasks.length > 0) {
  renderTasks();
}
if(tasks.length==0){
  fetchInitialTasks();
}
console.log(tasks.length);
// to backup all the existings tasks still haven't been treated
let id = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) : 0;
console.log("je suis la", tasks);

function createTask(taskContent) {
  return {
    content: taskContent,
    checked: false,
    id: ++id,
    dueDate: this.moment().format("DD/MM/YYYY hh:mm A"),
  };
}

function addTask() {
  const value = input.value.trim();
  if (value === "") return;

  const newTask = createTask(value);
  tasks.push(newTask);
  saveTask(tasks);

  renderTasks();

  input.value = "";
  console.log(newTask);
}

//fonction qui va modifier les checkbox
ol.addEventListener("change", (ev) => {
  console.log(ev.target.type);
  if (ev.target.type === "checkbox") {
    const li = ev.target.closest("li");
    // On retrouve l'objet par son ID (converti en nombre)
    const taskId = Number(li.dataset.id);
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      task.checked = ev.target.checked;
      li.classList.toggle("checked");
      saveTask(tasks);
      const button = li.querySelector("button");
      button.classList.toggle("visible");
    }
  }
});

ol.addEventListener("click", (ev) => {
  if (ev.target.tagName === "BUTTON") {
    const li = ev.target.closest("li");
    const taskId = Number(li.dataset.id);
    const task = tasks.find((t) => t.id === taskId);

    tasks.splice(tasks.indexOf(task), 1);
    li.remove();
    saveTask(tasks);
  }
});

function saveTask(tasks) {
  const tasksaved = JSON.stringify(tasks);
  localStorage.setItem("tasks", tasksaved);
  console.log(localStorage.getItem("tasks"));
}

function getTasks() {
  // On récupère la chaîne de caractères
  const data = localStorage.getItem("tasks");

  // Si data existe, on parse, sinon on met un tableau vide []
  const savedTask = data ? JSON.parse(data) : [];
  return savedTask;
}

function renderTasks(event) {
  ol.innerHTML = "";

  const filter = event ? event.target.value : "all";
  const filteredTasks = filterTasks(tasks, filter);

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("taskItem");
    li.dataset.id = task.id;

    // checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "taskCheck";
    checkbox.checked = !!task.checked;

    // text
    const text = document.createElement("div");
    text.className = "taskText";
    text.textContent = task.content;

    // trash
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "taskTrash";
    remove.textContent = "🗑️";

    // date (dans un TAG, pas un span)
    const meta = document.createElement("div");
    meta.className = "taskMeta";
    meta.textContent = task.dueDate;

    li.append(checkbox, text, remove, meta);

    if (task.checked) {
      li.classList.add("checked");
      remove.classList.add("visible");
    }

    ol.appendChild(li);
  });
}
function sortTasks() {
  tasks.sort((a, b) => {
    const da = moment(a.dueDate, "DD/MM/YYYY hh:mm A").valueOf();
    const db = moment(b.dueDate, "DD/MM/YYYY hh:mm A").valueOf();
    return da - db;
  });

  saveTask(tasks);
  renderTasks();
}
function filterTasks(tasks, filter) {
  switch (filter) {
    case "all":
      return tasks;
    case "completed":
      return tasks.filter((task) => task.checked);
    case "active":
      return tasks.filter((task) => !task.checked);
    default:
      return tasks;
  }
}
function clearAll(){
  tasks=[];
  saveTask(tasks);
  renderTasks();
}
async function fetchInitialTasks() {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/todos?_limit=5",
  );
  const data= await res.json();
      const cleanTasks = data.map(item => {
        return {
            content: item.title,      
            checked: item.completed,  
            id: item.id,              
            dueDate: moment().format("DD/MM/YYYY hh:mm A")
        };
    });
    tasks.push(...cleanTasks);
    saveTask(tasks);
    renderTasks();
}
//manque supprimer de la liste et localestorage.
//faire refactoring
//decorer
