
const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const subjectInput = document.getElementById("subject");
const dateInput = document.getElementById("task-date");
const durationInput = document.getElementById("duration");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("task-list");
const taskFilter = document.getElementById("task-filter");

const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const pendingTasks = document.getElementById("pending-tasks");
const progressNumber = document.getElementById("progress-number");
const progressFill = document.getElementById("progress-fill");
const visibleCount = document.getElementById("visible-count");

// Today's date in local time
function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

document.getElementById("today-date").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

dateInput.value = getLocalDate();
dateInput.min = getLocalDate();

// Load previously saved tasks
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("studyFlowTasks");
        const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

        return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

let tasks = loadTasks();

// Save tasks in the browser
function saveTasks() {
    try {
        localStorage.setItem("studyFlowTasks", JSON.stringify(tasks));
    } catch (error) {
        alert("Tasks save nahi ho sake. Browser storage check karein.");
        console.error("Could not save tasks:", error);
    }
}

// Add a new task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskTitle.value.trim();

    if (!title) {
        alert("Please task ka naam enter karein.");
        return;
    }

    if (!subjectInput.value || !dateInput.value) {
        alert("Please subject aur study date select karein.");
        return;
    }

    const newTask = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        title: title,
        subject: subjectInput.value,
        date: dateInput.value,
        duration: Number(durationInput.value),
        priority: priorityInput.value,
        completed: false
    };

    tasks.unshift(newTask);

    saveTasks();
    renderTasks();

    taskForm.reset();
    dateInput.value = getLocalDate();
    durationInput.value = "30";
    priorityInput.value = "Normal";
    taskTitle.focus();
});

// Create a text element safely
function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;

    return element;
}

// Render one task card
function createTaskCard(task) {
    const card = document.createElement("article");
    card.className = "task-card";

    if (task.completed) {
        card.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
        "aria-label",
        `Mark ${task.title} as completed`
    );

    checkbox.addEventListener("change", function () {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
    });

    const info = document.createElement("div");
    info.className = "task-info";

    const subject = createTextElement(
        "span",
        "subject-tag",
        task.subject
    );

    const title = createTextElement("h4", "", task.title);

    const priorityClass = {
        High: "priority-high",
        Normal: "priority-normal",
        Low: "priority-low"
    };

    const priority = createTextElement(
        "span",
        `priority-tag ${priorityClass[task.priority] || "priority-normal"}`,
        `${task.priority} Priority`
    );

    const meta = document.createElement("div");
    meta.className = "task-meta";

    meta.appendChild(
        createTextElement("span", "", `📅 ${formatDate(task.date)}`)
    );

    meta.appendChild(
        createTextElement("span", "", `◷ ${task.duration} min`)
    );

    meta.appendChild(
        createTextElement(
            "span",
            "",
            task.completed ? "✓ Completed" : "○ Pending"
        )
    );

    info.append(subject, title, priority, meta);

    const deleteButton = createTextElement(
        "button",
        "delete-button",
        "Delete"
    );

    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    deleteButton.addEventListener("click", function () {
        const shouldDelete = confirm(
            `Delete "${task.title}" task?`
        );

        if (shouldDelete) {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        }
    });

    card.append(checkbox, info, deleteButton);

    return card;
}

// Display tasks according to the selected filter
function renderTasks() {
    taskList.replaceChildren();

    const filter = taskFilter.value;

    const filteredTasks = tasks.filter(task => {
        if (filter === "completed") {
            return task.completed;
        }

        if (filter === "pending") {
            return !task.completed;
        }

        return true;
    });

    totalTasks.textContent = tasks.length;

    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;

    const percentage = tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0;

    progressNumber.textContent = `${percentage}%`;
    progressFill.style.width = `${percentage}%`;

    visibleCount.textContent =
        `${filteredTasks.length} ${filteredTasks.length === 1 ? "task" : "tasks"}`;

    if (filteredTasks.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const icon = createTextElement("div", "empty-icon", "📖");

        const heading = createTextElement(
            "h3",
            "",
            filter === "completed"
                ? "No completed tasks yet"
                : filter === "pending"
                    ? "All caught up!"
                    : "Your study plan is empty"
        );

        const message = createTextElement(
            "p",
            "",
            filter === "all"
                ? "Add your first study task using the form above."
                : "Try another filter or add a new study task."
        );

        emptyState.append(icon, heading, message);
        taskList.appendChild(emptyState);
        return;
    }

    filteredTasks.forEach(task => {
        taskList.appendChild(createTaskCard(task));
    });
}

// Update list when the filter changes
taskFilter.addEventListener("change", renderTasks);

// Initial display
renderTasks();
