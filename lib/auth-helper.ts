// Simple authentication helper for development
// In production, you would implement proper JWT token validation

export function getCurrentUserId(): string {
  // For development, return a consistent user ID
  // In production, extract from JWT token or session
  return 'dev-user-123'
}

export function isAuthenticated(): boolean {
  // For development, always return true
  // In production, validate JWT token
  return true
}
