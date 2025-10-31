import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import EventPage from './pages/EventPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';
import Landing from './pages/Landing';
import RoleSelection from './pages/RoleSelection';
import UserProfileForm from './pages/UserProfileForm';
import CreateClubForm from './pages/CreateClubForm';
import { useAuth } from './contexts/AuthContext';
import api from './api';


// A wrapper to handle the new onboarding logic
function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user is logged in but hasn't completed onboarding, redirect them to role selection.
  if (user.profileStatus === 'INCOMPLETE' && location.pathname !== '/onboarding/role') {
    return <Navigate to="/onboarding/role" state={{ from: location }} replace />;
  }

  return children;
}

// Layout remains mostly the same
function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  useEffect(() => {
    if (user?.role === 'admin') {
      const load = async () => {
        // Get admin's clubs
        const { data: clubs } = await api.get('/clubs');
        const owned = clubs.filter(c => c.owner === user._id);
        // Get join requests for all these clubs (flattened)
        let reqs = [];
        for (const club of owned) {
          const { data: joinReqs } = await api.get(`/clubs/${club._id}/join-requests`);
          joinReqs.forEach(r => {
            if (r.status === 'pending') reqs.push({ ...r, clubName: club.name, clubId: club._id });
          });
        }
        setRequests(reqs);
      };
      load();
      const i = setInterval(load, 15000);
      return () => clearInterval(i);
    } else {
      setRequests([]);
    }
  }, [user]);
  async function handleRequest(clubId, reqId, decision) {
    await api.patch(`/clubs/${clubId}/join-requests/${reqId}`, { status: decision });
    setRequests(requests.filter(r => r._id !== reqId));
  }

  // Don't show nav on onboarding or login pages for a cleaner flow
  if (location.pathname.startsWith('/onboarding') || location.pathname === '/login') {
    return <>{children}</>;
  }
  
  // Don't show nav on the landing page if the user is logged out
  if (!user && location.pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div>
      <nav className="flex flex-wrap items-center gap-4 px-6 py-4 bg-white border-b shadow-sm sticky top-0 z-10">
        <Link className="font-bold text-xl text-purple-700" to="/">BuzzBoard</Link>
        <Link className="hover:text-purple-600 font-medium" to="/">Dashboard</Link>
        <Link className="hover:text-purple-600 font-medium" to="/clubs">Clubs</Link>
        <div className="ml-auto flex items-center gap-4">
          {user && user.role === 'admin' && (
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)} className="relative mr-2">
                <span className="text-2xl">🔔</span>
                {requests.length > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {requests.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-96 bg-white shadow-lg rounded-xl z-30 border overflow-auto animate-fadeIn">
                  <h4 className="text-center font-bold py-2 text-indigo-700">Join Requests</h4>
                  {requests.length === 0 ? <p className="px-6 py-4 text-center text-gray-500">No requests</p> : (
                    requests.map(r => (
                      <div key={r._id} className="flex flex-col gap-1 border-b px-4 py-2">
                        <div>
                          <b>{r.user.name}</b> wants to join <span className="text-indigo-700 font-semibold">{r.clubName}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleRequest(r.clubId, r._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-green-600">Accept</button>
                          <button onClick={() => handleRequest(r.clubId, r._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-red-600">Reject</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {user ? (
            <>
              <Link className="hover:text-purple-600 font-medium" to="/profile">Profile</Link>
              {user.role === 'admin' && <Link className="hover:text-purple-600 font-medium" to="/admin">Admin</Link>}
              <button className="px-4 py-2 rounded-full font-bold text-white bg-pink-500 hover:bg-pink-600 shadow transition" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link className="font-medium" to="/login">Login</Link>
          )}
        </div>
      </nav>
      {children}
    </div>
  );
}

// A special private route for the onboarding flow itself
function OnboardingRoute({ children }) {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}


function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes: Landing and Login */}
          <Route path="/" element={user ? <PrivateRoute><Dashboard /></PrivateRoute> : <Landing />} />
          <Route path="/login" element={<LoginRegister />} />
          
          {/* Onboarding Routes (must be logged in to access) */}
          <Route path="/onboarding/role" element={<OnboardingRoute><RoleSelection /></OnboardingRoute>} />
          <Route path="/onboarding/user-profile" element={<OnboardingRoute><UserProfileForm /></OnboardingRoute>} />
          <Route path="/onboarding/create-club" element={<OnboardingRoute><CreateClubForm /></OnboardingRoute>} />

          {/* Fully Private Routes (must be logged in and have completed profile) */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          <Route path="/clubs" element={<PrivateRoute><Clubs /></PrivateRoute>} />
          <Route path="/events/:id" element={<PrivateRoute><EventPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          
          <Route path="/events/:id/gallery" element={<PrivateRoute><Gallery eventId={'some-id'} isAdmin={user?.role === 'admin'} /></PrivateRoute>} />

        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App;
