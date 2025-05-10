import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Définir le type pour le token décodé
interface DecodedToken {
  exp: number;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
}

interface AuthContextProps {
  children: ReactNode;
}

interface AuthContextValue {
  email: string | null;
  userId: string | null;
  role: string | null;
  accessToken: string | null;
  setTokensAndIdExist: React.Dispatch<React.SetStateAction<boolean>>;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  tokensAndIdExist: boolean;
}

// Création du contexte
const AuthContext = createContext<AuthContextValue | null>(null);

// Fournisseur de contexte
const AuthProvider: React.FC<AuthContextProps> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokensAndIdExist, setTokensAndIdExist] = useState<boolean>(false);

  // Décodage du token à partir du localStorage
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');

    if (storedAccessToken) {
      setTokensAndIdExist(true);
      setAccessToken(storedAccessToken);

      try {
        // Décoder le token pour extraire les informations
        const decodedToken = jwtDecode<DecodedToken>(storedAccessToken);
        console.log('Décodage du token :', decodedToken);

        // Récupérer les informations du token
        const decodedUserId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
        const decodedEmail = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
        const decodedRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
        const exp = decodedToken.exp;

        // Vérifier l'expiration du token
        const currentTime = Date.now() / 1000;
        if (exp < currentTime) {
          console.log('Le token est expiré');
          localStorage.removeItem('accessToken');
          setTokensAndIdExist(false);
        }

        // Mettre à jour les états
        setUserId(decodedUserId);
        setEmail(decodedEmail);
        setRole(decodedRole);
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        email,
        userId,
        role,
        accessToken,
        setTokensAndIdExist,
        setUserId,
        setAccessToken,
        tokensAndIdExist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
