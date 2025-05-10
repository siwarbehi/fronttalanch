import  { useState } from 'react';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Envoi de la requête au backend avec l'email
      const response = await axios.post('/api/auth/forgot-password', { email });  // URL relative pour le proxy Vite
      setSuccessMessage(response.data);  // Afficher le message de succès
      setErrorMessage('');  // Clear any previous error messages
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data || "Une erreur est survenue.");
      } else {
        setErrorMessage("Une erreur est survenue.");
      }
    }
  };

  return (
    <div>
      <h2>Mot de passe oublié</h2>
      <form onSubmit={handleForgotPassword}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Envoyer le lien de réinitialisation</button>
      </form>

      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
    </div>
  );
};

export default ForgotPasswordPage;
