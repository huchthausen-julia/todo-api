const remBtn = document.querySelector(".remove-btn");
const addBtn = document.querySelector(".add-btn");
const inputField = document.querySelector(".input");
const ulEl = document.querySelector(".todo-container");
const radioContainer = document.querySelector(".radio-container");

const filterOptions = ["all", "done", "open"];

let toDoAppState = {
  filter: "all",
  todos: [],
};

const apiURL = "http://localhost:4730/todos";

addBtn.addEventListener("click", addInput);
inputField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addInput();
    inputField.value = "";
  }
});

remBtn.addEventListener("click", removeDoneToDos);
radioContainer.addEventListener("change", updateFilter);

loadToDoAppStateFromAPI();

async function loadToDoAppStateFromAPI() {
  fetch(apiURL)
    .then((response) => response.json())
    .then((data) => {
      toDoAppState.todos = data;
      render();
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Daten aus der API:", error);
    });
}

function addInput() {
  const inputValue = inputField.value.trim(); // entfernt Leerschritte vor und nach der Eingabe im inputFeld!

  if (inputValue !== "" && inputValue.length >= 5) {
    const newToDo = {
      description: inputValue,
      done: false,
    };

    fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newToDo),
    })
      .then((response) => response.json())
      .then((createdToDo) => {
        toDoAppState.todos.push(createdToDo);
        inputField.value = "";
        render();
      })
      .catch((error) => {
        console.error("Fehler beim Hinzufügen eines neuen To-Do:", error);
      });
  } else {
    alert("unzulässige Eingabe!");
    inputField.value = "";
  }
}

function render() {
  ulEl.innerHTML = "";
  const filter = toDoAppState.filter;

  for (let todo of toDoAppState.todos) {
    const isDone = todo.done;

    if (
      filter === "all" ||
      (filter === "done" && isDone) ||
      (filter === "open" && !isDone)
    ) {
      const newLi = document.createElement("li");
      const newInput = document.createElement("input");

      newInput.addEventListener("input", () => {
        todo.done = newInput.checked; // synchronisation vom state und nutzeroberfläche
        updateStyling(newLi, newInput, todo.done);
        saveToDoAppStateToAPI();
      });

      newInput.setAttribute("type", "checkbox");
      newInput.checked = todo.done;
      updateStyling(newLi, newInput, todo.done);

      const liText = document.createTextNode(todo.description);

      newLi.append(newInput);
      newLi.append(liText);
      ulEl.append(newLi);
    }
  }
}

function saveToDoAppStateToAPI() {
  fetch(apiURL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toDoAppState.todos),
  }).catch((error) => {
    console.error("Fehler beim Speichern des Zustands in der API:", error);
  });
}

function updateStyling(liElement, checkbox, isDone) {
  if (isDone) {
    liElement.style.textDecoration = "line-through";
    checkbox.checked = true;
  } else {
    liElement.style.textDecoration = "none";
    checkbox.checked = false;
  }
}

async function removeDoneToDos() {
  const checkboxesChecked = ulEl.querySelectorAll(
    "input[type='checkbox']:checked"
  ); //NodeList von allen ausgewählten Checkbox-Elementen wird erstellt!

  for (const checkbox of checkboxesChecked) {
    const li = checkbox.parentElement;
    const todoId = li.getAttribute("data-id");

    const removed = await removeToDoFromAPI(todoId);

    if (removed) {
      toDoAppState.todos = toDoAppState.todos.filter(
        (todo) => todo.id !== todoId
      );
      li.remove();
    }
  }
}

async function removeToDoFromAPI(todoId) {
  try {
    // Lösche das Todo aus der API
    await fetch(`${apiURL}/${todoId}`, {
      method: "DELETE",
    });

    return true;
  } catch (error) {
    console.error("Fehler beim Löschen eines Todos aus der API:", error);
    return false;
  }
}

function updateFilter(e) {
  const selectedFilter = e.target.value;
  toDoAppState.filter = selectedFilter;
  console.log(toDoAppState.filter);
  render();
}
