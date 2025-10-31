import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import CommentSection from './CommentSection';

// Helper to get a sample event image
const heroUrl = (id) => `https://source.unsplash.com/random/900x350?sig=${id.length*7+111}&meet,event,party`;

export default function EventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/events');
      const found = data.find((e) => e._id === id);
      setEvent(found || null);
      setLoading(false);
    };
    load();
  }, [id]);

  const rsvp = async (s) => {
    await api.post('/rsvp', { eventId: id, status: s });
    setStatus(s);
  };

  if (loading) return <div className="text-center text-gray-500 animate-pulse py-16">Loading...</div>;
  if (!event) return <div className="text-center text-gray-400 py-20">Event not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="rounded-xl overflow-hidden shadow-lg bg-white mb-4 animate-fadeIn">
        <img
          src={heroUrl(event._id)}
          className="w-full h-56 object-cover object-center border-b"
          alt="Event Hero"
          loading="lazy"
        />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-blue-700 flex-1">{event.title}</h2>
            {status === 'going' && <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full animate-pulse">RSVP'ed!</span>}
            {status === 'cancelled' && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full animate-fadeIn">RSVP cancelled</span>}
          </div>
          <div className="mb-2 text-gray-700 flex flex-wrap gap-4 text-sm">
            <span>📅 {new Date(event.startAt).toLocaleString()}</span>
            <span>👤 Club: <span className="font-semibold">{event.club?.name || 'N/A'}</span></span>
          </div>
          <div className="mb-4 text-gray-600 leading-relaxed">
            {event.description || <span className="italic text-gray-400">No description provided</span>}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => rsvp('going')}
              className={
                'px-6 py-2 rounded-full bg-blue-500 text-white font-bold shadow hover:scale-105 transition ' +
                (status === 'going' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-600')
              }
              disabled={status === 'going'}
            >RSVP Going</button>
            <button
              onClick={() => rsvp('cancelled')}
              className={
                'px-6 py-2 rounded-full bg-gray-200 font-bold text-gray-700 shadow hover:scale-105 transition ' +
                (status === 'cancelled' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-300')
              }
              disabled={status === 'cancelled'}
            >Cancel RSVP</button>
            {status && (
              <span className="ml-2 text-sm text-gray-400 flex items-center">Status: <span className="font-semibold ml-1">{status}</span></span>
            )}
          </div>
        </div>
      </div>
      {/* COMMENTS SECTION */}
      <CommentSection eventId={id} />
    </div>
  );
}


