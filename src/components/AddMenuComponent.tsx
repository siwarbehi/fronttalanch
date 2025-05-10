"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  CircularProgress,
  alpha,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material"
import { Add as AddIcon, Delete as DeleteIcon, RestaurantMenu as RestaurantMenuIcon } from "@mui/icons-material"

// Configuration
const API_CONFIG = {
  baseURL: "http://localhost:5180/api",
  timeout: 5000,
}

interface Dish {
  dishId: number
  dishName: string
  dishPrice: number
  dishDescription: string
}

interface DishSelection {
  dishId: number
  dishQuantity: number
}

interface AddMenuComponentProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  customColors?: {
    primary: string
    secondary: string
    accent: string
    neutral: string
    lightGrey: string
  }
}

export default function AddMenuComponent({
  open,
  onClose,
  onSuccess,
  customColors = {
    primary: "rgb(76, 114, 164)",
    secondary: "rgb(143, 148, 36)",
    accent: "rgb(224, 69, 128)",
    neutral: "rgb(100, 100, 100)",
    lightGrey: "rgb(240, 240, 240)",
  },
}: AddMenuComponentProps) {
  const theme = useTheme()
  const [menuDescription, setMenuDescription] = useState<string>("")
  const [selectedDishes, setSelectedDishes] = useState<DishSelection[]>([{ dishId: 0, dishQuantity: 1 }])
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [fetchingDishes, setFetchingDishes] = useState<boolean>(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [message, setMessage] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success")

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setMenuDescription("")
      setSelectedDishes([{ dishId: 0, dishQuantity: 1 }])
      setValidationErrors({})
      setMessage(null)
      fetchDishes()
    }
  }, [open])

  // Fetch available dishes when component mounts
  const fetchDishes = async () => {
    setFetchingDishes(true)
    try {
      // Créer une instance axios avec la configuration
      const api = axios.create({
        baseURL: API_CONFIG.baseURL,
        timeout: API_CONFIG.timeout,
      })

      const response = await api.get("/dish")

      // Extraire les données, qu'elles soient dans $values ou directement dans l'objet
      let dishes: Dish[] = []
      const data = response.data

      if (data && typeof data === "object") {
        if ("$values" in data) {
          dishes = data.$values
        } else if (Array.isArray(data)) {
          dishes = data
        } else {
          // Parcourir toutes les propriétés pour trouver un tableau
          for (const key in data) {
            if (Array.isArray(data[key])) {
              dishes = data[key]
              break
            }
          }
        }
      }

      setAvailableDishes(dishes)
    } catch (err) {
      console.error("Erreur lors de la récupération des plats", err)
      setMessage("Impossible de charger les plats disponibles.")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    } finally {
      setFetchingDishes(false)
    }
  }

  const handleDishChange = (index: number, dishId: number) => {
    const updatedDishes = [...selectedDishes]
    updatedDishes[index].dishId = Number(dishId)
    setSelectedDishes(updatedDishes)

    // Clear validation error if a dish is selected
    if (dishId > 0) {
      const newErrors = { ...validationErrors }
      delete newErrors[`dish-${index}`]
      setValidationErrors(newErrors)
    }
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedDishes = [...selectedDishes]
    updatedDishes[index].dishQuantity = quantity
    setSelectedDishes(updatedDishes)
  }

  const addDishSelection = () => {
    setSelectedDishes([...selectedDishes, { dishId: 0, dishQuantity: 1 }])
  }

  const removeDishSelection = (index: number) => {
    if (selectedDishes.length > 1) {
      const updatedDishes = selectedDishes.filter((_, i) => i !== index)
      setSelectedDishes(updatedDishes)

      // Remove any validation errors for this dish
      const newErrors = { ...validationErrors }
      delete newErrors[`dish-${index}`]
      setValidationErrors(newErrors)
    }
  }

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}
    let isValid = true

    // Check if at least one dish is selected
    let hasValidDish = false
    selectedDishes.forEach((dish, index) => {
      if (dish.dishId <= 0) {
        errors[`dish-${index}`] = "Veuillez sélectionner un plat"
      } else {
        hasValidDish = true
      }
    })

    if (!hasValidDish) {
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Filtrer les plats valides (avec un ID > 0)
      const validDishes = selectedDishes.filter((dish) => dish.dishId > 0)

      // Créer l'objet MenuDto selon la structure attendue par le contrôleur
      const menuDto = {
        menuDescription: menuDescription,
        dishes: validDishes.map((dish) => ({
          dishId: dish.dishId,
          dishQuantity: dish.dishQuantity,
        })),
      }

      console.log("Envoi des données:", menuDto)

      // Envoyer la requête avec JSON
      const response = await axios.post("http://localhost:5180/api/menu", menuDto, {
        headers: { "Content-Type": "application/json" },
      })

      console.log("Menu créé :", response.data)
      setMessage("Menu ajouté avec succès !")
      setSnackbarSeverity("success")
      setSnackbarOpen(true)

      // Fermer le dialogue après un court délai
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Erreur lors de la création du menu", error)

      let errorMessage = "Une erreur est survenue lors de la création du menu"
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
      }

      setMessage(errorMessage)
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: `linear-gradient(90deg, ${customColors.primary} 0%, ${customColors.secondary} 100%)`,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            pt: 3,
            pb: 2,
          }}
        >
          <RestaurantMenuIcon sx={{ color: customColors.secondary, fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold" color={customColors.primary}>
            Créer un nouveau menu
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              fullWidth
              label="Description du menu (optionnel)"
              multiline
              rows={3}
              value={menuDescription}
              onChange={(e) => setMenuDescription(e.target.value)}
              variant="outlined"
              placeholder="Entrez une description pour ce menu..."
              sx={{ mb: 4, mt: 1 }}
            />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" color={customColors.primary} fontWeight="medium">
                  Plats du menu
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addDishSelection}
                  sx={{
                    borderColor: alpha(customColors.secondary, 0.7),
                    color: customColors.secondary,
                    "&:hover": {
                      borderColor: customColors.secondary,
                      backgroundColor: alpha(customColors.secondary, 0.05),
                    },
                  }}
                >
                  Ajouter un plat
                </Button>
              </Box>

              {fetchingDishes ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={40} sx={{ color: customColors.primary }} />
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {selectedDishes.map((dish, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(customColors.lightGrey, 0.5),
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "flex-end" }}>
                        <Box sx={{ flex: { xs: "0 0 100%", md: "0 0 66.666%" } }}>
                          <FormControl fullWidth error={!!validationErrors[`dish-${index}`]}>
                            <InputLabel id={`dish-select-label-${index}`}>Sélectionner un plat</InputLabel>
                            <Select
                              labelId={`dish-select-label-${index}`}
                              value={dish.dishId.toString()}
                              onChange={(e) => handleDishChange(index, Number(e.target.value))}
                              label="Sélectionner un plat"
                            >
                              <MenuItem value="0" disabled>
                                <em>Sélectionner un plat</em>
                              </MenuItem>
                              {availableDishes.filter(dish =>  dish.dishId).map((availableDish) => (
                                <MenuItem key={availableDish.dishId} value={availableDish.dishId.toString()}>
                                  {availableDish.dishName} 
                                </MenuItem>
                              ))}
                            </Select>
                            {validationErrors[`dish-${index}`] && (
                              <FormHelperText>{validationErrors[`dish-${index}`]}</FormHelperText>
                            )}
                          </FormControl>
                        </Box>
                        <Box sx={{ flex: { xs: "0 0 66.666%", md: "0 0 25%" } }}>
                          <TextField
                            fullWidth
                            label="Quantité"
                            type="number"
                            InputProps={{ inputProps: { min: 1 } }}
                            value={dish.dishQuantity}
                            onChange={(e) => handleQuantityChange(index, Number.parseInt(e.target.value) || 1)}
                          />
                        </Box>
                        <Box
                          sx={{
                            flex: { xs: "0 0 33.333%", md: "0 0 8.333%" },
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            onClick={() => removeDishSelection(index)}
                            disabled={selectedDishes.length <= 1}
                            sx={{
                              color: customColors.accent,
                              "&.Mui-disabled": {
                                color: alpha(theme.palette.text.disabled, 0.3),
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 3, justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: alpha(customColors.neutral, 0.5),
              color: customColors.neutral,
              "&:hover": {
                borderColor: customColors.neutral,
                backgroundColor: alpha(customColors.neutral, 0.05),
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: customColors.secondary,
              color: "white",
              "&:hover": {
                backgroundColor: alpha(customColors.secondary, 0.9),
              },
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Création...
              </>
            ) : (
              "Créer le menu"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            bgcolor: snackbarSeverity === "success" ? customColors.secondary : customColors.accent,
            fontSize: "1.1rem",
            py: 1.5,
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  )
}
