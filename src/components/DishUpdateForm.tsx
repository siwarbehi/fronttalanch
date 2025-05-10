"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { alpha } from "@mui/system"
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  styled,
} from "@mui/material"
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from "@mui/icons-material"

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

interface DishUpdateFormProps {
  dishId: number
  open?: boolean
  onClose?: () => void
  onSuccess?: () => void
  isStandalone?: boolean
}

interface Dish {
  dishId: number
  dishName: string
  dishDescription: string
  dishPrice: number | string
  dishPhoto?: string
}

// Fonction pour formater le prix avec virgule pour l'affichage
const formatPriceForDisplay = (price: number): string => {
  return price.toString().replace(".", ",")
}

// Fonction pour convertir le prix avec virgule en format avec point pour le backend
const formatPriceForBackend = (price: string): string => {
  // Remplacer la virgule par un point et s'assurer que c'est une chaîne valide
  return price.toString().replace(",", ".")
}

const DishUpdateForm: React.FC<DishUpdateFormProps> = ({
  dishId,
  open = true,
  onClose,
  onSuccess,
  isStandalone = false,
}) => {
  const customColors = {
    primary: "rgb(76, 114, 164)",
    secondary: "rgb(143, 148, 36)",
    accent: "rgb(224, 69, 128)",
  }

  const [dishData, setDishData] = useState<Dish>({
    dishId: dishId,
    dishName: "",
    dishDescription: "",
    dishPrice: "",
  })

  const [dishPhoto, setDishPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchLoading, setFetchLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [fieldsChanged, setFieldsChanged] = useState<Set<string>>(new Set())

  const fetchDishData = useCallback(async () => {
    setFetchLoading(true)
    try {
      const response = await axios.get(`http://localhost:5180/api/dish/${dishId}`)
      const dish = response.data

      // Handle different API response structures
      const dishData = dish.$values ? dish.$values[0] : dish

      setDishData({
        dishId: dishData.dishId,
        dishName: dishData.dishName || "",
        dishDescription: dishData.dishDescription || "",
        // Formater le prix pour l'affichage avec virgule
        dishPrice: formatPriceForDisplay(dishData.dishPrice || 0),
      })

      if (dishData.dishPhoto) {
        setOriginalImageUrl(`http://localhost:5180/dishes/${dishData.dishPhoto}`)
      }
    } catch (err) {
      console.error("Error fetching dish data:", err)
      setError("Erreur lors du chargement des données du plat.")
    } finally {
      setFetchLoading(false)
    }
  }, [dishId])

  useEffect(() => {
    if (open && dishId) {
      fetchDishData()
      // Réinitialiser les champs modifiés lors de l'ouverture du formulaire
      setFieldsChanged(new Set())
    }
  }, [open, dishId, fetchDishData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Ajouter le nom du champ à l'ensemble des champs modifiés
    setFieldsChanged((prev) => new Set(prev).add(name))

    if (name === "dishPrice") {
      // Pour le champ de prix, accepter uniquement les chiffres et une virgule
      const newValue = value.replace(/[^0-9,]/g, "")
      setDishData((prevData) => ({
        ...prevData,
        [name]: newValue,
      }))
    } else {
      setDishData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setDishPhoto(files[0])
      setFieldsChanged((prev) => new Set(prev).add("dishPhoto"))

      // Create image preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(files[0])
    }
  }

  const resetForm = () => {
    setDishData({
      dishId: dishId,
      dishName: "",
      dishDescription: "",
      dishPrice: "",
    })
    setDishPhoto(null)
    setImagePreview(null)
    setOriginalImageUrl(null)
    setError("")
    setSuccessMessage("")
    setFieldsChanged(new Set())
  }

  const handleClose = () => {
    resetForm()
    if (onClose) {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    const formData = new FormData()

    // N'ajouter que les champs qui ont été modifiés
    if (fieldsChanged.has("dishName")) {
      formData.append("dishName", dishData.dishName)
    }

    if (fieldsChanged.has("dishDescription")) {
      formData.append("dishDescription", dishData.dishDescription)
    }

    if (fieldsChanged.has("dishPrice")) {
      // Convertir le prix avec virgule en format avec point pour le backend
      const formattedPrice = formatPriceForBackend(dishData.dishPrice.toString())
      formData.append("dishPrice", formattedPrice)
    }

    // Ajouter la photo si elle a été modifiée
    if (dishPhoto) {
      formData.append("dishPhoto", dishPhoto)
    }

    try {
      // Utiliser PATCH au lieu de PUT pour correspondre au contrôleur backend
      await axios.patch(`http://localhost:5180/api/dish/${dishId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setSuccessMessage("Plat mis à jour avec succès !")

      // Notify parent component of success if callback provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 1500) // Close after showing success message briefly
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour du plat. Veuillez réessayer.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <>
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 1,
            bgcolor: alpha(customColors.accent, 0.1),
            color: customColors.accent,
            "& .MuiAlert-icon": {
              color: customColors.accent,
            },
          }}
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 1,
            bgcolor: alpha(customColors.secondary, 0.1),
            color: customColors.secondary,
            "& .MuiAlert-icon": {
              color: customColors.secondary,
            },
          }}
        >
          {successMessage}
        </Alert>
      )}

      {fetchLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress sx={{ color: customColors.primary }} />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nom du Plat"
              name="dishName"
              value={dishData.dishName}
              onChange={handleChange}
              required
              variant="outlined"
              placeholder="Ex: Lasagne Végétarienne"
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
              fullWidth
              label="Description"
              name="dishDescription"
              value={dishData.dishDescription}
              onChange={handleChange}
              multiline
              rows={4}
              variant="outlined"
              placeholder="Décrivez les ingrédients et la préparation..."
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
              fullWidth
              label="Prix"
              name="dishPrice"
              type="text"
              value={dishData.dishPrice}
              onChange={handleChange}
              required
              variant="outlined"
              placeholder="Ex: 12,55"
              inputProps={{ inputMode: "decimal", pattern: "[0-9]+([,][0-9]*)?" }}
              InputProps={{
                endAdornment: <InputAdornment position="end">DT</InputAdornment>,
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

            <Divider sx={{ my: 1 }} />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Photo du plat
              </Typography>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{
                  mb: 2,
                  width: "100%",
                  borderColor: customColors.primary,
                  color: customColors.primary,
                  "&:hover": {
                    borderColor: customColors.accent,
                    color: customColors.accent,
                  },
                }}
              >
                Télécharger une photo
                <VisuallyHiddenInput id="dish-photo-input" type="file" accept="image/*" onChange={handleFileChange} />
              </Button>

              {(imagePreview || originalImageUrl) && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <img
                    src={imagePreview || originalImageUrl || ""}
                    alt="Aperçu du plat"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
            </Box>

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleClose}
                sx={{
                  width: "auto",
                  color: customColors.accent,
                  borderColor: customColors.accent,
                  "&:hover": {
                    borderColor: customColors.primary,
                    color: customColors.primary,
                  },
                }}
              >
                Annuler
              </Button>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading || fieldsChanged.size === 0}
                sx={{
                  width: "auto",
                  backgroundColor: customColors.primary,
                  "&:hover": {
                    backgroundColor: customColors.accent,
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Mettre à jour"}
              </Button>
            </Stack>
          </Stack>
        </form>
      )}
    </>
  )

  // Si le composant est utilisé en mode autonome, afficher directement le contenu
  if (isStandalone) {
    return <Box sx={{ p: 3 }}>{formContent}</Box>
  }

  // Sinon, afficher dans une boîte de dialogue
  return open ? (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="span">
          Modifier le plat
        </Typography>
        <IconButton onClick={handleClose} sx={{ position: "absolute", top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{formContent}</DialogContent>
    </Dialog>
  ) : null
}

export default DishUpdateForm
