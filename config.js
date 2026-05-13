/* ============================================
  CRAFTBASE — Environment Configuration
  ============================================ */

// API Configuration
const API_CONFIG = {
  // For local development: http://localhost:5000
  // For production: Update to your deployed backend URL
  baseURL: (() => {
    // In production (Vercel), use environment variable or your backend URL
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // Deployed on Vercel or similar
      return 'https://craftbase-production-f77a.up.railway.app';
    }
    // Local development
    return 'http://localhost:5000';
  })(),

  endpoints: {
    auth: '/api/auth',
    companies: '/api/companies',
    quotes: '/api/quotes',
    reviews: '/api/reviews',
    threads: '/api/threads'
  }
};

// Helper function to build full API URLs
function getApiUrl(path) {
  return `${API_CONFIG.baseURL}${path}`;
}

// Test connection to backend
async function testBackendConnection() {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/`, { method: 'GET' });
    return response.ok;
  } catch (err) {
    console.warn('Backend connection test failed:', err.message);
    return false;
  }
}
