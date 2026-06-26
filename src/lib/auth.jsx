// Autenticación simulada. No hay servidor: validamos contra cuentas demo y
// guardamos la sesión en localStorage. Soporta 3 tipos de sesión:
//  - "usuario"      → panel de empresa (app ERP)
//  - "superadmin"   → panel de empresa + admin
//  - "distribuidor" → portal de distribuidor
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AUTH_KEY = "gecir_demo_auth_v1";

// Cuentas de demostración. Cualquier contraseña sirve (es una demo),
// pero estas credenciales aparecen pre-rellenadas en los formularios.
export const DEMO_ACCOUNTS = {
  usuario: {
    email: "admin@graficasdelsur.es",
    password: "demo1234",
    userType: "superadmin",
    nombre: "Admin Demo",
    empresa: "Imprenta Gráficas del Sur S.L.",
  },
  distribuidor: {
    email: "distribuidor@reprise.es",
    password: "demo1234",
    userType: "distribuidor",
    nombre: "REPRISE Distribución",
  },
};

const AuthContext = createContext(null);

function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    if (session) localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    else localStorage.removeItem(AUTH_KEY);
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      isAuth: !!session,
      // Login app/empresa: acepta cualquier credencial en la demo.
      // `empresa` opcional permite mostrar el nombre del cliente recién dado de alta.
      loginUsuario(email, empresa) {
        const s = {
          email: email || DEMO_ACCOUNTS.usuario.email,
          userType: "superadmin",
          nombre: DEMO_ACCOUNTS.usuario.nombre,
          empresa: empresa || DEMO_ACCOUNTS.usuario.empresa,
          context: "usuario",
        };
        setSession(s);
        return s;
      },
      loginDistribuidor(email) {
        const s = {
          email: email || DEMO_ACCOUNTS.distribuidor.email,
          userType: "distribuidor",
          nombre: DEMO_ACCOUNTS.distribuidor.nombre,
          context: "distribuidor",
        };
        setSession(s);
        return s;
      },
      logout() {
        setSession(null);
      },
      isSuperAdmin: session?.userType === "superadmin",
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
