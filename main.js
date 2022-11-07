import './style.css'

const addTD = document.getElementById("addTodo");
const tdList = document.getElementById("todoList");
const tdTitle = document.getElementById("todoTitle");
const newListBtn = document.getElementById("createNewList");
const taskList = document.getElementById("taskList");
const dropdownList = document.getElementById("dropdownList");
const currentTodoListPage = document.getElementById("currentTodoListPage");
const homePage = document.getElementById("homePage");
const homePageListOfLists = document.getElementById("homePageListOfLists")
const homeBtn = document.getElementById("homeBtn");
const favoriteListBtn = document.getElementById("favoriteListBtn");

let currentList;
let currentListID = localStorage.getItem("currentListID");




function openHomeScreen() {
  currentTodoListPage.style.display = "none";
  homePage.style.display = "flex";

  const listOfListIDs = Object.keys(localStorage).filter(key => key.match(/tdl-/));
  homePageListOfLists.innerHTML = "";

  listOfListIDs.forEach((listID, idx) => {
    const list = JSON.parse(localStorage.getItem(listID));

    const div = document.createElement('div');
    div.className = "homePageListName";
    div.innerText = list.title;
    div.dataset.listID = listID;
    div.tabIndex = "0";

    const icon = document.createElement('i');
    if (listID === localStorage.getItem('favoriteListID')) {
      icon.classList = "fa-solid fa-star favorites";
    } else {
      icon.classList = "fa-regular fa-star favorites";

    }


    div.insertAdjacentElement('beforeend', icon);

    div.addEventListener('click', (e) => {
      const listID = e.target.dataset.listID;

      if (listID) {
        openList(listID);
      }

      const isFavoriteBtn = e.target.className.includes("favorites");
      if (isFavoriteBtn) {
        const previousFavoriteListID = localStorage.getItem('favoriteListID');

        if (previousFavoriteListID) {
          const previousFavoriteList = JSON.parse(localStorage.getItem(previousFavoriteListID));
          previousFavoriteList.isFavorite = false;
          localStorage.setItem(previousFavoriteListID, JSON.stringify(previousFavoriteList));
        }

        const newFavoriteListID = e.target.parentNode.dataset.listID;
        localStorage.setItem('favoriteListID', newFavoriteListID);

        const favoriteList = JSON.parse(localStorage.getItem(newFavoriteListID));
        favoriteList.isFavorite = true;
        localStorage.setItem(newFavoriteListID, JSON.stringify(favoriteList));

        openHomeScreen();
      }

    })

    div.addEventListener('keypress', (e) => {
      const key = e.code;

      if (key === "Space" || key === "Enter") {
        openList(e.target.dataset.listID);
      }
    })

    const customHR = document.createElement('div');
    customHR.className = "customHR";

    homePageListOfLists.append(div);
    if (idx < listOfListIDs.length - 1) {
      homePageListOfLists.append(customHR);
    }
  })
}
homeBtn.addEventListener('click', openHomeScreen);

function openFavoriteList() {
  homePage.style.display = "none";
  currentTodoListPage.style.display = "flex";

  const favoriteListID = localStorage.getItem("favoriteListID");

  openList(favoriteListID);
}
favoriteListBtn.addEventListener('click', openFavoriteList);

function openList(listID) {
  homePage.style.display = "none";
  currentTodoListPage.style.display = "flex";

  updateCurrentListID(listID);
  drawTodoList();
}

function enterEditMode(e) {
  e.target.dataset.editing = "true";
  e.target.dataset.originalValue = e.target.innerText;
}

function exitEditMode(e) {
  const target = e.target;
  target.dataset.editing = "false";

  if (target.innerText.trim() === "") {
    if (target.dataset.originalValue === "") {
      currentList.tasks.every((task, idx) => {
        if (target.id === task.id) {
          currentList.tasks.splice(idx, 1);
          updateDB();
          return false;
        }
        return true;
      })
    } else {
      target.innerText = target.dataset.originalValue;
    }

  }

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
  const todoLists = localStorageKeys.filter(key => key.match(/tdl-/)).sort();

  todoLists.forEach(listID => {
    const list = JSON.parse(localStorage.getItem(listID));

    const masterDiv = document.createElement('div');
    masterDiv.dataset.listID = listID;
    masterDiv.className = "dropdownTaskDiv";

    const div = document.createElement('div');
    div.innerText = list.title;

    div.addEventListener('click', changeCurrentList)
    masterDiv.append(div);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = "deleteBtn";
    deleteBtn.innerText = "X";
    deleteBtn.addEventListener("click", deleteList);
    masterDiv.append(deleteBtn);

    taskList.append(masterDiv);
  })
}

function deleteList(e) {
  const target = e.target;
  const listID = target.parentNode.dataset.listID;
  const targetList = JSON.parse(localStorage.getItem(listID));

  const div = document.createElement('div');
  div.id = "confirmListDelete";
  div.innerText = `Click to confirm deleting list: ${targetList.title}`;

  div.addEventListener('mouseleave', (e) => {
    e.target.remove();
  })

  div.addEventListener('click', (e) => {
    e.target.parentNode.remove();
    localStorage.removeItem(listID);

    if (listID === currentListID) {
      const replacementListID = Object.keys(localStorage).filter(key => key.match(/tdl-/)).sort()[0];

      if (!replacementListID) {
        const newListID = `tdl-${Date.now()}`;
        const date = new Date().toISOString().substr(0, 10);
        const newTodoListObj = {
          "title": `Todo List: ${date}`,
          "tasks": []
        }
        currentListID = newListID;
        localStorage.setItem("currentListID", currentListID);
        localStorage.setItem(newListID, JSON.stringify(newTodoListObj));

        currentList = JSON.parse(localStorage.getItem(currentListID));
      }

      if (replacementListID) {
        updateCurrentListID(replacementListID);
      }

      drawTodoList();
    }
  })

  target.insertAdjacentElement("afterend", div);
}

function changeCurrentList(e) {
  const listID = e.target.parentNode.dataset.listID;

  currentListID = listID;
  localStorage.setItem('currentListID', currentListID);
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

    const deleteBtn = document.createElement('button');
    deleteBtn.className = "deleteBtn";
    deleteBtn.innerText = "X";

    deleteBtn.addEventListener("click", removeTask);

    masterDiv.append(deleteBtn);

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
  localStorage.setItem(currentListID, JSON.stringify(currentList));

  drawTodoList();
}

function createNewList() {
  const newListID = `tdl-${Date.now()}`;
  const date = new Date().toISOString().substr(0, 10);
  const newTodoListObj = {
    "title": `Todo List: ${date}`,
    "tasks": [],
    "dateCreated": Date.now(),
    "isFavorite": false
  }
  currentListID = newListID;
  localStorage.setItem("currentListID", currentListID);
  localStorage.setItem(newListID, JSON.stringify(newTodoListObj));

  currentList = JSON.parse(localStorage.getItem(currentListID));
  drawTodoList();
  dropdownList.style.zIndex = "-1";
  setTimeout(() => { dropdownList.style.zIndex = "1" }, 100);
  tdTitle.focus();

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(tdTitle);
  selection.removeAllRanges();
  selection.addRange(range);
}
newListBtn.addEventListener('click', createNewList);

function updateCurrentListID(newListID) {
  currentListID = newListID;
  localStorage.setItem('currentListID', currentListID);

  currentList = JSON.parse(localStorage.getItem(newListID));
}

function initialLoad() {
  if (!currentListID || !localStorage.getItem(currentListID)) {
    const newListID = `tdl-${Date.now()}`;
    const date = new Date().toISOString().substr(0, 10);
    const newTodoListObj = {
      "title": `Todo List: ${date}`,
      "tasks": []
    }
    currentListID = newListID;
    localStorage.setItem("currentListID", currentListID);
    localStorage.setItem(newListID, JSON.stringify(newTodoListObj));
  }

  currentList = JSON.parse(localStorage.getItem(currentListID));
  drawTodoList();
  openHomeScreen();
}

initialLoad();