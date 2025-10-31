export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-blue-100 to-pink-100 flex flex-col w-full p-4">
      <div className="relative flex-1 flex flex-col items-center justify-center py-16 sm:py-24 text-center animate-fadeIn w-full max-w-7xl mx-auto">
        <img
          src={import.meta.env.VITE_APP_LOGO_URL || '/brand-logo.jpeg'}
          alt="BuzzBoard Logo"
          className="w-32 h-32 mx-auto mb-6 drop-shadow-md animate-bounceOnce max-w-full rounded-full object-contain bg-white p-2 ring-1 ring-indigo-200"
          loading="lazy"
        />
        <h1 className="text-5xl sm:text-6xl font-extrabold text-purple-700 mb-5 font-display drop-shadow-lg">
          BuzzBoard
        </h1>
        <h2 className="text-xl sm:text-2xl text-purple-700 mb-10 max-w-xl mx-auto font-semibold">
          Connect, Create, Lead. <span className="text-blue-500">The all-in-one clubs and event platform.</span>
        </h2>
        <div className="flex gap-6 justify-center mt-5 animate-fadeIn">
          <a href="/onboarding/role" className="px-8 py-3 text-lg rounded-full font-bold text-white bg-pink-500 shadow-lg hover:bg-pink-600 focus:outline-none transition">Get Started</a>
          <a href="/" className="px-8 py-3 text-lg rounded-full font-bold text-pink-700 bg-white shadow-lg hover:bg-pink-50 hover:text-pink-900 focus:outline-none transition">Explore Events</a>
        </div>
        {/* Community promo image removed as requested */}
      </div>
      <section className="py-8 sm:py-16 bg-white/80 animate-fadeInUp w-full max-w-7xl mx-auto">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-blue-700 mb-10 text-center">Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl shadow text-left bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <div className="text-3xl mb-2">🥳</div>
              <b>Clubs & Communities</b>
              <p className="text-gray-600">Create or join clubs, manage members and events easily. Personalized recommendations for you!</p>
            </div>
            <div className="p-5 rounded-xl shadow text-left bg-gradient-to-br from-purple-50 via-white to-blue-50">
              <div className="text-3xl mb-2">📅</div>
              <b>Stunning Events</b>
              <p className="text-gray-600">Browse, create, and RSVP to upcoming club events. Smart geolocation for nearby meetups.</p>
            </div>
            <div className="p-5 rounded-xl shadow text-left bg-gradient-to-br from-pink-50 via-white to-indigo-50">
              <div className="text-3xl mb-2">☑️</div>
              <b>One-Click RSVP & Registration</b>
              <p className="text-gray-600">Quick registration with prefilled info. Join and manage your event list in one click!</p>
            </div>
            <div className="p-5 rounded-xl shadow text-left bg-gradient-to-br from-indigo-50 via-white to-pink-50">
              <div className="text-3xl mb-2">🛠️</div>
              <b>Admin Dashboard</b>
              <p className="text-gray-600">Club admins can create/edit/delete events, view stats, approve volunteers, upload galleries, and more.</p>
            </div>
            <div className="p-5 rounded-xl shadow text-left bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <div className="text-3xl mb-2">🎖️</div>
              <b>Volunteer Management</b>
              <p className="text-gray-600">Events can accept volunteers! Admins approve or reject; volunteers get credit and engagement.</p>
            </div>
            <div className="p-5 rounded-xl shadow text-left bg-gradient-to-br from-pink-50 via-white to-purple-50">
              <div className="text-3xl mb-2">🖼️</div>
              <b>Event Gallery</b>
              <p className="text-gray-600">Share your best photos after each event — multimedia gallery for each club!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

