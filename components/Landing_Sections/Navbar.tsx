"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Stack,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useScrollTrigger,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export default function Navbar() {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("#features");
  const trigger = useScrollTrigger({ threshold: 10, disableHysteresis: true });

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  React.useEffect(() => {
    const targets = navItems
      .map((i) => document.querySelector(i.href) as HTMLElement)
      .filter(Boolean);
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(`#${visible.target.id}`);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const handleDrawerToggle = () => setMobileOpen((o) => !o);

  const drawer = (
    <Box sx={{ p: 2, width: 320 }} role="presentation" onClick={() => setMobileOpen(false)}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Image src="/logo.png" alt="Snap2Listing" width={200} height={100} style={{ objectFit: "contain" }} />
        <IconButton aria-label="Close menu">
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider sx={{ mb: 1 }} />
      <List sx={{ py: 0 }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton component={Link} href={item.href} sx={{ borderRadius: 2 }}>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1}>
        <Button component={Link} href="/login" variant="outlined" sx={{ textTransform: "none", borderRadius: 999, fontWeight: 600 }}>
          Log in
        </Button>
        <Button
          component={Link}
          href="/signup"
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: 999,
            fontWeight: 700,
            background: "linear-gradient(90deg, #F97316, #9333EA)",
            "&:hover": {
              filter: "brightness(1.1)",
              boxShadow: "0 4px 12px rgba(249, 115, 22, 0.4)",
            },
          }}
        >
          Start Free
        </Button>
      </Stack>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={trigger ? 8 : 0}
        sx={{
          backdropFilter: "saturate(180%) blur(20px)",
          backgroundColor: alpha("#FFFFFF", trigger ? 0.85 : 0.7),
          borderBottom: trigger ? `1px solid ${alpha("#E5E7EB", 1)}` : "1px solid rgba(229, 231, 235, 0.5)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: trigger ? "0 4px 20px rgba(0, 0, 0, 0.08)" : "none",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            sx={{
              minHeight: { xs: 64, sm: 70, md: trigger ? 70 : 80 },
              transition: "min-height 0.3s ease",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
    
            {/* Logo */}
<Box component={Link} href="/" sx={{ display: "flex", alignItems: "left", gap: 1 }}>
  <Image
    src="/logo.png?v=2"        // add ?v=2 to bust cache if needed
    alt="Snap2Listing"
    width={300}                 // tweak to your liking (navbar height ~36–40px)
    height={100}
    priority
    style={{ objectFit: "contain" }}
  />

</Box>


            {/* Desktop Navigation */}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
              {navItems.map((item) => {
                const active = activeId === item.href;
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "1.2rem",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      color: active ? "#F97316" : "#6B7280",
                      position: "relative",
                      "&:hover": {
                        color: "#F97316",
                        backgroundColor: alpha("#F97316", 0.06),
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        left: "20%",
                        right: "20%",
                        bottom: 6,
                        height: 2,
                        borderRadius: 2,
                        transform: active ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "center",
                        transition: "transform 0.3s ease",
                        bgcolor: "#F97316",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>

            {/* CTA Buttons Desktop */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ display: { xs: "none", md: "flex" } }}>
              <Button
                component={Link}
                href="/login"
                variant="text"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  color: "#6B7280",
                  "&:hover": {
                    color: "#111827",
                    backgroundColor: alpha("#111827", 0.04),
                  }
                }}
              >
                Log in
              </Button>
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  px: 3,
                  py: 1.25,
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #F97316, #9333EA)",
                  boxShadow: "0 2px 8px rgba(249, 115, 22, 0.25)",
                  transition: "all 0.2s",
                  "&:hover": {
                    filter: "brightness(1.1)",
                    boxShadow: "0 6px 20px rgba(249, 115, 22, 0.4)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Start Free
              </Button>
            </Stack>

            {/* Mobile Menu Button */}
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ display: { md: "none" }, color: "text.primary" }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Spacer for fixed navbar */}
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70, md: 80 } }} />

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
