import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, Paper, Divider, CircularProgress } from '@mui/material';

interface Dish {
  dishId: number;
  dishName: string;
}

interface Menu {
  menuId: number;
  menuDescription: string;
  menuDishes?: {
    $values?: {
      dish: Dish;
    }[]; 
  };
}

const MenusList: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les menus depuis l'API
  const fetchMenus = async (): Promise<Menu[]> => {
    try {
      const response = await axios.get("http://localhost:5180/api/menu");
      console.log("Réponse de l'API :", response.data);  // Affichage complet de la réponse API
      return response.data?.$values ?? response.data; // Vérifie que la réponse contient bien $values
    } catch (error) {
      console.error("Erreur API :", error);
      setError("Une erreur est survenue lors de la récupération des menus.");
      throw error;
    }
  };

  // Fonction de gestion de l'affichage des menus et plats
  const displayMenuAndDishes = useCallback(async () => {
    try {
      const menusData = await fetchMenus();
      setMenus(menusData); // Mise à jour des menus
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
      setError(`Erreur affichage menus et plats : ${errorMessage}`);
    } finally {
      setLoading(false); // Fin du chargement
    }
  }, []);

  // Utilisation du hook useEffect pour récupérer les menus dès que le composant est monté
  useEffect(() => {
    displayMenuAndDishes();
  }, [displayMenuAndDishes]);

  // Affichage du chargement ou de l'erreur
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ p: 2, color: 'error.main' }}>
      <Typography variant="h6">Erreur: {error}</Typography>
    </Box>
  );

  return (
    // Conteneur principal avec largeur contrôlée et sans défilement horizontal
    <Box 
      sx={{ 
        width: '100%',         // Largeur par défaut (100% du conteneur parent)
        maxWidth: '800px',     // Largeur maximale - AJUSTABLE selon vos besoins
        mx: 'auto',            // Centrage horizontal
        px: 2,                 // Padding horizontal
        overflowX: 'hidden',   // Empêche le défilement horizontal
      }}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Liste des Menus
      </Typography>
      
      {/* Liste des menus */}
      <List sx={{ width: '100%' }}>
        {menus.map((menu) => {
          const dishes = menu.menuDishes?.$values || []; // Liste des plats
          
          return (
            <Paper 
              key={menu.menuId}
              elevation={2}
              sx={{ 
                mb: 3, 
                p: 2,
                borderRadius: 2,
                // Transition douce au survol
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 4,
                }
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                {menu.menuDescription}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Menu ID : {menu.menuId}
              </Typography>
              
              <Divider sx={{ my: 1.5 }} />
              
              {dishes.length > 0 ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Plats du menu:
                  </Typography>
                  
                  <List>
                    {dishes.map(({ dish }) => (
                      <ListItem key={dish.dishId} sx={{ py: 0.5 }}>
                        <Typography variant="body1">
                          {dish.dishName}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Aucun plat pour ce menu.
                </Typography>
              )}
            </Paper>
          );
        })}
      </List>
      
      {/* Message si aucun menu n'est trouvé */}
      {menus.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Aucun menu disponible.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MenusList;
