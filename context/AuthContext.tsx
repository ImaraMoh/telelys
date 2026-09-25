"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { User, Retailer } from "@/types";

import {
  authApi,
  setStoredToken,
  getStoredToken,
  clearStoredToken,
} from "@/lib/api";

import {
  Language,
  translations,
} from "@/lib/i18n";

/*
 * =========================================================
 * AUTH CONTEXT TYPE
 * =========================================================
 */

interface AuthContextType {
  user: User | null;

  role: "ADMIN" | "RETAILER" | null;

  retailer: Retailer | null;

  token: string | null;

  isLoading: boolean;

  lang: Language;

  setLang: (lang: Language) => void;

  t: typeof translations["en"];

  activeTab: string;

  setActiveTab: (tab: string) => void;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  demoLogin: (email: string) => Promise<void>;

  logout: () => void;

  refreshMe: () => Promise<void>;
}

/*
 * =========================================================
 * CONTEXT
 * =========================================================
 */

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

/*
 * =========================================================
 * AUTH PROVIDER
 * =========================================================
 */

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const [retailer, setRetailer] =
    useState<Retailer | null>(null);

  // Lazy initialize token from client storage
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return getStoredToken();
    }
    return null;
  });

  const [isLoading] = useState<boolean>(false);

  // Lazy initialize language from client storage without triggering useEffect state-in-effect warning
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("telelys_lang") as Language | null;
      if (storedLanguage && storedLanguage in translations) {
        return storedLanguage;
      }
    }
    return "en";
  });

  const [activeTab, setActiveTab] =
    useState<string>("dashboard");

  /*
   * ---------------------------------------------------------
   * LANGUAGE
   * ---------------------------------------------------------
   */

  const handleSetLang = (newLang: Language) => {
    setLangState(newLang);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "telelys_lang",
        newLang
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * GET CURRENT USER
   * ---------------------------------------------------------
   */

  const refreshMe = async () => {
    try {
      const data = await authApi.getMe();

      setUser(data.user);

      if (data.retailer) {
        setRetailer(data.retailer);
      } else {
        setRetailer(null);
      }
    } catch (error) {
      console.error(
        "Failed to refresh authenticated user:",
        error
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * LOGIN
   * ---------------------------------------------------------
   */

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await authApi.login(
      email,
      password
    );

    /*
     * Store JWT
     */

    setStoredToken(response.token);

    /*
     * Update React state
     */

    setToken(response.token);

    setUser(response.user);

    if (response.retailer) {
      setRetailer(response.retailer);
    } else {
      setRetailer(null);
    }

    /*
     * Reset active module
     */

    setActiveTab("dashboard");
  };

  /*
   * ---------------------------------------------------------
   * DEMO LOGIN
   * ---------------------------------------------------------
   */

  const demoLogin = async (email: string) => {
    const password = email
      .toLowerCase()
      .includes("admin")
      ? "admin123"
      : "retailer123";

    await login(email, password);
  };

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  const logout = () => {
    authApi.logout().catch((error) => {
      console.error(
        "Backend logout failed:",
        error
      );
    });

    clearStoredToken();

    setToken(null);
    setUser(null);
    setRetailer(null);

    setActiveTab("dashboard");
  };

  /*
   * ---------------------------------------------------------
   * CONTEXT VALUE
   * ---------------------------------------------------------
   */

  const contextValue: AuthContextType = {
    user,

    role: user
      ? user.userType
      : null,

    retailer,

    token,

    isLoading,

    lang,

    setLang: handleSetLang,

    t: translations[lang],

    activeTab,

    setActiveTab,

    login,

    demoLogin,

    logout,

    refreshMe,
  };

  /*
   * ---------------------------------------------------------
   * PROVIDER
   * ---------------------------------------------------------
   */

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/*
 * =========================================================
 * USE AUTH HOOK
 * =========================================================
 */

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}