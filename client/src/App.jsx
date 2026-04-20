import { useState } from "react";

const App = () => {
  // Initial state for the columns and tasks in the Kanban board
  const [column, setColumn] = useState({
    todo: {
      name: "To Do",
      items: [
        { id: "1", content: "Native App Development" },
        { id: "2", content: "Web App Development" },
        { id: "3", content: "UI/UX Design" },
        { id: "4", content: "Project Management" },
        { id: "5", content: "Testing & QA" },
      ],
    },
    inprogress: {
      name: "In Progress",
      items: [
        { id: "6", content: "Mobile App Development" },
        { id: "7", content: "Backend Development" },
        { id: "8", content: "Frontend Development" },
        { id: "9", content: "Database Design" },
        { id: "10", content: "API Integration" },
      ],
    },
    done: {
      name: "Done",
      items: [
        { id: "11", content: "Requirement Analysis" },
        { id: "12", content: "Wireframing" },
        { id: "13", content: "Prototyping" },
        { id: "14", content: "Deployment" },
        { id: "15", content: "Maintenance & Support" },
      ],
    },
  });

  // State for the new task input
  const [newTask, setNewTask] = useState("");

  // State to track the active column for drag-and-drop functionality
  const [activeColumn, setActiveColumn] = useState("todo");

  // State to track the currently dragged item during drag-and-drop operations
  const [draggedItem, setDraggedItem] = useState(null);

  const addNewTask = () => {
    if (newTask.trim() === "") return; // Prevent adding empty tasks

    const newTaskObj = {
      id: Date.now().toString(), // Generate a unique ID for the new task
      content: newTask, // Set the content of the new task from the input
    };

    // Update the state to add the new task to the active column
    setColumn((prev) => {
      return {
        ...prev,
        [activeColumn]: {
          ...prev[activeColumn],
          items: [...prev[activeColumn].items, newTaskObj], // Add the new task to the existing items
        },
      };
    });

    setNewTask(""); // Clear the input field after adding the task
  };

  const removeTask = (columnId, taskId) => {
    // Update the state to remove the specified task from the specified column
    setColumn((prev) => {
      return {
        ...prev,
        [columnId]: {
          ...prev[columnId],
          items: prev[columnId].items.filter((item) => item.id !== taskId), // Filter out the task to be removed
        },
      };
    });
  };

  const handleDragStart = (columnId, item) => {
    setDraggedItem(columnId, item); // Set the currently dragged item and its column
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default behavior to allow dropping
  };

  const handleDrop = (columnId) => {
    if (!draggedItem) return; // If no item is being dragged, do nothing

    // Update the state to move the dragged item to the new column
    setColumn((prev) => {
      const newColumns = { ...prev };
      const draggedItemData = newColumns[draggedItem.columnId].items.find(
        (item) => item.id === draggedItem.item.id,
      );

      // Remove the dragged item from its original column
      newColumns[draggedItem.columnId].items = newColumns[
        draggedItem.columnId
      ].items.filter((item) => item.id !== draggedItem.item.id);

      // Add the dragged item to the new column
      newColumns[columnId].items.push(draggedItemData);

      return newColumns; // Return the updated columns state
    });

    setDraggedItem(null); // Clear the dragged item state after dropping
  };

  const columnStyles = {
    todo: {
      header: "bg-gradient-to-r from-blue-600 to-blue-400",
      border: "border-blue-400",
    },
    inprogress: {
      header: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      border: "border-yellow-400",
    },
    done: {
      header: "bg-gradient-to-r from-green-600 to-green-400",
      border: "border-green-400",
    },
  };

  return (
    <>
      <section className="p-6 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center">
        <section className="container mx-auto flex flex-col gap-4 items-center justify-center">
          <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-400">
            Pickaxe & Shovel Vision
          </h1>

          <section className="mb-8 w-full flex max-w-lg shadow-lg rounded-lg overflow-hidden">
            <input
              type="text"
              value={newTask}
              name="newTask"
              id="newTask"
              placeholder="New task"
              className="p-3 flex-grow bg-zinc-700 text-white outline-none"
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewTask()}
            />

            <select
              value={activeColumn}
              onChange={(e) => setActiveColumn(e.target.value)}
              className="p-3 bg-zinc-700 text-white border-0 border-l border-zinc-600 outline-none"
            >
              {Object.keys(column).map((col) => (
                <option key={col} value={col}>
                  {column[col].name}
                </option>
              ))}
            </select>

            <button
              onClick={addNewTask}
              className="px-6 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-500 font-medium transition-all duration-200 text-white"
            >
              Add
            </button>
          </section>

          <section className="flex gap-6 overflow-x-auto pb-6 w-full">
            {Object.entries(column).map(([columnId, columnData]) => (
              <section
                key={columnId}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(columnId)}
                className={`w-80 flex-shrink-0 rounded-lg ${columnStyles[columnId].border} border-2`}
              >
                <h2
                  className={`text-xl font-bold p-4 text-white ${columnStyles[columnId].header}`}
                >
                  {columnData.name}
                </h2>

                <section className="p-4 flex flex-col gap-4">
                  {columnData.items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() =>
                        handleDragStart(columnId, { columnId, item })
                      }
                      className="p-3 bg-zinc-700 text-white rounded cursor-move"
                    >
                      {item.content}

                      <button
                        onClick={() => removeTask(columnId, item.id)}
                        className="ml-2 text-red-500 hover:text-red-400 transition-all duration-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </section>
              </section>
            ))}
          </section>
        </section>
      </section>
    </>
  );
};

export default App;
