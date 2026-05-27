import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Bell, Search, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, userData } = useApp();
  const { signOut } = useAuth();

  return (
    <header className="h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-dark-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">
              {userData?.displayName || user?.displayName || 'User'}
            </p>
            <p className="text-xs text-dark-400">
              {user?.email}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold">
                {(userData?.displayName || user?.displayName || 'U')[0].toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
