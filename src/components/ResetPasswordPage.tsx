import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer le token depuis la query string
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token'); 

  useEffect(() => {
    if (!token) {
      setError('Token manquant.');
    }
  }, [token]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setError('Token manquant.');
      return;
    }

    try {
      // Utilisation d'Axios pour envoyer la requête POST avec le token
      const response = await axios.post(`http://localhost:5180/api/auth/reset-password/${token}`, {
        newPassword, // Le mot de passe envoyé dans la requête
      });

      if (response.status === 200) {
        setSuccessMessage('Mot de passe réinitialisé avec succès.');
        setTimeout(() => navigate('/login'), 3000); // Rediriger vers la page de login après 3 secondes
      }
    } catch (err) {
      if (err instanceof Error) {
        // Si l'erreur est une instance de Error
        setError(err.message || 'Erreur lors de la réinitialisation du mot de passe.');
      } else {
        // Si l'erreur n'est pas de type Error
        setError('Une erreur s\'est produite. Veuillez réessayer.');
      }
    }
  };

  return (
    <div>
      <h2>Réinitialiser le mot de passe</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword">Nouveau mot de passe</label>
          <input
  type="password"
  id="newPassword"
  value={newPassword}
  onChange={handlePasswordChange}
  required
  autoComplete="new-password"
/>

        </div>
        <button type="submit">Réinitialiser</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
