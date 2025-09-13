// Utility to simulate token expiry for testing
// Run this in browser console to test the reconnect flow

console.log('🧪 Simulating Token Expiry...')

// Clear all Gmail-related tokens and cache
localStorage.removeItem("gmail_access_token")
localStorage.removeItem("gmail_refresh_token") 
localStorage.removeItem("gmail_token_expiry")
localStorage.removeItem("gmail_token_last_validation")

console.log('✅ Cleared all Gmail tokens')
console.log('📱 Now refresh the dashboard page to see the reconnect flow')
console.log('💡 You should see: "Gmail access expired. Please sign out and sign in again to reconnect."')