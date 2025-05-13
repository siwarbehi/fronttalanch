"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material"
import { Lock, Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material"
import { createTheme, ThemeProvider } from "@mui/material/styles"

// Création d'un thème personnalisé avec des couleurs inspirées de l'image
const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(76, 114, 164)", // Nouvelle couleur bleue
      light: "rgba(76, 114, 164, 0.8)",
      dark: "rgb(50, 75, 108)",
    },
    secondary: {
      main: "#F5F5FF", // Fond clair
    },
    background: {
      default: "#F5F5FF",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: "16px",
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
})

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Récupérer le token depuis la query string
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get("token")

  useEffect(() => {
    if (!token) {
      setError("Token manquant.")
    }
  }, [token])

  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordsMatch(false)
    } else {
      setPasswordsMatch(true)
    }
  }, [newPassword, confirmPassword])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (!token) {
      setError("Token manquant.")
      return
    }

    setLoading(true)

    try {
      // Utilisation d'Axios pour envoyer la requête POST avec le token dans l'URL et le newPassword dans le body
      const response = await axios.post(`http://localhost:5180/api/auth/reset-password/${token}`, {
        Token: token, // Envoi du token dans le corps de la requête
        NewPassword: newPassword, // Le mot de passe envoyé dans la requête
      })

      if (response.status === 200) {
        setSuccessMessage("Mot de passe réinitialisé avec succès.")
        setTimeout(() => navigate("/login"), 3000) // Rediriger vers la page de login après 3 secondes
      }
    } catch (err) {
      if (err instanceof Error) {
        // Si l'erreur est une instance de Error
        setError(err.message || "Erreur lors de la réinitialisation du mot de passe.")
      } else {
        // Si l'erreur n'est pas de type Error
        setError("Une erreur s'est produite. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate("/login")
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
          backgroundColor: "secondary.main",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            width: "100%",
            maxWidth: "900px",
            height: { xs: "auto", md: "auto" },
            overflow: "hidden",
            borderRadius: 4,
          }}
        >
          {/* Section gauche avec image et texte */}
          <Box
            sx={{
              flex: { xs: "0 0 0%", md: "1 1 45%" },
              position: "relative",
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              p: 5,
              backgroundColor: "primary.main",
              color: "white",
            }}
          >
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
                Créez un nouveau mot de passe
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Choisissez un mot de passe sécurisé pour protéger votre compte.
              </Typography>

              <Box
                component="img"
                src="/src/assets/food-reset-image.png"
                alt="Illustration de nourriture"
                sx={{
                  maxWidth: "80%",
                  mt: 4,
                }}
              />
            </Box>
          </Box>

          {/* Section formulaire (côté droit) */}
          <Box
            sx={{
              flex: { xs: "1 1 100%", md: "1 1 55%" },
              display: "flex",
              flexDirection: "column",
              p: { xs: 3, sm: 4, md: 5 },
              backgroundColor: "#ffffff",
              overflow: "auto",
            }}
          >
            <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
              Réinitialiser le mot de passe
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Vous allez être redirigé vers la page de connexion...
                </Typography>
              </Alert>
            )}

            {!successMessage && (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Veuillez saisir et confirmer votre nouveau mot de passe.
                </Typography>

                <TextField
                  required
                  fullWidth
                  name="newPassword"
                  label="Nouveau mot de passe"
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmer le mot de passe"
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={!passwordsMatch}
                  helperText={!passwordsMatch ? "Les mots de passe ne correspondent pas" : ""}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || !passwordsMatch}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Réinitialiser le mot de passe"}
                </Button>
              </Box>
            )}

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Link
                component="button"
                variant="body2"
                onClick={handleBackToLogin}
                color="primary"
                underline="hover"
                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <ArrowBack fontSize="small" sx={{ mr: 0.5 }} />
                Retour à la page de connexion
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  )
}

export default ResetPasswordPage
