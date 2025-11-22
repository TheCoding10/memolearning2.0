import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  username: string;
  email: string;
}

export function UserMenu({ username, email }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

   const handleSettings = () => {
     setIsOpen(false);
     navigate('/settings');
   };

   const handleLogout = () => {
     setIsOpen(false);
     logout();
     navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div 
      className="relative inline-block" 
      ref={menuRef}
    >
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="text-left">
          <p className="font-semibold text-gray-900">{username}</p>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
        >
           <div className="border-b border-gray-100 px-4 py-3">
             <p className="font-semibold text-gray-900">{username}</p>
             <p className="text-sm text-gray-600 truncate">{email}</p>
           </div>

          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
