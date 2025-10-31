import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';


export default function UserProfileForm() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    gender: 'Prefer not to say',
    college: '',
    course: '',
    year: '',
    interests: '',
    resumeUrl: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        interests: formData.interests.split(',').map(item => item.trim()).filter(Boolean),
        profileStatus: 'COMPLETE',
      };
      const { data: updatedUser } = await api.put('/auth/me', payload);
      
      // Use the context to update the user globally
      updateUser(updatedUser);

      navigate('/'); // Redirect to dashboard
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-blue-100 to-pink-100 w-full p-4">
      <div className="max-w-2xl w-full bg-white p-6 md:p-12 rounded-2xl shadow-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="input-style" />
            <select name="gender" value={formData.gender} onChange={handleChange} className="input-style">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
            <input name="college" value={formData.college} onChange={handleChange} placeholder="College Name" required className="input-style" />
            <input name="course" value={formData.course} onChange={handleChange} placeholder="Course (e.g., B.Tech)" className="input-style" />
            <input name="year" value={formData.year} onChange={handleChange} placeholder="Year of Study" className="input-style" />
            <input name="address" value={formData.address} onChange={handleChange} placeholder="City, State" className="input-style" />
          </div>
          <input name="interests" value={formData.interests} onChange={handleChange} placeholder="Your Interests (comma-separated)" className="input-style w-full" />
          <input name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} placeholder="Link to your Resume/Portfolio (optional)" className="input-style w-full" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300">
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
      <style>{`.input-style { padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; width: 100%; font-size: 1rem; }`}</style>
    </div>
  );
}
