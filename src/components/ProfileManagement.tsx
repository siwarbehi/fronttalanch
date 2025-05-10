import { useContext, useEffect, useState } from 'react'; 
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socialImage from '../assets/social.png';

const ProfileManagement: React.FC = () => {
  const authContext = useContext(AuthContext);
  const serverUrl = 'http://localhost:5180';
  const navigate = useNavigate();

  const [userImage, setUserImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (authContext && authContext.tokensAndIdExist) {
      axios.get(`/api/user/${authContext.userId}`, {
        headers: { Authorization: `Bearer ${authContext.accessToken}` },
      })
      .then((response) => {
        const profilePicture = response.data.ProfilePicture;
        setUserImage(profilePicture && profilePicture !== 'null' ? `${serverUrl}/uploads/${profilePicture}` : socialImage);
        setFirstName(response.data.firstName || '');
        setLastName(response.data.lastName || '');
        setEmail(response.data.email || '');
        setPhoneNumber(response.data.phoneNumber || '');
      })
      .catch(() => setError('Erreur de récupération des données utilisateur'));
    }
  }, [authContext]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileReader = new FileReader();
      fileReader.onloadend = () => setUserImage(fileReader.result as string);
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      return setError('Veuillez saisir votre adresse email ou un nouveau.');
    }
    
    if (password && password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.');
    }

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('emailAddress', email);
    formData.append('phoneNumber', phoneNumber);

    // Ajouter uniquement si l'utilisateur veut mettre à jour son mot de passe
    if (password) {
      formData.append('updatedPassword', password);  // ✅ Mot de passe mis à jour
    }

    if (file) {
      formData.append('profilePicture', file);
    }

    axios.patch(`/api/user/${authContext?.userId}`, formData, {
      headers: { Authorization: `Bearer ${authContext?.accessToken}` },
    })
    .then(() => {
      alert('Profil mis à jour avec succès !');
      if (file) setUserImage(URL.createObjectURL(file));
      navigate('/profile');
    })
    .catch(() => setError('Erreur de mise à jour du profil'));
  };

  if (!authContext || !authContext.tokensAndIdExist) {
    return <div>Veuillez vous connecter pour voir vos informations.</div>;
  }

  return (
    <div>
      <h2>Informations de l'utilisateur</h2>
      <div>
        <img src={userImage || socialImage} alt="Photo de profil" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Prénom:</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label>Nom:</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Numéro de téléphone:</label>
          <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        <div>
          <label>Nouveau mot de passe:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Confirmer le mot de passe:</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <div>
          <label>Choisir votre photo:</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit">Mettre à jour</button>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default ProfileManagement;
