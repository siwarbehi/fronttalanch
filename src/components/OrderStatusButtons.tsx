
import { Box, Tooltip, IconButton } from "@mui/material"
import { TollOutlined, MoneyOffOutlined, RoomServiceOutlined, DoNotDisturbOnOutlined } from "@mui/icons-material"
import { OrderStatusService } from "../services/order-status-service"

interface OrderStatusButtonsProps {
  orderId: number
  isPaid: boolean
  isServed: boolean
  onStatusChange: (orderId: number, type: "paid" | "served", newStatus: boolean) => void
}

const OrderStatusButtons: React.FC<OrderStatusButtonsProps> = ({ orderId, isPaid, isServed, onStatusChange }) => {
  // Fonction pour gérer le changement de statut de paiement
  const handlePaidStatusChange = async () => {
    let success = false

    if (!isPaid) {
      // Marquer comme payé
      success = await OrderStatusService.markAsPaid(orderId)
    } else {
      // Annuler le paiement
      success = await OrderStatusService.unmarkAsPaid(orderId)
    }

    if (success) {
      onStatusChange(orderId, "paid", !isPaid)
    }
  }

  // Fonction pour gérer le changement de statut de service
  const handleServedStatusChange = async () => {
    let success = false

    if (!isServed) {
      // Marquer comme servi
      success = await OrderStatusService.markAsServed(orderId)
    } else {
      // Annuler le service
      success = await OrderStatusService.unmarkAsServed(orderId)
    }

    if (success) {
      onStatusChange(orderId, "served", !isServed)
    }
  }

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Tooltip title={isPaid ? "Annuler paiement" : "Marquer comme payé"}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation()
            handlePaidStatusChange()
          }}
          sx={{
            color: isPaid ? "#ffc107" : "text.secondary", // Couleur de l'icône
            bgcolor: isPaid ? "rgba(255, 193, 7, 0.1)" : "transparent", // Fond léger si payé
            "&:hover": {
              bgcolor: isPaid ? "rgba(255, 193, 7, 0.2)" : "rgba(255, 193, 7, 0.1)", // Fond au survol
            },
          }}
          
        >
          {isPaid ? <TollOutlined /> : <MoneyOffOutlined />}
        </IconButton>
      </Tooltip>

      <Tooltip title={isServed ? "Annuler service" : "Marquer comme servi"}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation()
            handleServedStatusChange()
          }}
          sx={{
            color: isServed ? "#8f9424" : "text.secondary",
            bgcolor: isServed ? "rgba(76, 175, 80, 0.1)" : "transparent",
            "&:hover": {
              bgcolor: isServed ? "rgba(76, 175, 80, 0.2)" : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          {isServed ? <RoomServiceOutlined /> : <DoNotDisturbOnOutlined />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default OrderStatusButtons
