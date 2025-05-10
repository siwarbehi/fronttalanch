import React,{ useState, useEffect, useCallback } from "react"
import axios from "axios"
import { alpha } from "@mui/system"
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Autocomplete,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tab,
  Tabs,
} from "@mui/material"
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material"

interface UpdateMenuProps {
  menuId: number
  open?: boolean
  onClose?: () => void
  onSuccess?: () => void
}

interface Menu {
  menuId: number
  menuDescription: string
  menuDishes: MenuDish[]
  createdAt?: string
  updatedAt?: string
}

interface MenuDish {
  menuDishId: number
  menuId: number
  dishId: number
  dish: Dish
}

interface Dish {
  dishId: number
  dishName: string
  dishDescription?: string
  dishPrice: number
  dishQuantity: number
  isSalad: boolean
  dishPhoto?: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const UpdateMenu: React.FC<UpdateMenuProps> = ({ menuId, open = true, onClose, onSuccess }) => {
  const customColors = {
    primary: "rgb(76, 114, 164)",
    secondary: "rgb(143, 148, 36)",
    accent: "rgb(224, 69, 128)",
  }

  const [menu, setMenu] = useState<Menu | null>(null)
  const [menuDescription, setMenuDescription] = useState<string>("")
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false)
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([])
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [error, setError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchLoading, setFetchLoading] = useState<boolean>(true)
  const [dishesLoading, setDishesLoading] = useState<boolean>(true)
  const [tabValue, setTabValue] = useState(0)

  // Charger les données du menu
  const fetchMenuData = useCallback(async () => {
    setFetchLoading(true)
    try {
      const response = await axios.get(`http://localhost:5180/api/menu/${menuId}`)
      const menuData = response.data.$values ? response.data.$values[0] : response.data
      setMenu(menuData)
      setMenuDescription(menuData.menuDescription || "")
    } catch (err) {
      console.error("Erreur lors du chargement du menu :", err)
      setError("Impossible de charger les données du menu.")
    } finally {
      setFetchLoading(false)
    }
  }, [menuId])

  // Charger les plats disponibles
  const fetchAvailableDishes = useCallback(async () => {
    setDishesLoading(true)
    try {
      const response = await axios.get("http://localhost:5180/api/dish")
      if (response.data.$values) {
        setAvailableDishes(response.data.$values)
      } else {
        setAvailableDishes(response.data)
      }
    } catch (err) {
      console.error("Erreur lors du chargement des plats :", err)
      setError("Impossible de charger la liste des plats disponibles.")
    } finally {
      setDishesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && menuId) {
      fetchMenuData()
      fetchAvailableDishes()
    }
  }, [open, menuId, fetchMenuData, fetchAvailableDishes])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleClose = () => {
    setError("")
    setSuccessMessage("")
    setIsEditingDescription(false)
    setSelectedDish(null)
    setTabValue(0)
    if (onClose) {
      onClose()
    }
  }

  const handleUpdateDescription = async () => {
    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const formData = new FormData()
      formData.append("newDescription", menuDescription)

      await axios.patch(`http://localhost:5180/api/menu/${menuId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setSuccessMessage("Description du menu mise à jour avec succès !")
      setIsEditingDescription(false)

      // Mettre à jour les données locales
      if (menu) {
        setMenu({ ...menu, menuDescription })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour de la description. Veuillez réessayer.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDishToMenu = async () => {
    if (!selectedDish) return

    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      await axios.post(`http://localhost:5180/api/menu/${menuId}/${selectedDish.dishId}`)

      setSuccessMessage("Plat ajouté au menu avec succès !")
      setSelectedDish(null)

      // Recharger les données du menu
      await fetchMenuData()

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError("Erreur lors de l'ajout du plat au menu. Veuillez réessayer.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDishFromMenu = async (dishId: number) => {
    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      await axios.delete(`http://localhost:5180/api/menu/${menuId}/${dishId}`)

      setSuccessMessage("Plat retiré du menu avec succès !")

      // Recharger les données du menu
      await fetchMenuData()

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError("Erreur lors du retrait du plat du menu. Veuillez réessayer.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les plats disponibles pour ne pas afficher ceux déjà dans le menu
  const getFilteredAvailableDishes = () => {
    if (!menu || !menu.menuDishes) return availableDishes

    const menuDishIds = menu.menuDishes.map((md) => md.dishId)
    return availableDishes.filter((dish) => !menuDishIds.includes(dish.dishId))
  }

  return open ? (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <RestaurantMenuIcon sx={{ mr: 1, color: customColors.primary }} />
          <Typography variant="h5" component="span">
            Détails du menu
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ position: "absolute", top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
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
        ) : menu ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Description
                </Typography>
                {!isEditingDescription ? (
                  <IconButton
                    size="small"
                    onClick={() => setIsEditingDescription(true)}
                    sx={{ color: customColors.secondary }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <IconButton
                    size="small"
                    onClick={handleUpdateDescription}
                    disabled={loading}
                    sx={{ color: customColors.secondary }}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {isEditingDescription ? (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={menuDescription}
                  onChange={(e) => setMenuDescription(e.target.value)}
                  variant="outlined"
                  placeholder="Entrez une description pour ce menu"
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: customColors.primary,
                    },
                  }}
                />
              ) : (
                <Typography variant="body1" sx={{ p: 1, bgcolor: alpha(customColors.primary, 0.05), borderRadius: 1 }}>
                  {menu.menuDescription || "Aucune description"}
                </Typography>
              )}
            </Box>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  color: alpha(customColors.primary, 0.7),
                  "&.Mui-selected": { color: customColors.primary },
                },
                "& .MuiTabs-indicator": { backgroundColor: customColors.primary },
              }}
            >
              <Tab label="Plats du menu" id="menu-tab-0" aria-controls="menu-tabpanel-0" />
              <Tab label="Ajouter des plats" id="menu-tab-1" aria-controls="menu-tabpanel-1" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {menu.menuDishes && menu.menuDishes.length > 0 ? (
                <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                  {menu.menuDishes.map((menuDish, index) => (
                    <React.Fragment key={menuDish.menuDishId}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {menuDish.dish.dishName}
                              </Typography>
                              {menuDish.dish.isSalad && (
                                <Chip
                                  label="Salade"
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    bgcolor: alpha(customColors.secondary, 0.1),
                                    color: customColors.secondary,
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary" component="span">
                                {menuDish.dish.dishDescription || "Pas de description"}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 0.5,
                                  color: customColors.primary,
                                  fontWeight: "medium",
                                }}
                              >
                                Prix: {menuDish.dish.dishPrice.toFixed(2)} DT
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveDishFromMenu(menuDish.dishId)}
                            disabled={loading}
                            sx={{ color: customColors.accent }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < menu.menuDishes.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Ce menu ne contient aucun plat.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setTabValue(1)}
                    sx={{
                      mt: 2,
                      color: customColors.primary,
                      borderColor: customColors.primary,
                      "&:hover": {
                        borderColor: customColors.secondary,
                        color: customColors.secondary,
                      },
                    }}
                  >
                    Ajouter des plats
                  </Button>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Sélectionner un plat à ajouter
                </Typography>

                {dishesLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                    <CircularProgress size={24} sx={{ color: customColors.primary }} />
                  </Box>
                ) : (
                  <Autocomplete
                    id="dish-selection"
                    options={getFilteredAvailableDishes()}
                    getOptionLabel={(option) => option.dishName}
                    value={selectedDish}
                    onChange={(_, newValue) => setSelectedDish(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Rechercher un plat..."
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: customColors.primary,
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: customColors.primary,
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body1">{option.dishName}</Typography>
                            {option.isSalad && (
                              <Chip
                                label="Salade"
                                size="small"
                                sx={{
                                  ml: 1,
                                  bgcolor: alpha(customColors.secondary, 0.1),
                                  color: customColors.secondary,
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Prix: {option.dishPrice.toFixed(2)} DT
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddDishToMenu}
                    disabled={!selectedDish || loading}
                    sx={{
                      backgroundColor: customColors.secondary,
                      "&:hover": {
                        backgroundColor: alpha(customColors.secondary, 0.9),
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Ajouter au menu"}
                  </Button>
                </Box>
              </Box>
            </TabPanel>
          </>
        ) : (
          <Typography variant="body1" color="error">
            Menu introuvable
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  ) : null
}

export default UpdateMenu

