import { Box, CircularProgress } from '@mui/material'; 
import { Drawer, AppBar, CssBaseline, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import { useLogout } from './Logout';
import { useState } from 'react'; 

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, route: '/sidebar/login' },
  { text: 'Commandes', icon: <ShoppingCartIcon />, route: '/sidebar/orders' },
  { text: 'Plats', icon: <RestaurantMenuIcon />, route: '/sidebar/dishes' },
  { text: 'Menu', icon: <MenuBookIcon />, route: '/sidebar/menu' },
];

const secondaryItems = [
  { text: 'Profile', icon: <AccountCircleIcon />, route: '/sidebar/user' },
  { text: 'Impayées', icon: <PaymentIcon />, route: '/sidebar/Unpaid' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useLogout();
  const [loadingLogout, setLoadingLogout] = useState(false); // Ajout du loading spécifique à la déconnexion

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await logout(); 
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'black',
          height: '60px',
        }}
      >
        <Toolbar sx={{ height: '150%', display: 'flex', justifyContent: 'flex-start' }}>
          <img
            src="/src/assets/logo.png"
            alt="Logo"
            style={{
              height: '50px',
              width: '210px',
              marginLeft: '-20px',
              marginTop: '-11px',
              objectFit: 'contain'
            }}
          />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'black',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', paddingTop: '10px', paddingLeft: '10px' }}>
          <List>
            {menuItems.map(({ text, icon, route }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton onClick={() => handleNavigation(route)}>
                  <ListItemIcon sx={{ color: 'white' }}>{icon}</ListItemIcon>
                  <ListItemText primary={text} sx={{ color: 'white' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {secondaryItems.map(({ text, icon, route }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton onClick={() => handleNavigation(route)}>
                  <ListItemIcon sx={{ color: 'white' }}>{icon}</ListItemIcon>
                  <ListItemText primary={text} sx={{ color: 'white' }} />
                </ListItemButton>
              </ListItem>
            ))}
            {/* Bouton Déconnexion avec Loader */}
            <ListItem key="LogOut" disablePadding>
              <ListItemButton onClick={handleLogout} disabled={loadingLogout}>
                <ListItemIcon sx={{ color: 'white' }}>
                  {loadingLogout ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    <LogoutIcon />
                  )}
                </ListItemIcon>
                <ListItemText primary={loadingLogout ? 'Déconnexion...' : 'LogOut'} sx={{ color: 'white' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: `${drawerWidth}px` }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
