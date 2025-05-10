import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tokensAndIdExist, setTokensAndIdExist] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');

    if (storedAccessToken) {
      // Affichage des tokens dans la console si déjà connecté
      const storedRefreshToken = localStorage.getItem('refreshToken');
      console.log('Access Token:', storedAccessToken);
      console.log('Refresh Token:', storedRefreshToken);

      // Mettre à jour l'état pour indiquer que l'utilisateur est connecté
      setTokensAndIdExist(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const loginDto = { emailAddress: email, password };
      const response = await axios.post('/api/auth/login', loginDto);

      const { accessToken, refreshToken, isApproved, userId } = response.data;

      if (!isApproved) {
        setErrorMessage("Votre compte n'est pas approuvé. Veuillez contacter l'administrateur.");
        return;
      }

      setSuccessMessage('Connexion réussie !');
      setErrorMessage('');

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUserId(userId);
      setTokensAndIdExist(true);

      // Affichage des tokens dans la console après la connexion
      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);

      window.location.reload();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data || 'Email ou mot de passe incorrect.');
      } else {
        setErrorMessage('Une erreur est survenue.');
      }
    }
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };

  return (
    <div>
      <h2>Connexion</h2>

      {userId && !tokensAndIdExist && (
        <div style={{ marginBottom: '15px', color: 'green' }}>
          ID Utilisateur : {userId}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit">Se connecter</button>
      </form>

      <button onClick={handleForgotPasswordClick} style={{ marginTop: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
        Mot de passe oublié ?
      </button>

      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
    </div>
  );
};

export default Login;
