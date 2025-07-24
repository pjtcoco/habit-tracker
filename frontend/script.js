const habitList = document.getElementById("habit-list");
const habitForm = document.getElementById("habit-form");
const habitInput = document.getElementById("habit-input");

async function fetchHabits(filter = "all") {
  try {
    const response = await fetch("http://localhost:5000/api/habits");
    let habits = await response.json();

    if (filter === "completed") {
      habits = habits.filter((habit) => habit.isCompleted);
    } else if (filter === "incomplete") {
      habits = habits.filter((habit) => !habit.isCompleted);
    }

    renderHabits(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
  }
}

// Render habit list with fade-in for new habits
function renderHabits(habits) {
  habitList.innerHTML = "";

  habits.forEach((habit) => {
    const li = document.createElement("li");

    // Add class for fade-in animation when rendered
    li.classList.add("new-habit");
    // Remove 'new-habit' after animation ends to keep DOM clean
    li.addEventListener("animationend", () => {
      li.classList.remove("new-habit");
    });

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.isCompleted;
    checkbox.addEventListener("change", async () => {
      await toggleHabit(habit._id);
      fetchHabits(filterSelect.value);
    });

    // Editable habit name span
    const nameSpan = document.createElement("span");
    nameSpan.textContent = habit.name;
    nameSpan.style.marginLeft = "8px";
    nameSpan.style.cursor = "pointer";

    nameSpan.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = habit.name;
      input.style.marginLeft = "8px";
      li.replaceChild(input, nameSpan);
      input.focus();

      function saveEdit() {
        const newName = input.value.trim();
        if (newName && newName !== habit.name) {
          updateHabitName(habit._id, newName);
        } else {
          fetchHabits(filterSelect.value);
        }
      }

      input.addEventListener("blur", saveEdit);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          input.blur();
        } else if (e.key === "Escape") {
          fetchHabits(filterSelect.value);
        }
      });
    });

    // Delete button with fade-out animation before removal
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", async () => {
      // Add removing class to trigger fade-out animation
      li.classList.add("removing");

      // Wait for animation to end before deleting on backend and removing from DOM
      li.addEventListener(
        "animationend",
        async () => {
          await deleteHabit(habit._id);
          // Remove element after deletion
          li.remove();
          fetchHabits(filterSelect.value); // Refresh counter and list if needed
        },
        { once: true }
      );
    });

    li.appendChild(checkbox);
    li.appendChild(nameSpan);
    li.appendChild(deleteBtn);
    habitList.appendChild(li);
  });

  updateHabitCounter(habits);
}

async function updateHabitName(id, newName) {
  console.log("Updating habit with id:", id, "new name:", newName);
  try {
    const res = await fetch(`http://localhost:5000/api/habits/${id}/name`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    console.log("📝 Updated habit name:", data);
    fetchHabits(filterSelect.value);
  } catch (err) {
    console.error("❌ Error updating habit name:", err);
  }
}

function updateHabitCounter(habits) {
  const counterDiv = document.getElementById("habit-counter");
  const total = habits.length;
  const completed = habits.filter((habit) => habit.isCompleted).length;
  counterDiv.textContent = `Completed habits: ${completed} / ${total}`;
}

async function toggleHabit(id) {
  try {
    const res = await fetch(`http://localhost:5000/api/habits/${id}`, {
      method: "PUT",
    });
    const updatedHabit = await res.json();
    console.log("✅ Toggled:", updatedHabit);
    return updatedHabit; // <-- return updated habit with new isCompleted
  } catch (err) {
    console.error("❌ Error toggling habit:", err);
    return null;
  }
}

async function deleteHabit(id) {
  try {
    const res = await fetch(`http://localhost:5000/api/habits/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    console.log("🗑 Deleted:", data.message);
  } catch (err) {
    console.error("❌ Error deleting habit:", err);
  }
}

// Add new habit
habitForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = habitInput.value.trim();
  if (name === "") return;

  try {
    const response = await fetch("http://localhost:5000/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const savedHabit = await response.json();
    console.log("Habit added:", savedHabit);

    habitInput.value = "";

    // Instead of fetchHabits(), add the new habit directly with animation
    addHabitToDOM(savedHabit);
    updateHabitCounter(await fetchHabitsReturnAll()); // update counter
  } catch (error) {
    console.error("Error adding habit:", error);
  }
});

// Helper to add a single habit item to DOM with fade-in animation
function addHabitToDOM(habit) {
  const li = document.createElement("li");
  li.classList.add("new-habit");
  li.dataset.id = habit._id;

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = habit.isCompleted;
  checkbox.addEventListener("change", async () => {
    await toggleHabit(habit._id);
    fetchHabits(filterSelect.value);
  });

  // Name span
  const nameSpan = document.createElement("span");
  nameSpan.textContent = habit.name;
  nameSpan.style.marginLeft = "8px";
  nameSpan.style.cursor = "pointer";
  nameSpan.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = habit.name;
    input.style.marginLeft = "8px";
    li.replaceChild(input, nameSpan);
    input.focus();

    function saveEdit() {
      const newName = input.value.trim();
      if (newName && newName !== habit.name) {
        updateHabitName(habit._id, newName);
      } else {
        fetchHabits(filterSelect.value);
      }
    }

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur();
      } else if (e.key === "Escape") {
        fetchHabits(filterSelect.value);
      }
    });
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.style.marginLeft = "10px";
  deleteBtn.addEventListener("click", async () => {
    li.classList.add("removing");
    li.addEventListener(
      "animationend",
      async () => {
        await deleteHabit(habit._id);
        li.remove();
        fetchHabits(filterSelect.value);
      },
      { once: true }
    );
  });

  li.appendChild(checkbox);
  li.appendChild(nameSpan);
  li.appendChild(deleteBtn);
  habitList.appendChild(li);

  // Remove 'new-habit' class after animation to clean DOM
  li.addEventListener("animationend", () => {
    li.classList.remove("new-habit");
  });
}

// Helper to fetch all habits and return the array (used for updating counter)
async function fetchHabitsReturnAll() {
  try {
    const response = await fetch("http://localhost:5000/api/habits");
    return await response.json();
  } catch {
    return [];
  }
}

const filterSelect = document.getElementById("filter");

// Handle initial page load to fetch habits based on the default filter
document.addEventListener("DOMContentLoaded", () => {
  const defaultFilter = filterSelect?.value || "all";
  fetchHabits(defaultFilter);
});

// Update habits when filter changes
filterSelect.addEventListener("change", () => {
  fetchHabits(filterSelect.value); // Load habits based on filter
});
