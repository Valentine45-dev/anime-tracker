// Simple authentication helper for development
// In production, you would implement proper JWT token validation

export function getCurrentUserId(): string {
  // For development, return a consistent user ID (valid UUID format)
  // In production, extract from JWT token or session
  return '550e8400-e29b-41d4-a716-446655440000'
}

export function isAuthenticated(): boolean {
  // For development, always return true
  // In production, validate JWT token
  return true
}
