import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    clubId: '',
    startAt: '',
    address: '',
    city: '',
    state: '',
    lat: '',
    lng: '',
    imageUrl: ''
  });
  const [clubs, setClubs] = useState([]);
  const [membersMap, setMembersMap] = useState({});
  const [selectedClub, setSelectedClub] = useState('');
  const [showTab, setShowTab] = useState('overview');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const [e, c] = await Promise.all([api.get('/events'), api.get('/clubs?owner=me')]);
      setEvents(e.data);
      setClubs(c.data);
      if (c.data.length > 0) {
        setSelectedClub(c.data[0]._id);
        for (const club of c.data) {
          try {
            const m = await api.get(`/clubs/${club._id}/members`);
            setMembersMap((prev) => ({ ...prev, [club._id]: m.data }));
          } catch {}
        }
      }

      // Admin-only: join requests and volunteers
      if (user?.role === 'admin') {
        try {
          const owned = (c.data || []).filter((cl) => cl.owner === user._id);
          const reqs = [];
          for (const cl of owned) {
            try {
              const { data } = await api.get(`/clubs/${cl._id}/join-requests`);
              data.filter(r => r.status === 'pending').forEach(r => reqs.push({ ...r, clubName: cl.name, clubId: cl._id }));
            } catch {}
          }
          setJoinRequests(reqs);
        } catch {}
        try {
          const { data } = await api.get('/volunteers');
          setVolunteers(data || []);
        } catch {}
      }
    };
    load();
    // refresh periodically to keep panels fresh
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [user]);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    const coords =
      form.lat && form.lng
        ? [parseFloat(form.lng), parseFloat(form.lat)]
        : [0, 0];
    const payload = {
      ...form,
      startAt: new Date(form.startAt).toISOString(),
      location: {
        type: 'Point',
        coordinates: coords,
        address: form.address,
        city: form.city,
        state: form.state,
      },
    };
    try {
      const { data } = await api.post('/events', payload);
      setEvents([data, ...events]);
      setForm({
        title: '',
        description: '',
        clubId: '',
        startAt: '',
        address: '',
        city: '',
        state: '',
        lat: '',
        lng: '',
      });
      setMsg('Event created!');
      setTimeout(() => setMsg(''), 1400);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to create event. Make sure all fields are filled.'
      );
    }
  };

  const remove = async (id) => {
    await api.delete(`/events/${id}`);
    setEvents(events.filter((e) => e._id !== id));
    setMsg('Event deleted.');
    setTimeout(() => setMsg(''), 1400);
  };

  async function handleJoinRequest(clubId, reqId, decision) {
    await api.patch(`/clubs/${clubId}/join-requests/${reqId}`, { status: decision });
    setJoinRequests(joinRequests.filter(r => r._id !== reqId));
  }

  async function updateVolunteerStatus(id, status) {
    await api.patch(`/volunteers/${id}`, { status });
    setVolunteers(v => v.map(x => x._id === id ? { ...x, status } : x));
  }

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter(e => `${e.title} ${e.description || ''}`.toLowerCase().includes(q));
  }, [events, search]);

  return (
    <div className="min-h-screen flex bg-[#F2F5FF]">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 shadow-xl p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-10">
            Admin Panel
          </h2>
          <nav className="flex flex-col gap-3">
            <button
              className={`text-left px-4 py-2 rounded-lg font-semibold transition text-white ${
                showTab === 'overview' ? 'bg-indigo-600' : 'bg-transparent hover:bg-indigo-600/40'
              }`}
              onClick={() => setShowTab('overview')}
            >
              🏠 Overview
            </button>
            <button
              className={`text-left px-4 py-2 rounded-lg font-semibold transition text-white ${
                showTab === 'events' ? 'bg-indigo-600' : 'bg-transparent hover:bg-indigo-600/40'
              }`}
              onClick={() => setShowTab('events')}
            >
              📅 Events
            </button>
            <button
              className={`text-left px-4 py-2 rounded-lg font-semibold transition text-white ${
                showTab === 'members' ? 'bg-indigo-600' : 'bg-transparent hover:bg-indigo-600/40'
              }`}
              onClick={() => setShowTab('members')}
            >
              👥 Members
            </button>
            <button
              className={`text-left px-4 py-2 rounded-lg font-semibold transition text-white ${
                showTab === 'volunteers' ? 'bg-indigo-600' : 'bg-transparent hover:bg-indigo-600/40'
              }`}
              onClick={() => setShowTab('volunteers')}
            >
              🤝 Volunteers
            </button>
            <button
              className={`text-left px-4 py-2 rounded-lg font-semibold transition text-white ${
                showTab === 'requests' ? 'bg-indigo-600' : 'bg-transparent hover:bg-indigo-600/40'
              }`}
              onClick={() => setShowTab('requests')}
            >
              📨 Join Requests
            </button>
          </nav>
        </div>

        <div className="border-t border-white/20 pt-4 mt-6 text-sm text-white/90">
          <p className="font-medium">{user?.name || 'Admin'}</p>
          <p className="text-xs text-white/70">{user?.email}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">{showTab === 'overview' ? 'Overview' : showTab === 'events' ? 'Manage Events' : showTab === 'members' ? 'Club Members' : showTab === 'volunteers' ? 'Volunteers' : 'Join Requests'}</h1>
          <div className="ml-auto w-full max-w-sm relative">
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search events" className="w-full bg-white rounded-full pl-10 pr-4 py-2 shadow border border-indigo-50"/>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
          </div>
        </div>

        {showTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="flex flex-col gap-6">
              {/* Greeting banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow">
                <div className="text-sm opacity-90">Hello {user?.name?.split(' ')[0] || 'Admin'}</div>
                <div className="text-2xl font-bold mt-1">Let’s manage your community</div>
                <div className="opacity-90 mt-1">You have {joinRequests.length} pending requests and {events.length} events.</div>
                <div className="mt-4 flex gap-3">
                  <button onClick={()=>setShowTab('events')} className="bg-white text-indigo-700 px-4 py-2 rounded-xl shadow font-semibold">Create Event</button>
                  <button onClick={()=>setShowTab('requests')} className="bg-indigo-900/20 backdrop-blur px-4 py-2 rounded-xl border border-white/30">Review Requests</button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AdminStat label="Events" value={events.length} />
                <AdminStat label="Clubs" value={clubs.length} />
                <AdminStat label="Pending Requests" value={joinRequests.length} />
                <AdminStat label="Volunteers" value={volunteers.length} />
              </div>

              {/* Recent events table */}
              <section className="bg-white rounded-2xl shadow p-0 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                  <div className="font-semibold text-gray-800">Recent Events</div>
                </div>
                <div className="divide-y">
                  {filteredEvents.slice(0,6).map((e)=> (
                    <div key={e._id} className="flex items-center gap-4 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 truncate">{e.title}</div>
                        <div className="text-xs text-gray-500 truncate">{e.club?.name || '-'} • {new Date(e.startAt).toLocaleString()}</div>
                      </div>
                      <button onClick={()=>remove(e._id)} className="text-red-600 text-sm">Delete</button>
                    </div>
                  ))}
                  {events.length === 0 && <div className="px-5 py-8 text-center text-gray-400">No events yet</div>}
                </div>
              </section>
            </div>

            {/* Right rail */}
            <div className="flex flex-col gap-6">
              {/* Requests panel */}
              <div className="bg-white rounded-2xl shadow">
                <div className="px-4 py-3 border-b font-semibold">New Applicants</div>
                <div className="max-h-80 overflow-auto">
                  {joinRequests.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">No new join requests</div>
                  ) : joinRequests.map(r => (
                    <div key={r._id} className="px-4 py-3 border-b last:border-0">
                      <div className="text-sm"><b>{r.user?.name || 'User'}</b> → {r.clubName}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={()=>handleJoinRequest(r.clubId, r._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">Accept</button>
                        <button onClick={()=>handleJoinRequest(r.clubId, r._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volunteers panel */}
              <div className="bg-white rounded-2xl shadow">
                <div className="px-4 py-3 border-b font-semibold">Volunteer Applicants</div>
                <div className="max-h-80 overflow-auto">
                  {volunteers.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">No volunteers yet</div>
                  ) : volunteers.slice(0,8).map(v => (
                    <div key={v._id} className="px-4 py-3 border-b last:border-0">
                      <div className="text-sm font-medium">{v.user?.name || 'User'}</div>
                      <div className="text-xs text-gray-500 mb-2">{v.status}</div>
                      <div className="flex gap-2">
                        <button onClick={()=>updateVolunteerStatus(v._id, 'approved')} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">Approve</button>
                        <button onClick={()=>updateVolunteerStatus(v._id, 'rejected')} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showTab === 'events' && (
          <>
            {/* Create Event Form */}
            <section className="bg-white rounded-2xl shadow p-8 mb-6">
              <h3 className="text-xl font-semibold mb-6 text-indigo-600">
                Create New Event
              </h3>
              <form
                onSubmit={create}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <input
                  className="rounded-lg border border-indigo-200 px-4 py-2 focus:border-indigo-400 outline-none"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />
                <select
                  value={form.clubId}
                  onChange={(e) =>
                    setForm({ ...form, clubId: e.target.value })
                  }
                  className="rounded-lg border border-indigo-200 px-3 py-2 focus:border-indigo-400 outline-none"
                  required
                >
                  <option value="">Select Club</option>
                  {clubs.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) =>
                    setForm({ ...form, startAt: e.target.value })
                  }
                  className="rounded-lg border border-indigo-200 px-4 py-2 focus:border-indigo-400 outline-none"
                  required
                />
                <input
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="rounded-lg border border-indigo-200 px-4 py-2 focus:border-indigo-400 outline-none col-span-full"
                />
                {/* Image upload */}
                <div className="col-span-full flex items-center gap-3">
                  <input id="event-image-input" type="file" accept="image/*" className="hidden" onChange={(e)=>{
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = async () => {
                      try {
                        const { data } = await api.post('/upload/image', { dataUrl: String(reader.result) });
                        setForm(prev => ({ ...prev, imageUrl: data.url }));
                      } catch (err) { console.error('Upload failed', err); }
                    };
                    reader.readAsDataURL(f);
                  }} />
                  <button type="button" onClick={()=>document.getElementById('event-image-input').click()} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm">{form.imageUrl ? 'Change Image' : 'Upload Image'}</button>
                  {form.imageUrl && <img src={form.imageUrl} alt="event" className="w-16 h-10 object-cover rounded border"/>}
                </div>
                <input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="rounded-lg border border-indigo-200 px-4 py-2 focus:border-indigo-400 outline-none"
                  required
                />
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                  className="rounded-lg border border-indigo-200 px-4 py-2 focus:border-indigo-400 outline-none"
                  required
                />
                <input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) =>
                    setForm({ ...form, state: e.target.value })
                  }
                  className="rounded-lg border border-indigo-200 px-4 py-2 focus:border-indigo-400 outline-none"
                  required
                />
                <input
                  placeholder="Latitude (opt)"
                  value={form.lat}
                  onChange={(e) =>
                    setForm({ ...form, lat: e.target.value })
                  }
                  className="rounded-lg border border-indigo-200 px-4 py-2 focus:border-indigo-400 outline-none"
                />
                <input
                  placeholder="Longitude (opt)"
                  value={form.lng}
                  onChange={(e) =>
                    setForm({ ...form, lng: e.target.value })
                  }
                  className="rounded-lg border border-indigo-200 px-4 py-2 focus:border-indigo-400 outline-none"
                />
                <button className="col-span-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-bold shadow hover:scale-105 active:scale-95 transition-transform">
                  Create Event
                </button>
              </form>

              {msg && (
                <p className="mt-4 text-green-600 font-medium">{msg}</p>
              )}
              {error && (
                <p className="mt-4 text-red-600 font-medium">{error}</p>
              )}
            </section>

            {/* Events Table */}
            <section className="bg-white rounded-2xl shadow p-8">
              <h3 className="text-xl font-semibold mb-4 text-indigo-600">
                All Events
              </h3>
              {events.length === 0 ? (
                <div className="text-gray-400 text-center py-6">
                  No events found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b bg-indigo-50 text-indigo-700">
                        <th className="text-left py-2 px-3">Title</th>
                        <th className="text-left py-2 px-3">Club</th>
                        <th className="text-left py-2 px-3">Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((e) => (
                        <tr
                          key={e._id}
                          className="border-b hover:bg-indigo-50 transition"
                        >
                          <td className="py-2 px-3 font-medium">
                            {e.title}
                          </td>
                          <td className="py-2 px-3">{e.club?.name || '-'}</td>
                          <td className="py-2 px-3">
                            {new Date(e.startAt).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => remove(e._id)}
                              className="px-4 py-1 text-xs rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white shadow hover:scale-105 transition-transform"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {showTab === 'members' && selectedClub && (
          <section className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-indigo-600">
                Members of {clubs.find((c) => c._id === selectedClub)?.name}
              </h3>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                {clubs.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">College</th>
                    <th className="px-3 py-2 text-left">Year</th>
                    <th className="px-3 py-2 text-left">Gender</th>
                    <th className="px-3 py-2 text-left">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {(membersMap[selectedClub] || []).map((m) => (
                    <tr key={m._id} className="hover:bg-indigo-50 transition">
                      <td className="px-3 py-2">{m.name}</td>
                      <td className="px-3 py-2">{m.email}</td>
                      <td className="px-3 py-2">{m.college}</td>
                      <td className="px-3 py-2">{m.year}</td>
                      <td className="px-3 py-2">{m.gender}</td>
                      <td className="px-3 py-2">{m.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {showTab === 'volunteers' && (
          <section className="bg-white rounded-2xl shadow p-8">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">Volunteers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(v => (
                    <tr key={v._id} className="hover:bg-indigo-50 transition">
                      <td className="px-3 py-2">{v.user?.name || 'User'}</td>
                      <td className="px-3 py-2">{v.status}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button onClick={()=>updateVolunteerStatus(v._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">Approve</button>
                          <button onClick={()=>updateVolunteerStatus(v._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {showTab === 'requests' && (
          <section className="bg-white rounded-2xl shadow p-8">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">Join Requests</h3>
            {joinRequests.length === 0 ? (
              <div className="text-gray-400 text-center py-6">No pending join requests.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th className="px-3 py-2 text-left">User</th>
                      <th className="px-3 py-2 text-left">Club</th>
                      <th className="px-3 py-2 text-left">Requested</th>
                      <th className="px-3 py-2 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinRequests.map(r => (
                      <tr key={r._id} className="hover:bg-indigo-50 transition">
                        <td className="px-3 py-2">{r.user?.name || 'User'}</td>
                        <td className="px-3 py-2">{r.clubName}</td>
                        <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button onClick={()=>handleJoinRequest(r.clubId, r._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">Approve</button>
                            <button onClick={()=>handleJoinRequest(r.clubId, r._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function AdminStat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold">{value}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );
}
