/**
 * Generate Development JWT Token for API Testing
 */

import jwt from 'jsonwebtoken';

const generateDevToken = () => {
  const payload = {
    sub: 'dev-user-123',
    id: 'dev-user-123',
    email: 'developer@adpa.io',
    role: 'admin',
    permissions: ['read', 'write', 'admin', 'standards-analysis'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  const secret = process.env.JWT_SECRET || 'development-secret-key';
  const token = jwt.sign(payload, secret);
  
  console.log('🔑 Development JWT Token (valid for 24 hours):');
  console.log('━'.repeat(60));
  console.log(token);
  console.log('\n📋 Use this token in your curl command:');
  console.log(`Authorization: Bearer ${token}`);
  
  return token;
};

// Generate token if run directly
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  generateDevToken();
}

export default generateDevToken;
