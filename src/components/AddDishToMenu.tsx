import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  TextField,
  InputAdornment,
  Divider,
  
  alpha,
} from "@mui/material"
import {
  Close as CloseIcon,
  Add as AddIcon,
  Search as SearchIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from "@mui/icons-material"

interface Dish {
  dishId: number
  dishName: string
  dishDescription?: string
  dishPrice: number
  dishQuantity: number
  isSalad: boolean
}

interface AddDishToMenuProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  menuId: number
  menuDescription: string
  customColors: {
    primary: string
    secondary: string
    accent: string
    neutral: string
    lightGrey: string
  }
}

const AddDishToMenu: React.FC<AddDishToMenuProps> = ({
  open,
  onClose,
  onSuccess,
  menuId,
  menuDescription,
  customColors,
}) => {
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [menuDishes, setMenuDishes] = useState<Dish[]>([])
  const [selectedDishes, setSelectedDishes] = useState<Map<number, number>>(new Map())

  const fetchAvailableDishes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://localhost:5180/api/dish")
      const dishes = response.data.$values ?? response.data
      setAvailableDishes(dishes)
      setFilteredDishes(dishes)
    } catch (error) {
      console.error("Erreur lors du chargement des plats :", error)
      setError("Impossible de charger la liste des plats disponibles.")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMenuDishes = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5180/api/menu/${menuId}/dishes`)
      const dishes = response.data.$values ?? response.data
      setMenuDishes(dishes)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erreur lors du chargement des plats du menu :",error.response?.data || error.message)
        setError("Impossible de charger les plats du menu. Vérifiez que l'ID du menu est valide.")
      } else {
        console.error("Erreur inconnue:", error)
        setError("Une erreur inconnue est survenue.")
      }
    }
  }, [menuId])
  

  useEffect(() => {
    if (open) {
      fetchAvailableDishes()
      fetchMenuDishes()
      setSelectedDishes(new Map())
    }
  }, [open, fetchAvailableDishes, fetchMenuDishes])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDishes(availableDishes)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = availableDishes.filter(
      (dish) =>
        dish.dishName.toLowerCase().includes(term) ||
        dish.dishDescription?.toLowerCase().includes(term),
    )
    setFilteredDishes(filtered)
  }, [searchTerm, availableDishes])

  const handleSubmit = async () => {
    if (selectedDishes.size === 0) {
      setError("Veuillez sélectionner au moins un plat à ajouter au menu.")
      return
    }
  
    setSubmitting(true)
    setError("")
  
    try {
      const addPromises = Array.from(selectedDishes.entries()).map(([dishId, quantity]) =>
        axios.post(`http://localhost:5180/api/menu/${menuId}/${dishId}?quantity=${quantity}`)
      )
  
      await Promise.all(addPromises)
  
      onSuccess()
      onClose()
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setError("Ce plat existe déjà dans le menu.")
      } else {
        setError("Une erreur s'est produite lors de l'ajout des plats au menu.")
      }
    } finally {
      setSubmitting(false)
    }
  }
  

  const isAlreadyInMenu = (dishId: number) =>
    menuDishes.some((dish) => dish.dishId === dishId)

  const handleDishClick = (dishId: number) => {
    if (isAlreadyInMenu(dishId)) return

    const newSelectedDishes = new Map(selectedDishes)
    if (newSelectedDishes.has(dishId)) {
      newSelectedDishes.delete(dishId)
    } else {
      newSelectedDishes.set(dishId, 1)
    }
    setSelectedDishes(newSelectedDishes)
  }

  const handleQuantityChange = (dishId: number, newQuantity: number) => {
    const updated = new Map(selectedDishes)
    if (newQuantity <= 0) {
      updated.delete(dishId)
    } else {
      updated.set(dishId, newQuantity)
    }
    setSelectedDishes(updated)
  }

  const incrementQuantity = (dishId: number) => {
    const currentQuantity = selectedDishes.get(dishId) || 1
    handleQuantityChange(dishId, currentQuantity + 1)
  }

  const decrementQuantity = (dishId: number) => {
    const currentQuantity = selectedDishes.get(dishId) || 1
    if (currentQuantity > 1) {
      handleQuantityChange(dishId, currentQuantity - 1)
    } else {
      const updated = new Map(selectedDishes)
      updated.delete(dishId)
      setSelectedDishes(updated)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AddIcon sx={{ mr: 1, color: customColors.secondary }} />
            <Typography variant="h6" color={customColors.primary}>
              Ajouter des plats au menu "{menuDescription}"
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          fullWidth
          placeholder="Rechercher un plat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: customColors.primary }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 },
          }}
        />

        <Divider sx={{ my: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress sx={{ color: customColors.primary }} />
          </Box>
        ) : filteredDishes.length === 0 ? (
          <Typography align="center" sx={{ my: 4 }} color="text.secondary">
            Aucun plat disponible
          </Typography>
        ) : (
          <List
            sx={{
              maxHeight: "400px",
              overflow: "auto",
              border: `1px solid ${alpha(customColors.primary, 0.2)}`,
              borderRadius: 1,
            }}
          >
            {filteredDishes.map((dish) => {
              const isSelected = selectedDishes.has(dish.dishId)
              const quantity = selectedDishes.get(dish.dishId) || 0
              const isInMenu = isAlreadyInMenu(dish.dishId)

              return (
                <ListItem
                  key={dish.dishId}
                  divider
                  onClick={() => !isInMenu && handleDishClick(dish.dishId)}
                  sx={{
                    cursor: isInMenu ? "not-allowed" : "pointer",
                    opacity: isInMenu ? 0.5 : 1,
                    backgroundColor: isSelected ? alpha(customColors.primary, 0.1) : "transparent",
                    "&:hover": {
                      backgroundColor: !isInMenu ? alpha(customColors.primary, 0.05) : undefined,
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={isSelected ? "bold" : "medium"}>
                      {dish.dishName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dish.dishDescription}
                    </Typography>
                  </Box>

                  {isSelected && (
                    <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <IconButton onClick={() => decrementQuantity(dish.dishId)}>
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                      <Typography>{quantity}</Typography>
                      <IconButton onClick={() => incrementQuantity(dish.dishId)}>
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </Box>
                  )}
                </ListItem>
              )
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={submitting || selectedDishes.size === 0}
        >
          {submitting ? "Ajout en cours..." : "Ajouter au menu"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddDishToMenu
