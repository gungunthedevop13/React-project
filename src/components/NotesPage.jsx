import React, { useState, useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import "quill/modules/clipboard";
import "quill/modules/syntax";
import { FaTrash, FaEdit } from "react-icons/fa";
import "../components/NotesPage.css";

const NotesPage = () => {
  const editorRef = useRef(null);
  const quillInstanceRef = useRef(null);

  const [notebooks, setNotebooks] = useState(() => {
    const saved = localStorage.getItem("notebooks");
    return saved ? JSON.parse(saved) : { "My Notebook": { General: [] } };
  });

  const [selectedNotebook, setSelectedNotebook] = useState("My Notebook");
  const [selectedSection, setSelectedSection] = useState("General");
  const currentNotes = notebooks[selectedNotebook]?.[selectedSection] || [];

  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const [stickyNotes, setStickyNotes] = useState(() => {
    const saved = localStorage.getItem("stickyNotes");
    return saved ? JSON.parse(saved) : [];
  });
  const stickyPanelRef = useRef(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panelSize, setPanelSize] = useState({ width: 300 });
  const [resizing, setResizing] = useState(false);

  const addStickyNote = () => {
    const newNote = { id: Date.now(), content: "", color: "#fffae6" };
    const updatedNotes = [...stickyNotes, newNote];
    setStickyNotes(updatedNotes);
    localStorage.setItem("stickyNotes", JSON.stringify(updatedNotes));
  };

  const handleStickyNoteChange = (id, content) => {
    const updatedNotes = stickyNotes.map((note) =>
      note.id === id ? { ...note, content } : note
    );
    setStickyNotes(updatedNotes);
    localStorage.setItem("stickyNotes", JSON.stringify(updatedNotes));
  };

  const deleteStickyNote = (id) => {
    const updatedNotes = stickyNotes.filter((note) => note.id !== id);
    setStickyNotes(updatedNotes);
    localStorage.setItem("stickyNotes", JSON.stringify(updatedNotes));
  };

  const handleDragStart = (e) => {
    setDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
    if (resizing) {
      setPanelSize((prev) => ({
        ...prev,
        width: Math.max(200, e.clientX - position.x),
      }));
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  const handleResizeStart = () => setResizing(true);
  const Font = Quill.import("formats/font");
Font.whitelist = ["sans", "serif", "monospace", "roboto", "georgia", "arial", "tahoma", "verdana"];
Quill.register(Font, true);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, resizing, dragOffset, position]);

  const [selectedNote, setSelectedNote] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const getTagColor = (tag) => {
    const hash = [...tag].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 70%)`;
  };

  useEffect(() => {
  if (editorRef.current && !quillInstanceRef.current) {
    quillInstanceRef.current = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Write your notes here...",
      modules: {
        toolbar: [
  [
    {
      font: [
        "sans",
        "serif",
        "monospace",
        "roboto",
        "georgia",
        "arial",
        "tahoma",
        "verdana"
      ]
    },
    { size: ["small", false, "large", "huge"] },
  ],
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  ["code-block"],
  ["link", "image"],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["clean"],
]

        
      },
    });
  }
}, []);


  const handlePrintNote = () => {
    const content = quillInstanceRef.current?.root.innerHTML;
    if (!content) return alert("No note to export!");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Exported Note</title>
          <style>
            body {
              font-family: 'Segoe UI', sans-serif;
              padding: 40px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              text-align: center;
              font-size: 24px;
            }
          </style>
        </head>
        <body>
          <h1>${selectedNote?.title || "Untitled Note"}</h1>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const saveNote = () => {
    const content = quillInstanceRef.current?.root.innerHTML || "";
    if (!content) return alert("Cannot save empty note.");

    let title = selectedNote?.title;
    if (!title || editingIndex === null) {
      title = prompt("Enter note title:");
      if (!title) return;
    }

    const noteData = {
      id: selectedNote?.id || Date.now(),
      title,
      content,
      tags,
    };

    const updatedNotebooks = { ...notebooks };
    const sectionNotes = updatedNotebooks[selectedNotebook][selectedSection];

    if (editingIndex !== null) {
      sectionNotes[editingIndex] = noteData;
    } else {
      sectionNotes.push(noteData);
    }

    setNotebooks(updatedNotebooks);
    localStorage.setItem("notebooks", JSON.stringify(updatedNotebooks));

    setSelectedNote(null);
    setEditingIndex(null);
    setTags([]);
    quillInstanceRef.current.setContents([]);
  };

  const deleteNote = (index) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    setNotebooks((prevBooks) => {
      const updatedBooks = { ...prevBooks };
      const notesArray = updatedBooks[selectedNotebook]?.[selectedSection];
      if (!notesArray) return prevBooks;

      notesArray.splice(index, 1);
      localStorage.setItem("notebooks", JSON.stringify(updatedBooks));
      return updatedBooks;
    });

    if (editingIndex === index) {
      setSelectedNote(null);
      setEditingIndex(null);
      quillInstanceRef.current?.setContents([]);
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      const tagLabel = tagInput.trim();
      if (!tags.find((t) => t.label === tagLabel)) {
        const color = getTagColor(tagLabel);
        setTags([...tags, { label: tagLabel, color }]);
      }
      setTagInput("");
    }
  };

  const filteredNotes = currentNotes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectNote = (note) => {
    const index = currentNotes.findIndex((n) => n.id === note.id);
    setSelectedNote(note);
    setEditingIndex(index);
    setTags(note.tags || []);

    if (quillInstanceRef.current) {
      quillInstanceRef.current.root.innerHTML = note.content;
    }
  };

  return (
    <div className="notes-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>📝 Notes</h2>
          <div className="notebook-selectors">
            <select
              value={selectedNotebook}
              onChange={(e) => {
                const newNotebook = e.target.value;
                setSelectedNotebook(newNotebook);
                const sections = Object.keys(notebooks[newNotebook] || {});
                setSelectedSection(sections[0] || "General");
              }}
            >
              {Object.keys(notebooks).map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {Object.keys(notebooks[selectedNotebook] || {}).map((section, idx) => (
                <option key={idx} value={section}>{section}</option>
              ))}
            </select>
          </div>

          <div className="notebook-buttons">
            <button
              onClick={() => {
                const name = prompt("Enter new notebook name:");
                if (name && !notebooks[name]) {
                  const updated = { ...notebooks, [name]: { General: [] } };
                  setNotebooks(updated);
                  localStorage.setItem("notebooks", JSON.stringify(updated));
                  setSelectedNotebook(name);
                  setSelectedSection("General");
                } else if (notebooks[name]) {
                  alert("Notebook already exists.");
                }
              }}
            >
              ➕ New Notebook
            </button>

            <button
              onClick={() => {
                const section = prompt("Enter new section name:");
                if (
                  section &&
                  notebooks[selectedNotebook] &&
                  !notebooks[selectedNotebook][section]
                ) {
                  const updated = {
                    ...notebooks,
                    [selectedNotebook]: {
                      ...notebooks[selectedNotebook],
                      [section]: [],
                    },
                  };
                  setNotebooks(updated);
                  localStorage.setItem("notebooks", JSON.stringify(updated));
                  setSelectedSection(section);
                } else if (
                  notebooks[selectedNotebook] &&
                  notebooks[selectedNotebook][section]
                ) {
                  alert("Section already exists.");
                }
              }}
            >
              ➕ New Section
            </button>
          </div>

          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="notes-list">
          {filteredNotes.map((note) => {
            const actualIndex = currentNotes.findIndex((n) => n.id === note.id);
            return (
              <div
                key={note.id}
                className="note-preview"
                onClick={() => handleSelectNote(note)}
              >
                <h4>{note.title}</h4>
                <div className="note-tags">
                  {note.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="tag-badge"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <div className="note-actions">
                  <FaEdit onClick={(e) => {
                    e.stopPropagation();
                    handleSelectNote(note);
                  }} />
                  <FaTrash onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(actualIndex);
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="main-editor">
        <div className="editor-toolbar">
          <div className="editor-toolbar-actions">
            <form onSubmit={addTag} className="tag-form-inline">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
              />
              <button type="submit">Add</button>
            </form>
            <button onClick={saveNote}>
              💾 {editingIndex !== null ? "Update" : "Save"}
            </button>
            <button onClick={handlePrintNote}>📄 Export</button>
            <button
              onClick={() => setShowStickyNotes(!showStickyNotes)}
              className="sticky-toggle-button"
            >
              StickyNote
            </button>
          </div>

          <div className="tag-display">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="tag-badge"
                style={{ backgroundColor: tag.color }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        <div className="quill-editor" ref={editorRef} />
      </div>

      {showStickyNotes && (
        <div
          className="sticky-panel"
          ref={stickyPanelRef}
          style={{ top: position.y, left: position.x, width: panelSize.width }}
        >
          <div className="sticky-panel-header" onMouseDown={handleDragStart}>
            <span>Sticky Notes</span>
            <button onClick={() => setShowStickyNotes(false)}>✖</button>
          </div>
          <div className="sticky-panel-content">
            {stickyNotes.map((note) => (
              <div key={note.id} className="sticky-note" style={{ backgroundColor: note.color }}>
                <div
                  className="sticky-note-body"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => handleStickyNoteChange(note.id, e.currentTarget.innerHTML)}
                  ref={(el) => {
                    if (el && !el.innerHTML) el.innerHTML = note.content;
                  }}
                ></div>
                <button onClick={() => deleteStickyNote(note.id)}>❌</button>
              </div>
            ))}
          </div>
<button className="add-sticky-button" onClick={addStickyNote}>
  ➕ Add Sticky
</button>
          <div className="resize-handle" onMouseDown={handleResizeStart}></div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
