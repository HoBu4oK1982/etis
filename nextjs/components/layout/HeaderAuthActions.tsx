"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound, UserRoundPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  logoutUser,
  type AuthUser,
} from "@/lib/api/auth";

export function HeaderAuthActions() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const sync = useCallback(() => {
    setUser(getStoredToken() ? getStoredUser() : null);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("etis:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("etis:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const logout = async () => {
    const token = getStoredToken();
    try {
      if (token) await logoutUser(token);
    } catch {
      // Локальный выход всё равно должен сработать.
    } finally {
      clearAuth();
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-5 shrink-0">
        <Link
          href="/account"
          className="flex items-center gap-2 text-[var(--text)] hover:text-[var(--accent)] transition-colors"
        >
          <span className="text-[var(--accent)]"><UserRound size={19} /></span>
          <span className="hidden lg:inline text-sm font-medium">{user.name.split(" ")[0]}</span>
          <span className="lg:hidden text-sm font-medium">Кабинет</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 text-[var(--text)] hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden xl:inline text-sm font-medium">Выйти</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5 shrink-0">
      <Link href="/login" className="flex items-center gap-2 text-[var(--text)] hover:text-[var(--accent)] transition-colors">
        <span className="text-[var(--accent)]"><UserRound size={19} /></span>
        <span className="text-sm font-medium">Вход</span>
      </Link>
      <Link href="/register" className="hidden md:flex items-center gap-2 text-[var(--text)] hover:text-[var(--accent)] transition-colors">
        <span className="text-[var(--accent)]"><UserRoundPlus size={19} /></span>
        <span className="text-sm font-medium">Регистрация</span>
      </Link>
    </div>
  );
}
