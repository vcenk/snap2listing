'use client';

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SettingsIcon from '@mui/icons-material/Settings';
import StyleIcon from '@mui/icons-material/Style';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const DRAWER_WIDTH = 260;

const menuItems = [
  { label: 'Overview', href: '/app/overview', icon: <DashboardIcon /> },
  { label: 'Create Listing', href: '/app/create', icon: <AddCircleIcon />, primary: true },
  { label: 'Listings', href: '/app/listings', icon: <ListAltIcon /> },
  { label: 'Channels', href: '/app/channels', icon: <StorefrontIcon /> },
  // { label: 'Templates', href: '/app/templates', icon: <StyleIcon /> },
  { label: 'Billing & Usage', href: '/app/billing', icon: <CreditCardIcon /> },
  { label: 'Settings', href: '/app/settings', icon: <SettingsIcon /> },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        component={Link}
        href="/app/overview"
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        <Image
          src="/logo.png"
          alt="Snap2Listing Logo"
          width={180}
          height={60}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Box>

      <Divider />

      {/* Menu */}
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  bgcolor: item.primary ? 'primary.main' : isActive ? 'action.selected' : 'transparent',
                  color: item.primary ? 'white' : isActive ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    bgcolor: item.primary ? 'primary.dark' : 'action.hover',
                  },
                  '&.Mui-selected': {
                    bgcolor: item.primary ? 'primary.main' : 'action.selected',
                    '&:hover': {
                      bgcolor: item.primary ? 'primary.dark' : 'action.hover',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: item.primary || isActive ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 Snap2Listing
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
