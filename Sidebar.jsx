import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Pill, 
  Building2, 
  UploadCloud, 
  FileText,
  Heart,
  Settings,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/medicines', label: 'Medicines Catalog', icon: Pill },
    { path: '/companies', label: 'Companies & MRs', icon: Building2 },
    { path: '/upload', label: 'Upload Document', icon: UploadCloud },
    { path: '/documents', label: 'Uploaded Archive', icon: FileText },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 dark:bg-slate-900/90 dark:border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-65px)] hidden md:flex transition-colors">
      <div className="space-y-6">
        <div className="px-3.5 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Main Menu</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-medred-600 text-white shadow-md shadow-medred-600/15 dark:bg-medred-600 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="flex items-center gap-2 text-medred-600 dark:text-medred-400 font-bold mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Doctor Encrypted System</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-500">HIPAA compliant AI extraction service. Original documents protected.</p>
      </div>
    </aside>
  );
}
