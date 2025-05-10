import { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isCaterer = true; 

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const registerUserDto = {
        firstName,
        lastName,
        emailAddress: email,
        phoneNumber,
        password,
      };

      const response = await axios.post(
        `/api/auth/register?isCaterer=${isCaterer}`, 
        registerUserDto
      );

      setSuccessMessage(response.data);
      setErrorMessage(''); 
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        if (typeof error.response?.data === 'string') {
          setErrorMessage(error.response.data);
        } else if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message); 
        } else {
          setErrorMessage('Une erreur inconnue est survenue.');
        }
      } else {
        setErrorMessage('Une erreur inconnue est survenue.');
      }
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Prénom</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Nom de famille</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Numéro de téléphone</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">S'inscrire</button>
      </form>

      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
    </div>
  );
};

export default Register;
