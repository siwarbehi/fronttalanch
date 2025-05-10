import { useState, useEffect } from "react"
import axios from "axios"

const T = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [menuDescription, setMenuDescription] = useState<string>("")
  const [availableDishes, setAvailableDishes] = useState<{ id: number; name: string }[]>([])
  const [selectedDishIds, setSelectedDishIds] = useState<number[]>([])
  const [dishesLoading, setDishesLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  // Charger les plats disponibles
  useEffect(() => {
    if (open) {
      fetchAvailableDishes()
    }
  }, [open])

  const fetchAvailableDishes = async () => {
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
  }

  const handleToggleDish = (dishId: number) => {
    setSelectedDishIds((prev) => {
      if (prev.includes(dishId)) {
        return prev.filter((id) => id !== dishId)
      } else {
        return [...prev, dishId]
      }
    })
  }

  const resetForm = () => {
    setMenuDescription("")
    setSelectedDishIds([])
    setMessage("")
    setError("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    if (selectedDishIds.length === 0) {
      setError("Veuillez sélectionner au moins un plat pour créer un menu.")
      setLoading(false)
      return
    }

    try {
      // Créer un FormData pour l'envoi
      const formData = new FormData()

      // Ajouter la description du menu
      formData.append("menuDescription", menuDescription)

      // Ajouter chaque ID de plat sélectionné
      selectedDishIds.forEach((id) => formData.append("DishIds", id.toString()))

      // Envoi de la requête
      const response = await axios.post("http://localhost:5180/api/menu", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Menu créé avec succès :", response.data)
      setMessage("Menu créé avec succès !")
      resetForm() // Réinitialiser le formulaire après soumission

    } catch (err) {
      console.error("Erreur lors de la soumission du menu :", err)
      setError("Une erreur s'est produite lors de la création du menu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Créer un menu</h2>

      {/* Formulaire de description du menu */}
      <input
        type="text"
        value={menuDescription}
        onChange={(e) => setMenuDescription(e.target.value)}
        placeholder="Description du menu"
        className="border p-2 mb-4 w-full"
      />

      {/* Affichage des plats disponibles et sélection */}
      {dishesLoading ? (
        <div>Chargement des plats...</div>
      ) : (
        <div>
          <h3 className="text-lg mb-2">Plats disponibles</h3>
          <ul className="space-y-2">
            {availableDishes.map((dish) => (
              <li key={dish.id} className="flex justify-between items-center">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedDishIds.includes(dish.id)}
                    onChange={() => handleToggleDish(dish.id)}
                  />
                  {dish.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages d'erreur ou de succès */}
      {error && <div className="text-red-500">{error}</div>}
      {message && <div className="text-green-500">{message}</div>}

      {/* Bouton pour créer le menu */}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Chargement..." : "Créer le menu"}
      </button>

      {/* Bouton pour fermer le formulaire */}
      <button
        onClick={handleClose}
        className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Annuler
      </button>
    </div>
  )
}

export default T
