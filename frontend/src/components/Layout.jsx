import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/', label: 'My tickets' },
    { to: '/tickets/new', label: 'New ticket' },
    ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin dashboard' }, { to: '/admin/tickets', label: 'All tickets' }] : []),
  ];
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const side = ({ isActive }) => `block rounded-md px-3 py-2 text-sm ${isActive ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`;
  const top = ({ isActive }) => `text-sm ${isActive ? 'font-semibold text-gray-900' : 'text-gray-600'}`;

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="hidden md:flex md:w-56 md:flex-none flex-col bg-white border-r border-gray-200 p-4">
        <nav className="space-y-1">
          {links.map((l) => <NavLink key={l.to} to={l.to} end className={side}>{l.label}</NavLink>)}
        </nav>
        <div className="mt-auto border-t border-gray-200 pt-4 text-sm text-gray-700">
          <p className="truncate">{user.name}</p>
          <button onClick={handleLogout} className="mt-1 text-gray-500 hover:underline">Logout</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="md:hidden flex flex-wrap items-center gap-4 bg-white border-b border-gray-200 px-4 py-3">
          {links.map((l) => <NavLink key={l.to} to={l.to} end className={top}>{l.label}</NavLink>)}
          <button onClick={handleLogout} className="ml-auto text-sm text-gray-500">Logout</button>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8"><Outlet /></main>
      </div>
    </div>
  );
}

export default Layout;
