export const getAuthToken = () => {
  const storedData = localStorage.getItem('sb-dpwepivngodkqrzyolvl-auth-token');
  if (!storedData) return null;
  try {
    const tokenData = JSON.parse(storedData);
    return tokenData.access_token;
  } catch (err) {
    console.error('Error parsing token from localStorage', err);
    return null;
  }
};