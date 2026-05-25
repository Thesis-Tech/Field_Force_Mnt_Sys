import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  firstName: string;
  lastName: string;
  designation: string;
  photoUrl: string | null;
  email: string;
  mobileNo: string;
  role: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  passwordHash: string; // Plaintext for demo simulation
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: "Global",
  lastName: "Ops",
  designation: "Super Admin",
  photoUrl: null,
  email: "admin@fieldforce.com",
  mobileNo: "+1 (555) 019-2834",
  role: "Super Admin",
};

// Safe helper for localStorage
const getLocalStorageItem = (key: string, fallback: string): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) || fallback;
  }
  return fallback;
};

const setLocalStorageItem = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

const getInitialUser = (): UserProfile | null => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("ff_user_profile");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    const isLoggedIn = localStorage.getItem("ff_is_logged_in") === "true";
    if (isLoggedIn) {
      return DEFAULT_PROFILE;
    }
    return null;
  }
  return null;
};

const getInitialIsLoggedIn = (): boolean => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ff_is_logged_in") === "true";
  }
  return false;
};

const initialState: AuthState = {
  isLoggedIn: getInitialIsLoggedIn(),
  user: getInitialUser(),
  passwordHash: getLocalStorageItem("ff_password", "admin123"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ name?: string; email: string; role?: string }>) {
      state.isLoggedIn = true;
      const parts = (action.payload.name || "Global Ops").split(" ");
      const firstName = parts[0] || "Global";
      const lastName = parts.slice(1).join(" ") || "Ops";

      state.user = {
        firstName,
        lastName,
        designation: action.payload.role || "Super Admin",
        photoUrl: null,
        email: action.payload.email,
        mobileNo: "+1 (555) 019-2834",
        role: action.payload.role || "Super Admin",
      };
      setLocalStorageItem("ff_is_logged_in", "true");
      setLocalStorageItem("ff_user_profile", JSON.stringify(state.user));
    },
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("ff_is_logged_in");
        localStorage.removeItem("ff_user_profile");
      }
    },
    updateProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
        setLocalStorageItem("ff_user_profile", JSON.stringify(state.user));
      }
    },
    changePassword(state, action: PayloadAction<string>) {
      state.passwordHash = action.payload;
      setLocalStorageItem("ff_password", action.payload);
    }
  },
});

export const { login, logout, updateProfile, changePassword } = authSlice.actions;
export default authSlice.reducer;
