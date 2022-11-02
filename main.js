import './style.css'

const addTD = document.getElementById("addTodo");
const tdList = document.getElementById("todoList");
const tdTitle = document.getElementById("todoTitle");
const newListBtn = document.getElementById("createNewList");
const taskList = document.getElementById("taskList");

let currentList;

function enterEditMode(e) {
  e.target.dataset.editing = "true";
  e.target.dataset.originalValue = e.target.innerText;
}

function exitEditMode(e) {
  const target = e.target;
  target.dataset.editing = "false";

  if (target.id === "todoTitle" && target.innerText !== target.dataset.originalValue) {
    currentList.title = target.innerText;
    updateDB();
  } else if (target.innerText !== target.dataset.originalValue) {
    currentList.tasks.every(task => {
      if (target.id === task.id) {
        task.text = target.innerText;
        return false;
      }
      return true;
    })
    updateDB();
  }
}

function drawTodoList() {
  tdList.innerHTML = "";
  taskList.innerHTML = "";

  tdTitle.innerText = currentList.title;
  tdTitle.addEventListener('focusin', enterEditMode);
  tdTitle.addEventListener('focusout', exitEditMode);
  tdTitle.addEventListener('keypress', dropFocus);

  const unfinishedTasks = currentList.tasks.filter(task => task.completed === false);
  const finishedTasks = currentList.tasks.filter(task => task.completed === true);

  drawTasks(unfinishedTasks);
  drawTasks(finishedTasks);
  createListDropdown();
}

function createListDropdown() {
  const localStorageKeys = Object.keys(localStorage);
  const todoLists = localStorageKeys.filter(key => key.match(/tdl-/));

  todoLists.forEach(listID => {
    const list = JSON.parse(localStorage.getItem(listID));

    const div = document.createElement('div');
    div.innerText = list.title;
    div.dataset.listID = listID;

    div.addEventListener('click', changeCurrentList)

    taskList.append(div);
  })
}

function changeCurrentList(e) {
  const listID = e.target.dataset.listID;
  
  localStorage.setItem('currentListID', listID);
  currentList = JSON.parse(localStorage.getItem(listID));
  drawTodoList();
}

function drawTasks(taskList) {
  taskList.forEach(task => {
    const masterDiv = document.createElement('div');
    masterDiv.className = "taskDiv";

    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    masterDiv.append(checkbox);

    const taskDiv = document.createElement('div');
    taskDiv.innerText = task.text;
    taskDiv.contentEditable = "true";
    taskDiv.dataset.editing = "false";
    taskDiv.id = task.id;
    taskDiv.dataset.completed = `${task.completed}`;

    taskDiv.addEventListener('focusin', enterEditMode);
    taskDiv.addEventListener('focusout', exitEditMode);
    taskDiv.addEventListener('keypress', dropFocus);

    masterDiv.append(taskDiv);

    const removeBtn = document.createElement('button');
    removeBtn.innerText = "X";

    removeBtn.addEventListener("click", removeTask);

    masterDiv.append(removeBtn);

    tdList.append(masterDiv);
  })
}

function removeTask(e) {
  const taskID = e.target.previousSibling.id;

  currentList.tasks.every((task, idx) => {
    if (task.id === taskID) {
      currentList.tasks.splice(idx, 1);
      return false;
    }
    return true;
  })

  updateDB();
}

function dropFocus(e) {
  const key = e.key;

  if (key === "Enter") {
    e.target.blur();
    exitEditMode(e);
  }
}

function addListItem() {
  currentList.tasks.push({
    "text": "",
    "completed": false,
    "id": `task-${Date.now()}`
  });

  updateDB();

  const unfinishedTasks = currentList.tasks.filter(task => task.completed === false);
  const lastUnfinishedTaskID = unfinishedTasks.at(-1).id;
  document.getElementById(lastUnfinishedTaskID).focus();
}
addTD.addEventListener('click', addListItem);

document.addEventListener('click', (e) => {
  const target = e.target;

  if (target.type === "checkbox") {
    const task = target.nextElementSibling;
    task.dataset.completed = target.checked;

    currentList.tasks.every(item => {
      if (task.id === item.id) {
        item.completed = target.checked;
        return false;
      }
      return true;
    })

    updateDB();
  }
})

function updateDB() {
  const currentListID = localStorage.getItem("currentListID");
  localStorage.setItem(currentListID, JSON.stringify(currentList));

  drawTodoList();
}

function createNewList() {
  const currentListID = `tdl-${Date.now()}`;
  const date = new Date().toISOString().substr(0, 10);
  const newTodoListObj = {
    "title": `Todo List: ${date}`,
    "tasks": []
  }
  localStorage.setItem("currentListID", currentListID);
  localStorage.setItem(currentListID, JSON.stringify(newTodoListObj));

  currentList = JSON.parse(localStorage.getItem(localStorage.getItem("currentListID")));
  drawTodoList();
}
newListBtn.addEventListener('click', createNewList);

function initialLoad() {
  if (!localStorage.getItem("currentListID")) {
    const currentListID = `tdl-${Date.now()}`;
    const date = new Date().toISOString().substr(0, 10);
    const newTodoListObj = {
      "title": `Todo List: ${date}`,
      "tasks": []
    }
    localStorage.setItem("currentListID", currentListID);
    localStorage.setItem(currentListID, JSON.stringify(newTodoListObj));
  }

  currentList = JSON.parse(localStorage.getItem(localStorage.getItem("currentListID")));
  drawTodoList();
}

initialLoad();