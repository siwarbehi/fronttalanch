"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { createTheme, ThemeProvider } from "@mui/material/styles"

// Création d'un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(76, 114, 164)",
      light: "rgba(76, 114, 164, 0.8)",
      dark: "rgb(50, 75, 108)",
    },
    secondary: {
      main: "#F5F5FF",
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

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  })
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const navigate = useNavigate()

  // Préchargement de la page de login
  useEffect(() => {
    const preloadLink = document.createElement("link")
    preloadLink.href = "/login"
    preloadLink.rel = "prefetch"
    document.head.appendChild(preloadLink)

    return () => {
      document.head.removeChild(preloadLink)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === "password" || name === "confirmPassword") {
      const newPassword = name === "password" ? value : formData.password
      const newConfirmPassword = name === "confirmPassword" ? value : formData.confirmPassword
      setPasswordsMatch(newPassword === newConfirmPassword)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post("/api/auth/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        isCaterer: true
      })

      setSuccessMessage(response.data?.message || "Inscription réussie !")
      setErrorMessage("")

      // Redirection optimisée vers login
      setTimeout(() => navigate("/login", { replace: true }), 10000)
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(
          typeof error.response.data === "string" 
            ? error.response.data 
            : error.response.data?.message || "Une erreur inconnue est survenue."
        )
      } else {
        setErrorMessage("Une erreur inconnue est survenue.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate("/login", { replace: true })
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
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
                Savourez vos plats préférés
              </Typography>
              <Typography variant="h5" component="h2" sx={{ mb: 4, fontWeight: "normal" }}>
                SANS ATTENTE
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Inscrivez-vous pour commander facilement vos repas au bureau et découvrir de nouvelles saveurs chaque
                jour.
              </Typography>

              <Box
                component="img"
                src="/src/assets/food-register-image.png"
                alt="Illustration de nourriture"
                loading="lazy"
                sx={{
                  maxWidth: "80%",
                  mt: 4,
                }}
              />
            </Box>
          </Box>

          {/* Section formulaire */}
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
              S'inscrire
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
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
              <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="Prénom"
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    size="small"
                  />
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Nom"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    size="small"
                  />
                </Box>

                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  size="small"
                />

                <TextField
                  required
                  fullWidth
                  id="phoneNumber"
                  label="Numéro de téléphone"
                  name="phoneNumber"
                  autoComplete="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  size="small"
                />

                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  size="small"
                  InputProps={{
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!passwordsMatch}
                  helperText={!passwordsMatch ? "Les mots de passe ne correspondent pas" : ""}
                  size="small"
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
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "S'inscrire"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Vous avez déjà un compte ?{" "}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={handleBackToLogin}
                      color="primary"
                      underline="hover"
                      fontWeight="medium"
                    >
                      Se connecter
                    </Link>
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  )
}

export default Register