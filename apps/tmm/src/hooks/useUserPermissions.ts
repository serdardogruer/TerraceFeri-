'use client';

import { useState, useEffect } from 'react';
import { UserPermissions, DEFAULT_PERMISSIONS, SUPER_ADMIN_PERMISSIONS, parseUserPermissions, ModulePermission } from '@/lib/permissions';

export function useUserPermissions(targetModuleKey?: string) {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    permissions: UserPermissions;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isSuperAdmin = currentUser?.email === 'serdardogruer@gmail.com' || currentUser?.role === 'SUPER_ADMIN';
  const permissions: UserPermissions = isSuperAdmin 
    ? SUPER_ADMIN_PERMISSIONS 
    : (currentUser?.permissions ? parseUserPermissions(currentUser.permissions, false) : DEFAULT_PERMISSIONS);

  const getModulePermissions = (moduleKey: string): ModulePermission => {
    if (isSuperAdmin) {
      return { view: true, create: true, edit: true, delete: true };
    }
    const modPerm = permissions.modulePermissions?.[moduleKey];
    if (modPerm) {
      return modPerm;
    }
    const hasMod = permissions.modules.includes(moduleKey);
    return {
      view: hasMod,
      create: hasMod && (permissions.canCreate ?? true),
      edit: hasMod && (permissions.canEdit ?? true),
      delete: hasMod && (permissions.canDelete ?? false),
    };
  };

  // If a specific module key is provided to the hook, compute context-specific permissions
  const targetModulePerm = targetModuleKey ? getModulePermissions(targetModuleKey) : null;

  return {
    currentUser,
    loading,
    isSuperAdmin,
    permissions,
    canView: targetModulePerm ? targetModulePerm.view : true,
    canCreate: isSuperAdmin ? true : (targetModulePerm ? targetModulePerm.create : permissions.canCreate),
    canEdit: isSuperAdmin ? true : (targetModulePerm ? targetModulePerm.edit : permissions.canEdit),
    canDelete: isSuperAdmin ? true : (targetModulePerm ? targetModulePerm.delete : permissions.canDelete),
    canExport: isSuperAdmin ? true : permissions.canExport,
    hasModule: (moduleKey: string) => isSuperAdmin || permissions.modules.includes(moduleKey) || Boolean(permissions.modulePermissions?.[moduleKey]?.view),
    getModulePermissions,
  };
}

