// Sync version between package.json and app.json
// This is called automatically by npm version hooks

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'src', 'package.json');
const appJsonPath = path.join(__dirname, '..', 'src', 'app.json');

// Read package.json (version was just updated by npm version)
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const newVersion = packageJson.version;

// Read app.json
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Update version in app.json
appJson.expo.version = newVersion;

// Write app.json back
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✅ Synced version ${newVersion} to app.json`);
