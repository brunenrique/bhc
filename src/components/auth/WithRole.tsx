
"use client";
import type { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface WithRoleProps {
  role: UserRole | UserRole[];
  children?: ReactNode;
  fallback?: ReactNode; // Optional fallback UI if role doesn't match
}

export function WithRole({ role, children, fallback = null }: WithRoleProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Optionally return a loader, or null to render nothing during load
    return null; 
  }

  if (!user) {
    return <>{fallback}</>; // Or redirect, or specific "access denied" UI
  }

  const rolesToCheck = Array.isArray(role) ? role : [role];
  if (rolesToCheck.includes(user.role)) {
    return <>{children ?? fallback}</>;
  }

  return <>{fallback}</>;
}

WithRole.propTypes = {
  children: PropTypes.element.isRequired,
};
