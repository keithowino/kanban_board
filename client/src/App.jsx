import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./lib/firebase";

const App = () => {
  // Initial state for the columns and tasks in the Kanban board
  const [column, setColumn] = useState({
    todo: {
      name: "To Do",
      items: [],
    },
    inprogress: {
      name: "In Progress",
      items: [],
    },
    done: {
      name: "Done",
      items: [],
    },
  });

  // State for the new task input
  const [newTask, setNewTask] = useState("");

  // State to track the active column for drag-and-drop functionality
  const [activeColumn, setActiveColumn] = useState("todo");

  // State to track the currently dragged item during drag-and-drop operations
  const [draggedItem, setDraggedItem] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
    setDraggedItem({ columnId, item }); // Set the currently dragged item and its column
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default behavior to allow dropping
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (!draggedItem) return; // If no item is being dragged, do nothing

    // 🚫 Prevent same-column duplication
    if (draggedItem.columnId === columnId) {
      setDraggedItem(null);
      return;
    }

    setColumn((prev) => {
      const sourceCol = prev[draggedItem.columnId];
      const targetCol = prev[columnId];

      const draggedItemData = sourceCol.items.find(
        (item) => item.id === draggedItem.item.id,
      );

      return {
        ...prev,
        [draggedItem.columnId]: {
          ...sourceCol,
          items: sourceCol.items.filter(
            (item) => item.id !== draggedItem.item.id,
          ),
        },
        [columnId]: {
          ...targetCol,
          items: [...targetCol.items, draggedItemData],
        },
      };
    });

    setDraggedItem(null); // Clear the dragged item state after dropping
  };

  const saveToFirebase = async (data) => {
    try {
      await setDoc(doc(db, "boards", "mainBoard"), {
        columns: data,
      });
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const loadFromFirebase = async () => {
    try {
      const docRef = doc(db, "boards", "mainBoard");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data().columns;
      }
    } catch (err) {
      console.error("Error loading:", err);
    }

    return null;
  };

  useEffect(() => {
    if (!isLoaded) return; // 🚫 don't save before loading finishes

    saveToFirebase(column);
  }, [column, isLoaded]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadFromFirebase();

      if (data) {
        setColumn(data);
      }

      setIsLoaded(true); // ✅ NOW it runs AFTER loading finishes
    };

    fetchData();
  }, []);

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

          {/* New Task Input */}
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

          <section className="flex gap-6 overflow-x-auto pb-6 w-full justify-center">
            {/* Column Sections */}
            {Object.entries(column).map(
              (
                [columnId, columnData], // the tutor went with object.keys
              ) => (
                <section
                  key={columnId}
                  onDragOver={(e) => handleDragOver(e, columnId)}
                  onDrop={(e) => handleDrop(e, columnId)}
                  className={`w-80 flex-shrink-0 rounded-lg ${columnStyles[columnId].border} border-2 shadow-xl bg-zinc-800`}
                >
                  <h2
                    className={`text-xl font-bold p-4 text-white ${columnStyles[columnId].header}`}
                  >
                    {columnData.name}
                    {columnData.items.length > 0 && (
                      <span className="ml-2 text-sm bg-zinc-700 text-white rounded-full px-2 py-1">
                        {columnData.items.length}
                      </span>
                    )}
                  </h2>

                  <section className="p-4 flex flex-col gap-4 min-h-64 ">
                    {columnData.items.length === 0 ? (
                      <p className="text-center text-zinc-500">No tasks</p>
                    ) : (
                      columnData.items.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(columnId, item)}
                          className="bg-zinc-700 text-white p-3 rounded-lg shadow-md cursor-move flex justify-between items-center transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                          <span>{item.content}</span>
                          <button
                            onClick={() => removeTask(columnId, item.id)}
                            className="ml-4 text-zinc-400 hover:text-red-400 transition-colors duration-200"
                          >
                            {/* &times; */}
                            <X className="text-lg" />
                          </button>
                        </div>
                      ))
                    )}
                  </section>
                </section>
              ),
            )}
          </section>
        </section>
      </section>
    </>
  );
};

export default App;
