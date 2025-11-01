"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Button, CircularProgress, Alert, Typography,
  LinearProgress, Stack, Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { initDynamicMockupsIframe } from "@dynamic-mockups/mockup-editor-sdk";
import { saveMockupsToStorage } from "@/lib/api/dynamicMockups";
import { dynamicMockupsConfig } from "@/lib/config/dynamicMockups";

interface MockupEditorFullPageProps {
  collectionUUID?: string;
  collectionName?: string;
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  // Removed: bulk preview functionality (not needed - editor has built-in previews)

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };

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

  // Removed: bulk preview generation (editor has built-in preview system)

  // ✅ Wait for dmIframeReady, then initialize SDK
  useEffect(() => {
    let validationAttempts = 0;

    const messageHandler = async (event: MessageEvent) => {
      // Only process messages from Dynamic Mockups iframe
      if (event.origin !== "https://embed.dynamicmockups.com") return;

      const data = event.data;

      // Log all messages for debugging
      console.log("🔍 [Dynamic Mockups Message]", data);

      // Check for validation errors
      if (typeof data === 'string' && data.includes('Error validating client')) {
        validationAttempts++;
        if (validationAttempts > 5) {
          console.error("❌ Multiple validation errors detected");
          addDebugInfo("⚠️ Editor validation failing - check website key");
          setError("Editor failed to validate. Please check your Dynamic Mockups website key configuration.");
        }
      }

      // Handle iframe ready event - INITIALIZE SDK HERE
      if (data === "dmIframeReady" && !sdkInitialized) {
        console.log("✅ dmIframeReady received! Initializing SDK...");
        addDebugInfo("✅ Editor iframe ready - initializing SDK...");
        setIframeLoaded(true);
        setSdkInitialized(true);

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
            console.log("⚙️ SDK Configuration:");
            console.log("   - iframeId: dm-iframe-fullpage");
            console.log("   - mode: custom");
            console.log("   - websiteKey:", websiteKey);

            initDynamicMockupsIframe({
              iframeId: "dm-iframe-fullpage",
              data: {
                "x-website-key": websiteKey,
                websiteKey: websiteKey, // Try both formats
                showUploadYourArtwork: true,
                enableExportMockups: true,
                disableDownload: true, // Prevent automatic downloads
              },
              mode: "custom",
              callback: async (callbackData: any) => {
                console.log("\n🎉 ============================================");
                console.log("🎉 SDK CALLBACK TRIGGERED!");
                console.log("📦 Full callback data:", JSON.stringify(callbackData, null, 2));
                console.log("📊 Callback data keys:", Object.keys(callbackData || {}));
                console.log("🎉 ============================================\n");

                addDebugInfo("🎉 Export callback received!");
                addDebugInfo(`📊 Callback keys: ${Object.keys(callbackData || {}).join(', ')}`);

                let mockupUrls: string[] = [];

                // Try multiple possible data structures
                if (callbackData?.mockupsExport && Array.isArray(callbackData.mockupsExport)) {
                  console.log("✅ Found mockupsExport array:", callbackData.mockupsExport.length);
                  mockupUrls = callbackData.mockupsExport
                    .map((m: any) => {
                      console.log("   Mockup item:", JSON.stringify(m, null, 2));
                      return m.export_path || m.exportPath || m.url;
                    })
                    .filter(Boolean);
                } else if (callbackData?.mockupsAndPrintFilesExport) {
                  console.log("✅ Found mockupsAndPrintFilesExport");
                  const exportData = callbackData.mockupsAndPrintFilesExport;
                  if (Array.isArray(exportData)) {
                    mockupUrls = exportData
                      .map((m: any) => {
                        console.log("   Mockup item:", JSON.stringify(m, null, 2));
                        return m.export_path || m.exportPath || m.url;
                      })
                      .filter(Boolean);
                  }
                } else if (callbackData?.exportedMockups) {
                  console.log("✅ Found exportedMockups");
                  mockupUrls = callbackData.exportedMockups
                    .map((m: any) => {
                      console.log("   Mockup item:", JSON.stringify(m, null, 2));
                      return m.export_path || m.exportPath || m.url;
                    })
                    .filter(Boolean);
                }

                console.log("\n📊 Extracted URLs:", mockupUrls);
                console.log("📊 URLs count:", mockupUrls.length);

                if (mockupUrls.length > 0) {
                  console.log("✅ Processing mockup URLs:", mockupUrls);
                  addDebugInfo(`✅ Found ${mockupUrls.length} mockup URL(s)`);
                  addDebugInfo("💾 Saving mockups...");
                  await handleMockupGenerated(mockupUrls);
                } else {
                  console.warn("\n⚠️ ============================================");
                  console.warn("⚠️ NO URLS FOUND IN CALLBACK!");
                  console.warn("⚠️ Please check the callback data structure above");
                  console.warn("⚠️ ============================================\n");
                  addDebugInfo("⚠️ No mockup URLs found in callback");
                  addDebugInfo("Check browser console for details");
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
      if (data && typeof data === 'object' && data !== 'dmIframeReady') {
        console.log("\n🔍 ============================================");
        console.log("🔍 postMessage RECEIVED (potential export event)");
        console.log("📦 Message data:", JSON.stringify(data, null, 2));
        console.log("📊 Message data keys:", Object.keys(data || {}));
        console.log("🔍 ============================================\n");

        if (data.mockupsExport || data.mockupsAndPrintFilesExport || data.exportedMockups) {
          console.log("🚨 EXPORT EVENT DETECTED via postMessage!");

          let mockupUrls: string[] = [];
          if (data.mockupsExport && Array.isArray(data.mockupsExport)) {
            console.log("✅ Found mockupsExport in postMessage");
            mockupUrls = data.mockupsExport
              .map((m: any) => {
                console.log("   Mockup item:", JSON.stringify(m, null, 2));
                return m.export_path || m.exportPath || m.url;
              })
              .filter(Boolean);
          } else if (data.mockupsAndPrintFilesExport) {
            console.log("✅ Found mockupsAndPrintFilesExport in postMessage");
            const exportData = Array.isArray(data.mockupsAndPrintFilesExport)
              ? data.mockupsAndPrintFilesExport
              : [data.mockupsAndPrintFilesExport];
            mockupUrls = exportData
              .map((m: any) => {
                console.log("   Mockup item:", JSON.stringify(m, null, 2));
                return m.export_path || m.exportPath || m.url;
              })
              .filter(Boolean);
          } else if (data.exportedMockups) {
            console.log("✅ Found exportedMockups in postMessage");
            mockupUrls = data.exportedMockups
              .map((m: any) => {
                console.log("   Mockup item:", JSON.stringify(m, null, 2));
                return m.export_path || m.exportPath || m.url;
              })
              .filter(Boolean);
          }

          console.log("\n📊 FALLBACK - Extracted URLs:", mockupUrls);
          console.log("📊 URLs count:", mockupUrls.length);

          if (mockupUrls.length > 0) {
            console.log("✅ FALLBACK: Processing mockup URLs:", mockupUrls);
            await handleMockupGenerated(mockupUrls);
          } else {
            console.warn("⚠️ FALLBACK: No URLs found in export event");
          }
        }
      }
    };

    window.addEventListener("message", messageHandler);
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [handleMockupGenerated, addDebugInfo, sdkInitialized]);

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
              Create Product Mockups
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select product type, upload your artwork, and create mockups
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ m: 2, mb: 0 }}>
          {error}
        </Alert>
      )}

      {/* Main Content Area - Full Width Editor */}
      <Box sx={{ flex: 1, p: 2, overflow: 'hidden', position: 'relative' }}>
        {/* Loading Overlay - When iframe is loading */}
        {!iframeLoaded && !loading && (
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
              textAlign: 'center',
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={60} />
              <Typography variant="h6" gutterBottom>
                Loading Mockup Editor...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Initializing Dynamic Mockups SDK
              </Typography>
            </Stack>
          </Paper>
        )}

        {/* Saving Progress Overlay */}
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
            src={`https://embed.dynamicmockups.com/?websiteKey=${dynamicMockupsConfig.websiteKey}`}
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
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box flex={1}>
              <Typography variant="body2" color="text.secondary">
                💡 <strong>Tip:</strong> Browse collections, upload your artwork, customize your mockups, then click "Export Mockups" in the editor. Your mockups will be automatically saved to your listing.
              </Typography>
            </Box>
          </Stack>

          {/* Debug Panel */}
          {debugInfo.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                maxHeight: 150,
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
              }}
            >
              <Typography variant="caption" fontWeight={600} display="block" mb={1}>
                🔍 Debug Log:
              </Typography>
              {debugInfo.map((info, idx) => (
                <Typography
                  key={idx}
                  variant="caption"
                  display="block"
                  sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}
                >
                  {info}
                </Typography>
              ))}
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
