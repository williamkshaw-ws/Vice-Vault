import { auth } from "../firebase";

/**
 * Returns HTTP headers including the Authorization Bearer token
 * for either Firebase-authenticated or mock/custom-authenticated users.
 */
export async function getAuthHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra };
  let token: string | null = null;

  const mockUserStr = localStorage.getItem("vice_vault_mock_user");
  if (mockUserStr) {
    try {
      const mockUser = JSON.parse(mockUserStr);
      if (mockUser.token) {
        token = mockUser.token;
      }
    } catch (e) {}
  }

  if (!token && auth?.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (e) {}
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
