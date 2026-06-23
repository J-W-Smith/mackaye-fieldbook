export interface Session {
  mode: "local" | "cloud";
  accountId: string | null;
}

export interface SessionProvider {
  getSession(): Promise<Session>;
  signOut(): Promise<void>;
}

export class LocalSessionProvider implements SessionProvider {
  async getSession(): Promise<Session> {
    return { mode: "local", accountId: null };
  }

  async signOut() {
    // Local-only use has no credentials and guide access is never revoked.
  }
}

export class DisabledCloudSessionProvider implements SessionProvider {
  async getSession(): Promise<Session> {
    throw new Error("Cloud accounts are disabled in this prototype.");
  }

  async signOut() {
    throw new Error("Cloud accounts are disabled in this prototype.");
  }
}
