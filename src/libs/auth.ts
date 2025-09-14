import { account } from './appwrite';

export type AuthUser = {
  $id: string;
  email: string;
  name: string;
  phone?: string;
  phoneVerification?: boolean;
};

export class AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await account.get();
      return {
        $id: user.$id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        phoneVerification: user.phoneVerification,
      };
    } catch {
      return null;
    }
  }

  async signUp(email: string, password: string, name: string) {
    const response = await account.create('unique()', email, password, name);
    return response;
  }

  async signIn(email: string, password: string) {
    try {
      // Check if there's already an active session
      const currentUser = await account.get();
      if (currentUser) {
        // User is already signed in, return the existing session
        return { $id: currentUser.$id, email: currentUser.email };
      }
    } catch {
      // No active session, continue with sign in
    }
    
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  }

  async signOut() {
    await account.deleteSession('current');
  }

  async clearAllSessions() {
    try {
      await account.deleteSessions();
    } catch {
      // No sessions to delete
    }
  }

  async sendPhoneVerification() {
    const response = await account.createPhoneVerification();
    return response;
  }

  async confirmPhoneVerification(userId: string, secret: string) {
    const response = await account.updatePhoneVerification(userId, secret);
    return response;
  }

  async updatePhone(phone: string, password: string) {
    const response = await account.updatePhone(phone, password);
    return response;
  }
}

export const authService = new AuthService();
