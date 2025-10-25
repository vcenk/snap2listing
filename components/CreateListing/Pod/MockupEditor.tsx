"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Button, Dialog, DialogContent, DialogTitle,
  CircularProgress, Alert, Typography, IconButton,
  LinearProgress, Stack, Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { initDynamicMockupsIframe } from "@dynamic-mockups/mockup-editor-sdk";
import { saveMockupsToStorage } from "@/lib/api/dynamicMockups";
import { dynamicMockupsConfig } from "@/lib/config/dynamicMockups";

interface MockupEditorProps {
  open: boolean;
  onClose: () => void;
  designFile?: File;
  onMockupsGenerated: (mockupUrls: string[]) => void;
  userId: string;
  listingId: string;
}

export default function MockupEditor({
  open, onClose, designFile, onMockupsGenerated, userId, listingId,
}: MockupEditorProps) {
  const [loading, setLoading] = useState(false);
  const [savingProgress, setSavingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mockupsReceived, setMockupsReceived] = useState(false);

  const handleMockupGenerated = useCallback(async (mockupUrls: string[]) => {
    console.log("\n🎯 ============================================");
    console.log("🎯 handleMockupGenerated CALLED");
    console.log("✅ Mockups received from Dynamic Mockups:", mockupUrls);
    console.log("   Count:", mockupUrls.length);
    console.log("   User ID:", userId);
    console.log("   Listing ID:", listingId);

    // Prevent duplicate calls
    if (loading) {
      console.warn("⚠️  Already processing mockups, ignoring duplicate call");
      return;
    }

    setMockupsReceived(true);
    setLoading(true);
    setError(null);

    try {
      const savedUrls: string[] = [];
      const totalMockups = mockupUrls.length;

      console.log(`\n📥 Starting to save ${totalMockups} mockup(s) to storage...`);

      for (let i = 0; i < mockupUrls.length; i++) {
        const url = mockupUrls[i];
        console.log(`\n📥 [${i + 1}/${totalMockups}] Saving mockup:`, url);

        try {
          const savedUrl = await saveMockupsToStorage([url], userId, listingId);
          savedUrls.push(...savedUrl);
          const progress = ((i + 1) / totalMockups) * 100;
          setSavingProgress(progress);
          console.log(`✅ [${i + 1}/${totalMockups}] Mockup saved successfully:`, savedUrl);
          console.log(`   Progress: ${Math.round(progress)}%`);
        } catch (saveErr) {
          console.error(`\n❌ ============================================`);
          console.error(`❌ Failed to save mockup ${i + 1}/${totalMockups}`);
          console.error("   URL was:", url);
          console.error("   Error:", saveErr);
          if (saveErr instanceof Error) {
            console.error("   Message:", saveErr.message);
            console.error("   Stack:", saveErr.stack);
          }
          console.error(`❌ ============================================\n`);
          throw saveErr; // Re-throw to trigger outer catch
        }
      }

      console.log("\n🎉 ============================================");
      console.log("🎉 ALL MOCKUPS SAVED SUCCESSFULLY!");
      console.log("   Total saved:", savedUrls.length);
      console.log("   URLs:", savedUrls);
      console.log("🎉 ============================================\n");

      onMockupsGenerated(savedUrls);

      setTimeout(() => {
        console.log("✅ Closing dialog...");
        onClose();
      }, 1500);
    } catch (err) {
      console.error("\n❌ ============================================");
      console.error("❌ SAVE MOCKUPS FAILED - TOP LEVEL ERROR");
      console.error("   Error:", err);
      if (err instanceof Error) {
        console.error("   Error name:", err.name);
        console.error("   Error message:", err.message);
        console.error("   Error stack:", err.stack);
      }
      console.error("❌ ============================================\n");
      setError(`Failed to save mockups: ${err instanceof Error ? err.message : 'Unknown error'}. Check console for details.`);
      setLoading(false);
    }
  }, [userId, listingId, onMockupsGenerated, onClose, loading]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setLoading(false);
      setError(null);
      setMockupsReceived(false);
      setSavingProgress(0);
    }
  }, [open]);

  // ✅ Wait for dmIframeReady, then initialize SDK
  useEffect(() => {
    if (!open) return;

    let isInitialized = false;

    const messageHandler = async (event: MessageEvent) => {
      // Only process messages from Dynamic Mockups iframe
      if (event.origin !== "https://embed.dynamicmockups.com") return;

      const data = event.data;

      // Log all messages for debugging
      console.log("🔍 [Dynamic Mockups Message]", data);

      // Handle iframe ready event - INITIALIZE SDK HERE
      if (data === "dmIframeReady" && !isInitialized) {
        console.log("✅ dmIframeReady received! Initializing SDK...");
        isInitialized = true;

        // Small delay to ensure iframe is fully ready
        setTimeout(() => {
          try {
            const websiteKey = dynamicMockupsConfig.websiteKey;
            console.log("🔑 Using website key:", websiteKey);

            if (!websiteKey) {
              console.error("❌ No website key configured!");
              setError("Website key not configured. Check your environment variables.");
              return;
            }

            if (typeof initDynamicMockupsIframe === 'undefined') {
              console.error("❌ initDynamicMockupsIframe is not defined!");
              setError("Dynamic Mockups SDK failed to load.");
              return;
            }

            console.log("🚀 Calling initDynamicMockupsIframe...");
            initDynamicMockupsIframe({
              iframeId: "dm-iframe",
              data: {
                "x-website-key": websiteKey,
                showUploadYourArtwork: true,
                enableExportMockups: true,
                showCollectionsWidget: true,
                showColorPicker: true,
                showArtworkLibrary: true,
                showTransformControls: true,
              },
              mode: "custom",
              callback: async (callbackData: any) => {
                console.log("🎉 SDK callback triggered!");
                console.log("📦 Callback data:", callbackData);

                let mockupUrls: string[] = [];

                // Extract URLs from callback data
                if (callbackData?.mockupsExport && Array.isArray(callbackData.mockupsExport)) {
                  mockupUrls = callbackData.mockupsExport
                    .map((m: any) => m.export_path || m.exportPath)
                    .filter(Boolean);
                } else if (callbackData?.mockupsAndPrintFilesExport) {
                  mockupUrls = callbackData.mockupsAndPrintFilesExport
                    .map((m: any) => m.export_path || m.exportPath)
                    .filter(Boolean);
                }

                if (mockupUrls.length > 0) {
                  console.log("✅ Processing mockup URLs:", mockupUrls);
                  await handleMockupGenerated(mockupUrls);
                } else {
                  console.warn("⚠️ No URLs found in callback");
                }
              },
            });
            console.log("✅ SDK initialized successfully!");
          } catch (err) {
            console.error("❌ SDK initialization failed:", err);
            setError(`Failed to initialize editor: ${err}`);
          }
        }, 100);
      }

      // Handle export events (fallback if SDK callback doesn't fire)
      if (data && typeof data === 'object') {
        if (data.mockupsExport || data.mockupsAndPrintFilesExport) {
          console.log("🚨 EXPORT EVENT DETECTED via postMessage!");

          let mockupUrls: string[] = [];
          if (data.mockupsExport && Array.isArray(data.mockupsExport)) {
            mockupUrls = data.mockupsExport.map((m: any) => m.export_path || m.exportPath).filter(Boolean);
          } else if (data.mockupsAndPrintFilesExport) {
            mockupUrls = data.mockupsAndPrintFilesExport.map((m: any) => m.export_path || m.exportPath).filter(Boolean);
          }

          if (mockupUrls.length > 0) {
            console.log("✅ FALLBACK: Processing mockup URLs:", mockupUrls);
            await handleMockupGenerated(mockupUrls);
          }
        }
      }
    };

    window.addEventListener("message", messageHandler);
    return () => {
      window.removeEventListener("message", messageHandler);
      isInitialized = false;
    };
  }, [open, handleMockupGenerated]);

  const handleCloseDialog = () => {
    if (!loading) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: "95vh",
          maxHeight: "95vh",
          bgcolor: "background.default",
          m: 2,
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box component="span" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
          Generate Product Mockups
        </Box>
        <IconButton onClick={handleCloseDialog} disabled={loading} sx={{ color: "inherit" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        {error && <Alert severity="error" sx={{ m: 2, mb: 0 }}>{error}</Alert>}

        {loading ? (
          <Fade in={loading}>
            <Box sx={{ p: 3, bgcolor: "background.paper" }}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  {mockupsReceived && savingProgress === 100
                    ? <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                    : <CircularProgress size={40} />}
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {savingProgress === 100 ? "Mockups saved successfully!" : "Saving your mockups..."}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {savingProgress === 100 ? "Redirecting to listing creation..." : `Progress: ${Math.round(savingProgress)}%`}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={savingProgress} sx={{ height: 8, borderRadius: 4 }} />
              </Stack>
            </Box>
          </Fade>
        ) : (
          <Box sx={{ flex: 1, position: "relative", bgcolor: "background.default", p: 2 }}>
            <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: "info.light", color: "info.contrastText" }}>
              <Typography variant="body2" fontWeight={600}>💡 Instructions:</Typography>
              <Typography variant="body2">
                1. Select a mockup template from the library
                <br />
                2. Upload or apply your design artwork
                <br />
                3. Customize colors, positioning, and effects
                <br />
                4. Click the "Export" or "Generate" button (NOT "Download")
                <br />
                5. Your mockups will be automatically captured and saved
              </Typography>
              <Typography variant="caption" sx={{ display: "block", mt: 1, fontStyle: "italic" }}>
                🔍 Debugging: Check browser console for detailed logs
              </Typography>
            </Box>

            <iframe
              id="dm-iframe"
              src="https://embed.dynamicmockups.com"
              style={{
                width: "100%",
                height: "calc(95vh - 200px)",
                minHeight: "600px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#fff",
              }}
              title="Dynamic Mockups Editor"
              allow="clipboard-write"
              scrolling="yes"
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
