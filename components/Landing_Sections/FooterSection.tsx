"use client";

import * as React from "react";
import Link from "next/link";
import { Box, Container, Typography, Stack, Grid, Divider, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function FooterSection() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#111827",
        borderTop: "1px solid rgba(229, 231, 235, 0.1)",
        color: "white",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              <Typography variant="h6" fontWeight={700}>
                Snap2Listing
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.7, maxWidth: 320 }}>
                AI-powered multi-channel listing generator for sellers. Create professional,
                export-ready listings in minutes with cutting-edge AI technology.
              </Typography>

              <Stack direction="row" spacing={1}>
                {[
                  { icon: <FacebookIcon fontSize="small" />, href: "https://facebook.com" },
                  { icon: <TwitterIcon fontSize="small" />, href: "https://twitter.com" },
                  { icon: <InstagramIcon fontSize="small" />, href: "https://instagram.com" },
                  { icon: <LinkedInIcon fontSize="small" />, href: "https://linkedin.com" },
                ].map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      transition: "all 0.2s",
                      "&:hover": {
                        color: "white",
                        bgcolor: alpha("#F97316", 0.15),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Product Links */}
          <Grid item xs={6} md={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Product
              </Typography>
              {["Features", "Pricing", "How It Works", "FAQ"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.5)",
                      "&:hover": { color: "white" },
                      transition: "color 0.2s",
                      fontSize: "0.9rem",
                    }}
                  >
                    {item}
                  </Typography>
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Company Links */}
          <Grid item xs={6} md={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Company
              </Typography>
              {[
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "Blog", href: "/blog" },
                { name: "Careers", href: "/careers" },
              ].map((link) => (
                <Link key={link.name} href={link.href} style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.5)",
                      "&:hover": { color: "white" },
                      transition: "color 0.2s",
                      fontSize: "0.9rem",
                    }}
                  >
                    {link.name}
                  </Typography>
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={6} md={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Legal
              </Typography>
              {[
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Cookie Policy", href: "/cookies" },
              ].map((link) => (
                <Link key={link.name} href={link.href} style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.5)",
                      "&:hover": { color: "white" },
                      transition: "color 0.2s",
                      fontSize: "0.9rem",
                    }}
                  >
                    {link.name}
                  </Typography>
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Support Links */}
          <Grid item xs={6} md={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Support
              </Typography>
              {[
                { name: "Help Center", href: "/help" },
                { name: "Contact Us", href: "/contact" },
                { name: "System Status", href: "/status" },
              ].map((link) => (
                <Link key={link.name} href={link.href} style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.5)",
                      "&:hover": { color: "white" },
                      transition: "color 0.2s",
                      fontSize: "0.9rem",
                    }}
                  >
                    {link.name}
                  </Typography>
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5, borderColor: "rgba(255, 255, 255, 0.1)" }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" sx={{ opacity: 0.6, fontSize: "0.875rem" }}>
            © {new Date().getFullYear()} Snap2Listing. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3} sx={{ opacity: 0.6, fontSize: "0.875rem" }}>
            <Typography variant="body2">
              Made for sellers worldwide 🌍
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
