import React, { useEffect, useState, useCallback } from "react"
import axios from "axios"
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Collapse,
  Alert,
  AlertTitle,
  Tooltip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  alpha,
  useTheme,
  Snackbar,
  Dialog,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowDropDown as ArrowDropUpIcon,
  ArrowDropUp as ArrowUpIcon,
  Refresh as RefreshIcon,
  Restaurant as MenuIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material"

// Importer les composants
import AddMenuComponent from "./AddMenuComponent"
import MenuOfTheDay from "./MenuOfTheDay"
import UpdateMenuAndAddDish from "./UpdateMenuAndAddDish"

// Modifier les interfaces pour correspondre à la structure de l'API
interface DishMenuAllDto {
  dishName: string
  dishQuantity: number
  dishId?: number
}

interface GetAllMenusDto {
  menuId: number
  menuDescription: string
  isMenuOfTheDay: boolean
  dishes: {
    $values: DishMenuAllDto[]
  }
}

// Type pour la réponse API qui peut avoir différentes structures
interface ApiResponse {
  $values?: GetAllMenusDto[]
  [key: string]: unknown
}

// Configuration
const API_CONFIG = {
  // URL de base de l'API
  baseURL: "http://localhost:5180/api",
  // Timeout en millisecondes
  timeout: 5000,
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

const MenuTable: React.FC = () => {
  // Couleurs personnalisées pour la cohérence visuelle
  const theme = useTheme()
  const customColors = {
    primary: "rgb(76, 114, 164)",
    secondary: "rgb(143, 148, 36)",
    accent: "rgb(224, 69, 128)",
    neutral: "rgb(100, 100, 100)",
    lightGrey: "rgb(240, 240, 240)",
    gold: "rgb(255, 215, 0)",
  }

  // États
  const [menus, setMenus] = useState<MenuType[]>([])
  const [filteredMenus, setFilteredMenus] = useState<MenuType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openAddMenu, setOpenAddMenu] = useState(false)
  const [openEditMenu, setOpenEditMenu] = useState(false)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [openSetMenuOfTheDay, setOpenSetMenuOfTheDay] = useState(false)
  const [currentMenu, setCurrentMenu] = useState<MenuType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })

  // Modifier la fonction fetchMenus pour extraire correctement les données
  const fetchMenus = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Créer une instance axios avec la configuration
      const api = axios.create({
        baseURL: API_CONFIG.baseURL,
        timeout: API_CONFIG.timeout,
      })

      // Récupérer tous les menus avec leurs plats en un seul appel API
      const response = await api.get<ApiResponse>("/menu")
      const data = response.data

      console.log("Structure de la réponse API:", data)

      // Initialiser un tableau pour extraire les menus
      let extractedMenus: GetAllMenusDto[] = []

      // Si la réponse est un objet avec $values, extraire les menus
      if (data && typeof data === "object" && "$values" in data && Array.isArray(data.$values)) {
        extractedMenus = data.$values as GetAllMenusDto[]
      } else if (Array.isArray(data)) {
        extractedMenus = data as GetAllMenusDto[]
      }

      // Vérifier si nous avons trouvé des données
      if (extractedMenus.length === 0) {
        console.warn("Aucune donnée de menu trouvée dans la réponse API:", data)
        setMenus([])
        setFilteredMenus([])
        return
      }

      // Transformer les données pour correspondre à la structure attendue par le composant
      const menusWithDishes = extractedMenus.map((menuData: GetAllMenusDto) => {
        // Extraire les plats du menu
        const dishes =
          menuData.dishes && menuData.dishes.$values
            ? menuData.dishes.$values.map((dish) => ({
                dishName: dish.dishName || "Nom non disponible",
                dishQuantity: dish.dishQuantity || 0,
                dishId: dish.dishId,
              }))
            : []

        return {
          menuId: menuData.menuId,
          menuDescription: menuData.menuDescription || `Menu ${menuData.menuId}`,
          isMenuOfTheDay: menuData.isMenuOfTheDay || false,
          dishes,
          expanded: false,
        }
      })

      setMenus(menusWithDishes)
      setFilteredMenus(menusWithDishes)
    } catch (err) {
      console.error("Erreur lors de la récupération des menus", err)

      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          setError("Le serveur met trop de temps à répondre.")
        } else if (err.message === "Network Error") {
          setError("Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d'exécution.")
        } else if (err.response) {
          setError(`Erreur ${err.response.status}: ${err.response.data?.message || err.message}`)
        } else {
          setError(`Erreur de connexion: ${err.message}`)
        }
      } else {
        setError("Erreur inconnue lors de la récupération des données.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Effet pour charger les données au démarrage
  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  // Effet pour filtrer et trier les menus
  useEffect(() => {
    let result = [...menus]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((menu) => menu.menuDescription.toLowerCase().includes(term))
    }

    // Tri par menu du jour puis par nombre de plats
    result.sort((a, b) => {
      if (a.isMenuOfTheDay && !b.isMenuOfTheDay) return -1
      if (!a.isMenuOfTheDay && b.isMenuOfTheDay) return 1
      return (b.dishes?.length || 0) - (a.dishes?.length || 0)
    })

    setFilteredMenus(result)
  }, [menus, searchTerm])

  // Fonctions de gestion des menus
  const handleToggleExpand = (menuId: number) => {
    setMenus((prevMenus) =>
      prevMenus.map((menu) => (menu.menuId === menuId ? { ...menu, expanded: !menu.expanded } : menu)),
    )
    setFilteredMenus((prevMenus) =>
      prevMenus.map((menu) => (menu.menuId === menuId ? { ...menu, expanded: !menu.expanded } : menu)),
    )
  }

  const handleEditClick = (menu: MenuType) => {
    setCurrentMenu(menu)
    setOpenEditMenu(true)
  }

  const handleDeleteClick = (menu: MenuType) => {
    setCurrentMenu(menu)
    setOpenDeleteConfirm(true)
  }

  const handleSetMenuOfTheDayClick = (menu: MenuType) => {
    setCurrentMenu(menu)
    setOpenSetMenuOfTheDay(true)
  }

  const handleConfirmDelete = async () => {
    if (!currentMenu) return

    try {
      // Envoyer la requête au serveur
      await axios.delete(`${API_CONFIG.baseURL}/menu/${currentMenu.menuId}`)

      // Supprimer le menu de l'état local
      setMenus((prevMenus) => prevMenus.filter((menu) => menu.menuId !== currentMenu.menuId))
      setFilteredMenus((prevMenus) => prevMenus.filter((menu) => menu.menuId !== currentMenu.menuId))

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: `Le menu "${currentMenu.menuDescription}" a été supprimé avec succès.`,
        severity: "success",
      })

      setOpenDeleteConfirm(false)
    } catch (err) {
      console.error("Erreur lors de la suppression du menu", err)
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression du menu.",
        severity: "error",
      })
    }
  }

  const handleUpdateSuccess = () => {
    fetchMenus()
    setSnackbar({
      open: true,
      message: "Menu mis à jour avec succès !",
      severity: "success",
    })
  }

  const handleMenuOfTheDaySuccess = () => {
    fetchMenus()
    setSnackbar({
      open: true,
      message: "Menu du jour défini avec succès !",
      severity: "success",
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Rendu du composant
  return (
    // Remplacer le Box parent par :
    <Box
      sx={{
        position: "relative",
        width: "125%", // Augmentation de la largeur
        p: { xs: 1, sm: 3, md: 4 }, // Padding augmenté
        mx: "auto",
        fontSize: "90%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        transform: "translateX(-225px)",
      }}
    >
      <Card
        elevation={3}
        sx={{
          mb: 5,
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
        }}
      >
        <CardContent sx={{ py: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <RestaurantMenuIcon sx={{ mr: 1.5, fontSize: 38, color: customColors.primary }} />
              <Typography variant="h4" fontWeight="bold" color={customColors.primary}>
                Gestion des Menus
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddMenu(true)}
                sx={{
                  backgroundColor: customColors.secondary,
                  color: "white",
                  borderRadius: "50px",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
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
                Créer un Menu
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ mb: 5, bgcolor: "transparent" }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "50%" } }}>
              <TextField
                fullWidth
                placeholder="Rechercher un menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: customColors.primary, fontSize: "1.5rem" }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, fontSize: "1.1rem", py: 0.5 },
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", md: "flex-end" },
                gap: 2,
                width: { xs: "100%", md: "50%" },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<SortIcon sx={{ fontSize: "1.3rem" }} />}
                sx={{
                  borderColor: alpha(customColors.primary, 0.5),
                  color: customColors.primary,
                  fontSize: "1.1rem",
                  py: 1.2,
                  px: 3,
                  "&:hover": {
                    borderColor: customColors.primary,
                    bgcolor: alpha(customColors.primary, 0.05),
                  },
                  borderRadius: 2,
                }}
              >
                Trier par nombre de plats
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
          <CircularProgress size={60} sx={{ color: customColors.primary }} />
        </Box>
      ) : error ? (
        <Box sx={{ my: 3 }}>
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="large" startIcon={<RefreshIcon />} onClick={() => fetchMenus()}>
                Réessayer
              </Button>
            }
            sx={{
              bgcolor: alpha(customColors.accent, 0.1),
              color: customColors.accent,
              fontSize: "1.1rem",
              py: 2,
            }}
          >
            <AlertTitle sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Problème de connexion</AlertTitle>
            {error}
          </Alert>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: { xs: "auto", md: "hidden" },
            "& .MuiTableRow-root:hover": {
              backgroundColor: alpha(customColors.primary, 0.05),
            },
            maxWidth: "100%",
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: alpha(customColors.primary, 0.1) }}>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="1.2rem">
                    Description
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="1.2rem">
                    Nombre de Plats
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="1.2rem">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMenus.length > 0 ? (
                filteredMenus.map((menu) => (
                  <React.Fragment key={menu.menuId}>
                    <TableRow
                      sx={{
                        "& > *": {
                          py: 1, // Réduction hauteur ligne
                          fontSize: "0.8rem", // Taille police globale
                        },
                        ...(menu.isMenuOfTheDay && {
                          bgcolor: alpha(customColors.gold, 0.05), // Fond plus discret
                          "&::before": {
                            left: -2, // Bordure plus proche
                            width: "2px", // Épaisseur réduite
                          },
                        }),
                      }}
                    >
                      <TableCell sx={{ px: 1 }}>
                        {" "}
                        {/* Padding horizontal réduit */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CheckCircleOutlineIcon
                            sx={{
                              color: menu.isMenuOfTheDay ? customColors.secondary : alpha(customColors.neutral, 0.4),
                              fontSize: "1rem", // Taille icône réduite
                              mr: 0.5,
                            }}
                          />
                          <Typography
                            variant="body2" // Version plus compacte
                            fontSize="0.9rem"
                            sx={{
                              fontWeight: menu.isMenuOfTheDay ? 600 : 500,
                              lineHeight: 1.2,
                            }}
                          >
                            {menu.menuDescription}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center" sx={{ px: 0.5 }}>
                        <Chip
                          label={menu.dishes?.length || 0}
                          size="small" // Taille réduite
                          sx={{
                            bgcolor: alpha(customColors.primary, 0.05),
                            fontSize: "0.8rem",
                            py: 0.5,
                            px: 0.5,
                            height: "24px", // Hauteur fixe
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <Tooltip title={menu.expanded ? "Masquer les détails" : "Voir les détails"}>
                            <IconButton
                              size="large"
                              onClick={() => handleToggleExpand(menu.menuId)}
                              aria-label={menu.expanded ? "Réduire" : "Voir les détails"}
                              sx={{ color: customColors.primary }}
                            >
                              {menu.expanded ? (
                                <ArrowUpIcon sx={{ fontSize: "1.8rem" }} />
                              ) : (
                                <ArrowDropUpIcon  sx={{ fontSize: "1.8rem" }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={menu.isMenuOfTheDay ? "Menu du jour actuel" : "Définir comme menu du jour"}>
                            <span>
                              <IconButton
                                size="large"
                                onClick={() => handleSetMenuOfTheDayClick(menu)}
                                aria-label="Définir comme menu du jour"
                                sx={{
                                  color: menu.isMenuOfTheDay
                                    ? customColors.secondary
                                    : alpha(customColors.neutral, 0.6),
                                }}
                                disabled={menu.isMenuOfTheDay}
                              >
                                <CheckCircleOutlineIcon
                                  sx={{
                                    fontSize: "1.8rem",
                                    color: menu.isMenuOfTheDay
                                      ? customColors.secondary
                                      : alpha(customColors.neutral, 0.6),
                                    ...(menu.isMenuOfTheDay && { fontWeight: "bold" }),
                                  }}
                                />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Modifier le menu">
                            <IconButton
                              size="large"
                              color="primary"
                              onClick={() => handleEditClick(menu)}
                              aria-label="Modifier"
                              sx={{ color: alpha(customColors.secondary, 0.9) }}
                            >
                              <EditIcon sx={{ fontSize: "1.8rem" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer ce menu">
                            <IconButton
                              size="large"
                              color="error"
                              onClick={() => handleDeleteClick(menu)}
                              aria-label="Supprimer"
                              sx={{ color: customColors.accent }}
                            >
                              <DeleteIcon sx={{ fontSize: "1.8rem" }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                        <Collapse in={menu.expanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2, py: 3, maxWidth: "85%", mx: "auto" }}>
                            <Typography
                              variant="h5"
                              gutterBottom
                              component="div"
                              color={customColors.primary}
                              fontWeight="bold"
                            >
                              Plats du Menu
                            </Typography>
                            <TableContainer
                              component={Paper}
                              elevation={1}
                              sx={{ bgcolor: alpha(customColors.lightGrey, 0.5), maxWidth: "100%", borderRadius: 2 }}
                            >
                              <Table size="medium" aria-label="plats">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>
                                      <Typography variant="subtitle1" fontWeight="bold" fontSize="1.1rem">
                                        Nom du Plat
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography variant="subtitle1" fontWeight="bold" fontSize="1.1rem">
                                        Quantité
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {menu.dishes && menu.dishes.length > 0 ? (
                                    menu.dishes.map((dish, index) => (
                                      <TableRow key={`${dish.dishName}-${index}`}>
                                        <TableCell component="th" scope="row">
                                          <Typography variant="body1" fontWeight="medium" fontSize="1.05rem">
                                            {dish.dishName || "Nom non disponible"}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography variant="body1" fontSize="1.05rem">
                                            {dish.dishQuantity}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={2} align="center">
                                        <Typography
                                          variant="body1"
                                          color="text.secondary"
                                          sx={{ py: 3, fontSize: "1.1rem" }}
                                        >
                                          Aucun plat dans ce menu
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <MenuIcon sx={{ fontSize: 64, color: alpha(theme.palette.text.secondary, 0.5), mb: 3 }} />
                      <Typography variant="h5" color="text.secondary">
                        Aucun menu trouvé
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: "1.1rem" }}>
                        {searchTerm
                          ? "Essayez de modifier vos critères de recherche"
                          : "Commencez par ajouter votre premier menu"}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon sx={{ fontSize: "1.3rem" }} />}
                        onClick={() => setOpenAddMenu(true)}
                        sx={{
                          mt: 3,
                          borderColor: customColors.primary,
                          color: customColors.primary,
                          fontSize: "1.1rem",
                          py: 1.2,
                          px: 3,
                          "&:hover": {
                            borderColor: customColors.secondary,
                            backgroundColor: alpha(customColors.secondary, 0.04),
                          },
                        }}
                      >
                        Créer un Menu
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Composant d'ajout de menu */}
      <AddMenuComponent
        open={openAddMenu}
        onClose={() => setOpenAddMenu(false)}
        onSuccess={() => {
          setOpenAddMenu(false)
          fetchMenus()
          setSnackbar({
            open: true,
            message: "Menu créé avec succès !",
            severity: "success",
          })
        }}
        customColors={customColors}
      />

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <Box sx={{ p: 4, width: { xs: "100%", sm: "450px" } }}>
          <Typography variant="h5" color={customColors.accent} gutterBottom fontWeight="bold">
            Confirmer la suppression
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: "1.1rem" }}>
            Êtes-vous sûr de vouloir supprimer le menu "{currentMenu?.menuDescription}" ? Cette action est irréversible.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              onClick={() => setOpenDeleteConfirm(false)}
              variant="outlined"
              size="large"
              sx={{
                borderColor: alpha(customColors.neutral, 0.5),
                color: customColors.neutral,
                fontSize: "1.05rem",
                px: 3,
                py: 1,
                "&:hover": {
                  borderColor: customColors.neutral,
                  bgcolor: alpha(customColors.neutral, 0.05),
                },
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              size="large"
              sx={{
                bgcolor: customColors.accent,
                fontSize: "1.05rem",
                px: 3,
                py: 1,
                "&:hover": {
                  bgcolor: alpha(customColors.accent, 0.9),
                },
              }}
            >
              Supprimer
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Composant combiné pour modifier la description et ajouter des plats */}
      {currentMenu && (
        <UpdateMenuAndAddDish
          open={openEditMenu}
          onClose={() => {
            setOpenEditMenu(false)
          }}
          onSuccess={handleUpdateSuccess}
          currentMenu={currentMenu}
          customColors={customColors}
        />
      )}

      {/* Composant pour définir le menu du jour */}
      {currentMenu && (
        <MenuOfTheDay
          open={openSetMenuOfTheDay}
          onClose={() => setOpenSetMenuOfTheDay(false)}
          onSuccess={handleMenuOfTheDaySuccess}
          menuId={currentMenu.menuId}
          menuDescription={currentMenu.menuDescription}
          customColors={customColors}
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
            fontSize: "1.1rem",
            py: 1.5,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MenuTable
