
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Avatar,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
  alpha,
  Card,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,

} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface User {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  profilePicture?: string;
}

const customColors = {
  primary: "rgb(76, 114, 164)",
  secondary: "rgb(143, 148, 36)",
  accent: "rgb(224, 69, 128)",
  background: "#f8f9fa",
  cardBg: "#ffffff",
  neutral: "rgb(100, 100, 100)",
  lightGrey: "rgb(240, 240, 240)",
};

const UserProfile: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const defaultProfilePicture = "/src/assets/social.png";

useEffect(() => {
  if (authContext && authContext.tokensAndIdExist) {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/user/${authContext.userId}`, {
          headers: {
            Authorization: `Bearer ${authContext.accessToken}`,
          },
        });

        setUserData(response.data);

        const userProfilePicture = response.data.profilePicture;

        // Vérifie si c'est un lien vers une image
        const isImage = userProfilePicture?.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i);

        if (userProfilePicture && isImage) {
          setProfilePicture(userProfilePicture);
        } else {
          setProfilePicture(defaultProfilePicture); // Sinon image par défaut
        }

      } catch (error) {
        if (error instanceof Error) {
          setError(`Erreur lors du chargement des données utilisateur: ${error.message}`);
        } else {
          setError("Erreur inconnue");
        }
        setProfilePicture(defaultProfilePicture);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }
}, [authContext]);


  const handleEditProfile = () => {
    navigate("/sidebar/profile-edit");
  };

  if (!authContext || !authContext.tokensAndIdExist) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Veuillez vous connecter pour voir vos informations.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: customColors.primary,
            "&:hover": { bgcolor: alpha(customColors.primary, 0.9) },
          }}
          onClick={() => navigate("/login")}
        >
          Se connecter
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}
      >
        <CircularProgress sx={{ color: customColors.primary }} size={60} />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          padding: { xs: "20px", md: "40px" },
          display: "flex",
          justifyContent: "center",
          bgcolor: customColors.background,
          minHeight: "80vh",
        }}
      >
        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          </Snackbar>
        )}

        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: { xs: "30px", md: "50px" },
            maxWidth: 1000,
            width: "100%",
            borderRadius: "16px",
            bgcolor: customColors.cardBg,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              background: `linear-gradient(90deg, ${customColors.primary} 0%, ${customColors.secondary} 100%)`,
            },
          }}
        >
          <Box sx={{ position: "relative", width: "100%", mb: 6 }}>
            <Box sx={{ position: "absolute", top: 0, right: 0, zIndex: 2 }}>
              <Tooltip title="Modifier le profil">
                <IconButton
                  onClick={handleEditProfile}
                  sx={{
                    backgroundColor: customColors.secondary,
                    "&:hover": {
                      backgroundColor: customColors.accent,
                      transform: "rotate(15deg)",
                    },
                    color: "white",
                    padding: "12px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                width: "100%",
                gap: { xs: 4, md: 6 },
              }}
            >
              <Avatar
                src={profilePicture || defaultProfilePicture}
                alt="Photo de profil"
                sx={{
                  width: { xs: "150px", md: "180px" },
                  height: { xs: "150px", md: "180px" },
                  border: `4px solid ${customColors.primary}`,
                  boxShadow: "0 8px 24px rgba(76, 114, 164, 0.2)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              />

              <Box sx={{ textAlign: { xs: "center", md: "left" }, flex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    color: customColors.primary,
                    fontSize: { xs: "2rem", md: "2.5rem" },
                  }}
                >
                  {userData?.firstName} {userData?.lastName}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              width: "100%",
              gap: 3,
              justifyContent: "space-between",
            }}
          >
            <CardInfo
              icon={<EmailIcon sx={{ fontSize: 32, color: customColors.primary, mr: 2 }} />}
              value={userData?.emailAddress}
            />
            <CardInfo
              icon={<PhoneIcon sx={{ fontSize: 32, color: customColors.primary, mr: 2 }} />}
              value={userData?.phoneNumber}
            />
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

// ✅ Nouveau composant CardInfo simplifié (sans titre, juste icône + valeur)
const CardInfo: React.FC<{
  icon: React.ReactNode;
  value?: string;
}> = ({ icon, value }) => {
  return (
    <Card
      elevation={2}
      sx={{
        p: 3,
        flex: "1 1 300px",
        borderRadius: "12px",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
        },
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon}
      <Typography variant="body1" sx={{ fontSize: "1.1rem", wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Card>
  );
};

export default UserProfile;