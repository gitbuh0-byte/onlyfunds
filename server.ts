import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Load Firebase configuration
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
} catch (err) {
  console.error("Error loading firebase-applet-config.json:", err);
}

// Fetch file metadata from Firestore using REST API
async function fetchFileMetadata(fileId: string) {
  if (!firebaseConfig) return null;
  const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;
  const dbId = firestoreDatabaseId || "(default)";
  
  // Try calling Firestore REST API
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/files/${fileId}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Firestore REST error for file ${fileId}: status ${res.status}`);
      return null;
    }
    const data = await res.json();
    const fields = data.fields || {};
    
    return {
      title: fields.title?.stringValue || "Untitled Document",
      description: fields.description?.stringValue || "No description provided.",
      fee: fields.fee?.doubleValue || fields.fee?.integerValue || fields.fee?.stringValue || "0.00",
      fileType: fields.fileType?.stringValue || "file",
      creatorName: fields.creatorName?.stringValue || "Creator",
      coverUrl: fields.coverUrl?.stringValue || ""
    };
  } catch (error) {
    console.error("Failed to fetch file metadata via REST API:", error);
    return null;
  }
}

// Helper to inject meta tags into index.html
function injectMetaTags(html: string, metadata: any) {
  const title = metadata?.title ? `Unlock: ${metadata.title} - Only Funds` : "Only Funds - Secure Asset Monetization & Sharing";
  const desc = metadata?.description 
    ? `${metadata.description} | Pay $${metadata.fee} security fee to unlock.` 
    : "Share files, images, videos and social links behind high-conversion secure lock screens.";
  const previewImg = metadata?.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
  const creator = metadata?.creatorName || "Only Funds Creator";

  const metaHtml = `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="🔒 ONLY FUNDS: Unlock ${metadata?.title || 'Shared File'}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${previewImg}" />
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="🔒 ONLY FUNDS: Unlock ${metadata?.title || 'Shared File'}" />
    <meta property="twitter:description" content="${desc}" />
    <meta property="twitter:image" content="${previewImg}" />
    <meta name="author" content="${creator}" />
  `;

  // Remove existing title tag
  let cleanHtml = html.replace(/<title>[\s\S]*?<\/title>/, "");
  
  // Insert meta html inside head
  cleanHtml = cleanHtml.replace("<head>", `<head>${metaHtml}`);
  return cleanHtml;
}

// API Health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Setup Vite or static serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Share link preview rendering in DEV
    app.get("/f/:id", async (req, res, next) => {
      const fileId = req.params.id;
      try {
        const metadata = await fetchFileMetadata(fileId);
        let html = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        const finalHtml = injectMetaTags(html, metadata);
        res.status(200).set({ "Content-Type": "text/html" }).end(finalHtml);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve share link first for preview bots
    app.get("/f/:id", async (req, res) => {
      const fileId = req.params.id;
      try {
        const metadata = await fetchFileMetadata(fileId);
        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, "utf-8");
          const finalHtml = injectMetaTags(html, metadata);
          res.status(200).set({ "Content-Type": "text/html" }).end(finalHtml);
        } else {
          res.status(404).send("Application dist folder index.html not found");
        }
      } catch (e) {
        console.error("Error serving shared page:", e);
        res.sendFile(path.join(distPath, "index.html"));
      }
    });

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
