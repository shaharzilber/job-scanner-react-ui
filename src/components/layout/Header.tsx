import { useAuthStore } from '@/store/authStore';
import { LogOut, User } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Scanner</h1>
            <p className="text-sm text-gray-600">Find and track job opportunities</p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{user.username}</span>
                <span className="text-xs text-gray-500">({user.role})</span>
              </div>
            )}

            <button
              onClick={logout}
              className="btn btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
