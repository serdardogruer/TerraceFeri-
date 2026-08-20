'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, CheckCircle2, XCircle, 
  Edit3, Trash2, Key, Lock, Mail, UserCheck, 
  Search, ShieldAlert, Sparkles, Check, AlertTriangle, Crown,
  PlusCircle, FileSpreadsheet, Ban, ShieldCheck, Eye, EyeOff, ToggleLeft, ToggleRight
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { 
  parseUserPermissions, 
  UserPermissions, 
  SUPER_ADMIN_PERMISSIONS, 
  ALL_SYSTEM_MODULES, 
  ModulePermission, 
  ModuleDefinition 
} from '@/lib/permissions';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICAL' | 'SECURITY' | 'CLEANING' | 'RESIDENT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  permissions: any;
  lastLogin: string | null;
  createdAt: string;
}

const MODULE_ICONS: Record<string, string> = {
  dashboard: '📊',
  areas: '🗺️',
  apartments: '🏢',
  equipments: '⚙️',
  faults: '⚠️',
  meters: '⚡',
  companies: '💼',
  management: '📨',
  personnel: '👥',
  users: '👤',
  settings: '⚙️',
};

const ROLE_TEMPLATES: Record<string, Record<string, ModulePermission>> = {
  ADMIN: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    areas: { view: true, create: true, edit: true, delete: false },
    apartments: { view: true, create: true, edit: true, delete: false },
    equipments: { view: true, create: true, edit: true, delete: false },
    faults: { view: true, create: true, edit: true, delete: false },
    meters: { view: true, create: true, edit: true, delete: false },
    management: { view: true, create: true, edit: true, delete: false },
    personnel: { view: true, create: true, edit: true, delete: false },
    companies: { view: true, create: true, edit: true, delete: false },
    users: { view: true, create: false, edit: false, delete: false },
    settings: { view: true, create: false, edit: false, delete: false },
  },
  TECHNICAL: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    areas: { view: true, create: false, edit: false, delete: false },
    apartments: { view: false, create: false, edit: false, delete: false },
    equipments: { view: true, create: true, edit: true, delete: false },
    faults: { view: true, create: true, edit: true, delete: false },
    meters: { view: true, create: true, edit: true, delete: false },
    management: { view: false, create: false, edit: false, delete: false },
    personnel: { view: false, create: false, edit: false, delete: false },
    companies: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  SECURITY: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    areas: { view: true, create: false, edit: false, delete: false },
    apartments: { view: false, create: false, edit: false, delete: false },
    equipments: { view: false, create: false, edit: false, delete: false },
    faults: { view: true, create: true, edit: false, delete: false },
    meters: { view: false, create: false, edit: false, delete: false },
    management: { view: false, create: false, edit: false, delete: false },
    personnel: { view: true, create: false, edit: false, delete: false },
    companies: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  CLEANING: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    areas: { view: true, create: false, edit: false, delete: false },
    apartments: { view: false, create: false, edit: false, delete: false },
    equipments: { view: false, create: false, edit: false, delete: false },
    faults: { view: true, create: true, edit: false, delete: false },
    meters: { view: false, create: false, edit: false, delete: false },
    management: { view: false, create: false, edit: false, delete: false },
    personnel: { view: false, create: false, edit: false, delete: false },
    companies: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  RESIDENT: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    areas: { view: false, create: false, edit: false, delete: false },
    apartments: { view: false, create: false, edit: false, delete: false },
    equipments: { view: false, create: false, edit: false, delete: false },
    faults: { view: true, create: true, edit: false, delete: false },
    meters: { view: false, create: false, edit: false, delete: false },
    management: { view: true, create: true, edit: false, delete: false },
    personnel: { view: false, create: false, edit: false, delete: false },
    companies: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
};

function getInitialModulePermissions(role: string): Record<string, ModulePermission> {
  const template = ROLE_TEMPLATES[role] || ROLE_TEMPLATES.ADMIN;
  const result: Record<string, ModulePermission> = {};
  for (const mod of ALL_SYSTEM_MODULES) {
    result[mod.key] = template[mod.key] || { view: false, create: false, edit: false, delete: false };
  }
  return result;
}

export default function UsersPage() {
  const { canCreate, canEdit, canDelete, isSuperAdmin: currentUserIsSuperAdmin } = useUserPermissions('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as UserItem['role'],
    status: 'ACTIVE' as UserItem['status'],
    modulePermissions: getInitialModulePermissions('ADMIN'),
    canExport: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Kullanıcılar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setShowModalPassword(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      status: 'ACTIVE',
      modulePermissions: getInitialModulePermissions('ADMIN'),
      canExport: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserItem) => {
    const isSuper = user.email === 'serdardogruer@gmail.com' || user.role === 'SUPER_ADMIN';
    setEditingUser(user);
    setShowModalPassword(false);
    const parsed = parseUserPermissions(user.permissions, isSuper);

    
    // Ensure all modules are populated in modulePermissions
    const completeModulePerms: Record<string, ModulePermission> = {};
    for (const mod of ALL_SYSTEM_MODULES) {
      completeModulePerms[mod.key] = parsed.modulePermissions?.[mod.key] || {
        view: parsed.modules.includes(mod.key),
        create: parsed.modules.includes(mod.key) && parsed.canCreate,
        edit: parsed.modules.includes(mod.key) && parsed.canEdit,
        delete: parsed.modules.includes(mod.key) && parsed.canDelete,
      };
    }

    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      modulePermissions: completeModulePerms,
      canExport: parsed.canExport,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: UserItem['role']) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      modulePermissions: getInitialModulePermissions(newRole),
    }));
  };

  // Toggle specific field on a module
  const handleTogglePerm = (moduleKey: string, field: 'view' | 'create' | 'edit' | 'delete') => {
    setFormData(prev => {
      const currentMod = prev.modulePermissions[moduleKey] || { view: false, create: false, edit: false, delete: false };
      const nextMod = { ...currentMod };

      if (field === 'view') {
        nextMod.view = !nextMod.view;
        // If viewing is disabled, disable create/edit/delete as well
        if (!nextMod.view) {
          nextMod.create = false;
          nextMod.edit = false;
          nextMod.delete = false;
        }
      } else {
        nextMod[field] = !nextMod[field];
        // If create/edit/delete is turned on, ensure view is also on
        if (nextMod[field]) {
          nextMod.view = true;
        }
      }

      return {
        ...prev,
        modulePermissions: {
          ...prev.modulePermissions,
          [moduleKey]: nextMod,
        }
      };
    });
  };

  // Toggle all actions for a specific module
  const handleToggleRowAll = (moduleKey: string) => {
    setFormData(prev => {
      const currentMod = prev.modulePermissions[moduleKey] || { view: false, create: false, edit: false, delete: false };
      const allActive = currentMod.view && currentMod.create && currentMod.edit && currentMod.delete;
      
      return {
        ...prev,
        modulePermissions: {
          ...prev.modulePermissions,
          [moduleKey]: {
            view: !allActive,
            create: !allActive,
            edit: !allActive,
            delete: !allActive,
          }
        }
      };
    });
  };

  // Quick Action: Grant full permissions to all modules
  const handleGrantAll = () => {
    const full: Record<string, ModulePermission> = {};
    for (const mod of ALL_SYSTEM_MODULES) {
      full[mod.key] = { view: true, create: true, edit: true, delete: true };
    }
    setFormData(prev => ({ ...prev, modulePermissions: full }));
  };

  // Quick Action: View only on all modules
  const handleViewOnlyAll = () => {
    const viewOnly: Record<string, ModulePermission> = {};
    for (const mod of ALL_SYSTEM_MODULES) {
      viewOnly[mod.key] = { view: true, create: false, edit: false, delete: false };
    }
    setFormData(prev => ({ ...prev, modulePermissions: viewOnly }));
  };

  // Quick Action: Reset to role template
  const handleResetTemplate = () => {
    setFormData(prev => ({
      ...prev,
      modulePermissions: getInitialModulePermissions(prev.role),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Lütfen ad soyad ve e-posta alanlarını doldurun.');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setFormError('Yeni kullanıcı için şifre belirlemek zorunludur.');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const activeModules = ALL_SYSTEM_MODULES
        .filter(m => formData.modulePermissions[m.key]?.view)
        .map(m => m.key);

      const hasAnyCreate = Object.values(formData.modulePermissions).some(p => p.create);
      const hasAnyEdit = Object.values(formData.modulePermissions).some(p => p.edit);
      const hasAnyDelete = Object.values(formData.modulePermissions).some(p => p.delete);

      const payloadPermissions: UserPermissions = {
        modules: activeModules,
        modulePermissions: formData.modulePermissions,
        canCreate: hasAnyCreate,
        canEdit: hasAnyEdit,
        canDelete: hasAnyDelete,
        canExport: formData.canExport,
      };

      const body = editingUser 
        ? { id: editingUser.id, ...formData, permissions: payloadPermissions }
        : { ...formData, permissions: payloadPermissions };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || 'İşlem başarısız oldu');
        return;
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Sunucu hatası oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setDeleteConfirmId(null);
        fetchUsers();
      } else {
        alert(data.message || 'Kullanıcı silinemedi');
      }
    } catch (err) {
      alert('Kullanıcı silinirken hata oluştu');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesQuery = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800/80">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Kullanıcı & Modül Yetkilendirme
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center">
                <Crown className="w-3 h-3 mr-1" /> Süper Admin Kontrolü
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Her kullanıcı için her modülde (Alanlar, Daireler, Sayaçlar vb.) <b>Görüntüleme, Ekleme, Düzenleme ve Silme</b> izinlerini bağımsız olarak yapılandırın.
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        {canCreate && (
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Yeni Kullanıcı Ekle
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card p-4 rounded-xl border border-slate-800/60">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="İsim veya e-posta ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Tümü' },
            { id: 'ADMIN', label: 'Yöneticiler' },
            { id: 'TECHNICAL', label: 'Teknik Ekip' },
            { id: 'SECURITY', label: 'Güvenlik' },
            { id: 'CLEANING', label: 'Temizlik' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                roleFilter === tab.id
                  ? "bg-[#070A11] border border-indigo-500/50 text-indigo-300 shadow-sm font-bold"
                  : "bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs rounded-xl">
            Kullanıcılar yükleniyor...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs rounded-xl">
            Kayıtlı kullanıcı bulunamadı.
          </div>
        ) : (
          filteredUsers.map(user => {
            const isSuperAdmin = user.email === 'serdardogruer@gmail.com' || user.role === 'SUPER_ADMIN';
            const parsedPerms = parseUserPermissions(user.permissions, isSuperAdmin);

            const activeModCount = parsedPerms.modules.length;
            const canCreateCount = Object.values(parsedPerms.modulePermissions).filter(p => p.create).length;
            const canEditCount = Object.values(parsedPerms.modulePermissions).filter(p => p.edit).length;
            const canDeleteCount = Object.values(parsedPerms.modulePermissions).filter(p => p.delete).length;

            return (
              <div
                key={user.id}
                className={cn(
                  "glass-card hover:border-slate-700/80 transition-all p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 group",
                  isSuperAdmin ? "border-amber-500/30 bg-amber-950/10" : "border-slate-800/70"
                )}
              >
                {/* Left Side: Avatar & Name & Email */}
                <div className="flex items-center space-x-3 min-w-[240px]">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0",
                    isSuperAdmin
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10"
                      : (user.role === 'ADMIN' ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-blue-500/10 border-blue-500/30 text-blue-400")
                  )}>
                    {isSuperAdmin ? <Crown className="w-5 h-5 text-amber-400" /> : user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-100">{user.name}</h3>
                      {isSuperAdmin && (
                        <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[10px] font-bold flex items-center">
                          <Crown className="w-2.5 h-2.5 mr-1" /> Süper Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-slate-400 mt-0.5 space-x-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Data Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-2xl">
                  {/* Box 1: ROL */}
                  <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm px-3">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">ROL</span>
                    <span className={cn(
                      "text-xs font-bold truncate max-w-full",
                      isSuperAdmin ? "text-amber-400" : "text-indigo-300"
                    )}>
                      {isSuperAdmin ? 'Süper Admin' : 
                       user.role === 'ADMIN' ? 'Yönetici' : 
                       user.role === 'TECHNICAL' ? 'Teknik Ekip' : 
                       user.role === 'SECURITY' ? 'Güvenlik' : 
                       user.role === 'CLEANING' ? 'Temizlik' : 'Sakin'}
                    </span>
                  </div>

                  {/* Box 2: MODÜL ERİŞİMİ */}
                  <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm px-3">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">MODÜLLER</span>
                    <span className={cn(
                      "text-xs font-bold truncate max-w-full",
                      isSuperAdmin ? "text-amber-300" : (activeModCount > 0 ? "text-indigo-300" : "text-rose-400")
                    )}>
                      {isSuperAdmin ? 'Tüm Modüller (11)' : `${activeModCount} / ${ALL_SYSTEM_MODULES.length} Modül`}
                    </span>
                  </div>

                  {/* Box 3: DETAYLI YETKİLER */}
                  <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm px-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">İŞLEM YETKİLERİ</span>
                    {isSuperAdmin ? (
                      <span className="text-[10px] text-amber-400 font-bold">Tam Yetkili</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className={cn("text-[9px] px-1 py-0.2 rounded font-bold", canCreateCount > 0 ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400" : "text-slate-600 line-through")} title={`${canCreateCount} modülde ekleme açık`}>
                          Ekle ({canCreateCount})
                        </span>
                        <span className={cn("text-[9px] px-1 py-0.2 rounded font-bold", canEditCount > 0 ? "bg-blue-950/40 border border-blue-500/30 text-blue-400" : "text-slate-600 line-through")} title={`${canEditCount} modülde düzenleme açık`}>
                          Düz ({canEditCount})
                        </span>
                        <span className={cn("text-[9px] px-1 py-0.2 rounded font-bold", canDeleteCount > 0 ? "bg-rose-950/50 border border-rose-500/40 text-rose-400" : "text-slate-600 line-through")} title={`${canDeleteCount} modülde silme açık`}>
                          Sil ({canDeleteCount})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Box 4: DURUM */}
                  <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm px-3">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">DURUM</span>
                    <span className={cn(
                      "text-xs font-bold flex items-center gap-1",
                      user.status === 'ACTIVE' ? "text-emerald-400" : "text-rose-400"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'ACTIVE' ? "bg-emerald-400" : "bg-rose-400")} />
                      {user.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                  {canEdit && (
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2.5 bg-[#070A11] border border-[#151B2B] hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Yetkileri ve Bilgileri Düzenle"
                    >
                      <Edit3 className="w-4 h-4 text-blue-400" />
                    </button>
                  )}

                  {canDelete && !isSuperAdmin && (
                    <button
                      onClick={() => setDeleteConfirmId(user.id)}
                      className="p-2.5 bg-[#070A11] border border-[#151B2B] hover:border-rose-900/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Kullanıcıyı Sil"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Kullanıcı Ekle / Yetki Düzenle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0B1120] border border-slate-700/80 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-[#070A11] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {editingUser ? `${editingUser.name} - Yetki ve Profil Düzenleme` : 'Yeni Kullanıcı Oluştur'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Modül bazlı yetkilendirme ile her sayfa için bağımsız izinler tanımlayın.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Info: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Saliha Demir"
                    className="w-full px-3 py-2 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    E-Posta / Kullanıcı Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Örn: saliha@terraceferi.com"
                    className="w-full px-3 py-2 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Password, Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {editingUser ? 'Şifre (Değişmeyecekse Boş Bırakın)' : 'Giriş Şifresi *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? '••••••••' : 'Şifre girin...'}
                      className="w-full pl-3 pr-9 py-2 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 p-1 rounded transition-colors cursor-pointer"
                      title={showModalPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                    >
                      {showModalPassword ? <EyeOff className="w-3.5 h-3.5 text-indigo-400" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>


                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Kullanıcı Rolü
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="ADMIN">Yönetici / Müdür</option>
                    <option value="TECHNICAL">Teknik Ekip</option>
                    <option value="SECURITY">Güvenlik Görevlisi</option>
                    <option value="CLEANING">Temizlik Personeli</option>
                    <option value="RESIDENT">Sakin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Hesap Durumu
                  </label>
                  <div className="flex items-center space-x-4 h-9">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'ACTIVE'}
                        onChange={() => setFormData({ ...formData, status: 'ACTIVE' })}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <span>Aktif</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'INACTIVE'}
                        onChange={() => setFormData({ ...formData, status: 'INACTIVE' })}
                        className="text-slate-600 focus:ring-0"
                      />
                      <span>Pasif</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION: MODÜL BAZLI DETAYLI YETKİLENDİRME MATRİSİ */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      Modül Bazlı Yetki Matrisi (Granular Permissions)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Her modül için kullanıcının hangi işlemleri yapabileceğini bağımsız olarak belirleyin.
                    </p>
                  </div>

                  {/* Hızlı Toplu Ayar Butonları */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleGrantAll}
                      className="text-[10px] text-emerald-300 hover:text-white px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/40 rounded-lg hover:bg-emerald-900/60 transition-colors cursor-pointer font-semibold"
                    >
                      ✓ Tüm Yetkileri Aç
                    </button>
                    <button
                      type="button"
                      onClick={handleViewOnlyAll}
                      className="text-[10px] text-blue-300 hover:text-white px-2.5 py-1 bg-blue-950/40 border border-blue-500/40 rounded-lg hover:bg-blue-900/60 transition-colors cursor-pointer font-semibold"
                    >
                      👁 Sadece Görüntüle
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTemplate}
                      className="text-[10px] text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      ↺ Rol Şablonu
                    </button>
                  </div>
                </div>

                {/* Modül Yetki Tablosu */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#070A11]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#05070d] border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Modül Adı & Tanımı</th>
                        <th className="py-2.5 px-3 text-center w-24">Görüntüle</th>
                        <th className="py-2.5 px-3 text-center w-24">Ekleme</th>
                        <th className="py-2.5 px-3 text-center w-24">Düzenleme</th>
                        <th className="py-2.5 px-3 text-center w-24">Silme</th>
                        <th className="py-2.5 px-3 text-center w-20">Hızlı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {ALL_SYSTEM_MODULES.map(mod => {
                        const perm = formData.modulePermissions[mod.key] || { view: false, create: false, edit: false, delete: false };
                        const isAllActive = perm.view && perm.create && perm.edit && perm.delete;

                        return (
                          <tr key={mod.key} className="hover:bg-slate-800/20 transition-colors">
                            {/* Modül Tanımı */}
                            <td className="py-2 px-3">
                              <div className="flex items-center space-x-2.5">
                                <span className="text-base">{MODULE_ICONS[mod.key] || '📦'}</span>
                                <div>
                                  <div className="font-bold text-slate-200 text-xs">{mod.label}</div>
                                  <div className="text-[10px] text-slate-500">{mod.description}</div>
                                </div>
                              </div>
                            </td>

                            {/* 1. GÖRÜNTÜLE */}
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePerm(mod.key, 'view')}
                                className={cn(
                                  "w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-bold transition-all border cursor-pointer",
                                  perm.view
                                    ? "bg-indigo-950/50 border-indigo-500/50 text-indigo-300"
                                    : "bg-[#0B1120] border-slate-800 text-slate-600 hover:border-slate-700"
                                )}
                                title={perm.view ? 'Görüntüleme Açık' : 'Görüntüleme Kapalı'}
                              >
                                {perm.view ? '✓' : '✕'}
                              </button>
                            </td>

                            {/* 2. EKLEME */}
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePerm(mod.key, 'create')}
                                className={cn(
                                  "w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-bold transition-all border cursor-pointer",
                                  perm.create
                                    ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-400"
                                    : "bg-[#0B1120] border-slate-800 text-slate-600 hover:border-slate-700"
                                )}
                                title={perm.create ? 'Ekleme Yetkisi Açık' : 'Ekleme Kapalı'}
                              >
                                {perm.create ? '✓' : '✕'}
                              </button>
                            </td>

                            {/* 3. DÜZENLEME */}
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePerm(mod.key, 'edit')}
                                className={cn(
                                  "w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-bold transition-all border cursor-pointer",
                                  perm.edit
                                    ? "bg-blue-950/50 border-blue-500/50 text-blue-400"
                                    : "bg-[#0B1120] border-slate-800 text-slate-600 hover:border-slate-700"
                                )}
                                title={perm.edit ? 'Düzenleme Yetkisi Açık' : 'Düzenleme Kapalı'}
                              >
                                {perm.edit ? '✓' : '✕'}
                              </button>
                            </td>

                            {/* 4. SİLME */}
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePerm(mod.key, 'delete')}
                                className={cn(
                                  "w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-bold transition-all border cursor-pointer",
                                  perm.delete
                                    ? "bg-rose-950/60 border-rose-500/60 text-rose-400 animate-pulse"
                                    : "bg-[#0B1120] border-slate-800 text-slate-600 hover:border-slate-700"
                                )}
                                title={perm.delete ? '⚠️ Silme Yetkisi Açık' : 'Silme Kapalı'}
                              >
                                {perm.delete ? '✓' : '✕'}
                              </button>
                            </td>

                            {/* Satır Hızlı İşlem */}
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleRowAll(mod.key)}
                                className={cn(
                                  "text-[10px] px-2 py-1 rounded border transition-colors cursor-pointer font-medium",
                                  isAllActive
                                    ? "bg-amber-950/30 border-amber-500/30 text-amber-400 hover:bg-amber-900/40"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                                )}
                              >
                                {isAllActive ? 'Kapat' : 'Tümü'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="flex items-center justify-end space-x-3 pt-5 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 hover:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  İptal
                </button>

                {((editingUser && canEdit) || (!editingUser && canCreate)) && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-2 bg-indigo-900/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : (editingUser ? 'Yetkileri Kaydet' : 'Kullanıcıyı Oluştur')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0F1D] border border-red-900/40 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-white">Kullanıcıyı Sil</h3>
            </div>
            <p className="text-xs text-slate-400">
              Bu kullanıcıyı sistemden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-transparent border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmId)}
                className="px-5 py-2 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-lg hover:bg-rose-900/60 cursor-pointer"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
