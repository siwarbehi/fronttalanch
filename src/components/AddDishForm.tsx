"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
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

interface AddDishFormProps {
  open?: boolean
  onClose?: () => void
  onSuccess?: () => void
  isStandalone?: boolean
}

const AddDishForm: React.FC<AddDishFormProps> = ({ open = true, onClose, onSuccess, isStandalone = false }) => {
  const navigate = useNavigate()

  const customColors = {
    primary: "rgb(76, 114, 164)",
    secondary: "rgb(143, 148, 36)",
    accent: "rgb(224, 69, 128)",
    dessert: "rgb(255, 183, 77)", // Couleur pour les desserts
  }

  const [dishData, setDishData] = useState({
    DishName: "",
    DishDescription: "",
    DishPrice: "",
    DishPhoto: null as File | null,
  })

  const [error, setError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setDishData((prevData) => ({
      ...prevData,
      [name]: name === "DishPrice" ? value.replace(/[^0-9,]/g, "") : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setDishData((prevData) => ({ ...prevData, DishPhoto: files[0] }))

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
      DishName: "",
      DishDescription: "",
      DishPrice: "",
      DishPhoto: null,
    })
    setImagePreview(null)
    setError("")
    setSuccessMessage("")

    // Reset file input
    const fileInput = document.getElementById("dish-photo-input") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleClose = () => {
    resetForm()
    if (onClose) {
      onClose()
    } else if (isStandalone) {
      navigate(-1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    // Vérifier si le nom du plat est vide
    if (!dishData.DishName.trim()) {
      setError("Le nom du plat est obligatoire")
      setLoading(false)
      return
    }

    // Vérifier si le prix est vide
    if (!dishData.DishPrice.trim()) {
      setError("Le prix du plat est obligatoire")
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("DishName", dishData.DishName)
    formData.append("DishDescription", dishData.DishDescription)

    // Valeurs par défaut pour les champs supprimés
    formData.append("DishQuantity", "1") // Valeur par défaut pour la quantité

    // Déterminer automatiquement si c'est une salade basée sur le nom
    const isSalad = dishData.DishName.toUpperCase().includes("SALADE")
    formData.append("IsSalad", isSalad.toString())

    formData.append("DishPrice", dishData.DishPrice.toString().replace(",", "."))

    if (dishData.DishPhoto) {
      formData.append("DishPhoto", dishData.DishPhoto)
    }

    try {
      await axios.post("http://localhost:5180/api/dish", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setSuccessMessage("Plat ajouté avec succès !")

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 1500)
      } else if (isStandalone) {
        setTimeout(() => {
          navigate("/table")
        }, 1500)
      } else {
        resetForm()
      }
    } catch (err) {
      setError("Erreur lors de l'ajout du plat. Veuillez réessayer.")
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

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Nom du Plat"
            name="DishName"
            value={dishData.DishName}
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
            name="DishDescription"
            value={dishData.DishDescription}
            onChange={handleChange}
            required
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
            name="DishPrice"
            type="text"
            value={dishData.DishPrice}
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

            {imagePreview && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
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
              disabled={loading}
              sx={{
                width: "auto",
                backgroundColor: customColors.primary,
                "&:hover": {
                  backgroundColor: customColors.accent,
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Ajouter"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </>
  )

  return open ? (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle>
        <Typography variant="h5" component="span">
          {isStandalone ? "Ajouter un plat" : "Ajouter un nouveau plat"}
        </Typography>
        <IconButton onClick={handleClose} sx={{ position: "absolute", top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{formContent}</DialogContent>
    </Dialog>
  ) : null
}

export default AddDishForm
