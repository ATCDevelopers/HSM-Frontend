import { useState, useEffect } from "react";
import BaseLayout from "../../components/layouts/BaseLayout";
import Button from "../../components/atoms/ui/Button";
import Input from "../../components/atoms/forms/Input";
import { readUsers } from "./usersStorage";

interface Note { id: string; userId: string; text: string; createdAt: string }
const storageKey = 'hms_user_notes';
function readNotes(): Note[] { try { const raw = localStorage.getItem(storageKey); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function writeNotes(notes: Note[]) { localStorage.setItem(storageKey, JSON.stringify(notes)); }

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string>("");
  const users = readUsers();

  useEffect(() => { setNotes(readNotes()); if (users.length) setUserId(users[0].id); }, []);

  function addNote() {
    if (!text.trim()) return;
    const n: Note = { id: `N-${Date.now()}`, userId: userId || (users[0] && users[0].id) || '', text: text.trim(), createdAt: new Date().toISOString() };
    const next = [n, ...notes];
    writeNotes(next); setNotes(next); setText('');
  }

  function removeNote(id: string) {
    if (!confirm('Delete note?')) return;
    const next = notes.filter(n => n.id !== id); writeNotes(next); setNotes(next);
  }

  return (
    <BaseLayout resourceName="User Notes">
      <div className="rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-lg font-bold text-gray-900">Notes</h1>
            <p className="mt-0.5 mb-4 text-sm text-gray-500">Create and view user-specific notes and audit comments.</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
              <label className="text-sm font-medium text-gray-700 md:col-span-2">User
                <select value={userId} onChange={(e) => setUserId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} — {u.role}</option>)}
                </select>
              </label>
              <div className="md:col-span-3">
                <Input label="New note" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a note for selected user..." />
                <div className="flex justify-end mt-3"><Button onClick={addNote}>Add note</Button></div>
              </div>
            </div>

            <div className="space-y-3">
              {notes.length ? notes.map(n => (
                <div key={n.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{(users.find(u => u.id === n.userId)?.firstName) || 'User'}</div>
                      <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-red-600 cursor-pointer" onClick={() => removeNote(n.id)}>Delete</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{n.text}</div>
                </div>
              )) : <div className="text-sm text-gray-400">No notes yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
