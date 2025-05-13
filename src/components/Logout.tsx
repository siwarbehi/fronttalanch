// src/components/Logout.tsx
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        console.log('Refresh Token avant déconnexion:', refreshToken);

        await axios.post(
          'http://localhost:5180/api/auth/logout',
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        localStorage.removeItem('accessToken'); 
        localStorage.removeItem('refreshToken'); 

        console.log('Tokens après déconnexion:', {
          refreshToken: localStorage.getItem('refreshToken'),
          accessToken: localStorage.getItem('accessToken'),
        });
        navigate('/login');
      } else {
        console.log('Aucun refresh token trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return logout;
};