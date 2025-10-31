import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';


export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await api.post(url, form);
      login(data.token, data.user); // Use the login function from context
      
      // Navigate based on profile status
      navigate(data.user.profileStatus === 'INCOMPLETE' ? '/onboarding/role' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#EEF8F6] relative overflow-hidden flex items-center justify-center px-4">
      {/* teal circular background accents on the right */}
      <div className="absolute right-[-15%] top-[-20%] w-[70vw] h-[70vw] rounded-full bg-teal-200 opacity-60"/>
      <div className="absolute right-[-10%] top-[10%] w-[55vw] h-[55vw] rounded-full bg-teal-300 opacity-60"/>

      <div className="relative z-10 bg-white w-full max-w-5xl rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2">
        {/* Left: form */}
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8 bg-gray-100 rounded-full p-1 w-max">
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                isLogin ? 'bg-teal-500 text-white shadow' : 'text-white'
              }`}
              onClick={() => { setIsLogin(true); setError(''); }}
              type="button"
            >
              Login
            </button>
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                !isLogin ? 'bg-teal-500 text-white shadow' : 'text-white'
              }`}
              onClick={() => { setIsLogin(false); setError(''); }}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                <input
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-400 outline-none"
                />
              </div>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
              <input
                type="email"
                placeholder="Email or phone number"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span/>
              <button type="button" className="hover:text-teal-600">Forgot your password?</button>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-36 ml-auto block py-3 px-5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-full shadow hover:from-teal-600 hover:to-emerald-600 transition disabled:opacity-60">
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign up')}
            </button>
          </form>
        </div>

        {/* Right: illustration (uses env or /login-art.jpg in public) */}
        <div className="relative rounded-r-2xl overflow-hidden bg-gradient-to-br from-teal-200 to-teal-400 flex items-center justify-center p-6">
          <img
            src={import.meta.env.VITE_LOGIN_ILLUSTRATION_URL || '/login-art.jpg'}
            alt="Login illustration"
            className="max-h-[380px] w-auto object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}


