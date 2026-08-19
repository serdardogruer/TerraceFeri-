export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface ModuleDefinition {
  key: string;
  label: string;
  description: string;
  category: 'core' | 'operations' | 'admin';
}

export const ALL_SYSTEM_MODULES: ModuleDefinition[] = [
  { key: 'dashboard', label: 'Genel Bakış & Özet', description: 'Ana kontrol paneli ve özet istatistikler', category: 'core' },
  { key: 'areas', label: 'Alanlar & Ortak Tesis', description: 'Bloklar, katlar ve mekan tanımları', category: 'operations' },
  { key: 'apartments', label: 'Daireler & Sakinler', description: 'Bağımsız bölüm ve sakin kayıtları', category: 'operations' },
  { key: 'equipments', label: 'Ekipmanlar & Envanter', description: 'Cihazlar, makineler ve demirbaşlar', category: 'operations' },
  { key: 'faults', label: 'Arızalar & Rutin Görevler', description: 'Teknik arıza ve periyodik bakım takibi', category: 'operations' },
  { key: 'meters', label: 'Sayaç Takibi & Tüketim', description: 'Elektrik, su, doğalgaz endeks girişleri', category: 'operations' },
  { key: 'management', label: 'Yönetim Masası & Talepler', description: 'Yönetim talepleri ve resmi kayıtlar', category: 'operations' },
  { key: 'personnel', label: 'Personel & PDKS', description: 'Çalışanlar, vardiya ve QR devriye', category: 'operations' },
  { key: 'companies', label: 'Anlaşmalı Firmalar', description: 'Hizmet sağlayıcı ve tedarikçi firmalar', category: 'admin' },
  { key: 'users', label: 'Kullanıcı Yönetimi', description: 'Sistem kullanıcıları ve rol/yetki atamaları', category: 'admin' },
  { key: 'settings', label: 'Sistem Ayarları', description: 'Konum, Wi-Fi ve genel yapılandırma', category: 'admin' },
];

export interface UserPermissions {
  modules: string[];
  modulePermissions: Record<string, ModulePermission>;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

function createFullModulePermissions(viewOnly = false): Record<string, ModulePermission> {
  const result: Record<string, ModulePermission> = {};
  for (const mod of ALL_SYSTEM_MODULES) {
    result[mod.key] = {
      view: true,
      create: !viewOnly,
      edit: !viewOnly,
      delete: !viewOnly,
    };
  }
  return result;
}

export const SUPER_ADMIN_PERMISSIONS: UserPermissions = {
  modules: ALL_SYSTEM_MODULES.map(m => m.key),
  modulePermissions: createFullModulePermissions(false),
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canExport: true,
};

export const DEFAULT_PERMISSIONS: UserPermissions = {
  modules: ['dashboard', 'faults', 'meters', 'equipments'],
  modulePermissions: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    faults: { view: true, create: true, edit: true, delete: false },
    meters: { view: true, create: true, edit: true, delete: false },
    equipments: { view: true, create: false, edit: false, delete: false },
    areas: { view: false, create: false, edit: false, delete: false },
    apartments: { view: false, create: false, edit: false, delete: false },
    management: { view: false, create: false, edit: false, delete: false },
    personnel: { view: false, create: false, edit: false, delete: false },
    companies: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  canCreate: true,
  canEdit: true,
  canDelete: false,
  canExport: true,
};

export function parseUserPermissions(raw: any, isSuperAdmin: boolean): UserPermissions {
  if (isSuperAdmin) {
    return SUPER_ADMIN_PERMISSIONS;
  }

  if (!raw) {
    return DEFAULT_PERMISSIONS;
  }

  // If raw is an array (legacy format)
  if (Array.isArray(raw)) {
    const modulePerms: Record<string, ModulePermission> = {};
    for (const mod of ALL_SYSTEM_MODULES) {
      const isAllowed = raw.includes(mod.key);
      modulePerms[mod.key] = {
        view: isAllowed,
        create: isAllowed,
        edit: isAllowed,
        delete: false,
      };
    }

    return {
      modules: raw,
      modulePermissions: modulePerms,
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canExport: true,
    };
  }

  // If raw has new granular `modulePermissions`
  if (raw.modulePermissions && typeof raw.modulePermissions === 'object') {
    const modulePerms: Record<string, ModulePermission> = {};
    const activeModules: string[] = [];

    for (const mod of ALL_SYSTEM_MODULES) {
      const p = raw.modulePermissions[mod.key];
      if (p) {
        modulePerms[mod.key] = {
          view: Boolean(p.view),
          create: Boolean(p.create),
          edit: Boolean(p.edit),
          delete: Boolean(p.delete),
        };
        if (p.view) {
          activeModules.push(mod.key);
        }
      } else {
        // Fallback for missing module definition in object
        const isLegacyInArray = Array.isArray(raw.modules) && raw.modules.includes(mod.key);
        modulePerms[mod.key] = {
          view: isLegacyInArray,
          create: isLegacyInArray && Boolean(raw.canCreate ?? true),
          edit: isLegacyInArray && Boolean(raw.canEdit ?? true),
          delete: isLegacyInArray && Boolean(raw.canDelete ?? false),
        };
        if (isLegacyInArray) activeModules.push(mod.key);
      }
    }

    return {
      modules: activeModules,
      modulePermissions: modulePerms,
      canCreate: raw.canCreate !== undefined ? Boolean(raw.canCreate) : true,
      canEdit: raw.canEdit !== undefined ? Boolean(raw.canEdit) : true,
      canDelete: raw.canDelete !== undefined ? Boolean(raw.canDelete) : false,
      canExport: raw.canExport !== undefined ? Boolean(raw.canExport) : true,
    };
  }

  // If raw is an older object with only `modules` array and global canCreate/canEdit/canDelete
  const legacyModules = Array.isArray(raw.modules) ? raw.modules : DEFAULT_PERMISSIONS.modules;
  const globalCanCreate = raw.canCreate !== undefined ? Boolean(raw.canCreate) : true;
  const globalCanEdit = raw.canEdit !== undefined ? Boolean(raw.canEdit) : true;
  const globalCanDelete = raw.canDelete !== undefined ? Boolean(raw.canDelete) : false;

  const modulePerms: Record<string, ModulePermission> = {};
  for (const mod of ALL_SYSTEM_MODULES) {
    const isAllowed = legacyModules.includes(mod.key);
    modulePerms[mod.key] = {
      view: isAllowed,
      create: isAllowed ? globalCanCreate : false,
      edit: isAllowed ? globalCanEdit : false,
      delete: isAllowed ? globalCanDelete : false,
    };
  }

  return {
    modules: legacyModules,
    modulePermissions: modulePerms,
    canCreate: globalCanCreate,
    canEdit: globalCanEdit,
    canDelete: globalCanDelete,
    canExport: raw.canExport !== undefined ? Boolean(raw.canExport) : true,
  };
}

