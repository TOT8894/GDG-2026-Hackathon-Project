import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  authApi,
  clearTokens,
  getAccessToken,
  storeSessionFromAuthResponse,
} from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(() => getAccessToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));

  const syncToken = useCallback(() => {
    setAccessTokenState(getAccessToken());
  }, []);

  const loadProfile = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await authApi.profile();
      const u = data?.user ?? data?.data ?? data;
      setUser(u && typeof u === "object" ? u : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) loadProfile();
    else {
      setUser(null);
      setLoading(false);
    }
  }, [accessToken, loadProfile]);

  const login = useCallback(
    async (credentials) => {
      const body = await authApi.login(credentials);
      storeSessionFromAuthResponse(body);
      syncToken();
      await loadProfile();
      return body;
    },
    [loadProfile, syncToken],
  );

  const register = useCallback(
    async (payload) => {
      const body = await authApi.register(payload);
      storeSessionFromAuthResponse(body);
      syncToken();
      await loadProfile();
      return body;
    },
    [loadProfile, syncToken],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore network errors */
    }
    clearTokens();
    syncToken();
    setUser(null);
  }, [syncToken]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(accessToken),
      login,
      register,
      logout,
      reloadProfile: loadProfile,
    }),
    [user, loading, accessToken, login, register, logout, loadProfile],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
