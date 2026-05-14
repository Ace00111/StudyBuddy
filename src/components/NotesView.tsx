"use client";

import { Search, Plus, FileText, Clock, X, Edit3, Trash2, Tag, Palette } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useUploadBlobs } from "@shelby-protocol/react";


const COLORS = [
  { id: 'blue', bg: 'bg-blue-500', border: 'border-blue-500', dark: 'bg-blue-500/10', text: 'text-blue-400' },
  { id: 'purple', bg: 'bg-purple-500', border: 'border-purple-500', dark: 'bg-purple-500/10', text: 'text-purple-400' },
  { id: 'pink', bg: 'bg-pink-500', border: 'border-pink-500', dark: 'bg-pink-500/10', text: 'text-pink-400' },
  { id: 'green', bg: 'bg-green-500', border: 'border-green-500', dark: 'bg-green-500/10', text: 'text-green-400' },
  { id: 'amber', bg: 'bg-amber-500', border: 'border-amber-500', dark: 'bg-amber-500/10', text: 'text-amber-400' },
];


const PRESET_TAGS = ['Physics', 'Math', 'Chemistry', 'Biology', 'History', 'Exams', 'Lectures', 'Assignments'];

interface NotesViewProps {
  sharedNotes: any[];
  setSharedNotes: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function NotesView({ sharedNotes, setSharedNotes }: NotesViewProps) {
  const { account, wallet, signAndSubmitTransaction } = useWallet();
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedColor, setSelectedColor] = useState('blue');
  const [newTag, setNewTag] = useState("");
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const uploadBlobs = useUploadBlobs({
    onSuccess: () => {
      console.log("[Shelby] Note synced successfully");
    },
    onError: (error) => {
      console.error("[Shelby] Note sync failed:", error);
    }
  });

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your wallet to create notes.");
      return;
    }
    if (!newTitle || !newContent) return;

    const noteId = editingNote ? editingNote.id : Date.now();
    const noteData = {
      title: newTitle,
      content: newContent,
      excerpt: newContent.slice(0, 80) + (newContent.length > 80 ? "..." : ""),
      color: selectedColor,
      tags: currentTags,
      date: editingNote ? editingNote.date : "Just now",
      id: noteId
    };

    // Sync to Shelby Protocol
    try {
      const blobData = new TextEncoder().encode(JSON.stringify(noteData));
      const expirationMicros = (Date.now() + 365 * 24 * 60 * 60 * 1000) * 1000;

      uploadBlobs.mutate({
        signer: wallet as any, // WalletAdapterSigner

        blobs: [
          {
            blobName: `notes/${account.address}/${noteId}.json`,
            blobData,
          }
        ],
        expirationMicros,
      });

      if (editingNote) {
        setSharedNotes(sharedNotes.map(n => n.id === noteId ? noteData : n));
        setEditingNote(null);
      } else {
        setSharedNotes([noteData, ...sharedNotes]);
      }
      resetForm();
    } catch (error) {
      console.error("Sync preparation failed:", error);
      // Still save locally if sync fails
      if (editingNote) {
        setSharedNotes(sharedNotes.map(n => n.id === noteId ? noteData : n));
        setEditingNote(null);
      } else {
        setSharedNotes([noteData, ...sharedNotes]);
      }
      resetForm();
    }
  };


  const resetForm = () => {
    setNewTitle("");
    setNewContent("");
    setSelectedColor('blue');
    setCurrentTags([]);
    setIsAdding(false);
    setEditingNote(null);
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setNewTitle(note.title);
    setNewContent(note.content);
    setSelectedColor(note.color || 'blue');
    setCurrentTags(note.tags || []);
    setIsAdding(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this study note?")) {
      setSharedNotes(sharedNotes.filter(n => n.id !== id));
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!currentTags.includes(newTag.trim())) {
        setCurrentTags([...currentTags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const togglePresetTag = (tag: string) => {
    if (currentTags.includes(tag)) {
      setCurrentTags(currentTags.filter(t => t !== tag));
    } else {
      setCurrentTags([...currentTags, tag]);
    }
  };

  const filteredNotes = sharedNotes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-white">
      <div className="px-4 md:px-8 pt-8 pb-4 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-1">Study Notes</h1>
            <p className="text-muted text-sm font-medium">Create and organize your personal study guides.</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => {
                if (!account) {
                  alert("Please connect your wallet to create notes.");
                  return;
                }
                setIsAdding(true);
              }}
              disabled={!account}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          )}
        </div>

        {isAdding && (
          <div className="mb-10 p-8 bg-card border border-slate-800 rounded-[40px] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black text-xl tracking-tight">{editingNote ? "Edit Note" : "Create New Note"}</h2>
              <button 
                onClick={resetForm} 
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

            </div>
            
            <form onSubmit={handleAddNote} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <input 
                      type="text" 
                      placeholder="Note Title" 
                      className="w-full px-6 py-4 bg-slate-900 rounded-2xl border border-slate-800 focus:border-primary text-sm font-bold outline-none transition-all text-white"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />

                    
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted">Color Theme</label>
                       <div className="flex gap-3">
                          {COLORS.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedColor(c.id)}
                              className={`w-8 h-8 rounded-full ${c.bg} ${selectedColor === c.id ? 'ring-4 ring-primary/20 scale-110' : 'opacity-60'} transition-all`}
                            />
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted">Quick Tags</label>
                       <div className="flex flex-wrap gap-2">
                          {PRESET_TAGS.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => togglePresetTag(tag)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${currentTags.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-primary/30'}`}
                            >
                               {tag}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted">Custom Tags (Enter)</label>
                       <div className="relative">
                          <Tag className="w-3 h-3 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                          <input 
                            type="text" 
                            placeholder="Add custom tag..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-900 rounded-2xl border border-slate-800 focus:border-primary text-xs font-bold outline-none transition-all text-white"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={addTag}
                          />
                       </div>
                    </div>
                 </div>

                 <textarea 
                  placeholder="Start typing your study note..." 
                  className="w-full px-6 py-5 bg-slate-900 rounded-[32px] border border-slate-800 focus:border-primary text-sm font-medium outline-none min-h-[250px] resize-none text-white"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />

              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="px-10 py-4 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-xl shadow-primary/20">
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-10 relative group">
          <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search through your study notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card border border-slate-800 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const color = COLORS.find(c => c.id === note.color) || COLORS[0];
            return (
              <div 
                key={note.id} 
                className={`group p-6 bg-card border border-slate-800 rounded-[40px] hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${color.bg} opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000`} />
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-2.5 rounded-2xl ${color.dark} ${color.text}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(note); }}
                      className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                <h3 className="font-black text-xl tracking-tight text-foreground mb-3 truncate">
                  {note.title}
                </h3>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {note.tags?.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-800 rounded-md text-[8px] font-black uppercase text-slate-400 tracking-widest border border-slate-700">
                       {tag}
                    </span>
                  ))}

                </div>

                <p className="text-xs text-muted font-medium line-clamp-3 mb-6 leading-relaxed">
                  {note.excerpt}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-border/50">
                  <div className="flex items-center gap-2 text-[9px] text-muted font-black uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {note.date}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${color.bg} shadow-lg shadow-current`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
