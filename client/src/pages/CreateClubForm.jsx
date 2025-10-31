import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function CreateClubForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    collegeName: '',
    address: '',
    logoUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-blue-100 to-pink-100 w-full">
        <div className="p-8 bg-white rounded-2xl shadow">
          <h2 className="text-xl font-bold text-center text-red-700 mb-4">Access Denied</h2>
          <p>You must be an admin to create a club.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/clubs', formData);
      
      const { data: updatedUser } = await api.get('/auth/me');
      updateUser(updatedUser);

      navigate('/admin'); // Redirect to admin dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create club. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-blue-100 to-pink-100 w-full">
      <div className="max-w-2xl w-full bg-white p-10 md:p-16 rounded-2xl shadow-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your Club</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Club Name" required className="input-style" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Club Description" required className="input-style min-h-[100px]"></textarea>
          <input name="collegeName" value={formData.collegeName} onChange={handleChange} placeholder="College/University Name" required className="input-style" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Club Address (City, State)" required className="input-style" />
          <div>
            <label className="block text-sm text-gray-600 mb-1">Club Logo (optional)</label>
            <div className="flex items-center gap-3">
              <input id="logo-file" type="file" accept="image/*" className="hidden" onChange={async (e)=>{
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = async () => {
                  try {
                    const { data } = await api.post('/upload/image', { dataUrl: String(reader.result) });
                    setFormData(prev => ({ ...prev, logoUrl: data.url }));
                  } catch (err) {
                    console.error('Logo upload failed', err);
                    setError('Logo upload failed');
                  }
                };
                reader.readAsDataURL(f);
              }} />
              <button type="button" onClick={()=>document.getElementById('logo-file').click()} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm">{formData.logoUrl ? 'Change Logo' : 'Upload Logo'}</button>
              {formData.logoUrl && <img src={formData.logoUrl} alt="logo" className="w-10 h-10 rounded object-cover border"/>}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition disabled:bg-indigo-300">
            {loading ? 'Creating Club...' : 'Create Club and Proceed'}
          </button>
        </form>
      </div>
      <style>{`.input-style { padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; width: 100%; font-size: 1rem; }`}</style>
    </div>
  );
}
