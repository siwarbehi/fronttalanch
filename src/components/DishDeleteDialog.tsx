import { useState } from "react"
import axios from "axios"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  alpha,
} from "@mui/material"

interface Dish {
  dishId: number
  dishName: string
  dishDescription?: string
  dishPrice?: number
  dishQuantity?: number
  isSalad?: boolean
  dishPhoto?: string
}

interface DishDeleteDialogProps {
  open: boolean
  dish: Dish | null
  onClose: () => void
  onSuccess: (deletedDishId: number) => void
  customColors: {
    primary: string
    secondary: string
    accent: string
  }
}

const DishDeleteDialog: React.FC<DishDeleteDialogProps> = ({ open, dish, onClose, onSuccess, customColors }) => {
  const [loading, setLoading] = useState<boolean>(false)

  const handleDeleteConfirm = async () => {
    if (!dish) return

    setLoading(true)
    try {
      await axios.delete(`http://localhost:5180/api/dish/${dish.dishId}`)
      onSuccess(dish.dishId)
    } catch (err) {
      console.error("Erreur lors de la suppression :", err)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ color: customColors.accent }}>Confirmer la suppression</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer le plat "{dish?.dishName}" ? Cette action est irréversible.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: customColors.primary }} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleDeleteConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: customColors.accent,
            "&:hover": {
              bgcolor: alpha(customColors.accent, 0.8),
            },
          }}
        >
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DishDeleteDialog
