import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  ThemeProvider,
  createTheme,
  Collapse,
  IconButton,
} from "@mui/material"
import { Search as SearchIcon, ExpandMore, ExpandLess } from "@mui/icons-material"

interface DishOrderDto {
  dishName: string
  dishId: number
  quantity: number
}

interface OrderDayDto {
  firstName: string
  lastName: string
  profilePicture?: string
  orderId: number
  totalAmount: number
  paid: boolean
  orderDate: string
  dishes: {
    $values: DishOrderDto[]
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#e04580",
    },
    secondary: {
      main: "#4c72a4",
    },
    success: {
      main: "#8f9424",
    },
  },
})

const UnpaidOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderDayDto[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())
  const pageSize = 2

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5180/api/order/unpaid", {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            FirstName: firstName,
            LastName: lastName,
          },
        })

        const fetchedOrders = response.data.items.$values || []

        if (fetchedOrders.length === 0 && pageNumber > 1) {
          setPageNumber((prev) => Math.max(prev - 1, 1))
        } else {
          setOrders(fetchedOrders)
          setHasNextPage(fetchedOrders.length === pageSize)
        }
      } catch (error) {
        console.error("Erreur lors du chargement :", error)
      }
    }

    fetchOrders()
  }, [pageNumber, firstName, lastName])

  const toggleOrder = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  return (
    <ThemeProvider theme={theme}>
<Container maxWidth="xl" sx={{ py: 1.5, width: '140%' ,ml: '-25%'}}>
          <Paper
          elevation={2}
          sx={{
            p: 1.5,
            minHeight: "50vh",
            position: "relative",
            borderRadius: 2,
            mb: 6,
          }}
        >
          <Typography variant="h5" component="h2" color="primary" fontWeight="bold" gutterBottom>
            Commandes Non Payées
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <TextField
              label="Prénom"
              variant="outlined"
              size="small"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              sx={{ minWidth: "160px", flexGrow: 1 }}
            />
            <TextField
              label="Nom"
              variant="outlined"
              size="small"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              sx={{ minWidth: "160px", flexGrow: 1 }}
            />
            <Button
              variant="contained"
              color="success"
              onClick={() => setPageNumber(1)}
              startIcon={<SearchIcon />}
              sx={{ px: 2, py: 0.8 }}
            >
              Rechercher
            </Button>
          </Box>

          {orders.length === 0 ? (
            <Typography variant="body1" sx={{ py: 2, textAlign: "center", color: "text.secondary" }}>
              Aucune commande à afficher.
            </Typography>
          ) : (
            orders.map((order) => (
              <Card
                key={order.orderId}
                sx={{
                  mb: 1.5,
                  borderRadius: 1.5,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  "&:hover": {
                    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  },
                  transition: "box-shadow 0.2s ease",
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      mb: expandedOrders.has(order.orderId) ? 1.5 : 0
                    }}
                    onClick={() => toggleOrder(order.orderId)}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" color="secondary" fontWeight="bold">
                        Client : {order.firstName} {order.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date : {new Date(order.orderDate).toLocaleString()}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                        Total : {order.totalAmount} DT
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      {expandedOrders.has(order.orderId) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>

                  <Collapse in={expandedOrders.has(order.orderId)}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="success.main" fontWeight="bold" sx={{ mb: 0.5 }}>
                      Plats :
                    </Typography>

                    <List disablePadding dense>
                      {order.dishes.$values.map((dish) => (
                        <ListItem
                          key={dish.dishId}
                          disablePadding
                          sx={{
                            py: 0.3,
                            borderBottom: "1px dashed rgba(0,0,0,0.08)",
                            '&:last-child': {
                              borderBottom: "none",
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">{dish.dishName}</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  × {dish.quantity}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </CardContent>
              </Card>
            ))
          )}
        </Paper>

        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: "6px",
            zIndex: 1000,
            minWidth: "260px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {pageNumber > 1 && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                size="small"
                sx={{ minWidth: 90 }}
              >
                Précédent
              </Button>
            )}

            <Typography variant="body1" sx={{ mx: 1 }}>
              Page {pageNumber}
            </Typography>

            {hasNextPage && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setPageNumber((prev) => prev + 1)}
                size="small"
                sx={{ minWidth: 90 }}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  )
}

export default UnpaidOrders