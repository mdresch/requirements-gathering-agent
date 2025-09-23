const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

export async function getAdminTemplates() {
  const res = await fetch(`${API_BASE}/templates`, {
    headers: { 'x-api-key': API_KEY }
  });
  if (!res.ok) throw new Error('Failed to fetch admin templates');
  return res.json();
}

// Add similar functions for projects, feedback, etc.
