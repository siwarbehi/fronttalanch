
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  CircularProgress,
  alpha,

  Snackbar,
  Alert,
  Chip,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material"

// Configuration
const API_CONFIG = {
  baseURL: "http://localhost:5180/api",
  timeout: 5000,
}

interface Dish {
  dishId: number
  dishName: string
  dishPrice: number
  dishDescription?: string
}

interface DishSelection {
  dishId: number
  dishQuantity: number
}

interface MenuType {
  menuId: number
  menuDescription: string
  isMenuOfTheDay: boolean
  dishes: {
    dishName: string
    dishQuantity: number
    dishId?: number
  }[]
  expanded?: boolean
}

interface UpdateMenuAndAddDishProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  currentMenu: MenuType | null
  customColors?: {
    primary: string
    secondary: string
    accent: string
    neutral: string
    lightGrey: string
  }
}

export default function UpdateMenuAndAddDish({
  open,
  onClose,
  onSuccess,
  currentMenu,
  customColors = {
    primary: "rgb(76, 114, 164)",
    secondary: "rgb(143, 148, 36)",
    accent: "rgb(224, 69, 128)",
    neutral: "rgb(100, 100, 100)",
    lightGrey: "rgb(240, 240, 240)",
  },
}: UpdateMenuAndAddDishProps) {
  const [menuDescription, setMenuDescription] = useState<string>("")
  const [existingDishes, setExistingDishes] = useState<MenuType["dishes"]>([])
  const [newDish, setNewDish] = useState<DishSelection>({ dishId: 0, dishQuantity: 1 })
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [fetchingDishes, setFetchingDishes] = useState<boolean>(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [message, setMessage] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success")

  // Reset form when dialog opens and load current menu data
  useEffect(() => {
    if (open && currentMenu) {
      setMenuDescription(currentMenu.menuDescription || "")
      setValidationErrors({})
      setMessage(null)
      setNewDish({ dishId: 0, dishQuantity: 1 })

      // Charger les plats existants
      if (currentMenu.dishes && currentMenu.dishes.length > 0) {
        setExistingDishes(currentMenu.dishes)
      } else {
        setExistingDishes([])
      }

      fetchDishes()
    }
  }, [open, currentMenu])

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

  const handleDishChange = (dishId: number) => {
    setNewDish({ ...newDish, dishId: Number(dishId) })

    // Clear validation error if a dish is selected
    if (dishId > 0) {
      const newErrors = { ...validationErrors }
      delete newErrors["new-dish"]
      setValidationErrors(newErrors)
    }
  }

  const handleQuantityChange = (quantity: number) => {
    setNewDish({ ...newDish, dishQuantity: quantity })
  }

  const handleRemoveDish = async (dishId: number | undefined) => {
    if (!dishId || !currentMenu) return;
  
    setIsLoading(true);
  
    try {
      // Créer le payload
      const command = {
        menuId: currentMenu.menuId,
        dishId: dishId,
      };
  
      // Utiliser axios.delete avec le corps dans l'objet `data`
      await axios.delete(`${API_CONFIG.baseURL}/menu`, {
        data: command, // c'est ici qu'on envoie le JSON
      });
  
      // Mettre à jour la liste des plats existants
      setExistingDishes(existingDishes.filter((dish) => dish.dishId !== dishId));
  
      setMessage("Plat supprimé avec succès !");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erreur lors de la suppression du plat", error);
  
      let errorMessage = "Une erreur est survenue lors de la suppression du plat";
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          errorMessage =
            typeof error.response.data === "string"
              ? error.response.data
              : error.response.data.message || error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
  
      setMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };
  

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}
    let isValid = true

    // Validation uniquement si on ajoute un nouveau plat
    if (newDish.dishId <= 0) {
      errors["new-dish"] = "Veuillez sélectionner un plat"
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleAddDish = async () => {
    if (!validateForm() || !currentMenu) return

    setIsLoading(true)

    try {
      const menuId = currentMenu.menuId
      console.log("menuId")
      // DTO pour le plat à ajouter
      const dto = {
        dishId: newDish.dishId,
        quantity: newDish.dishQuantity,
        newDescription: menuDescription,
      }
  
      const response = await axios.post(`${API_CONFIG.baseURL}/menu/${menuId}`, dto)

      // Si le plat est déjà présent, afficher un message d'erreur
      if (response.data?.dishAlreadyExists) {
        const selectedDish = availableDishes.find((dish) => dish.dishId === newDish.dishId)
        setMessage(`Le plat "${selectedDish?.dishName}" est déjà dans ce menu.`)
        setSnackbarSeverity("error")
        setSnackbarOpen(true)
        setIsLoading(false)
        return
      }
      console.log("menuId", menuId)
      console.log("dto", dto)
      // Ajouter le plat à la liste des plats existants
      const selectedDish = availableDishes.find((dish) => dish.dishId === newDish.dishId)
      if (selectedDish) {
        setExistingDishes([
          ...existingDishes,
          {
            dishId: newDish.dishId,
            dishName: selectedDish.dishName,
            dishQuantity: newDish.dishQuantity,
          },
        ])
      }

      // Réinitialiser le formulaire d'ajout de plat
      setNewDish({ dishId: 0, dishQuantity: 1 })

      setMessage("Plat ajouté avec succès !")
      setSnackbarSeverity("success")
      setSnackbarOpen(true)
    } catch (error) {
      console.error("Erreur lors de l'ajout du plat", error)

      let errorMessage = "Une erreur est survenue lors de l'ajout du plat"
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          errorMessage =
            typeof error.response.data === "string" ? error.response.data : error.response.data.message || error.message
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentMenu) return

    setIsLoading(true)

    try {
      const menuId = currentMenu.menuId

      // Mettre à jour uniquement la description
      const dto = {
        dishId: -1, // Utiliser un dishId négatif pour indiquer qu'on veut juste mettre à jour la description
        quantity: 0,
        newDescription: menuDescription,
      }

      await axios.post(`${API_CONFIG.baseURL}/menu/${menuId}`, dto)

      setMessage("Menu mis à jour avec succès !")
      setSnackbarSeverity("success")
      setSnackbarOpen(true)

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du menu", error)

      let errorMessage = "Une erreur est survenue lors de la mise à jour du menu"
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          errorMessage =
            typeof error.response.data === "string" ? error.response.data : error.response.data.message || error.message
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

  if (!currentMenu) {
    return null
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            maxHeight: "80vh",
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
          <EditIcon sx={{ color: customColors.secondary, fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold" color={customColors.primary}>
            Modifier le menu "{currentMenu.menuDescription}"
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              fullWidth
              label="Description du menu"
              multiline
              rows={2}
              value={menuDescription}
              onChange={(e) => setMenuDescription(e.target.value)}
              variant="outlined"
              placeholder="Entrez une description pour ce menu..."
              sx={{ mb: 3, mt: 1 }}
            />

            {/* Plats existants */}
            {existingDishes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" color={customColors.primary} fontWeight="medium" sx={{ mb: 2 }}>
                  Plats actuels dans ce menu
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {existingDishes.map((dish, index) => (
                    <Chip
                      key={index}
                      label={`${dish.dishName} (${dish.dishQuantity})`}
                      onDelete={() => handleRemoveDish(dish.dishId)}
                      sx={{
                        bgcolor: alpha(customColors.primary, 0.1),
                        color: customColors.primary,
                        fontWeight: "medium",
                        py: 2,
                        px: 1,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Ajout de nouveaux plats */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" color={customColors.primary} fontWeight="medium">
                  Ajouter un plat
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleAddDish}
                  disabled={isLoading || newDish.dishId <= 0}
                  size="small"
                  sx={{
                    borderColor: alpha(customColors.secondary, 0.7),
                    color: customColors.secondary,
                    minWidth: "36px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    p: 0,
                    "&:hover": {
                      borderColor: customColors.secondary,
                      backgroundColor: alpha(customColors.secondary, 0.05),
                    },
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>

              {fetchingDishes ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={40} sx={{ color: customColors.primary }} />
                </Box>
              ) : (
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(customColors.lightGrey, 0.5),
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "flex-end" }}>
                    <Box sx={{ flex: { xs: "0 0 100%", sm: "0 0 70%" } }}>
                      <FormControl fullWidth error={!!validationErrors["new-dish"]}>
                        <InputLabel id="new-dish-select-label">Sélectionner un plat</InputLabel>
                        <Select
                          labelId="new-dish-select-label"
                          value={newDish.dishId.toString()}
                          onChange={(e) => handleDishChange(Number(e.target.value))}
                          label="Sélectionner un plat"
                        >
                          <MenuItem value="0" disabled>
                            <em>Sélectionner un plat</em>
                          </MenuItem>
                          {availableDishes
                            .filter(
                              (dish) => !existingDishes.some((existingDish) => existingDish.dishId === dish.dishId),
                            )
                            .map((dish) => (
                              <MenuItem key={dish.dishId} value={dish.dishId.toString()}>
                                {dish.dishName} 
                              </MenuItem>
                            ))}
                        </Select>
                        {validationErrors["new-dish"] && (
                          <FormHelperText>{validationErrors["new-dish"]}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                    <Box sx={{ flex: { xs: "0 0 100%", sm: "0 0 30%" } }}>
                      <TextField
                        fullWidth
                        label="Quantité"
                        type="number"
                        InputProps={{ inputProps: { min: 1 } }}
                        value={newDish.dishQuantity}
                        onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                      />
                    </Box>
                  </Box>
                </Paper>
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
                Mise à jour...
              </>
            ) : (
              "Mettre à jour le menu"
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
