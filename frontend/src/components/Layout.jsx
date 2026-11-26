import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const admin = user?.role === 'admin';
  const links = admin
    ? [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/tickets', label: 'All tickets' }]
    : [{ to: '/', label: 'Dashboard' }, { to: '/tickets/new', label: 'New ticket' }];

  function signOut() { logout(); navigate('/login'); }

  return <div className="min-h-screen md:flex">
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white p-4 md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r md:p-6">
      <a href={admin ? '/admin' : '/'} className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-800"><span className="grid h-9 w-9 place-items-center rounded-xl bg-green-100 text-xl text-green-700">k</span>kindred <span className="text-sm font-normal text-slate-400">/ support</span></a>
      <p className="mb-3 mt-8 hidden text-[10px] font-bold tracking-widest text-slate-400 md:block">WORKSPACE</p>
      <nav className="mt-4 flex gap-2 md:mt-0 md:flex-col">
        {links.map((link) => <NavLink key={link.to} to={link.to} end className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-green-50 text-green-800' : 'text-slate-500 hover:bg-slate-50'}`}>{link.label}</NavLink>)}
      </nav>
      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 md:mt-auto">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-green-100 text-sm font-semibold text-green-800">{user?.name?.[0]?.toUpperCase()}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-700">{user?.name}</p><p className="text-xs capitalize text-slate-400">{admin ? 'Administrator' : 'Account'}</p></div>
        <button onClick={signOut} className="text-xs font-semibold text-slate-500 hover:text-green-700">Logout</button>
      </div>
    </aside>
    <main className="min-w-0 flex-1 bg-[#f5f7f5] md:ml-64"><header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-10"><span className="text-xs text-slate-500">Workspace <span className="mx-2 text-slate-300">/</span>{admin ? 'Admin' : 'Support desk'}</span><span className="flex items-center gap-2 text-[11px] text-slate-500"><i className="h-2 w-2 rounded-full bg-pista" /> All systems operational</span></header><div className="mx-auto max-w-6xl p-5 md:p-10"><Outlet /></div></main>
  </div>;
}
