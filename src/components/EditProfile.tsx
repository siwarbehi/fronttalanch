"use client"

import type React from "react"

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import axios from "axios"
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  IconButton,
  Avatar,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  Fade,
  alpha,
  Tooltip,
} from "@mui/material"
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

const customColors = {
  primary: "rgb(76, 114, 164)",
  secondary: "rgb(143, 148, 36)",
  accent: "rgb(224, 69, 128)",
  background: "#f8f9fa",
  cardBg: "#ffffff",
  neutral: "rgb(100, 100, 100)",
  lightGrey: "rgb(240, 240, 240)",
}

const EditProfile: React.FC = () => {
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const serverUrl = "http://localhost:5180"

  const [userImage, setUserImage] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  useEffect(() => {
    if (authContext && authContext.tokensAndIdExist) {
      setLoading(true)
      axios
        .get(`/api/user/${authContext.userId}`, {
          headers: { Authorization: `Bearer ${authContext.accessToken}` },
        })
        .then((response) => {
          const profilePicture = response.data.profilePicture
          setUserImage(
            profilePicture && profilePicture !== "null"
              ? `${serverUrl}/uploads/${profilePicture}`
              : "/src/assets/social.png",
          )
          setFirstName(response.data.firstName || "")
          setLastName(response.data.lastName || "")
          setEmail(response.data.emailAddress || "")
          setPhoneNumber(response.data.phoneNumber || "")
        })
        .catch(() => setError("Erreur de récupération des données utilisateur"))
        .finally(() => setLoading(false))
    }
  }, [authContext])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Vérifier le type de fichier
      if (!selectedFile.type.match("image.*")) {
        setError("Veuillez sélectionner une image valide")
        return
      }

      // Vérifier la taille du fichier (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB")
        return
      }

      setFile(selectedFile)
      const fileReader = new FileReader()
      fileReader.onloadend = () => setUserImage(fileReader.result as string)
      fileReader.readAsDataURL(selectedFile)
    }
  }

  const validateForm = (): boolean => {
    let isValid = true

    // Validation de l'email
    if (!email) {
      setEmailError("L'adresse email est requise")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Adresse email invalide")
      isValid = false
    } else {
      setEmailError(null)
    }

    // Validation du téléphone
    if (phoneNumber && !/^[0-9+\s()-]{8,15}$/.test(phoneNumber)) {
      setPhoneError("Numéro de téléphone invalide")
      isValid = false
    } else {
      setPhoneError(null)
    }

    // Validation du mot de passe
    if (password && password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères")
      isValid = false
    } else if (password && password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas")
      isValid = false
    } else {
      setPasswordError(null)
    }

    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateForm()) {
      return
    }
    if (!authContext || !authContext.userId) {
      setError("Utilisateur non connecté.");
      return;
    }
    setSubmitting(true)

    const formData = new FormData()
    formData.append("firstName", firstName)
    formData.append("lastName", lastName)
    formData.append("emailAddress", email)
    formData.append("phoneNumber", phoneNumber)
    formData.append('UserId', authContext!.userId.toString());


    if (password) {
      formData.append("updatedPassword", password)
    }

    if (file) {
      formData.append("profilePicture", file)
    }

    axios.patch(`/api/user/${authContext?.userId}`, formData, {
      headers: { Authorization: `Bearer ${authContext?.accessToken}` },
    })
    
      .then(() => {
        setSuccess("Profil mis à jour avec succès !")
        setTimeout(() => {
          navigate("/user")
        }, 1500)
      })
      .catch((err) => {
        console.error("Erreur de mise à jour:", err)
        setError(err.response?.data?.message || "Erreur de mise à jour du profil")
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handleCancel = () => {
    navigate("/user")
  }

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
          Veuillez vous connecter pour modifier vos informations.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: customColors.primary,
            "&:hover": { bgcolor: alpha(customColors.primary, 0.9) },
          }}
        >
          Se connecter
        </Button>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress sx={{ color: customColors.primary }} size={60} />
      </Box>
    )
  }

  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          padding: { xs: "20px", md: "40px" },
          bgcolor: customColors.background,
          minHeight: "80vh",
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: "16px",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "8px",
                background: `linear-gradient(90deg, ${customColors.primary} 0%, ${customColors.accent} 100%)`,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
              <IconButton
                onClick={handleCancel}
                sx={{
                  mr: 2,
                  color: customColors.primary,
                  "&:hover": { bgcolor: alpha(customColors.primary, 0.1) },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: customColors.primary,
                }}
              >
                Modifier mon profil
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={userImage || "/src/assets/social.png"}
                  alt="Photo de profil"
                  sx={{
                    width: { xs: "120px", md: "150px" },
                    height: { xs: "120px", md: "150px" },
                    border: `3px solid ${customColors.primary}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <label htmlFor="upload-photo">
                  <input
                    style={{ display: "none" }}
                    id="upload-photo"
                    name="upload-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Tooltip title="Changer la photo">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      sx={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        bgcolor: customColors.secondary,
                        color: "white",
                        "&:hover": { bgcolor: customColors.accent },
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </Tooltip>
                </label>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Prénom"
                      variant="outlined"
                      fullWidth
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: customColors.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: customColors.primary,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: customColors.primary,
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Nom"
                      variant="outlined"
                      fullWidth
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: customColors.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: customColors.primary,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: customColors.primary,
                        },
                      }}
                    />
                  </Box>
                </Box>

                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: customColors.primary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: customColors.primary,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: customColors.primary,
                    },
                  }}
                />

                <TextField
                  label="Numéro de téléphone"
                  variant="outlined"
                  fullWidth
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  error={!!phoneError}
                  helperText={phoneError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: customColors.primary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: customColors.primary,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: customColors.primary,
                    },
                  }}
                />

                <Divider>
                  <Typography variant="body2" color="text.secondary">
                    Changer le mot de passe (optionnel)
                  </Typography>
                </Divider>

                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Nouveau mot de passe"
                      variant="outlined"
                      type="password"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={!!passwordError}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: customColors.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: customColors.primary,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: customColors.primary,
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Confirmer le mot de passe"
                      variant="outlined"
                      type="password"
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={!!passwordError}
                      helperText={passwordError}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: customColors.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: customColors.primary,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: customColors.primary,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
                <Tooltip title="Annuler">
                  <IconButton
                    onClick={handleCancel}
                    sx={{
                      color: customColors.neutral,
                      bgcolor: alpha(customColors.neutral, 0.1),
                      "&:hover": {
                        bgcolor: alpha(customColors.neutral, 0.2),
                      },
                      p: 2,
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Enregistrer">
                  <IconButton
                    type="submit"
                    disabled={submitting}
                    sx={{
                      bgcolor: customColors.primary,
                      color: "white",
                      "&:hover": {
                        bgcolor: customColors.secondary,
                      },
                      "&:disabled": {
                        bgcolor: alpha(customColors.primary, 0.6),
                        color: "white",
                      },
                      p: 2,
                    }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </form>
          </Paper>
        </Container>
      </Box>
    </Fade>
  )
}

export default EditProfile
