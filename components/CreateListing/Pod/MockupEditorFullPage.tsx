"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Button, CircularProgress, Alert, Typography,
  LinearProgress, Stack, Paper, Grid, Card, CardMedia,
  Divider, Chip, alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageIcon from "@mui/icons-material/Image";
import { initDynamicMockupsIframe } from "@dynamic-mockups/mockup-editor-sdk";
import { saveMockupsToStorage } from "@/lib/api/dynamicMockups";
import { dynamicMockupsConfig } from "@/lib/config/dynamicMockups";

interface MockupPreview {
  label: string;
  mockup_uuid: string;
  url: string;
}

interface MockupEditorFullPageProps {
  collectionUUID: string;
  collectionName: string;
  onBack: () => void;
  onMockupsGenerated: (mockupUrls: string[]) => void;
  userId: string;
  listingId: string;
}

export default function MockupEditorFullPage({
  collectionUUID,
  collectionName,
  onBack,
  onMockupsGenerated,
  userId,
  listingId,
}: MockupEditorFullPageProps) {
  const [loading, setLoading] = useState(false);
  const [savingProgress, setSavingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mockupsReceived, setMockupsReceived] = useState(false);
  const [bulkPreviews, setBulkPreviews] = useState<MockupPreview[]>([]);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [artworkUploaded, setArtworkUploaded] = useState(false);
  const [lastArtworkUrl, setLastArtworkUrl] = useState<string | null>(null);

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
          throw saveErr;
        }
      }

      console.log("\n🎉 ============================================");
      console.log("🎉 ALL MOCKUPS SAVED SUCCESSFULLY!");
      console.log("   Total saved:", savedUrls.length);
      console.log("   URLs:", savedUrls);
      console.log("🎉 ============================================\n");

      onMockupsGenerated(savedUrls);

      setTimeout(() => {
        console.log("✅ Resetting loading state...");
        setLoading(false);
        setSavingProgress(0);
        setMockupsReceived(false);
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
  }, [userId, listingId, onMockupsGenerated, loading]);

  // Generate bulk previews when artwork is uploaded
  const handleArtworkUpload = useCallback(async (artworkUrl: string) => {
    console.log("\n🎨 Artwork uploaded:", artworkUrl);
    setArtworkUploaded(true);
    setLastArtworkUrl(artworkUrl);
    setLoadingPreviews(true);
    setError(null);

    try {
      console.log("📤 Generating bulk previews for collection:", collectionUUID);

      const response = await fetch('/api/mockups/bulk-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkUrl,
          collectionUUID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate previews');
      }

      const data = await response.json();
      console.log("✅ Bulk previews generated:", data.previews);
      setBulkPreviews(data.previews || []);
    } catch (err) {
      console.error("❌ Failed to generate bulk previews:", err);
      setError(err instanceof Error ? err.message : 'Failed to generate previews');
    } finally {
      setLoadingPreviews(false);
    }
  }, [collectionUUID]);

  // ✅ Wait for dmIframeReady, then initialize SDK
  useEffect(() => {
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
              iframeId: "dm-iframe-fullpage",
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

                // Check if artwork was uploaded
                if (callbackData?.artworkUploaded && callbackData?.artworkUrl) {
                  console.log("🎨 Artwork uploaded detected!");
                  await handleArtworkUpload(callbackData.artworkUrl);
                }

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
  }, [handleMockupGenerated, handleArtworkUpload]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
          >
            Back
          </Button>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700}>
              Create Mockups - {collectionName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Upload your artwork, customize mockups, and export
            </Typography>
          </Box>
          {artworkUploaded && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Artwork Uploaded"
              color="success"
              size="small"
            />
          )}
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ m: 2, mb: 0 }}>
          {error}
        </Alert>
      )}

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Editor */}
        <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
          {loading && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                p: 4,
                zIndex: 1000,
                minWidth: 400,
              }}
            >
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
                      {savingProgress === 100 ? "Ready to continue!" : `Progress: ${Math.round(savingProgress)}%`}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={savingProgress} sx={{ height: 8, borderRadius: 4 }} />
              </Stack>
            </Paper>
          )}

          <Paper
            elevation={2}
            sx={{
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: '#fff',
            }}
          >
            <iframe
              id="dm-iframe-fullpage"
              src="https://embed.dynamicmockups.com"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title="Dynamic Mockups Editor"
              allow="clipboard-write"
              scrolling="yes"
            />
          </Paper>
        </Box>

        {/* Right: Preview Sidebar */}
        <Box
          sx={{
            width: 320,
            borderLeft: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: 2,
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Mockup Previews
          </Typography>

          {!artworkUploaded && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ImageIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Upload your artwork in the editor to see previews of all mockups in this collection
              </Typography>
            </Box>
          )}

          {loadingPreviews && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                Generating previews...
              </Typography>
            </Box>
          )}

          {artworkUploaded && !loadingPreviews && bulkPreviews.length > 0 && (
            <Grid container spacing={1.5}>
              {bulkPreviews.map((preview) => (
                <Grid item xs={12} key={preview.mockup_uuid}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={preview.url}
                      alt={preview.label}
                      sx={{
                        aspectRatio: '1/1',
                        objectFit: 'cover',
                      }}
                    />
                    <Box sx={{ p: 1, bgcolor: 'background.default' }}>
                      <Typography variant="caption" noWrap>
                        {preview.label}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {artworkUploaded && !loadingPreviews && bulkPreviews.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No previews available. This may happen if the collection is empty or the API request failed.
            </Alert>
          )}
        </Box>
      </Box>

      {/* Bottom Action Bar */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary">
              Click "Export" in the editor when you're ready to save your mockups
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            disabled
            sx={{ minWidth: 200 }}
          >
            Generate Listing (Coming Soon)
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
