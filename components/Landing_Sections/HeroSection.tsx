"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, Container, Grid } from "@mui/material";

const squareData = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Watch product
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Sunglasses
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Nike shoe
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Makeup products
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Handbag
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Headphones
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Perfume
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Camera product
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Gadgets
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Jewelry
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Candles
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Backpack
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // T-shirt
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1625948515291-69613efd103f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Skincare
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1587467512961-120760940315?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Wallet
  },
  {
    id: 16,
    src: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Sneakers
  },
];

const shuffle = (array: typeof squareData) => {
  const newArray = [...array];
  let currentIndex = newArray.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }

  return newArray;
};

const generateSquares = () => {
  return shuffle(squareData).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "6px",
        overflow: "hidden",
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [squares, setSquares] = useState<JSX.Element[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSquares(generateSquares());

    const shuffleSquares = () => {
      setSquares(generateSquares());
      timeoutRef.current = setTimeout(shuffleSquares, 3000);
    };

    timeoutRef.current = setTimeout(shuffleSquares, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isClient) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
          height: "450px",
          gap: "4px",
        }}
      >
        {squareData.slice(0, 16).map((sq) => (
          <Box
            key={sq.id}
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "6px",
              overflow: "hidden",
              backgroundImage: `url(${sq.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(4, 1fr)",
        height: "450px",
        gap: "4px",
      }}
    >
      {squares}
    </Box>
  );
};

export default function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 6, md: 12 },
        px: { xs: 2, md: 4 },
        background: "#fafafa",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  display: "inline-block",
                  mb: 3,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                AI-Powered Marketplace Listings
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "3.5rem", md: "5.5rem", lg: "6.5rem" },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  mb: 4,
                  color: "#0a0a0a",
                  letterSpacing: "-0.02em",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  One
                </Box>{" "}
                Photo,{" "}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Every
                </Box>{" "}
                Platform
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                  color: "#4a5568",
                  lineHeight: 1.6,
                  mb: 5,
                  fontWeight: 400,
                }}
              >
                Transform a single product photo into optimized listings for 10+ marketplaces.
                AI generates titles, descriptions, tags, and pricing - ready to publish in seconds.
              </Typography>
              <Button
                href="/signup"
                component="a"
                variant="contained"
                size="large"
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontWeight: 700,
                  py: 2.5,
                  px: 6,
                  borderRadius: "50px",
                  textTransform: "none",
                  fontSize: "1.25rem",
                  boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    transform: "translateY(-3px)",
                    boxShadow: "0 15px 40px rgba(102, 126, 234, 0.5)",
                  },
                  "&:active": {
                    transform: "scale(0.97)",
                  },
                }}
              >
                🚀 Start Listing Free
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <ShuffleGrid />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
