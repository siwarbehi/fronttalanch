import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import axios from "axios"
import {
  Box,
  Button,
  TextField,
  Typography,
  CardContent,
  Container,
  IconButton,
  Avatar,
  Divider,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Fade,
  
  alpha,
  styled,
} from "@mui/material"
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material"
import socialImage from "../assets/social.png"

interface User {
  firstName: string
  lastName: string
  emailAddress: string
  phoneNumber: string
  profilePicture?: string
}

const customColors = {
  primary: "rgb(76, 114, 164)",
  secondary: "rgb(143, 148, 36)",
  accent: "rgb(224, 69, 128)",
  background: "#f8f9fa",
  cardBg: "#ffffff",
  neutral: "rgb(100, 100, 100)",
  lightGrey: "rgb(240, 240, 240)",
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})

const UserProfile: React.FC<{ onEditProfile: () => void }> = ({ onEditProfile }) => {
  const authContext = useContext(AuthContext)
  const [userData, setUserData] = useState<User | null>(null)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const defaultProfilePicture = "/assets/social.png"
  const serverUrl = "http://localhost:5180"

  useEffect(() => {
    if (authContext && authContext.tokensAndIdExist) {
      const fetchUserData = async () => {
        setLoading(true)
        try {
          const response = await axios.get(`/api/user/${authContext.userId}`, {
            headers: {
              Authorization: `Bearer ${authContext.accessToken}`,
            },
          })

          setUserData(response.data)

          const userProfilePicture = response.data.profilePicture
          if (userProfilePicture) {
            setProfilePicture(`${serverUrl}/uploads/${userProfilePicture}`)
          } else {
            setProfilePicture(defaultProfilePicture)
          }
        } catch (error) {
          if (error instanceof Error) {
            setError(`Erreur lors du chargement des données utilisateur: ${error.message}`)
          } else {
            setError("Erreur inconnue")
          }
          setProfilePicture(defaultProfilePicture)
        } finally {
          setLoading(false)
        }
      }

      fetchUserData()
    }
  }, [authContext])

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
            maxWidth: 900,
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
          <Avatar
            src={profilePicture || defaultProfilePicture}
            alt="Photo de profil"
            sx={{
              width: { xs: "150px", md: "200px" },
              height: { xs: "150px", md: "200px" },
              border: `4px solid ${customColors.primary}`,
              boxShadow: "0 8px 24px rgba(76, 114, 164, 0.2)",
              mb: 4,
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />

          {/* Icone de modification */}
          <IconButton
            onClick={onEditProfile}
            aria-label="Modifier le profil"
            sx={{
              position: "absolute",
              top: "20px",
              right: "20px",
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

          <CardContent sx={{ textAlign: "center", width: "100%" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mb: 4,
                color: customColors.primary,
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              {userData?.firstName} {userData?.lastName}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mb: 4 }}>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: alpha(customColors.primary, 0.05),
                  height: "100%",
                }}
              >
                <EmailIcon sx={{ fontSize: 28, color: customColors.primary, mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Adresse email
                  </Typography>
                  <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
                    {userData?.emailAddress}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: alpha(customColors.secondary, 0.05),
                  height: "100%",
                }}
              >
                <PhoneIcon sx={{ fontSize: 28, color: customColors.secondary, mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Numéro de téléphone
                  </Typography>
                  <Typography variant="h6">{userData?.phoneNumber || "Non renseigné"}</Typography>
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onEditProfile}
              sx={{
                mt: 2,
                bgcolor: customColors.primary,
                color: "white",
                px: 4,
                py: 1.5,
                borderRadius: "50px",
                boxShadow: "0 4px 14px rgba(76, 114, 164, 0.25)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: customColors.secondary,
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 20px rgba(76, 114, 164, 0.3)",
                },
              }}
            >
              Modifier mon profil
            </Button>
          </CardContent>
        </Paper>
      </Box>
    </Fade>
  )
}

// Composant ProfileManagement amélioré
const ProfileManagement: React.FC<{ onCancelEdit: () => void }> = ({ onCancelEdit }) => {
  const authContext = useContext(AuthContext)
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
            profilePicture && profilePicture !== "null" ? `${serverUrl}/uploads/${profilePicture}` : socialImage,
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

    setSubmitting(true)

    const formData = new FormData()
    formData.append("firstName", firstName)
    formData.append("lastName", lastName)
    formData.append("emailAddress", email)
    formData.append("phoneNumber", phoneNumber)

    if (password) {
      formData.append("updatedPassword", password)
    }

    if (file) {
      formData.append("profilePicture", file)
    }

    axios
      .patch(`/api/user/${authContext?.userId}`, formData, {
        headers: { Authorization: `Bearer ${authContext?.accessToken}` },
      })
      .then(() => {
        setSuccess("Profil mis à jour avec succès !")
        setTimeout(() => {
          onCancelEdit()
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
                onClick={onCancelEdit}
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
                  src={userImage || socialImage}
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

                <Divider>
                  <Typography variant="body2" color="text.secondary">
                    Photo de profil
                  </Typography>
                </Divider>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      borderColor: customColors.secondary,
                      color: customColors.secondary,
                      "&:hover": {
                        borderColor: customColors.accent,
                        color: customColors.accent,
                        bgcolor: alpha(customColors.accent, 0.05),
                      },
                      borderRadius: "8px",
                      py: 1.2,
                    }}
                  >
                    Choisir une photo
                    <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
                  </Button>
                </Box>
                {file && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Fichier sélectionné: {file.name}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
                <Button
                  variant="outlined"
                  onClick={onCancelEdit}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderColor: alpha(customColors.neutral, 0.5),
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "text.primary",
                      bgcolor: "rgba(0, 0, 0, 0.04)",
                    },
                    borderRadius: "8px",
                    px: 3,
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    bgcolor: customColors.primary,
                    "&:hover": {
                      bgcolor: customColors.secondary,
                    },
                    "&:disabled": {
                      bgcolor: alpha(customColors.primary, 0.6),
                      color: "white",
                    },
                    borderRadius: "8px",
                    px: 4,
                    py: 1.2,
                  }}
                >
                  {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </Box>
    </Fade>
  )
}

// Composant principal
const UserPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {isEditing ? (
        <ProfileManagement onCancelEdit={handleCancelEdit} />
      ) : (
        <UserProfile onEditProfile={handleEditProfile} />
      )}
    </Box>
  )
}

export default UserPage

