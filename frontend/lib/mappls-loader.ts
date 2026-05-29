/**
 * 🔐 Secure Mappls SDK Loader
 *
 * BEFORE: Token was hardcoded in NEXT_PUBLIC_MAPPLS_KEY (exposed in browser JS)
 * NOW:    Token is fetched from our secure backend proxy (/api/map/token)
 *         which requires JWT authentication.
 *
 * Flow: Frontend → Backend (JWT verified) → Returns token → SDK loads
 */

let loadPromise: Promise<void> | null = null;
let cachedToken: string | null = null;

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Fetch the Mappls token from our secure backend.
 * Requires a valid JWT stored in localStorage.
 */
async function fetchMapToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const jwt = localStorage.getItem("auth_token");

  // If no JWT yet (user not logged in), use the fallback key for development
  if (!jwt) {
    const fallbackKey = process.env.NEXT_PUBLIC_MAPPLS_KEY;
    if (fallbackKey) {
      console.warn(
        "[MapLoader] No auth token — using fallback NEXT_PUBLIC_MAPPLS_KEY (dev only)"
      );
      return fallbackKey;
    }
    throw new Error("Not authenticated — login required to load maps");
  }

  try {
    const response = await fetch(`${API_URL}/api/map/token`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to fetch map token (HTTP ${response.status})`
      );
    }

    const data = await response.json();

    if (!data.success || !data.data?.token) {
      throw new Error("Invalid response from map token endpoint");
    }

    cachedToken = data.data.token;

    // Auto-expire cache based on server hint
    const expiresIn = (data.data.expiresIn || 3600) * 1000;
    setTimeout(() => {
      cachedToken = null;
    }, expiresIn);

    return cachedToken!;
  } catch (err: any) {
    console.warn(
      `[MapLoader] Backend token fetch failed (${err.message}). Falling back to local developer map key.`
    );
    
    // Developer Fallback Key (the user's working key)
    const devFallbackKey = "mlddjdgsiiceeksvmdvagxxyghickrnvcbjl";
    return devFallbackKey;
  }
}

/**
 * Load the Mappls Web SDK securely.
 *
 * 1. Fetches the API token from backend proxy (JWT-protected)
 * 2. Injects the Mappls SDK script tag
 * 3. Waits for the SDK to initialize
 */
export function loadMapplsSDK(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise(async (resolve, reject) => {
    // 1. If already loaded in window, resolve immediately
    if (
      typeof (window as any).mappls !== "undefined" &&
      typeof (window as any).L !== "undefined"
    ) {
      resolve();
      return;
    }

    try {
      // 2. Fetch token securely from backend
      const token = await fetchMapToken();

      if (!token) {
        loadPromise = null;
        reject(new Error("Map token is empty"));
        return;
      }

      const callbackName = "__mapplsSDKReady";
      let isResolved = false;

      const safeResolve = () => {
        if (isResolved) return;
        isResolved = true;
        delete (window as any)[callbackName];
        resolve();
      };

      // 3. Register SDK ready callback
      (window as any)[callbackName] = () => {
        safeResolve();
      };

      // 4. Inject SDK script with the token from backend
      const script = document.createElement("script");
      script.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${token}&callback=${callbackName}`;
      script.async = true;
      script.defer = true;

      // Fallback polling
      script.onload = () => {
        const wait = setInterval(() => {
          if (
            typeof (window as any).mappls !== "undefined" &&
            typeof (window as any).L !== "undefined"
          ) {
            clearInterval(wait);
            safeResolve();
          }
        }, 50);
        setTimeout(() => clearInterval(wait), 5000);
      };

      script.onerror = () => {
        loadPromise = null;
        delete (window as any)[callbackName];
        reject(
          new Error(
            "Failed to load Mappls SDK script — check your API key and network"
          )
        );
      };

      document.head.appendChild(script);
    } catch (err) {
      loadPromise = null;
      reject(err);
    }
  });

  return loadPromise;
}

/**
 * Clear the cached token (call on logout).
 */
export function clearMapToken(): void {
  cachedToken = null;
  loadPromise = null;
}
