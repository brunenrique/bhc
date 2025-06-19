
"use client";
import React, { type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface WithRoleProps {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode; // Optional fallback UI if role doesn't match
}

export function WithRole({ role, children, fallback = null }: WithRoleProps) {
  const { user, isLoading } = useAuth();
  const child = React.Children.only(children);

  if (isLoading) {
    // Optionally return a loader, or null to render nothing during load
    return null; 
  }

  if (!user) {
    return <>{fallback}</>; // Or redirect, or specific "access denied" UI
  }

  const rolesToCheck = Array.isArray(role) ? role : [role];
  if (rolesToCheck.includes(user.role)) {
    return <>{child}</>;
  }

  return <>{fallback}</>;
}
