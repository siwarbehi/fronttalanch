import { useEffect, useState } from "react"
import axios from "axios"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Box,
  useTheme,
  alpha,
  Snackbar,
  Alert,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Restaurant as DishIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  LocalDining as DiningIcon,
  Cake as CakeIcon,
  Spa as SpaIcon,
} from "@mui/icons-material"
import AddDishForm from "./AddDishForm"
import DishUpdateForm from "./DishUpdateForm"
import DishDeleteDialog from "./DishDeleteDialog"

// Définition de l'interface pour un plat selon le modèle backend
interface Dish {
  dishId: number
  dishName: string
  dishDescription?: string
  orderDate: string
  dishQuantity: number
  reviewCount: number
  dishPhoto?: string
  dishPrice: number
  currentRating: number
  isSalad: boolean
  menuDishes: unknown[]
  orderDishes: unknown[]
}

// Fonction pour récupérer les plats depuis l'API
const fetchDishes = async (): Promise<Dish[]> => {
  try {
    const response = await axios.get("http://localhost:5180/api/dish")

    // Vérification de la structure de la réponse et extraction des plats
    if (!Array.isArray(response.data.$values)) {
      throw new Error("Format de réponse invalide : attendu un tableau sous $values.")
    }

    return response.data.$values
  } catch (error) {
    console.error("Erreur API :", error)
    throw error
  }
}

// Interface pour le dialogue de mise à jour des prix
interface PriceUpdateDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (newPrice: number) => void
  title: string
  currentPrice?: number
}

// Composant pour le dialogue de mise à jour des prix
const PriceUpdateDialog: React.FC<PriceUpdateDialogProps> = ({ open, onClose, onSubmit, title, currentPrice }) => {
  const [price, setPrice] = useState<string>(currentPrice ? currentPrice.toString().replace(".", ",") : "")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (open && currentPrice) {
      setPrice(currentPrice.toString().replace(".", ","))
    } else {
      setPrice("")
    }
    setError("")
  }, [open, currentPrice])

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9,]/g, "")
    setPrice(value)
  }

  const handleSubmit = () => {
    if (!price) {
      setError("Veuillez entrer un prix valide")
      return
    }

    const numericPrice = Number.parseFloat(price.replace(",", "."))
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Le prix doit être un nombre positif")
      return
    }

    onSubmit(numericPrice)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Nouveau prix"
          type="text"
          fullWidth
          value={price}
          onChange={handlePriceChange}
          InputProps={{
            endAdornment: <InputAdornment position="end">DT</InputAdornment>,
          }}
          inputProps={{ inputMode: "decimal", pattern: "[0-9]+([,][0-9]*)?" }}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Mettre à jour
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const DishTable: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })
  const [addDishDialogOpen, setAddDishDialogOpen] = useState<boolean>(false)
  const [updateDishDialogOpen, setUpdateDishDialogOpen] = useState<boolean>(false)
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null)
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null)
  const [sortOrder, setSortOrder] = useState<"name" | "price">("name")
  const [filterType, setFilterType] = useState<"all" | "salade" | "dessert" | "other">("all")

  // États pour les dialogues de mise à jour des prix
  const [saladePriceDialogOpen, setSaladePriceDialogOpen] = useState<boolean>(false)
  const [dessertPriceDialogOpen, setDessertPriceDialogOpen] = useState<boolean>(false)
  const [otherPriceDialogOpen, setOtherPriceDialogOpen] = useState<boolean>(false)
  const [updatingPrices, setUpdatingPrices] = useState<boolean>(false)

  const theme = useTheme()

  // Couleurs personnalisées pour la cohérence visuelle
  const customColors = {
    primary: "rgb(76, 114, 164)",
    secondary: "rgb(143, 148, 36)",
    accent: "rgb(224, 69, 128)",
    neutral: "rgb(100, 100, 100)",
    lightGrey: "rgb(240, 240, 240)",
    dessert: "rgb(255, 183, 77)", // Couleur pour les desserts
  }

  // Remplacer cette valeur par l'URL du serveur réel

  useEffect(() => {
    loadDishes()
  }, [])

  useEffect(() => {
    // Filtrer et trier les plats lorsque les critères changent
    let result = [...dishes]

    // Appliquer la recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (dish) =>
          dish.dishName.toLowerCase().includes(term) ||
          (dish.dishDescription && dish.dishDescription.toLowerCase().includes(term)),
      )
    }

    // Appliquer le filtre par type
    if (filterType !== "all") {
      if (filterType === "salade") {
        result = result.filter((dish) => dish.dishName.toUpperCase().includes("SALADE"))
      } else if (filterType === "dessert") {
        result = result.filter((dish) => dish.dishName.toUpperCase().includes("DESSERT"))
      } else {
        result = result.filter(
          (dish) => !dish.dishName.toUpperCase().includes("SALADE") && !dish.dishName.toUpperCase().includes("DESSERT"),
        )
      }
    }

    // Séparer les plats par catégorie
    const salades = result.filter((dish) => dish.dishName.toUpperCase().includes("SALADE"))
    const desserts = result.filter((dish) => dish.dishName.toUpperCase().includes("DESSERT"))
    const autres = result.filter(
      (dish) => !dish.dishName.toUpperCase().includes("SALADE") && !dish.dishName.toUpperCase().includes("DESSERT"),
    )

    // Trier chaque catégorie séparément
    const sortDishes = (dishes: Dish[]) => {
      return dishes.sort((a, b) => {
        switch (sortOrder) {
          case "name":
            return a.dishName.localeCompare(b.dishName)
          case "price":
            return a.dishPrice - b.dishPrice
          default:
            return 0
        }
      })
    }

    // Combiner les catégories triées avec les salades et desserts en premier
    setFilteredDishes([...sortDishes(salades), ...sortDishes(desserts), ...sortDishes(autres)])
  }, [dishes, searchTerm, sortOrder, filterType])

  const loadDishes = async () => {
    setLoading(true)
    try {
      const data = await fetchDishes()
      setDishes(data)

      // Séparer les plats par catégorie dès le chargement
      const salades = data.filter((dish) => dish.dishName.toUpperCase().includes("SALADE"))
      const desserts = data.filter((dish) => dish.dishName.toUpperCase().includes("DESSERT"))
      const autres = data.filter(
        (dish) => !dish.dishName.toUpperCase().includes("SALADE") && !dish.dishName.toUpperCase().includes("DESSERT"),
      )

      // Combiner les catégories avec les salades et desserts en premier
      setFilteredDishes([...salades, ...desserts, ...autres])

      setError(null)
    } catch (err) {
      console.error("Erreur :", err)
      setError(`Erreur: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDish = () => {
    setAddDishDialogOpen(true)
  }

  const handleAddDishSuccess = () => {
    loadDishes() // Recharger la liste des plats
    setSnackbar({
      open: true,
      message: "Le plat a été ajouté avec succès !",
      severity: "success",
    })
  }

  const handleEditDish = (dishId: number) => {
    setSelectedDishId(dishId)
    setUpdateDishDialogOpen(true)
  }

  const handleCloseUpdateDialog = () => {
    setUpdateDishDialogOpen(false)
    setSelectedDishId(null)
  }

  const handleUpdateDishSuccess = () => {
    loadDishes() // Recharger la liste des plats
    setSnackbar({
      open: true,
      message: "Le plat a été mis à jour avec succès !",
      severity: "success",
    })
  }

  const handleDeleteClick = (dish: Dish) => {
    setDishToDelete(dish)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = (deletedDishId: number) => {
    // Mettre à jour la liste des plats localement sans recharger depuis l'API
    const updatedDishes = dishes.filter((dish) => dish.dishId !== deletedDishId)
    setDishes(updatedDishes)

    // Réappliquer la logique de tri avec les salades et desserts en premier
    const salades = updatedDishes.filter((dish) => dish.dishName.toUpperCase().includes("SALADE"))
    const desserts = updatedDishes.filter((dish) => dish.dishName.toUpperCase().includes("DESSERT"))
    const autres = updatedDishes.filter(
      (dish) => !dish.dishName.toUpperCase().includes("SALADE") && !dish.dishName.toUpperCase().includes("DESSERT"),
    )

    setFilteredDishes([...salades, ...desserts, ...autres])

    // Afficher un message de succès
    const deletedDish = dishToDelete
    setSnackbar({
      open: true,
      message: `Le plat "${deletedDish?.dishName}" a été supprimé avec succès.`,
      severity: "success",
    })

    // Fermer le dialogue et réinitialiser le plat à supprimer
    setDeleteDialogOpen(false)
    setDishToDelete(null)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setDishToDelete(null)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Gestionnaires pour les menus de tri et de filtre
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget)
  }

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null)
  }

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget)
  }

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null)
  }

  const handleSortChange = (order: "name" | "price") => {
    setSortOrder(order)
    handleSortMenuClose()
  }

  const handleFilterChange = (value: "all" | "salade" | "dessert" | "other") => {
    setFilterType(value)
    handleFilterMenuClose()
  }

  // Fonction pour déterminer le type d'un plat en fonction de son nom
  const getDishType = (dishName: string): "salade" | "dessert" | "other" => {
    const upperName = dishName.toUpperCase()
    if (upperName.includes("SALADE")) {
      return "salade"
    } else if (upperName.includes("DESSERT")) {
      return "dessert"
    }
    return "other"
  }

  // Fonction pour mettre à jour les prix par catégorie
  const updatePricesByCategory = async (category: "salade" | "dessert" | "other", newPrice: number) => {
    setUpdatingPrices(true)
    try {
      // Filtrer les plats par catégorie
      const dishesToUpdate = dishes.filter((dish) => {
        return getDishType(dish.dishName) === category
      })

      // Mettre à jour chaque plat
      const updatePromises = dishesToUpdate.map(async (dish) => {
        const formData = new FormData()
        formData.append("dishPrice", newPrice.toString())

        await axios.patch(`http://localhost:5180/api/dish/${dish.dishId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      })

      await Promise.all(updatePromises)

      // Mettre à jour l'état local
      const updatedDishes = dishes.map((dish) => {
        if (getDishType(dish.dishName) === category) {
          return { ...dish, dishPrice: newPrice }
        }
        return dish
      })

      setDishes(updatedDishes)

      // Réappliquer la logique de tri avec les salades et desserts en premier
      const salades = updatedDishes.filter((dish) => dish.dishName.toUpperCase().includes("SALADE"))
      const desserts = updatedDishes.filter((dish) => dish.dishName.toUpperCase().includes("DESSERT"))
      const autres = updatedDishes.filter(
        (dish) => !dish.dishName.toUpperCase().includes("SALADE") && !dish.dishName.toUpperCase().includes("DESSERT"),
      )

      setFilteredDishes([...salades, ...desserts, ...autres])

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: `Prix des ${
          category === "salade" ? "salades" : category === "dessert" ? "desserts" : "autres plats"
        } mis à jour avec succès !`,
        severity: "success",
      })

      // Fermer le dialogue correspondant
      if (category === "salade") setSaladePriceDialogOpen(false)
      else if (category === "dessert") setDessertPriceDialogOpen(false)
      else setOtherPriceDialogOpen(false)
    } catch (err) {
      console.error("Erreur lors de la mise à jour des prix :", err)
      setSnackbar({
        open: true,
        message: "Erreur lors de la mise à jour des prix.",
        severity: "error",
      })
    } finally {
      setUpdatingPrices(false)
    }
  }

  // Calculer le prix moyen par catégorie
  const getAveragePriceByCategory = (category: "salade" | "dessert" | "other"): number => {
    const filteredDishes = dishes.filter((dish) => getDishType(dish.dishName) === category)

    if (filteredDishes.length === 0) return 0

    const sum = filteredDishes.reduce((acc, dish) => acc + dish.dishPrice, 0)
    return sum / filteredDishes.length
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "125%",
        transform: "translateX(-230px)",
        p: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Card
        elevation={2}
        sx={{
          mb: 4,
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${customColors.primary} 0%, ${customColors.secondary} 100%)`,
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <DishIcon sx={{ mr: 1, fontSize: 32, color: customColors.primary }} />
              <Typography variant="h5" fontWeight="bold" color={customColors.primary}>
                Gestion des Plats
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddDish}
                sx={{
                  backgroundColor: customColors.secondary,
                  color: "white",
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  boxShadow: "0 4px 10px rgba(143, 148, 36, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: alpha(customColors.secondary, 0.9),
                    boxShadow: "0 6px 15px rgba(143, 148, 36, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                    boxShadow: "0 2px 5px rgba(143, 148, 36, 0.3)",
                  },
                }}
              >
                Ajouter un plat
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Boutons de mise à jour des prix par catégorie */}
      <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Mise à jour des prix par catégorie
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SpaIcon />}
              onClick={() => setSaladePriceDialogOpen(true)}
              disabled={updatingPrices}
              sx={{
                borderColor: customColors.secondary,
                color: customColors.secondary,
                "&:hover": {
                  borderColor: customColors.secondary,
                  backgroundColor: alpha(customColors.secondary, 0.1),
                },
              }}
            >
              Modifier prix des salades
            </Button>
            <Button
              variant="outlined"
              startIcon={<CakeIcon />}
              onClick={() => setDessertPriceDialogOpen(true)}
              disabled={updatingPrices}
              sx={{
                borderColor: customColors.dessert,
                color: customColors.dessert,
                "&:hover": {
                  borderColor: customColors.dessert,
                  backgroundColor: alpha(customColors.dessert, 0.1),
                },
              }}
            >
              Modifier prix des desserts
            </Button>
            <Button
              variant="outlined"
              startIcon={<DiningIcon />}
              onClick={() => setOtherPriceDialogOpen(true)}
              disabled={updatingPrices}
              sx={{
                borderColor: customColors.primary,
                color: customColors.primary,
                "&:hover": {
                  borderColor: customColors.primary,
                  backgroundColor: alpha(customColors.primary, 0.1),
                },
              }}
            >
              Modifier prix des autres plats
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ mb: 4, bgcolor: "transparent" }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "50%" } }}>
              <TextField
                fullWidth
                placeholder="Rechercher un plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: customColors.primary }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 },
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", md: "flex-end" },
                gap: 1,
                width: { xs: "100%", md: "50%" },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleFilterMenuOpen}
                sx={{
                  borderColor: alpha(customColors.primary, 0.5),
                  color: customColors.primary,
                  "&:hover": {
                    borderColor: customColors.primary,
                    bgcolor: alpha(customColors.primary, 0.05),
                  },
                  borderRadius: 2,
                }}
              >
                {filterType === "all"
                  ? "Tous les plats"
                  : filterType === "salade"
                    ? "Salades uniquement"
                    : filterType === "dessert"
                      ? "Desserts uniquement"
                      : "Autres plats"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<SortIcon />}
                onClick={handleSortMenuOpen}
                sx={{
                  borderColor: alpha(customColors.primary, 0.5),
                  color: customColors.primary,
                  "&:hover": {
                    borderColor: customColors.primary,
                    bgcolor: alpha(customColors.primary, 0.05),
                  },
                  borderRadius: 2,
                }}
              >
                {sortOrder === "name" ? "Trier par nom" : "Trier par prix"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress sx={{ color: customColors.primary }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2, bgcolor: alpha(customColors.accent, 0.1), color: customColors.accent }}>
          {error}
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: { xs: "auto", md: "hidden" },
            maxWidth: "100%",
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: alpha(customColors.primary, 0.1) }}>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Type
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Nom
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Description
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Photo
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Prix (DT)
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDishes.length > 0 ? (
                <>
                  {/* En-tête pour les salades */}
                  {filteredDishes.some((dish) => getDishType(dish.dishName) === "salade") && (
                    <TableRow
                      sx={{
                        bgcolor: alpha(customColors.secondary, 0.1),
                        borderLeft: `4px solid ${customColors.secondary}`,
                      }}
                    >
                      <TableCell colSpan={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <SpaIcon sx={{ color: customColors.secondary, mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold" color={customColors.secondary}>
                            Salades
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Afficher les salades */}
                  {filteredDishes
                    .filter((dish) => getDishType(dish.dishName) === "salade")
                    .map((dish) => (
                      <TableRow
                        key={dish.dishId}
                        sx={{
                          bgcolor: alpha(customColors.secondary, 0.05),
                          "&:hover": {
                            bgcolor: alpha(customColors.secondary, 0.1),
                          },
                        }}
                      >
                        <TableCell>
                          <Chip
                            icon={<SpaIcon />}
                            label="Salade"
                            size="small"
                            sx={{
                              bgcolor: alpha(customColors.secondary, 0.2),
                              color: customColors.secondary,
                              fontWeight: "medium",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium" sx={{ color: customColors.secondary }}>
                            {dish.dishName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 250,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              color: customColors.secondary,
                            }}
                          >
                            {dish.dishDescription || "Pas de description"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
  component="img"
  src={
    dish.dishPhoto
      ? dish.dishPhoto // déjà une URL complète comme "https://talunch.blob.core.windows.net/dishimages/xxx.png"
      : "https://via.placeholder.com/80"
  }
                            alt={dish.dishName}
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              objectFit: "cover",
                              border: `1px solid ${alpha(customColors.secondary, 0.5)}`,
                              transition: "transform 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                                cursor: "pointer",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="medium" sx={{ color: customColors.secondary }}>
                            {dish.dishPrice.toFixed(3)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Tooltip title="Modifier ce plat">
                              <IconButton
                                size="small"
                                onClick={() => handleEditDish(dish.dishId)}
                                sx={{
                                  color: customColors.secondary,
                                  mr: 1,
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer ce plat">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(dish)}
                                sx={{ color: customColors.accent }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* En-tête pour les desserts */}
                  {filteredDishes.some((dish) => getDishType(dish.dishName) === "dessert") && (
                    <TableRow
                      sx={{
                        bgcolor: alpha(customColors.dessert, 0.1),
                        borderLeft: `4px solid ${customColors.dessert}`,
                      }}
                    >
                      <TableCell colSpan={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CakeIcon sx={{ color: customColors.dessert, mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold" color={customColors.dessert}>
                            Desserts
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Afficher les desserts */}
                  {filteredDishes
                    .filter((dish) => getDishType(dish.dishName) === "dessert")
                    .map((dish) => (
                      <TableRow
                        key={dish.dishId}
                        sx={{
                          bgcolor: alpha(customColors.dessert, 0.05),
                          "&:hover": {
                            bgcolor: alpha(customColors.dessert, 0.1),
                          },
                        }}
                      >
                        <TableCell>
                          <Chip
                            icon={<CakeIcon />}
                            label="Dessert"
                            size="small"
                            sx={{
                              bgcolor: alpha(customColors.dessert, 0.2),
                              color: customColors.dessert,
                              fontWeight: "medium",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium" sx={{ color: customColors.dessert }}>
                            {dish.dishName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 250,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              color: customColors.dessert,
                            }}
                          >
                            {dish.dishDescription || "Pas de description"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
  component="img"
  src={
    dish.dishPhoto
      ? dish.dishPhoto // déjà une URL complète comme "https://talunch.blob.core.windows.net/dishimages/xxx.png"
      : "https://via.placeholder.com/80"
  }
                            alt={dish.dishName}
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              objectFit: "cover",
                              border: `1px solid ${alpha(customColors.dessert, 0.5)}`,
                              transition: "transform 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                                cursor: "pointer",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="medium" sx={{ color: customColors.dessert }}>
                            {dish.dishPrice.toFixed(3)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Tooltip title="Modifier ce plat">
                              <IconButton
                                size="small"
                                onClick={() => handleEditDish(dish.dishId)}
                                sx={{
                                  color: customColors.dessert,
                                  mr: 1,
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer ce plat">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(dish)}
                                sx={{ color: customColors.accent }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* En-tête pour les autres plats */}
                  {filteredDishes.some((dish) => getDishType(dish.dishName) === "other") && (
                    <TableRow
                      sx={{
                        bgcolor: alpha(customColors.primary, 0.1),
                        borderLeft: `4px solid ${customColors.primary}`,
                      }}
                    >
                      <TableCell colSpan={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <DiningIcon sx={{ color: customColors.primary, mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold" color={customColors.primary}>
                            Autres plats
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Afficher les autres plats */}
                  {filteredDishes
                    .filter((dish) => getDishType(dish.dishName) === "other")
                    .map((dish) => (
                      <TableRow
                        key={dish.dishId}
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(customColors.primary, 0.05),
                          },
                        }}
                      >
                        <TableCell>
                          <Chip
                            icon={<DiningIcon />}
                            label="Plat"
                            size="small"
                            sx={{
                              bgcolor: alpha(customColors.primary, 0.1),
                              color: customColors.primary,
                              fontWeight: "medium",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {dish.dishName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 250,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {dish.dishDescription || "Pas de description"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
  component="img"
  src={
    dish.dishPhoto
      ? dish.dishPhoto // déjà une URL complète comme "https://talunch.blob.core.windows.net/dishimages/xxx.png"
      : "https://via.placeholder.com/80"
  }
                            alt={dish.dishName}
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              objectFit: "cover",
                              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                              transition: "transform 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                                cursor: "pointer",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="medium">
                            {dish.dishPrice.toFixed(3)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Tooltip title="Modifier ce plat">
                              <IconButton
                                size="small"
                                onClick={() => handleEditDish(dish.dishId)}
                                sx={{
                                  color: alpha(customColors.secondary, 0.9),
                                  mr: 1,
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer ce plat">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(dish)}
                                sx={{ color: customColors.accent }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <DishIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.5), mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Aucun plat trouvé
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {searchTerm || filterType !== "all"
                          ? "Essayez de modifier vos critères de recherche"
                          : "Commencez par ajouter votre premier plat"}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddDish}
                        sx={{
                          mt: 2,
                          borderColor: customColors.primary,
                          color: customColors.primary,
                          "&:hover": {
                            borderColor: customColors.secondary,
                            backgroundColor: alpha(customColors.secondary, 0.04),
                          },
                        }}
                      >
                        Ajouter un plat
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Menu de tri */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={handleSortMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2, minWidth: 180 },
        }}
      >
        <MenuItem onClick={() => handleSortChange("name")} selected={sortOrder === "name"}>
          <ListItemIcon>
            <SortIcon fontSize="small" sx={{ color: sortOrder === "name" ? customColors.primary : undefined }} />
          </ListItemIcon>
          <ListItemText>Trier par nom</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSortChange("price")} selected={sortOrder === "price"}>
          <ListItemIcon>
            <SortIcon fontSize="small" sx={{ color: sortOrder === "price" ? customColors.primary : undefined }} />
          </ListItemIcon>
          <ListItemText>Trier par prix</ListItemText>
        </MenuItem>
      </Menu>

      {/* Menu de filtre */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2, minWidth: 180 },
        }}
      >
        <MenuItem onClick={() => handleFilterChange("all")} selected={filterType === "all"}>
          <ListItemIcon>
            <FilterIcon fontSize="small" sx={{ color: filterType === "all" ? customColors.primary : undefined }} />
          </ListItemIcon>
          <ListItemText>Tous les plats</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange("salade")} selected={filterType === "salade"}>
          <ListItemIcon>
            <SpaIcon fontSize="small" sx={{ color: filterType === "salade" ? customColors.secondary : undefined }} />
          </ListItemIcon>
          <ListItemText>Salades uniquement</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange("dessert")} selected={filterType === "dessert"}>
          <ListItemIcon>
            <CakeIcon fontSize="small" sx={{ color: filterType === "dessert" ? customColors.dessert : undefined }} />
          </ListItemIcon>
          <ListItemText>Desserts uniquement</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange("other")} selected={filterType === "other"}>
          <ListItemIcon>
            <DiningIcon fontSize="small" sx={{ color: filterType === "other" ? customColors.primary : undefined }} />
          </ListItemIcon>
          <ListItemText>Autres plats</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialogues de mise à jour des prix */}
      <PriceUpdateDialog
        open={saladePriceDialogOpen}
        onClose={() => setSaladePriceDialogOpen(false)}
        onSubmit={(newPrice) => updatePricesByCategory("salade", newPrice)}
        title="Modifier le prix de toutes les salades"
        currentPrice={getAveragePriceByCategory("salade")}
      />

      <PriceUpdateDialog
        open={dessertPriceDialogOpen}
        onClose={() => setDessertPriceDialogOpen(false)}
        onSubmit={(newPrice) => updatePricesByCategory("dessert", newPrice)}
        title="Modifier le prix de tous les desserts"
        currentPrice={getAveragePriceByCategory("dessert")}
      />

      <PriceUpdateDialog
        open={otherPriceDialogOpen}
        onClose={() => setOtherPriceDialogOpen(false)}
        onSubmit={(newPrice) => updatePricesByCategory("other", newPrice)}
        title="Modifier le prix des autres plats"
        currentPrice={getAveragePriceByCategory("other")}
      />

      {/* Utiliser le composant DishDeleteDialog pour la suppression */}
      <DishDeleteDialog
        open={deleteDialogOpen}
        dish={dishToDelete}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleDeleteSuccess}
        customColors={customColors}
      />

      {/* Modal pour ajouter un plat */}
      <AddDishForm
        open={addDishDialogOpen}
        onClose={() => setAddDishDialogOpen(false)}
        onSuccess={handleAddDishSuccess}
      />

      {/* Modal pour modifier un plat */}
      {selectedDishId && (
        <DishUpdateForm
          dishId={selectedDishId}
          open={updateDishDialogOpen}
          onClose={handleCloseUpdateDialog}
          onSuccess={handleUpdateDishSuccess}
        />
      )}

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            bgcolor: snackbar.severity === "success" ? customColors.secondary : customColors.accent,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default DishTable
