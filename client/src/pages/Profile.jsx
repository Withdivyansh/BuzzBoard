import { useEffect, useState } from 'react';
import api from '../api';

const avatar = (name) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || 'BuzzBoard')}`;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', phone: '', address: '', avatarUrl: '', logoUrl: '', vendorDocuments: [] });
  const [justSaved, setJustSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/auth/me');
      setUser(data);
      setForm({
        name: data.name || '',
        bio: data.bio || '',
        phone: data.phone || '',
        address: data.address || '',
        avatarUrl: data.avatarUrl || '',
        logoUrl: data.logoUrl || '',
        vendorDocuments: data.vendorDocuments || []
      });
    };
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/auth/me', form);
    setUser(data);
    setEditing(false);
    setJustSaved(true); setTimeout(() => setJustSaved(false), 1400);
  };

  if (!user) return <div className="py-20 text-center text-gray-500 animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-[#EBEDF6] py-10 px-4 flex items-start justify-center relative overflow-hidden">
      {/* Background illustration */}
      <img src={import.meta.env.VITE_PROFILE_ILLUSTRATION_URL || '/profile-art.jpg'} alt="profile art" className="pointer-events-none select-none opacity-10 absolute right-10 top-6 w-[520px] hidden lg:block"/>

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg font-semibold text-gray-800">Profile</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setEditing((v)=>!v)} className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 text-sm">
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-8">
          {/* Left: avatar + upload placeholders */}
          <div>
            <div className="relative w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-indigo-200">
              <img src={form.avatarUrl || avatar(user.name)} alt="avatar" className="w-40 h-40 rounded-lg object-cover" loading="lazy"/>
              <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={(e)=>{
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setForm(prev => ({ ...prev, avatarUrl: String(reader.result) }));
                reader.readAsDataURL(file);
              }} />
              <button type="button" onClick={()=>document.getElementById('avatar-input').click()} className="absolute top-2 left-2 text-xs bg-indigo-600 text-white rounded-full px-2 py-1 shadow">📷</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <input id="logo-input" type="file" accept="image/*" className="hidden" onChange={(e)=>{
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => setForm(prev => ({ ...prev, logoUrl: String(reader.result) }));
                reader.readAsDataURL(f);
              }}/>
              <button type="button" onClick={()=>document.getElementById('logo-input').click()} className="h-12 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700">{form.logoUrl ? 'Change Logo' : 'Upload Logo'}</button>

              <input id="docs-input" type="file" multiple className="hidden" onChange={(e)=>{
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                const readers = files.map(f => new Promise((resolve)=>{ const r=new FileReader(); r.onload=()=>resolve(String(r.result)); r.readAsDataURL(f); }));
                Promise.all(readers).then(imgs => setForm(prev => ({ ...prev, vendorDocuments: imgs })));
              }}/>
              <button type="button" onClick={()=>document.getElementById('docs-input').click()} className="h-12 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700">{(form.vendorDocuments||[]).length>0 ? 'Replace Documents' : 'Vendor Documents'}</button>
            </div>
            {form.logoUrl && (
              <div className="mt-3 text-xs text-gray-500">Logo preview:</div>
            )}
            {form.logoUrl && <img src={form.logoUrl} alt="logo preview" className="mt-1 w-24 h-24 object-cover rounded"/>}
            {(form.vendorDocuments||[]).length>0 && (
              <div className="mt-3 text-xs text-gray-500">Documents uploaded: {(form.vendorDocuments||[]).length}</div>
            )}
          </div>

          {/* Right: details or form */}
          <div>
            {!editing ? (
              <div className="space-y-4">
                <Detail label="Name" value={user.name} />
                <Detail label="Email" value={user.email} />
                <Detail label="Phone Number" value={user.phone || '-'} />
                <Detail label="Address" value={user.address || '-'} />
                {user.bio && <Detail label="Bio" value={user.bio} />}
              </div>
            ) : (
              <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Name" value={form.name} onChange={(v)=>setForm({...form, name:v})} required/>
                <Input label="Phone" value={form.phone} onChange={(v)=>setForm({...form, phone:v})}/>
                <div className="sm:col-span-2">
                  <Input label="Address" value={form.address} onChange={(v)=>setForm({...form, address:v})}/>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Bio</label>
                  <textarea value={form.bio} onChange={(e)=>setForm({...form, bio:e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none min-h-[90px]" placeholder="Write something about yourself"/>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button className="px-5 py-2 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700">Save Changes</button>
                </div>
              </form>
            )}
          </div>
        </div>
        {justSaved && <div className="text-green-600 text-center mt-6">Profile updated!</div>}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="text-sm">
      <div className="text-gray-400">{label}:</div>
      <div className="text-gray-800 mt-0.5">{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}{required ? ' *' : ''}</label>
      <input value={value} onChange={(e)=>onChange(e.target.value)} required={required} className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-indigo-300 outline-none"/>
    </div>
  );
}


