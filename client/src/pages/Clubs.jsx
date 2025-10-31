import { useEffect, useMemo, useState } from 'react';
import api from '../api';
// Helper to get a pseudo-random avatar (e.g. dicebear)
const avatar = (txt) => `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(txt || 'BuzzBoard')}`;
import { useAuth } from '../contexts/AuthContext';

export default function Clubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [myRequests, setMyRequests] = useState({});
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/clubs');
    setClubs(data);
    if (user) {
      const map = {};
      for (const club of data) {
        // Defensive: always compare as string
        const userId = String(user._id);
        // Robustly check members array
        const isMember = (club.members || []).some(m => String(m._id || m) === userId);
        // Robustly check for pending join request
        let joinReqId = null;
        let isRequest = false;
        if (Array.isArray(club.joinRequests)) {
          for (const r of club.joinRequests) {
            const ru = r.user && (typeof r.user === 'object' ? r.user._id : r.user);
            if (String(ru) === userId && r.status === 'pending') {
              isRequest = true;
              joinReqId = r._id;
              break;
            }
          }
        }
        map[club._id] = { isMember, isRequest, joinReqId };
      }
      setMyRequests(map);
    } else {
      setMyRequests({});
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filteredClubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter(c => `${c.name} ${c.description || ''}`.toLowerCase().includes(q));
  }, [clubs, search]);

  const createClub = async (e) => {
    e.preventDefault();
    await api.post('/clubs', { name, description });
    setName(''); setDescription(''); load();
  };
  const join = async (id) => { await api.post(`/clubs/${id}/join`); load(); };
  // Optional: cancel join request (needs DELETE endpoint or PATCH on backend)
  const cancelJoin = async (clubId, joinReqId) => {
    await api.patch(`/clubs/${clubId}/join-requests/${joinReqId}`, { status: 'rejected' });
    load();
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F5FF] p-6 flex flex-col gap-6">
      {/* Header with search */}
      <div className="flex items-center gap-3">
        <div className="text-2xl font-extrabold text-indigo-700">Clubs</div>
        <div className="ml-auto w-full max-w-xl relative">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search clubs..." className="w-full bg-white rounded-full pl-10 pr-4 py-2 shadow border border-indigo-50"/>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
        </div>
      </div>

      {user?.role === 'admin' && (
        <form 
          className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-[2fr_3fr_auto] gap-3 items-center"
          onSubmit={createClub}
        >
          <input required placeholder="Club name" value={name} onChange={e=>setName(e.target.value)}
            className="rounded-xl border border-indigo-200 px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)}
            className="rounded-xl border border-indigo-200 px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button 
            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
          >Create</button>
        </form>
      )}

      {loading ? (
        <div className="text-center text-gray-500 animate-pulse mt-12">Loading clubs...</div>
      ) : filteredClubs.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">No clubs found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto">
          {filteredClubs.map((c) => {
            const info = myRequests[c._id] || {};
            const isMember = info.isMember;
            const isRequest = info.isRequest;
            return (
            <div key={c._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 flex flex-col">
              <div className="flex items-center gap-4">
                <img src={avatar(c.name)} alt="avatar" className="w-14 h-14 rounded-full border border-indigo-100" loading="lazy" />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 truncate">{c.name}</div>
                  <div className="text-sm text-gray-500 line-clamp-2">{c.description || '—'}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                {!user ? null : isMember ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Joined</span>
                ) : isRequest ? (
                  <button
                    className="px-4 py-1.5 rounded-full bg-gray-500 text-white text-xs font-semibold shadow"
                    onClick={() => cancelJoin(c._id, info.joinReqId)}
                  >Cancel Request</button>
                ) : (
                  <button
                    className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700"
                    onClick={() => join(c._id)}
                  >Join</button>
                )}
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}


