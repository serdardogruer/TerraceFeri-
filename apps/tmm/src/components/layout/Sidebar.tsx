'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, Map, Zap, Settings, 
  Building, ChevronLeft, ChevronRight, GripVertical, Cpu, AlertTriangle, Briefcase, UserCheck, User, LogOut, Send,
  Smartphone, Sparkles, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { parseUserPermissions } from '@/lib/permissions';

interface MenuItem {

  id: string;
  name: string;
  icon: React.ElementType;
  href: string;
  moduleKey: string;
}

const defaultMenus: MenuItem[] = [
  { id: '1', name: 'Dashboard', icon: Home, href: '/admin', moduleKey: 'dashboard' },
  { id: '3', name: 'Alanlar', icon: Map, href: '/admin/areas', moduleKey: 'areas' },
  { id: '4', name: 'Daireler', icon: Building, href: '/admin/apartments', moduleKey: 'apartments' },
  { id: '5', name: 'Ekipmanlar', icon: Cpu, href: '/admin/equipments', moduleKey: 'equipments' },
  { id: '6', name: 'Arızalar', icon: AlertTriangle, href: '/admin/faults', moduleKey: 'faults' },
  { id: '7', name: 'Sayaçlar', icon: Zap, href: '/admin/meters', moduleKey: 'meters' },
  { id: '8', name: 'Firmalar', icon: Briefcase, href: '/admin/settings/companies', moduleKey: 'companies' },
  { id: '9', name: 'Yönetim Masası', icon: Send, href: '/admin/management-requests', moduleKey: 'management' },
  { id: '10', name: 'Personel & PDKS', icon: UserCheck, href: '/admin/personnel', moduleKey: 'personnel' },
  { id: '11', name: 'Personel Mobil', icon: Shield, href: '/personel', moduleKey: 'personnel_mobile' },
  { id: '12', name: 'Sakin Portalı', icon: Smartphone, href: '/sakin', moduleKey: 'resident_mobile' },
];

const settingsSubItems = [
  { id: '2', name: 'Kullanıcılar', icon: Users, href: '/admin/users', moduleKey: 'users' },
];


interface SortableMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function SortableMenuItem({ item, isActive, isCollapsed }: SortableMenuItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group relative z-10">
      <div {...attributes} {...listeners} className={cn("absolute -left-2 p-1 text-slate-600 opacity-0 group-hover:opacity-100 cursor-grab hover:text-slate-300 transition-opacity", isCollapsed && "hidden")}>
        <GripVertical className="w-4 h-4" />
      </div>

      <Link
        href={item.href}
        className={cn(
          "flex items-center w-full transition-all duration-300 relative",
          isCollapsed 
            ? "justify-center p-3 rounded-lg" 
            : "px-4 py-3 space-x-3 rounded-xl text-[13px]",
          isActive 
            ? "glass-active text-blue-400 font-medium border border-blue-500/30 bg-blue-950/30" 
            : "hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] hover:text-slate-200 text-slate-400"
        )}
        title={isCollapsed ? item.name : undefined}
      >
        <item.icon className={cn(isCollapsed ? "h-5 w-5" : "h-4 w-4", isActive ? "text-blue-400" : "text-slate-500")} />
        {!isCollapsed && <span>{item.name}</span>}
      </Link>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [menus, setMenus] = useState<MenuItem[]>(defaultMenus);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isSettingsHovered, setIsSettingsHovered] = useState<boolean>(false);
  const [isUserHovered, setIsUserHovered] = useState<boolean>(false);

  // Current User & Permissions State
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  } | null>(null);

  const isSettingsRouteActive = pathname.startsWith('/admin/settings') || pathname === '/admin/users';
  const showSettingsSub = isSettingsHovered || isSettingsRouteActive;


  useEffect(() => {
    setIsMounted(true);
    // Fetch Current User & Permissions
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    try {
      const savedCollapsed = localStorage.getItem('sidebar_collapsed');
      if (savedCollapsed === 'true') setIsCollapsed(true);

      const savedMenus = localStorage.getItem('sidebar_menus');
      if (savedMenus) {
        const parsedIds: string[] = JSON.parse(savedMenus);
        const reordered = parsedIds.map((id: string) => defaultMenus.find(m => m.id === id)).filter(Boolean) as MenuItem[];
        const missing = defaultMenus.filter(m => !reordered.some(r => r.id === m.id));
        setMenus([...reordered, ...missing]);
      }
    } catch {
      // LocalStorage hatası olursa varsayılan menüleri koru
    }
  }, []);

  const toggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    try {
      localStorage.setItem('sidebar_collapsed', newVal.toString());
    } catch {}
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMenus((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        try {
          const idsToSave = newItems.map(item => item.id);
          localStorage.setItem('sidebar_menus', JSON.stringify(idsToSave));
        } catch {}

        return newItems;
      });
    }
  };

  // Filter Menus based on User Permissions
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'serdardogruer@gmail.com';
  const parsedPermissions = currentUser ? parseUserPermissions(currentUser.permissions, isSuperAdmin) : null;

  const canViewSettings = isSuperAdmin || (parsedPermissions ? (parsedPermissions.modulePermissions?.settings?.view ?? parsedPermissions.modules.includes('settings')) : false);

  const visibleMenus = isSuperAdmin 
    ? menus 
    : menus.filter(m => parsedPermissions ? (parsedPermissions.modulePermissions?.[m.moduleKey]?.view ?? parsedPermissions.modules.includes(m.moduleKey)) : true);

  const visibleSettingsSub = isSuperAdmin
    ? settingsSubItems
    : settingsSubItems.filter(s => parsedPermissions ? (parsedPermissions.modulePermissions?.[s.moduleKey]?.view ?? parsedPermissions.modules.includes(s.moduleKey)) : true);





  return (
    <aside 
      className={cn(
        "relative flex flex-col z-40 transition-all duration-300 select-none glass-card-solid border-r border-slate-800/80 shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
      style={{
        background: 'linear-gradient(180deg, #090E17 0%, #05080E 100%)'
      }}
    >
      {/* Brand Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b border-slate-800/80 glass-divider relative",
        isCollapsed ? "justify-center" : "px-6"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 shrink-0">
              TF
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-slate-100 uppercase">Terrace Feri</span>
              <span className="text-[10px] text-blue-400 font-medium -mt-0.5 tracking-wider">TMM YÖNETİM</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            TF
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          className={cn(
            "p-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors cursor-pointer",
            isCollapsed && "hidden"
          )}
          title={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* When collapsed, a toggle trigger icon at the bottom of header */}
      {isCollapsed && (
        <button
          onClick={toggleCollapse}
          className="mx-auto my-2 p-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Menüyü Genişlet"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Navigation Links with Drag-and-Drop Reordering */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {isMounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleMenus.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {visibleMenus.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <SortableMenuItem
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        ) : (
          visibleMenus.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <div key={item.id} className="flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center w-full transition-all duration-300 relative",
                    isCollapsed 
                      ? "justify-center p-3 rounded-lg" 
                      : "px-4 py-3 space-x-3 rounded-xl text-[13px]",
                    isActive 
                      ? "glass-active text-blue-400 font-medium border border-blue-500/30 bg-blue-950/30" 
                      : "hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] hover:text-slate-200 text-slate-400"
                  )}
                >
                  <item.icon className={cn(isCollapsed ? "h-5 w-5" : "h-4 w-4", isActive ? "text-blue-400" : "text-slate-500")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </div>
            );
          })
        )}

        {/* System Settings & Submenu (Kullanıcılar & Personeller) */}
        {(canViewSettings || visibleSettingsSub.length > 0) && (

          <>
            {/* Separator */}
            <div className="pt-2 pb-1">
              <div className="border-t border-slate-800/60" />
            </div>

            <div 
              className="relative"
              onMouseEnter={() => setIsSettingsHovered(true)}
              onMouseLeave={() => setIsSettingsHovered(false)}
            >
              {canViewSettings ? (
                <Link
                  href="/admin/settings"

                  className={cn(
                    "flex items-center w-full transition-all duration-300 relative",
                    isCollapsed 
                      ? "justify-center p-3 rounded-lg" 
                      : "px-4 py-3 space-x-3 rounded-xl text-[13px]",
                    pathname === '/admin/settings'
                      ? "glass-active text-blue-400 font-medium border border-blue-500/30 bg-blue-950/30" 
                      : "hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] hover:text-slate-200 text-slate-400"
                  )}
                  title={isCollapsed ? "Sistem Ayarları" : undefined}
                >
                  <Settings className={cn(isCollapsed ? "h-5 w-5" : "h-4 w-4", pathname === '/admin/settings' ? "text-blue-400" : "text-slate-500")} />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Ayarlar</span>
                      {visibleSettingsSub.length > 0 && (
                        <ChevronRight className={cn("h-3.5 w-3.5 text-slate-500 transition-transform duration-200", showSettingsSub && "rotate-90 text-blue-400")} />
                      )}
                    </div>
                  )}
                </Link>
              ) : (
                <div
                  className={cn(
                    "flex items-center w-full transition-all duration-300 relative cursor-pointer",
                    isCollapsed 
                      ? "justify-center p-3 rounded-lg" 
                      : "px-4 py-3 space-x-3 rounded-xl text-[13px]",
                    "hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] hover:text-slate-200 text-slate-400"
                  )}
                  onClick={() => setIsSettingsHovered(!isSettingsHovered)}
                >
                  <Settings className={cn(isCollapsed ? "h-5 w-5" : "h-4 w-4", "text-slate-500")} />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Yönetim</span>
                      <ChevronRight className={cn("h-3.5 w-3.5 text-slate-500 transition-transform duration-200", showSettingsSub && "rotate-90 text-blue-400")} />
                    </div>
                  )}
                </div>
              )}


              {/* Submenu Items (Kullanıcılar & Personeller) */}
              {showSettingsSub && !isCollapsed && visibleSettingsSub.length > 0 && (
                <div className="ml-4 pl-2 border-l border-slate-800/80 my-1 space-y-1 transition-all duration-300">
                  {visibleSettingsSub.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        className={cn(
                          "flex items-center w-full px-3 py-2 space-x-2.5 rounded-lg text-[12px] transition-colors",
                          isSubActive
                            ? "glass-active text-blue-400 font-medium border border-blue-500/30 bg-blue-950/30"
                            : "hover:bg-white/[0.06] text-slate-400 hover:text-slate-200"
                        )}
                      >
                        <sub.icon className={cn("h-3.5 w-3.5", isSubActive ? "text-blue-400" : "text-slate-500")} />
                        <span>{sub.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Collapsed Sidebar Flyout Popover */}
              {isCollapsed && isSettingsHovered && (
                <div className="absolute left-full top-0 ml-2 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-2 shadow-2xl z-50 space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2.5 py-1">Yönetim & Ayarlar</div>
                  {canViewSettings && (
                    <Link
                      href="/admin/settings"

                      className={cn("flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors", pathname === '/admin/settings' ? 'text-blue-400 font-bold bg-blue-900/20' : 'text-slate-300 hover:bg-slate-800')}
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Genel Ayarlar</span>
                    </Link>
                  )}

                  {visibleSettingsSub.map(sub => (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      className={cn("flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors", pathname === sub.href ? 'text-blue-400 font-bold bg-blue-900/20' : 'text-slate-300 hover:bg-slate-800')}
                    >
                      <sub.icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sub.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </nav>

      {/* Bottom Sidebar Footer: User Profile & Logout */}
      <div className={cn("p-4 border-t border-slate-800/80 glass-divider flex items-center justify-between", isCollapsed && "flex-col gap-3 py-4 px-2")}>
        {/* User Avatar & Info (Hover Popover) */}
        <div 
          className="relative flex-1"
          onMouseEnter={() => setIsUserHovered(true)}
          onMouseLeave={() => setIsUserHovered(false)}
        >
          <div 
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer group"
            title="Kullanıcı Profili"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/30 to-[#F97316]/30 border border-[#F97316]/40 flex items-center justify-center text-[#F97316] font-bold text-xs shadow-sm shrink-0">
              <User className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#F97316] leading-none truncate max-w-[120px]">
                  {currentUser?.role === 'ADMIN' ? 'Sistem Yöneticisi' : 
                   currentUser?.role === 'TECHNICAL' ? 'Teknik Personel' : 
                   currentUser?.role === 'SECURITY' ? 'Güvenlik Görevlisi' : 
                   currentUser?.role || 'Kullanıcı'}
                </span>
                <span className="text-xs font-semibold text-slate-200 leading-tight mt-0.5 max-w-[120px] truncate">
                  {currentUser?.name || 'Serdar DOĞRUER'}
                </span>
              </div>
            )}
          </div>

          {/* User Popover on Hover */}
          {isUserHovered && (
            <div className={cn("absolute bottom-full mb-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl z-50 min-w-52 animate-in fade-in slide-in-from-bottom-1 duration-150", isCollapsed ? "left-full ml-2 bottom-0 mb-0" : "left-0")}>
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#F97316]/20 border border-[#F97316]/30 flex items-center justify-center text-[#F97316] font-bold text-xs">
                  {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TF'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none">{currentUser?.name || 'Serdar DOĞRUER'}</div>
                  <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                    {currentUser?.role === 'ADMIN' ? 'Süper Admin' : currentUser?.role || 'Kullanıcı'}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 truncate mb-2">{currentUser?.email || 'serdardogruer@gmail.com'}</div>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                  } finally {
                    window.location.href = '/login';
                  }
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg text-red-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
              } finally {
                window.location.href = '/login';
              }
            }}
            className="p-2 glass-surface bg-slate-900/80 border border-slate-800 hover:bg-red-950/40 hover:border-red-500/40 hover:text-red-400 rounded-xl transition-all text-slate-400 cursor-pointer"
            title="Güvenli Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
