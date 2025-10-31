import { useEffect, useState } from 'react';
import api from '../api';

export default function Gallery({ eventId, isAdmin }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalImg, setModalImg] = useState(null);
  const [form, setForm] = useState({ url: '', caption: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/gallery', { params: { eventId } });
    setImages(data[0]?.images || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [eventId]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await api.post('/gallery', { eventId, images: [{ url: form.url, caption: form.caption }] });
    setForm({ url: '', caption: '' });
    setSubmitting(false);
    load();
  };

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-center mb-6 text-pink-600">Event Gallery</h3>
      {isAdmin && (
        <form onSubmit={submit} className="mb-8 flex flex-wrap gap-3 items-center justify-center">
          <input required className="border rounded px-2 py-1" placeholder="Image URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}/>
          <input className="border rounded px-2 py-1" placeholder="Caption (optional)" value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}/>
          <button className="bg-pink-500 text-white rounded px-4 py-1 font-semibold hover:bg-pink-700 transition disabled:opacity-60" disabled={submitting}>Upload</button>
        </form>
      )}
      {loading ? (<div className="text-center text-gray-400">Loading gallery...</div>) :
        images.length === 0 ? (
          <div className="text-center text-gray-400">No images yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl shadow bg-white hover:shadow-lg transition cursor-pointer" onClick={() => { setShowModal(true); setModalImg(img); }}>
                <img src={img.url} alt='' className="object-cover w-full h-full hover:scale-105 transition-transform" loading="lazy"/>
                {img.caption && <div className="p-1 text-xs text-pink-800 truncate bg-white bg-opacity-80 absolute bottom-0 left-0 right-0">{img.caption}</div>}
              </div>
            ))}
          </div>
        )
      }
      {showModal && modalImg && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70" onClick={() => setShowModal(false)}>
          <img src={modalImg.url} alt='' className="max-h-[80vh] max-w-[90vw] rounded-2xl border-4 border-pink-200 shadow-xl" />
          {modalImg.caption && <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xl font-bold text-white drop-shadow-xl">{modalImg.caption}</div>}
        </div>
      )}
    </div>
  );
}

