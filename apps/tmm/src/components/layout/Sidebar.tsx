'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, Map, Zap, Settings, 
  Building, ChevronLeft, ChevronRight, GripVertical, Cpu, AlertTriangle, Briefcase, UserCheck, Bell, User, Bot
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

interface MenuItem {
  id: string;
  name: string;
  icon: React.ElementType;
  href: string;
}

const defaultMenus: MenuItem[] = [
  { id: '1', name: 'Dashboard', icon: Home, href: '/admin' },
  { id: '3', name: 'Alanlar', icon: Map, href: '/admin/areas' },
  { id: '4', name: 'Daireler', icon: Building, href: '/admin/apartments' },
  { id: '5', name: 'Ekipmanlar', icon: Cpu, href: '/admin/equipments' },
  { id: '6', name: 'Arızalar', icon: AlertTriangle, href: '/admin/faults' },
  { id: '7', name: 'Sayaçlar', icon: Zap, href: '/admin/meters' },
  { id: '8', name: 'Firmalar', icon: Briefcase, href: '/admin/settings/companies' },
];

const settingsSubItems = [
  { id: '2', name: 'Kullanıcılar', icon: Users, href: '/admin/users' },
  { id: '10', name: 'Personeller', icon: UserCheck, href: '/admin/personnel' },
  { id: '11', name: 'AI & WhatsApp Bot', icon: Bot, href: '/admin/settings/ai-bot' },
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
            ? "glass-active text-blue-400 font-medium" 
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
  const [isMounted, setIsMounted] = useState(false);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);

  const isSettingsRouteActive = pathname.startsWith('/admin/settings') || pathname === '/admin/users' || pathname === '/admin/personnel';
  const showSettingsSub = isSettingsHovered || isSettingsRouteActive;

  useEffect(() => {
    setIsMounted(true);
    const savedCollapsed = localStorage.getItem('sidebar_collapsed');
    if (savedCollapsed === 'true') setIsCollapsed(true);

    const savedMenus = localStorage.getItem('sidebar_menus');
    if (savedMenus) {
      try {
        const parsedIds: string[] = JSON.parse(savedMenus);
        const reordered = parsedIds.map((id: string) => defaultMenus.find(m => m.id === id)).filter(Boolean) as MenuItem[];
        if (reordered.length === defaultMenus.length) {
          setMenus(reordered);
        }
      } catch {
        setMenus(defaultMenus);
      }
    }
  }, []);

  const toggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('sidebar_collapsed', newVal.toString());
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMenus((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('sidebar_menus', JSON.stringify(newItems.map(i => i.id)));
        return newItems;
      });
    }
  };

  if (!isMounted) {
    return (
      <aside className="w-72 glass-panel min-h-screen hidden lg:block" />
    );
  }

  return (
    <aside className={cn(
      "glass-panel text-slate-400 min-h-screen flex flex-col transition-all duration-300 relative z-20",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Collapse Toggle */}
      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-8 glass-surface rounded-full p-1.5 text-slate-400 hover:text-white z-50 transition-all duration-200 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo Area */}
      <div className={cn("h-24 flex items-center border-b glass-divider", isCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg glass-surface flex items-center justify-center shrink-0 glass-glow-amber">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px] text-[#C5A55B]">
              <rect x="9.5" y="7" width="5" height="2.5" />
              <rect x="6.5" y="11.5" width="11" height="2.5" />
              <rect x="3.5" y="16" width="17" height="2.5" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="whitespace-nowrap overflow-hidden flex flex-col justify-center mt-1">
              <div className="text-[15px] tracking-widest leading-none font-medium">
                <span className="text-white">TERRACE</span><span className="text-[#C5A55B]">FERİ</span>
              </div>
              <div className="text-[7px] text-slate-500 font-bold tracking-[0.25em] mt-1.5 ml-0.5">
                PREMIUM RESIDENCE
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={menus} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {menus.map((item) => (
                <SortableMenuItem key={item.id} item={item} isActive={pathname === item.href} isCollapsed={isCollapsed} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Genel Ayarlar & Mouse Hover Submenu */}
        <div 
          className="relative group/settings mt-2"
          onMouseEnter={() => setIsSettingsHovered(true)}
          onMouseLeave={() => setIsSettingsHovered(false)}
        >
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center w-full transition-all duration-300 relative",
              isCollapsed ? "justify-center p-3 rounded-lg" : "px-4 py-3 space-x-3 rounded-xl text-[13px]",
              isSettingsRouteActive 
                ? "glass-active text-blue-400 font-medium" 
                : "hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] hover:text-slate-200 text-slate-400"
            )}
            title={isCollapsed ? "Genel Ayarlar" : undefined}
          >
            <Settings className={cn(isCollapsed ? "h-5 w-5" : "h-4 w-4", isSettingsRouteActive ? "text-blue-400" : "text-slate-500")} />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Genel Ayarlar</span>
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-200 text-slate-500", showSettingsSub && "rotate-90 text-blue-400")} />
              </div>
            )}
          </Link>

          {/* Submenu Items (Kullanıcılar, Personeller, AI & WhatsApp Bot) */}
          {showSettingsSub && !isCollapsed && (
            <div className="ml-4 pl-2 border-l border-slate-800/80 my-1 space-y-1 transition-all duration-300">
              {settingsSubItems.map((sub) => {
                const isSubActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.id}
                    href={sub.href}
                    className={cn(
                      "flex items-center w-full px-3 py-2 space-x-2.5 rounded-lg text-[12px] transition-colors",
                      isSubActive
                        ? "glass-active text-blue-400 font-medium"
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

          {/* Collapsed Sidebar Mouse Hover Flyout Popover */}
          {isCollapsed && isSettingsHovered && (
            <div className="absolute left-full top-0 ml-2 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-2 shadow-2xl z-50 space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2.5 py-1">Genel Ayarlar</div>
              <Link
                href="/admin/settings"
                className={cn("flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors", pathname === '/admin/settings' ? 'text-blue-400 font-bold bg-blue-900/20' : 'text-slate-300 hover:bg-slate-800')}
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Genel Ayarlar</span>
              </Link>
              <Link
                href="/admin/users"
                className={cn("flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors", pathname === '/admin/users' ? 'text-blue-400 font-bold bg-blue-900/20' : 'text-slate-300 hover:bg-slate-800')}
              >
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Kullanıcılar</span>
              </Link>
              <Link
                href="/admin/personnel"
                className={cn("flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors", pathname === '/admin/personnel' ? 'text-blue-400 font-bold bg-blue-900/20' : 'text-slate-300 hover:bg-slate-800')}
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Personeller</span>
              </Link>
              <Link
                href="/admin/settings/ai-bot"
                className={cn("flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors", pathname === '/admin/settings/ai-bot' ? 'text-blue-400 font-bold bg-blue-900/20' : 'text-slate-300 hover:bg-slate-800')}
              >
                <Bot className="w-3.5 h-3.5 text-slate-400" />
                <span>AI & WhatsApp Bot</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Sidebar Footer: Notifications & User Profile */}
      <div className={cn("p-4 border-t glass-divider flex items-center justify-between", isCollapsed && "flex-col gap-3 py-4 px-2")}>
        {/* User Avatar & Info (Hover Popover) */}
        <div 
          className="relative"
          onMouseEnter={() => setIsUserHovered(true)}
          onMouseLeave={() => setIsUserHovered(false)}
        >
          <button 
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer group"
            title="Kullanıcı Profili"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shadow-sm shrink-0">
              <User className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 leading-none">Yönetici Oturumu</span>
                <span className="text-xs font-semibold text-slate-200 leading-tight mt-0.5 max-w-[120px] truncate">admin@terraceferi.com</span>
              </div>
            )}
          </button>

          {/* User Popover on Hover */}
          {isUserHovered && (
            <div className={cn("absolute bottom-full mb-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl z-50 min-w-48 animate-in fade-in slide-in-from-bottom-1 duration-150", isCollapsed ? "left-full ml-2 bottom-0 mb-0" : "left-0")}>
              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Yönetici Oturumu</div>
              <div className="text-xs font-semibold text-white mt-0.5 truncate">admin@terraceferi.com</div>
            </div>
          )}
        </div>

        {/* Notification Bell Button */}
        <button 
          className="relative p-2 glass-surface hover:bg-white/[0.08] rounded-xl transition-all text-slate-400 hover:text-slate-200"
          title="Bildirimler"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#060B14]/50" />
        </button>
      </div>
    </aside>
  );
}
