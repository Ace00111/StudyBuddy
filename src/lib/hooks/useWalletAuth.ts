/**
 * useWalletAuth - React hook for secure wallet authentication
 * Handles sign message flow and session management
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export interface AuthUser {
  token: string;
  walletAddress: string;
  profile: {
    id: string;
    username: string;
    avatar?: string;
    bio?: string;
    createdAt: string;
  };
}

export interface UseWalletAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "studybuddy_auth_token";
const USER_STORAGE_KEY = "studybuddy_user";

export function useWalletAuth(): UseWalletAuthReturn {
  const { account, connected, signMessage } = useWallet();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  const login = useCallback(async () => {
    if (!account?.address) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletAddress = account.address.toString();

      // Step 1: Get challenge from backend
      const challengeRes = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (!challengeRes.ok) {
        throw new Error("Failed to get authentication challenge");
      }

      const challengeData = await challengeRes.json();
      const { challengeId, message } = challengeData.data;

      // Step 2: Sign message with wallet
      const signResult = await signMessage({
        message,
        nonce: `nonce_${Date.now()}`,
      });

      if (!signResult || !signResult.signature) {
        setError("Failed to sign message. User rejected the request.");
        setIsLoading(false);
        return;
      }

      // Step 3: Verify signature and create session
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          walletAddress,
          signature: signResult.signature,
          username: `User_${walletAddress.slice(0, 6)}`,
        }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || "Authentication failed");
      }

      const authData = await verifyRes.json();
      const { token, profile } = authData.data;

      // Save session
      const authUser: AuthUser = {
        token,
        walletAddress,
        profile,
      };

      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, signMessage]);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
}

/**
 * Helper to get authorization header for API calls
 */
export function getAuthHeader(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Fetch wrapper with automatic auth header
 */
export async function fetchWithAuth<T>(
  token: string,
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeader(token),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
