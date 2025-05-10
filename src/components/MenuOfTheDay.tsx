import axios from "axios"
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, alpha } from "@mui/material"
import { Star as StarIcon } from "@mui/icons-material"

// Configuration
const API_CONFIG = {
  baseURL: "http://localhost:5180/api",
  timeout: 5000,
}

interface MenuOfTheDayProps {
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
const MenuOfTheDay: React.FC<MenuOfTheDayProps> = ({
  open,
  onClose,
  onSuccess,
  menuId,
  menuDescription,
  customColors,
}) => {
  const handleSetMenuOfTheDay = async () => {
    try {
      // Créer une instance axios avec la configuration
      const api = axios.create({
        baseURL: API_CONFIG.baseURL,
        timeout: API_CONFIG.timeout,
      })

      // Appeler l'endpoint PATCH pour définir le menu du jour
      await api.patch(`/menu/setMenuOfTheDay`, {menuId})

      // Fermer le dialogue et notifier le succès
      onClose()
      onSuccess()
    } catch (error) {
      console.error("Erreur lors de la définition du menu du jour:", error)
    }
  }


  // Le dialogue est déjà bien configuré pour l'affichage fixe horizontal
  // car il utilise une largeur fixe et est centré par défaut
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: { xs: "90%", sm: "450px" }, // Largeur responsive - AJUSTABLE
          maxWidth: "450px", // Largeur maximale - AJUSTABLE
          p: 1,
          mx: "auto", // Centrage horizontal
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <StarIcon sx={{ color: customColors.secondary, fontSize: "2rem" }} />
          <Typography variant="h5" fontWeight="bold" color={customColors.primary}>
            Définir comme Menu du Jour
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
          Voulez-vous définir "{menuDescription}" comme menu du jour ?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.95rem" }}>
          Cette action désactivera tout autre menu du jour existant. Le menu du jour sera automatiquement réinitialisé à
          minuit.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: alpha(customColors.neutral, 0.5),
            color: customColors.neutral,
            fontSize: "1rem",
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
          onClick={handleSetMenuOfTheDay}
          variant="contained"
          sx={{
            bgcolor: customColors.secondary,
            fontSize: "1rem",
            px: 3,
            py: 1,
            "&:hover": {
              bgcolor: alpha(customColors.secondary, 0.9),
            },
          }}
        >
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MenuOfTheDay
