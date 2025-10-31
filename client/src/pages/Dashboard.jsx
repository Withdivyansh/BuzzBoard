import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

// Unsplash sample images (keeps cards lively without managing uploads here)
const sampleImgUrl = (i) => `https://source.unsplash.com/random/600x400?sig=${i + 15}&event,party,celebration`;

// Tiny calendar util
function buildMonthDays(date, eventDates) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];
  for (let d = 1; d <= last.getDate(); d++) {
    const dayDate = new Date(date.getFullYear(), date.getMonth(), d);
    const key = dayDate.toDateString();
    days.push({ d, hasEvent: !!eventDates[key] });
  }
  return { monthLabel: date.toLocaleString('default', { month: 'long' }), year: date.getFullYear(), days };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [myRsvps, setMyRsvps] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Load primary lists
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
    setLoading(true);
        const [evRes, clubRes] = await Promise.all([
          api.get('/events'),
          api.get('/clubs')
        ]);
        if (!mounted) return;
        setEvents(evRes.data || []);
        setClubs(clubRes.data || []);

        // Auth-protected calls
        if (user) {
          try {
            const [{ data: rsvps }] = await Promise.all([
              api.get('/rsvp')
            ]);
            if (mounted) setMyRsvps(rsvps || []);
          } catch {}
        }

        // Admin-only datasets
        if (user?.role === 'admin') {
          try {
            const { data: owned } = await api.get('/clubs');
            const myClubs = (owned || []).filter(c => c.owner === user._id);
            const reqs = [];
            for (const c of myClubs) {
              try {
                const { data } = await api.get(`/clubs/${c._id}/join-requests`);
                data.filter(r => r.status === 'pending').forEach(r => reqs.push({ ...r, clubName: c.name, clubId: c._id }));
              } catch {}
            }
            setJoinRequests(reqs);
          } catch {}

          try {
            const { data } = await api.get('/volunteers');
            setVolunteers(data || []);
          } catch {}
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const eventDatesMap = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const d = new Date(e.startAt);
      map[new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString()] = true;
    });
    return map;
  }, [events]);

  const monthData = useMemo(() => buildMonthDays(new Date(), eventDatesMap), [eventDatesMap]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events.slice(0, 6);
    return events.filter(e => `${e.title} ${e.description || ''} ${e.location?.city || ''}`.toLowerCase().includes(q)).slice(0, 6);
  }, [events, search]);

  const stats = useMemo(() => ({
    totalEvents: events.length,
    totalClubs: clubs.length,
    myRsvps: myRsvps.length,
    volunteers: volunteers.length
  }), [events.length, clubs.length, myRsvps.length, volunteers.length]);

  return (
    <div className="min-h-screen w-full bg-[#F2F5FF] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl font-extrabold text-indigo-700">Dashboard</div>
        <div className="ml-auto flex items-center gap-3 w-full max-w-xl">
          <div className="flex-1 relative">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events, clubs..." className="w-full bg-white rounded-full pl-12 pr-4 py-2 shadow border border-indigo-50"/>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
      </div>
          {user?.role === 'admin' && (
            <Link to="/admin" className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700">Add New</Link>
          )}
        </div>
      </div>

      {/* Main three-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_minmax(0,2fr)_1fr] gap-6">
        {/* Left sidebar-like nav */}
        <div className="hidden xl:flex flex-col gap-2 bg-white rounded-2xl p-4 shadow-sm">
          <div className="font-semibold text-gray-700 mb-2">Menu</div>
          <Link className="px-3 py-2 rounded-lg hover:bg-indigo-50 text-gray-700" to="/dashboard">Dashboard</Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-indigo-50 text-gray-700" to="/clubs">Clubs</Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-indigo-50 text-gray-700" to="/profile">Profile</Link>
          {user?.role === 'admin' && <Link className="px-3 py-2 rounded-lg hover:bg-indigo-50 text-gray-700" to="/admin">Admin</Link>}
        </div>

        {/* Center content */}
        <div className="flex flex-col gap-6">
          {/* Greeting Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow relative overflow-hidden">
            <div className="text-sm opacity-90">Good Morning{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</div>
            <div className="text-2xl sm:text-3xl font-bold mt-1">Welcome back to BuzzBoard</div>
            <div className="opacity-90 mt-1">You have {stats.totalEvents} events to explore today.</div>
            <div className="mt-4 flex gap-3">
              <Link to="/clubs" className="bg-white text-indigo-700 px-4 py-2 rounded-xl shadow font-semibold">Browse Clubs</Link>
              {user?.role === 'admin' && <Link to="/admin" className="bg-indigo-900/20 backdrop-blur px-4 py-2 rounded-xl shadow border border-white/30 text-white">Create Event</Link>}
            </div>
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full"/>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Events" value={stats.totalEvents} color="indigo"/>
            <StatCard label="Clubs" value={stats.totalClubs} color="cyan"/>
            <StatCard label="My RSVPs" value={stats.myRsvps} color="violet"/>
            <StatCard label="Volunteers" value={stats.volunteers} color="blue"/>
          </div>

          {/* Events table-like list */}
          <div className="bg-white rounded-2xl shadow-sm p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="font-semibold text-gray-800">Upcoming Events</div>
              <Link to="/clubs" className="text-indigo-600 text-sm">View all</Link>
            </div>
            {loading ? (
              <div className="px-5 py-10 text-center text-gray-500">Loading...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400">No matching events.</div>
            ) : (
              <div className="divide-y">
                {filteredEvents.map((e, i) => (
                  <Link key={e._id} to={`/events/${e._id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-indigo-50/40">
                    <img src={sampleImgUrl(i)} alt="event" className="w-16 h-12 rounded-lg object-cover"/>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-800 truncate">{e.title}</div>
                      <div className="text-xs text-gray-500 truncate">{e.location?.city}, {e.location?.state} • {new Date(e.startAt).toLocaleString()}</div>
                </div>
                    <div className="text-xs text-gray-500 hidden sm:block">{e.club?.name || 'Club'}</div>
                    <span className="ml-auto text-indigo-600 text-sm">View</span>
              </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Mini Calendar */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{monthData.monthLabel} {monthData.year}</div>
              <div className="text-gray-400 text-sm">Today: {new Date().getDate()}</div>
            </div>
            <div className="grid grid-cols-7 gap-2 mt-3 text-center text-xs text-gray-500">
              {['S','M','T','W','T','F','S'].map(d=> <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
              {monthData.days.map(day => (
                <div key={day.d} className={`h-9 rounded-md text-sm flex items-center justify-center ${day.hasEvent ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' : 'text-gray-700'}`}>{day.d}</div>
              ))}
            </div>
          </div>

          {/* New Applicants (admin) */}
          {user?.role === 'admin' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="px-4 py-3 border-b font-semibold">New Applicants</div>
              <div className="max-h-72 overflow-auto">
                {joinRequests.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">No new join requests</div>
                ) : joinRequests.map(r => (
                  <div key={r._id} className="px-4 py-3 border-b last:border-0">
                    <div className="text-sm"><b>{r.user?.name || 'User'}</b> → {r.clubName}</div>
                    <div className="text-xs text-gray-500">Requested on {new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ready For Training (volunteers) */}
          {user?.role === 'admin' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="px-4 py-3 border-b font-semibold">Volunteer Applicants</div>
              <div className="max-h-72 overflow-auto">
                {volunteers.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">No volunteers yet</div>
                ) : volunteers.slice(0, 6).map(v => (
                  <div key={v._id} className="px-4 py-3 border-b last:border-0">
                    <div className="text-sm font-medium">{v.user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{v.status}</div>
            </div>
          ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600',
    cyan: 'from-cyan-500 to-cyan-600',
    violet: 'from-violet-500 to-violet-600',
    blue: 'from-blue-500 to-blue-600'
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.indigo} text-white flex items-center justify-center font-bold`}>{value}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );
}


