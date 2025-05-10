import axios from "axios"

// Interface pour le DTO de mise à jour du statut
interface UpdateOrderStatusDto {
  orderId: number
  paid?: boolean
  served?: boolean
}

// Service pour gérer les mises à jour de statut des commandes
export const OrderStatusService = {
  // Fonction pour mettre à jour le statut d'une commande (payée ou servie)
  updateOrderStatus: async (dto: UpdateOrderStatusDto): Promise<boolean> => {
    try {
      // Conversion du DTO au format attendu par l'API
      const apiDto = {
        orderId: dto.orderId,
        paid: dto.paid,
        served: dto.served,
      }

      // Appel à l'API
      const response = await axios.patch("http://localhost:5180/api/order/update-order-status", apiDto)

      // Vérification de la réponse
      return response.status === 200
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la commande:", error)
      return false
    }
  },

  // Fonction pour marquer une commande comme payée
  markAsPaid: async (orderId: number): Promise<boolean> => {
    return await OrderStatusService.updateOrderStatus({
      orderId,
      paid: true,
    })
  },

  // Fonction pour marquer une commande comme servie
  markAsServed: async (orderId: number): Promise<boolean> => {
    return await OrderStatusService.updateOrderStatus({
      orderId,
      served: true,
    })
  },

  // Fonction pour annuler le paiement d'une commande
  unmarkAsPaid: async (orderId: number): Promise<boolean> => {
    return await OrderStatusService.updateOrderStatus({
      orderId,
      paid: false,
    })
  },

  // Fonction pour annuler le service d'une commande
  unmarkAsServed: async (orderId: number): Promise<boolean> => {
    return await OrderStatusService.updateOrderStatus({
      orderId,
      served: false,
    })
  },
}
