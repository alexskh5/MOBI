import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Navigate,
} from "react-router-dom";

import {
  supabaseAuth,
} from "../../config/supabaseAuth";
import {
  getStaffSecurityStatus,
  type StaffRole,
} from "../../services/auth/staffAuthApi";

export default function ProfessionalRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: StaffRole;
}) {
  const [checking, setChecking] =
    useState(true);
  const [redirectTo, setRedirectTo] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const role = localStorage.getItem(
        "mobi_staff_role",
      ) as StaffRole | null;
      const profileId = localStorage.getItem(
        "mobi_staff_profile_id",
      );

      if (
        !role ||
        !profileId ||
        (requiredRole && role !== requiredRole)
      ) {
        if (mounted) {
          setRedirectTo("/login");
          setChecking(false);
        }
        return;
      }

      const {
        data: { session },
      } = await supabaseAuth.auth.getSession();

      if (!session) {
        if (mounted) {
          setRedirectTo("/login");
          setChecking(false);
        }
        return;
      }

      try {
        const result = await getStaffSecurityStatus(
          role,
          profileId,
          session.access_token,
        );

        if (!mounted) return;

        if (result.security.requiresPasswordSetup) {
          localStorage.setItem(
            "mobi_password_setup_required",
            "true",
          );
          setRedirectTo(
            "/professional/setup-password",
          );
          return;
        }

        localStorage.removeItem(
          "mobi_password_setup_required",
        );
      } catch {
        if (!mounted) return;
        setRedirectTo("/login");
      } finally {
        if (mounted) setChecking(false);
      }
    }

    void checkAccess();
    return () => {
      mounted = false;
    };
  }, [requiredRole]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F5F9] text-sm font-semibold text-slate-600">
        Verifying secure session...
      </div>
    );
  }

  if (redirectTo) {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  return <>{children}</>;
}
