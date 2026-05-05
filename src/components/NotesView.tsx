"use client";

import { Search, Plus, FileText, Clock, X, Edit3 } from "lucide-react";
import { useState } from "react";

export default function NotesView() {
  const [notes, setNotes] = useState([
    { id: 1, title: "Quantum Physics Summary", excerpt: "The main principles of quantum mechanics include...", content: "The main principles of quantum mechanics include superposition, entanglement, and the uncertainty principle. It describes the physical properties of nature at the scale of atoms and subatomic particles.", date: "2 hours ago" },
    { id: 2, title: "Math Formulas - Week 4", excerpt: "Derivatives of trigonometric functions: sin(x) -> cos(x)...", content: "Derivatives of trigonometric functions: sin(x) -> cos(x), cos(x) -> -sin(x), tan(x) -> sec^2(x). Integration formulas are also essential for this week's exam.", date: "Yesterday" },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? {
        ...n,
        title: newTitle,
        content: newContent,
        excerpt: newContent.slice(0, 100) + (newContent.length > 100 ? "..." : ""),
      } : n));
      setEditingNote(null);
    } else {
      const newNote = {
        id: Date.now(),
        title: newTitle,
        content: newContent,
        excerpt: newContent.slice(0, 100) + (newContent.length > 100 ? "..." : ""),
        date: "Just now"
      };
      setNotes([newNote, ...notes]);
    }

    setNewTitle("");
    setNewContent("");
    setIsAdding(false);
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setNewTitle(note.title);
    setNewContent(note.content);
    setIsAdding(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background transition-colors">
      <div className="px-4 md:px-8 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Notes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Create and organize your study notes.</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8">
        {isAdding && (
          <div className="mb-8 p-6 bg-card border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{editingNote ? "Edit Note" : "Create New Note"}</h2>
              <button 
                onClick={() => { setIsAdding(false); setEditingNote(null); setNewTitle(""); setNewContent(""); }} 
                className="text-slate-400 hover:text-slate-600"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-4">
              <input 
                type="text" 
                placeholder="Note Title" 
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea 
                placeholder="Start typing your note..." 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                 <button 
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingNote(null); setNewTitle(""); setNewContent(""); }} 
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all">
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search notes..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="group p-5 bg-card border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md relative">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(note); }}
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                    title="Edit Note"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete Note"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {note.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                {note.excerpt}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium pt-3 border-t border-slate-50 dark:border-slate-800">
                <Clock className="w-3.5 h-3.5" />
                {note.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

