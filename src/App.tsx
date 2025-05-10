"use client"

import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom"
import Sidebar from "./components/SideBar"
import UserProfile from "./components/UserProfile"
import EditProfile from "./components/EditProfile"
import Register from "./components/Register"
import Login from "./components/Login"
import ForgotPasswordPage from "./components/ForgotPasswordPage"
import ResetPasswordPage from "./components/ResetPasswordPage"
import { AuthProvider } from "./contexts/AuthContext"
import DishTable from "./components/DishTable"
import AddDishForm from "./components/AddDishForm"
import DishUpdateForm from "./components/DishUpdateForm"
import MenuTable from "./components/MenuTable"
import MenuDetail from "./components/MenuDetail"
import MenusList from "./components/MenusList"
import OrdersByDate from "./components/OrdersByDate"
import UnpaidOrders from "./components/UnpaidOrders"

const DishUpdateWrapper = () => {
  const { id } = useParams()
  return <DishUpdateForm dishId={Number.parseInt(id || "0")} isStandalone={true} />
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dishes/edit/:id" element={<DishUpdateWrapper />} />
          <Route path="/adddish" element={<AddDishForm isStandalone={true} />} />
          <Route path="/t" element={<MenuDetail menuId={15} />} />
          <Route path="/p" element={<MenusList />} />

          {/* Routes protégées */}
          <Route path="/*" element={<Sidebar />}>
            <Route path="dishes" element={<DishTable />} />
            <Route path="menu" element={<MenuTable />} />
            <Route path="user" element={<UserProfile />} />
            <Route path="profile-edit" element={<EditProfile />} />
            <Route path="orders" element={<OrdersByDate />} />
            <Route path="Unpaid" element={<UnpaidOrders />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
