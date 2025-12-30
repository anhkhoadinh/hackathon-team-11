#!/usr/bin/env node

/**
 * Generate extension config from .env.local
 * Run: node scripts/generate-extension-config.js
 */

const fs = require("fs");
const path = require("path");

// Read .env.local
const envPath = path.join(__dirname, "../.env.local");
const extensionConfigPath = path.join(
  __dirname,
  "../chrome-extension/config.js"
);

try {
  // Read .env.local file
  const envContent = fs.readFileSync(envPath, "utf8");

  // Parse API_URL from .env.local (if exists)
  let apiUrl = "http://localhost:3002/api";
  const apiUrlMatch =
    envContent.match(/^API_BASE_URL=(.+)$/m) ||
    envContent.match(/^NEXT_PUBLIC_API_URL=(.+)$/m);

  if (apiUrlMatch) {
    apiUrl = apiUrlMatch[1].trim().replace(/['"]/g, "");
  }

  // Generate config.js content
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

  // Write to config.js
  fs.writeFileSync(extensionConfigPath, configContent, "utf8");

  console.log("? Extension config generated successfully!");
  console.log(`?? API_BASE_URL: ${apiUrl}`);
  console.log(`?? Output: chrome-extension/config.js`);
} catch (error) {
  console.error("? Error generating config:", error.message);
  process.exit(1);
}
