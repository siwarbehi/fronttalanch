"use client"

import React, { useState, useEffect, useCallback } from "react"
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

const formatPriceForDisplay = (price: number): string =>
  price.toString().replace(".", ",")

const formatPriceForBackend = (price: string): string =>
  price.replace(",", ".")

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
    dishId,
    dishName: "",
    dishDescription: "",
    dishPrice: "",
  })
  const [dishPhoto, setDishPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [fieldsChanged, setFieldsChanged] = useState<Set<string>>(new Set())

  const fetchDishData = useCallback(async () => {
    setFetchLoading(true)
    try {
      const { data } = await axios.get(`http://localhost:5180/api/dish/${dishId}`)
      const dto = data.$values ? data.$values[0] : data

      setDishData({
        dishId: dto.dishId,
        dishName: dto.dishName || "",
        dishDescription: dto.dishDescription || "",
        dishPrice: formatPriceForDisplay(dto.dishPrice || 0),
      })
      if (dto.dishPhoto) {
        setOriginalImageUrl(dto.dishPhoto)
      }
    } catch (err) {
      console.error(err)
      setError("Erreur lors du chargement des données du plat.")
    } finally {
      setFetchLoading(false)
    }
  }, [dishId])

  useEffect(() => {
    if (open) {
      fetchDishData()
      setFieldsChanged(new Set())
    }
  }, [open, fetchDishData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFieldsChanged(prev => new Set(prev).add(name))
    if (name === "dishPrice") {
      const sanitized = value.replace(/[^0-9,]/g, "")
      setDishData(prev => ({ ...prev, [name]: sanitized }))
    } else {
      setDishData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setDishPhoto(files[0])
      setFieldsChanged(prev => new Set(prev).add("Photo"))
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(files[0])
    }
  }

  const resetForm = () => {
    setDishData({ dishId, dishName: "", dishDescription: "", dishPrice: "" })
    setDishPhoto(null)
    setImagePreview(null)
    setOriginalImageUrl(null)
    setError("")
    setSuccessMessage("")
    setFieldsChanged(new Set())
  }

  const handleClose = () => {
    resetForm()
    onClose?.()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccessMessage(""); setLoading(true)

    const formData = new FormData()
    if (fieldsChanged.has("dishName")) formData.append("dishName", dishData.dishName)
    if (fieldsChanged.has("dishDescription")) formData.append("dishDescription", dishData.dishDescription)
    if (fieldsChanged.has("dishPrice")) {
      formData.append("dishPrice", formatPriceForBackend(dishData.dishPrice.toString()))
    }
    if (dishPhoto) {
      formData.append("Photo", dishPhoto)
    }

    try {
      await axios.patch(`http://localhost:5180/api/dish/${dishId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setSuccessMessage("Plat mis à jour avec succès !")
      if (onSuccess) setTimeout(() => { onSuccess(); handleClose() }, 1500)
    } catch (err) {
      console.error(err)
      setError("Erreur lors de la mise à jour du plat. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <>
      {error && <Alert severity="error" sx={{ mb:3, bgcolor: alpha(customColors.accent,0.1), color: customColors.accent }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb:3, bgcolor: alpha(customColors.secondary,0.1), color: customColors.secondary }}>{successMessage}</Alert>}

      {fetchLoading
        ? <Box sx={{ display:"flex", justifyContent:"center", my:4 }}><CircularProgress sx={{ color: customColors.primary }} /></Box>
        : <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth label="Nom du Plat"
                name="dishName" value={dishData.dishName}
                onChange={handleChange} required
                placeholder="Ex: Lasagne Végétarienne"
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: customColors.primary },
                  "& .MuiInputLabel-root.Mui-focused": { color: customColors.primary },
                }}
              />

              <TextField
                fullWidth label="Description"
                name="dishDescription" value={dishData.dishDescription}
                onChange={handleChange} multiline rows={4}
                placeholder="Décrivez les ingrédients..."
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: customColors.primary },
                  "& .MuiInputLabel-root.Mui-focused": { color: customColors.primary },
                }}
              />

              <TextField
                fullWidth label="Prix"
                name="dishPrice" type="text"
                value={dishData.dishPrice} onChange={handleChange}
                required placeholder="Ex: 12,55"
                inputProps={{ inputMode: "decimal", pattern: "[0-9]+([,][0-9]*)?" }}
                InputProps={{ endAdornment:<InputAdornment position="end">DT</InputAdornment> }}
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: customColors.primary },
                  "& .MuiInputLabel-root.Mui-focused": { color: customColors.primary },
                }}
              />

              <Divider sx={{ my:1 }} />

              <Box>
                <Typography variant="subtitle1" gutterBottom>Photo du plat</Typography>
                <Button
                  component="label" variant="outlined" startIcon={<CloudUploadIcon />}
                  sx={{
                    mb:2, width:"100%", borderColor:customColors.primary, color:customColors.primary,
                    "&:hover":{ borderColor:customColors.accent, color:customColors.accent }
                  }}
                >
                  Télécharger une photo
                  <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
                </Button>

                {(imagePreview || originalImageUrl) && (
                  <Box sx={{ display:"flex", justifyContent:"center", mb:2 }}>
                    <img
                      src={imagePreview || originalImageUrl!}
                      alt="Aperçu du plat"
                      style={{ maxWidth:"100%", maxHeight:300, objectFit:"contain" }}
                    />
                  </Box>
                )}
              </Box>

              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button variant="outlined" color="error" onClick={handleClose}
                  sx={{
                    color: customColors.accent,
                    borderColor: customColors.accent,
                    "&:hover":{ color:customColors.primary, borderColor:customColors.primary }
                  }}
                >
                  Annuler
                </Button>
                <Button variant="contained" color="primary" type="submit"
                  disabled={loading || fieldsChanged.size===0}
                  sx={{
                    backgroundColor: customColors.primary,
                    "&:hover":{ backgroundColor: customColors.accent }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit"/> : "Mettre à jour"}
                </Button>
              </Stack>
            </Stack>
          </form>
      }
    </>
  )

  if (isStandalone) {
    return <Box sx={{ p:3 }}>{formContent}</Box>
  }
  return open ? (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5">Modifier le plat</Typography>
        <IconButton onClick={handleClose} sx={{ position:"absolute", top:8, right:8 }}>
          <CloseIcon/>
        </IconButton>
      </DialogTitle>
      <DialogContent>{formContent}</DialogContent>
    </Dialog>
  ) : null
}

export default DishUpdateForm
