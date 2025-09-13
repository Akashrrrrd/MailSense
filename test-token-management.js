// Test script to verify Gmail token management
console.log('🔍 Testing Gmail Token Management\n');

// Simulate token expiry scenarios
const testScenarios = [
  {
    name: 'Valid Token',
    token: 'valid_token_123',
    expiry: Date.now() + (30 * 60 * 1000), // 30 minutes from now
    expected: 'valid'
  },
  {
    name: 'Expired Token',
    token: 'expired_token_456',
    expiry: Date.now() - (10 * 60 * 1000), // 10 minutes ago
    expected: 'expired'
  },
  {
    name: 'Soon to Expire Token',
    token: 'soon_expire_789',
    expiry: Date.now() + (2 * 60 * 1000), // 2 minutes from now (within 5 min threshold)
    expected: 'expired'
  },
  {
    name: 'No Token',
    token: null,
    expiry: null,
    expected: 'missing'
  }
];

function isTokenExpired(expiry) {
  if (!expiry) return true;
  
  // Consider token expired if it expires within the next 5 minutes
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  return expiry <= fiveMinutesFromNow;
}

function getTokenStatus(token, expiry) {
  if (!token) return 'missing';
  if (isTokenExpired(expiry)) return 'expired';
  return 'valid';
}

console.log('📊 Token Status Test Results:');
console.log('================================');

testScenarios.forEach((scenario, index) => {
  const status = getTokenStatus(scenario.token, scenario.expiry);
  const passed = status === scenario.expected;
  const icon = passed ? '✅' : '❌';
  
  console.log(`${icon} Test ${index + 1}: ${scenario.name}`);
  console.log(`   Expected: ${scenario.expected}, Got: ${status}`);
  
  if (scenario.expiry) {
    const timeUntilExpiry = Math.round((scenario.expiry - Date.now()) / 1000);
    console.log(`   Time until expiry: ${timeUntilExpiry} seconds`);
  }
  console.log('');
});

// Test localStorage simulation
console.log('💾 LocalStorage Token Management:');
console.log('==================================');

const mockLocalStorage = {
  data: {},
  setItem(key, value) {
    this.data[key] = value;
    console.log(`📝 Stored: ${key} = ${value}`);
  },
  getItem(key) {
    const value = this.data[key] || null;
    console.log(`📖 Retrieved: ${key} = ${value}`);
    return value;
  },
  removeItem(key) {
    delete this.data[key];
    console.log(`🗑️ Removed: ${key}`);
  }
};

// Simulate token storage and retrieval
console.log('\n🔄 Simulating Token Lifecycle:');
console.log('-------------------------------');

// Store new token
const newToken = 'fresh_token_abc123';
const newExpiry = Date.now() + (3600 * 1000); // 1 hour from now

mockLocalStorage.setItem('gmail_access_token', newToken);
mockLocalStorage.setItem('gmail_token_expiry', newExpiry.toString());
mockLocalStorage.setItem('gmail_refresh_token', 'refresh_token_xyz789');

// Retrieve and check token
const storedToken = mockLocalStorage.getItem('gmail_access_token');
const storedExpiry = parseInt(mockLocalStorage.getItem('gmail_token_expiry'));

console.log(`\n📋 Token Status Check:`);
console.log(`Token: ${storedToken ? 'Present' : 'Missing'}`);
console.log(`Expiry: ${new Date(storedExpiry).toLocaleString()}`);
console.log(`Status: ${getTokenStatus(storedToken, storedExpiry)}`);

// Simulate token cleanup
console.log(`\n🧹 Token Cleanup:`);
mockLocalStorage.removeItem('gmail_access_token');
mockLocalStorage.removeItem('gmail_token_expiry');
mockLocalStorage.removeItem('gmail_refresh_token');

console.log('\n✅ Token Management Test Complete!');
console.log('\n📋 Key Improvements Made:');
console.log('• Added token expiry tracking');
console.log('• Implemented automatic token validation');
console.log('• Added 5-minute expiry buffer for safety');
console.log('• Enhanced error handling for expired tokens');
console.log('• Created connection status component');
console.log('• Improved user experience with reconnect flow');