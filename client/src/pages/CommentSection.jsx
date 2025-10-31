import { useEffect, useState } from 'react';
import api from '../api';
import { getUser } from '../auth';

// Helper for avatars
const avatar = (name) => `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name || 'BB')}`;

export default function CommentSection({ eventId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const user = getUser();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/comments', { params: { eventId } });
      setComments(data);
    } catch (e) { setErr('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [eventId]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setErr('');
    try {
      await api.post('/comments', { eventId, content: text });
      setText('');
      load();
    } catch (e) {
      setErr('Failed to post');
    }
    setSending(false);
  };

  const del = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      load();
    } catch {}
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h3 className="text-xl text-purple-700 font-bold mb-4">Event Chat</h3>
      {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
      {loading ? (
        <div className="text-gray-400 animate-pulse">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-400 mb-4">No messages yet. Start the conversation!</div>
      ) : (
        <div className="space-y-3 mb-5">
          {comments.map(c => (
            <div key={c._id||c.createdAt+''} className="flex items-start gap-3 group">
              <img src={avatar(c.user?.name)} alt="avatar" className="w-8 h-8 rounded-full mt-1"/>
              <div className="flex-1">
                <b className="text-purple-800 ">{c.user?.name || 'User'}</b>{' '}
                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                <div className="bg-purple-50 p-3 rounded-xl mt-1 shadow-sm whitespace-pre-line">{c.content}</div>
              </div>
              {(user && (user.id === (c.user?._id||c.user) || user.role === 'admin')) && (
                <button onClick={()=>del(c._id)} className="text-red-400 hover:text-red-700 text-xs ml-1 opacity-0 group-hover:opacity-100 transition">Delete</button>
              )}
            </div>
          ))}
        </div>
      )}
      {user && (
        <form onSubmit={send} className="flex items-center gap-2 py-1">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 border border-purple-200 rounded-full px-4 py-2 focus:outline-purple-400"
            placeholder="Write a message..."
            maxLength={500}
            disabled={sending}
          />
          <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded-full font-bold hover:bg-purple-600 disabled:opacity-40 transition" disabled={sending||!text.trim()}>
            Send
          </button>
        </form>
      )}
    </div>
  );
}

