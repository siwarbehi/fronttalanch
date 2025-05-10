import { useState, useEffect } from "react";
import axios from "axios";
import { Chip, Typography, Box, CircularProgress, alpha } from "@mui/material";

interface Dish {
  dishId: number
  dishName: string
  isSalad: boolean
}

interface MenuDish {
  menuDishId: number
  menuId: number
  dishId: number
  dish: Dish
}

interface Menu {
  menuId: number
  menuDescription: string
  menuDishes: {
    $values?: MenuDish[]
  }
}

interface MenuDetailProps {
  menuId: number
  inline?: boolean // Pour afficher en ligne dans la table ou en détail
}

const MenuDetail: React.FC<MenuDetailProps> = ({ menuId, inline = true }) => {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Couleurs personnalisées pour la cohérence visuelle
  const customColors = {
    primary: "rgb(76, 114, 164)",
    secondary: "rgb(143, 148, 36)",
    accent: "rgb(224, 69, 128)",
  }

  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5180/api/menu/${menuId}`)
        console.log("Menu data received:", response.data);
        
        // Vérifier si la réponse contient $values (pour un tableau) ou directement les données
        const menuData = response.data.$values ? response.data.$values[0] : response.data
        
        // S'assurer que menuDishes.$values est un tableau
        if (menuData && menuData.menuDishes && !Array.isArray(menuData.menuDishes.$values)) {
          console.warn("menuDishes.$values n'est pas un tableau:", menuData.menuDishes);
          // Tenter de corriger si possible
          if (menuData.menuDishes.$values && typeof menuData.menuDishes.$values === 'object') {
            menuData.menuDishes.$values = Object.values(menuData.menuDishes.$values);
          }
        }
        
        setMenu(menuData)
        setLoading(false)
      } catch (err) {
        console.error("Erreur lors du chargement des données du menu:", err);
        setLoading(false)
        setError(`Erreur lors du chargement des données: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
      }
    }

    fetchMenuDetails()
  }, [menuId])

  if (loading) {
    return <CircularProgress size={inline ? 20 : 40} sx={{ color: customColors.primary }} />
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">
        {error}
      </Typography>
    )
  }

  // Si aucun plat n'est disponible
  if (!menu?.menuDishes?.$values || menu.menuDishes.$values.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Aucun plat disponible
      </Typography>
    )
  }
  
  // Affichage des plats
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
     {menu.menuDishes.$values.map((menuDish) => {
  const { dish } = menuDish;
  
  // Vérifier que dish existe
  if (!dish) {
    console.warn("Plat manquant dans menuDish:", menuDish);
    return null;
  }

  // Utiliser une combinaison de menuId et menuDishId comme clé unique
  return (
    <Chip
      key={`${menu.menuId}-${menuDish.menuDishId}`} // Combiner menuId et menuDishId
      label={inline ? dish.dishName : `${dish.dishName} (ID: ${dish.dishId})`}
      size="small"
      sx={{
        bgcolor: dish.isSalad ? alpha(customColors.secondary, 0.1) : alpha(customColors.primary, 0.1),
        color: dish.isSalad ? customColors.secondary : customColors.primary,
        margin: "2px",
      }}
    />
  )
})}

      {inline && menu.menuDishes.$values.length > 3 && (
        <Chip
          label={`+${menu.menuDishes.$values.length - 3}`}
          size="small"
          sx={{
            bgcolor: alpha("#000", 0.1),
            color: "text.secondary",
          }}
        />
      )}
    </Box>
  )
}

export default MenuDetail
