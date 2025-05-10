import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
  createTheme,
  ThemeProvider,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material"
import {
  Restaurant,
  EventNote,
  LocalDining,
  Payment,
  RoomService,
  CheckCircle,
  RoomServiceOutlined,
  ExpandMore,
  ExpandLess,
  TollOutlined,
  Person,
  Comment,
  NavigateNext,
  NavigateBefore,
} from "@mui/icons-material"
import { Tabs, Tab } from "@mui/material"
import socialImage from "../assets/social.png"
import OrderStatusButtons from "./OrderStatusButtons"

interface DishOrderDto {
  dishName: string
  quantity: number
}

interface OrderDayDto {
  firstName: string
  lastName: string
  profilePicture?: string
  orderRemark?: string
  totalAmount: number
  paid: boolean
  served: boolean
  orderDate: string
  dishes: DishOrderDto[]
  orderId: number
}

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#4c72a4",
    },
    success: {
      main: "#8f9424", // Green for served
    },
    warning: {
      main: "#ffc107", // Yellow for money icon
    },
    error: {
      main: "#e04580", // Pink for paid
    },
  },
})

const OrdersByDate: React.FC = () => {
  const today = new Date().toISOString().split("T")[0]
  const [filteredOrders, setFilteredOrders] = useState<OrderDayDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [tabValue, setTabValue] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const pageSize = 10
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({})
  const [hasMoreOrders, setHasMoreOrders] = useState(true)

  // Toggle expanded state for an order
  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const fetchOrders = useCallback(
    async (filterParams: {
      pageNumber: number
      pageSize: number
      isPaid: boolean | null
      isServed: boolean | null
    }) => {
      setLoading(true)
      try {
        const response = await axios.get<{
          items: {
            $values: Array<{
              firstName: string
              lastName: string
              profilePicture?: string
              orderRemark?: string
              totalAmount: number
              paid: boolean
              served: boolean
              orderDate: string
              orderId: number
              dishes?: { $values: DishOrderDto[] }
            }>
          }
        }>(`http://localhost:5180/api/order`, {
          params: filterParams,
        })

        const rawList = response.data.items?.$values ?? []
        const todayOnly = new Date().toISOString().split("T")[0]

        const cleanList: OrderDayDto[] = rawList.map((o) => ({
          firstName: o.firstName,
          lastName: o.lastName,
          profilePicture: o.profilePicture ?? undefined,
          orderRemark: o.orderRemark,
          orderId: o.orderId,
          totalAmount: o.totalAmount,
          paid: o.paid,
          served: o.served,
          orderDate: o.orderDate,
          dishes: o.dishes?.$values ?? [],
        }))

        const todayOrders = cleanList.filter((order) => order.orderDate.split("T")[0] === todayOnly)
        setFilteredOrders(todayOrders)
        setHasMoreOrders(todayOrders.length === pageSize)
      } catch (error) {
        console.error("Erreur lors de la récupération des ordres :", error)
        setFilteredOrders([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const buildFilterParams = useCallback(
    (
      tab: number,
    ): {
      pageNumber: number
      pageSize: number
      isPaid: boolean | null
      isServed: boolean | null
    } => {
      const params = {
        pageNumber,
        pageSize,
        isPaid: null as boolean | null,
        isServed: null as boolean | null,
      }

      if (tab === 0) {
        params.isPaid = false
        params.isServed = false
      } else if (tab === 1) {
        params.isServed = false
      } else if (tab === 2) {
        params.isPaid = false
      } else if (tab === 3) {
        params.isPaid = true
        params.isServed = true
      }

      return params
    },
    [pageNumber, pageSize],
  )

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setPageNumber(1) 
  }

  const handleStatusChange = (orderId: number, type: "paid" | "served", newStatus: boolean) => {
    setFilteredOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, [type === "paid" ? "paid" : "served"]: newStatus } : order,
      ),
    )
  }

  useEffect(() => {
    const filterParams = buildFilterParams(tabValue)
    fetchOrders(filterParams)
  }, [fetchOrders, tabValue, pageNumber, buildFilterParams])

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          Width: 1000,
          margin: "0 auto",
          transform: "translateX(-190px)",
        }}
      >
        <Box
          sx={{
            Width: 1000,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            pl: 0,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ display: "flex", alignItems: "center", pl: 0 }}>
            <Restaurant sx={{ mr: 1 }} />
            Commandes du Jour
          </Typography>
          <Chip icon={<EventNote />} label={today} color="primary" variant="outlined" sx={{ pl: 1 }} />
        </Box>

        <Paper sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Commandes par statut" variant="fullWidth">
            <Tab icon={<LocalDining />} label="Non Payées et Non Servies" iconPosition="start" />
            <Tab icon={<RoomService />} label="À Servir" iconPosition="start" />
            <Tab icon={<Payment />} label="Non Payées" iconPosition="start" />
            <Tab icon={<CheckCircle />} label="Payées et Servies" iconPosition="start" />
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Person sx={{ mr: 1 }} />
                        Nom
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LocalDining sx={{ mr: 1 }} />
                        Commande
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        <TollOutlined sx={{ mr: 1 }} />
                        Montant
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Comment sx={{ mr: 1 }} />
                        Remarque
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TollOutlined sx={{ mr: 1, color: "warning.main" }} />
                        <RoomServiceOutlined sx={{ color: "success.main" }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order.orderId}>
                      <TableRow
                        sx={{
                          "& > *": { borderBottom: expandedOrders[order.orderId] ? 0 : "inherit" },
                          cursor: "pointer",
                          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                        }}
                      >
                        <TableCell
                          sx={{ display: "flex", alignItems: "center" }}
                          onClick={() => toggleOrderExpand(order.orderId)}
                        >
                          <Avatar
                            src={order.profilePicture ?? socialImage}
                            alt={`${order.firstName} ${order.lastName}`}
                            sx={{ mr: 2 }}
                          />
                          <Typography>
                            {order.firstName} {order.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell onClick={() => toggleOrderExpand(order.orderId)}>
                          <Box sx={{ display: "flex", alignItems: "center", height: "40px" }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {order.dishes.length} plat{order.dishes.length > 1 ? "s" : ""}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleOrderExpand(order.orderId)
                              }}
                            >
                              {expandedOrders[order.orderId] ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right" onClick={() => toggleOrderExpand(order.orderId)}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "warning.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            <TollOutlined sx={{ mr: 0.5 }} />
                            {order.totalAmount.toFixed(3)} TND
                          </Typography>
                        </TableCell>
                        <TableCell align="center" onClick={() => toggleOrderExpand(order.orderId)}>
                          <Tooltip title={order.orderRemark || "Aucune remarque"}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: "150px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {order.orderRemark || "Aucune remarque"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <OrderStatusButtons
                            orderId={order.orderId}
                            isPaid={order.paid}
                            isServed={order.served}
                            onStatusChange={handleStatusChange}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                          <Collapse in={expandedOrders[order.orderId]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2, ml: 8 }}>
                              <Typography variant="h6" gutterBottom component="div">
                                Détails de la commande
                              </Typography>
                              <Table size="small" aria-label="purchases">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Plat</TableCell>
                                    <TableCell align="right">Quantité</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {order.dishes.map((dish) => (
                                    <TableRow key={dish.dishName}>
                                      <TableCell component="th" scope="row">
                                        {dish.dishName}
                                      </TableCell>
                                      <TableCell align="right">{dish.quantity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton
                  color="primary"
                  onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                  disabled={pageNumber === 1}
                >
                  <NavigateBefore />
                </IconButton>
                <Typography variant="body1">{pageNumber}</Typography>
                <IconButton color="primary" onClick={() => setPageNumber((prev) => prev + 1)} disabled={!hasMoreOrders}>
                  <NavigateNext />
                </IconButton>
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default OrdersByDate
