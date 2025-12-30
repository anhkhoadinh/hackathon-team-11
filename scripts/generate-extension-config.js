#!/usr/bin/env node

/**
 * Generate extension config from .env.local
 * This script automatically updates:
 * - chrome-extension/config.js
 * - chrome-extension/manifest.json (host_permissions & content_scripts)
 *
 * Run: npm run generate:extension-config
 */

const fs = require("fs");
const path = require("path");

// Paths
const envPath = path.join(__dirname, "../.env.local");
const extensionConfigPath = path.join(
  __dirname,
  "../chrome-extension/config.js"
);
const manifestPath = path.join(__dirname, "../chrome-extension/manifest.json");

try {
  // Read .env.local file
  const envContent = fs.readFileSync(envPath, "utf8");

  // Parse API_BASE_URL from .env.local
  let apiUrl = "http://localhost:3000/api";
  const apiUrlMatch =
    envContent.match(/^API_BASE_URL=(.+)$/m) ||
    envContent.match(/^NEXT_PUBLIC_API_URL=(.+)$/m);

  if (apiUrlMatch) {
    apiUrl = apiUrlMatch[1].trim().replace(/['"]/g, "");
  }

  // Extract base URL (without /api)
  const baseUrl = apiUrl.replace(/\/api$/, "");

  // Parse URL to get host and port
  const urlObj = new URL(baseUrl);
  const host = urlObj.hostname; // localhost or 127.0.0.1
  const port = urlObj.port || "3000";

  console.log("?? Parsed configuration:");
  console.log(`   - API_BASE_URL: ${apiUrl}`);
  console.log(`   - Base URL: ${baseUrl}`);
  console.log(`   - Host: ${host}`);
  console.log(`   - Port: ${port}`);
  console.log("");

  // =========================================================================
  // 1. Generate config.js
  // =========================================================================
  const configContent = `// Extension Configuration
// ??  AUTO-GENERATED - DO NOT EDIT DIRECTLY
// This file is generated from .env.local
// Run: npm run generate:extension-config to regenerate

const CONFIG = {
  // API Base URL from .env.local
  API_BASE_URL: "${apiUrl}",
};

// Export for use in extension scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
`;

  fs.writeFileSync(extensionConfigPath, configContent, "utf8");
  console.log("? Updated: chrome-extension/config.js");

  // =========================================================================
  // 2. Update manifest.json
  // =========================================================================
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Update host_permissions
  manifest.host_permissions = [
    "https://meet.google.com/*",
    `http://${host}:${port}/*`,
    `http://127.0.0.1:${port}/*`,
  ];

  // Update content_scripts matches for results page
  const resultsScriptIndex = manifest.content_scripts.findIndex(
    (script) => script.js && script.js.includes("results-loader.js")
  );

  if (resultsScriptIndex !== -1) {
    manifest.content_scripts[resultsScriptIndex].matches = [
      `http://${host}:${port}/results*`,
      `http://127.0.0.1:${port}/results*`,
      `http://${host}:${port}/history*`,
      `http://127.0.0.1:${port}/history*`,
    ];
  }

  // Write updated manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log("? Updated: chrome-extension/manifest.json");
  console.log(`   - host_permissions: ${host}:${port}`);
  console.log(
    `   - content_scripts matches: ${host}:${port}/results*, ${host}:${port}/history*`
  );

  // =========================================================================
  // Success Summary
  // =========================================================================
  console.log("");
  console.log("???????????????????????????????????????????????????????");
  console.log("? Configuration generated successfully!");
  console.log("???????????????????????????????????????????????????????");
  console.log("");
  console.log("?? Next steps:");
  console.log("   1. Reload Chrome Extension (chrome://extensions/)");
  console.log("   2. Restart Next.js server (npm run dev)");
  console.log("   3. Close all Google Meet tabs");
  console.log("   4. Test the extension");
  console.log("");
} catch (error) {
  console.error("? Error generating config:", error.message);
  console.error("");
  console.error("Make sure:");
  console.error("   1. .env.local exists (copy from .env.example)");
  console.error("   2. API_BASE_URL is set in .env.local");
  console.error("");
  process.exit(1);
}
