"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import { Box, Button, TextField, Typography, Alert, Link, CircularProgress, Paper } from "@mui/material"
import { ArrowBack } from "@mui/icons-material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"

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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Envoi de la requête au backend avec l'email
      const response = await axios.post("/api/auth/forgot-password", { email })
      setSuccessMessage(response.data) // Afficher le message de succès
      setErrorMessage("") // Clear any previous error messages
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data || "Une erreur est survenue.")
      } else {
        setErrorMessage("Une erreur est survenue.")
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
                Mot de passe oublié ?
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Pas de panique ! Nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </Typography>

              <Box
                component="img"
                src="/src/assets/food-forgot-image.png"
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
              Réinitialisation du mot de passe
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            {!successMessage ? (
              <Box component="form" onSubmit={handleForgotPassword} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Saisissez votre adresse email pour recevoir un lien de réinitialisation.
                </Typography>

                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="small"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Envoyer le lien de réinitialisation"}
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Veuillez vérifier votre boîte de réception et suivre les instructions pour réinitialiser votre mot de
                  passe.
                </Typography>
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

export default ForgotPasswordPage
