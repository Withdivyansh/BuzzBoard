import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // Handler to set the user's role then navigate
  const selectRole = async (role) => {
    try {
      // Update user role on backend
      const { data } = await api.put('/auth/me', { role, profileStatus: 'INCOMPLETE' });
      updateUser(data);
      if (role === 'user') {
        navigate('/onboarding/user-profile');
      } else if (role === 'admin') {
        navigate('/onboarding/create-club');
      }
    } catch (e) {
      alert('Failed to set role. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
        <div className="text-center mb-12 animate-fadeIn w-full">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">Welcome to BuzzBoard!</h1>
          <p className="text-lg text-gray-600">First, let's get you set up. How will you be joining us today?</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-center">
          <div 
            onClick={() => selectRole('user')}
            className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xs text-center cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-transform duration-300 transform"
          >
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Continue as a User</h2>
            <p className="text-gray-500">
              Join clubs, RSVP to events, and connect with your community.
            </p>
          </div>
          <div 
            onClick={() => selectRole('admin')}
            className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xs text-center cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-transform duration-300 transform"
          >
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-2xl font-bold text-indigo-600 mb-2">Continue as a Club Admin</h2>
            <p className="text-gray-500">
              Create your own club, manage events, and lead your community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

