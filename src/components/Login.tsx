"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
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
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "rgb(76, 114, 164)", // Mise à jour de la couleur des checkbox
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

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [tokensAndIdExist, setTokensAndIdExist] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken")

    if (storedAccessToken) {
      // Affichage des tokens dans la console si déjà connecté
      const storedRefreshToken = localStorage.getItem("refreshToken")
      console.log("Access Token:", storedAccessToken)
      console.log("Refresh Token:", storedRefreshToken)

      // Mettre à jour l'état pour indiquer que l'utilisateur est connecté
      setTokensAndIdExist(true)
    }
  }, [])

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const loginDto = { emailAddress: email, password }
    const response = await axios.post("/api/auth/login", loginDto)

    const { accessToken, refreshToken, isApproved, userId } = response.data

    if (!isApproved) {
      setErrorMessage("Votre compte n'est pas approuvé. Veuillez contacter l'administrateur.")
      setLoading(false)
      return
    }

    setSuccessMessage("Connexion réussie !")
    setErrorMessage("")

    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)

    setUserId(userId)
    setTokensAndIdExist(true)

    // Redirection vers /sidebar après connexion réussie
    navigate("/sidebar")
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      setErrorMessage(error.response.data || "Email ou mot de passe incorrect.")
    } else {
      setErrorMessage("Une erreur est survenue.")
    }
    setLoading(false)
  }
}


  const handleForgotPasswordClick = () => {
    navigate("/forgot-password")
  }

  const handleRegisterClick = () => {
    navigate("/register")
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
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
                Bienvenue sur Talunch
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Connectez-vous pour accéder à votre compte et commander vos repas préférés.
              </Typography>

              <Box
                component="img"
                src="/src/assets/food-login-image.jpg"
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
              Connexion
            </Typography>

            {userId && !tokensAndIdExist && (
              <Alert severity="success" sx={{ mb: 3 }}>
                ID Utilisateur : {userId}
              </Alert>
            )}

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

            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
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

              <TextField
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} size="small" />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Se souvenir de moi
                    </Typography>
                  }
                />
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleForgotPasswordClick}
                  color="primary"
                  underline="hover"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Mot de passe oublié ?
                </Link>
              </Box>

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
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
              </Button>

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Vous n'avez pas de compte ?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleRegisterClick}
                    color="primary"
                    underline="hover"
                    fontWeight="medium"
                  >
                    S'inscrire
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  )
}

export default Login
