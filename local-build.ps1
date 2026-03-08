# Accounting - Local APK Build Script
# Builds a local APK from the Expo app in src/ and places it in the build folder

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Accounting - Local Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Project root is src/ for this Expo app
$projectRoot = "src"
$appJsonPath = Join-Path $projectRoot "app.json"

if (Test-Path $appJsonPath) {
    $appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json
    $version = $appJson.expo.version
    $appName = $appJson.expo.name
    Write-Host "[BUILD] App: $appName" -ForegroundColor Green
    Write-Host "[BUILD] Version: $version" -ForegroundColor Green
} else {
    Write-Host "[ERROR] app.json not found at $appJsonPath" -ForegroundColor Red
    exit 1
}

# Create build folder at repo root if it doesn't exist
$buildFolder = "build"
if (!(Test-Path $buildFolder)) {
    Write-Host "[SETUP] Creating build folder..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $buildFolder | Out-Null
}

# Check if Android folder exists (under src/)
$androidPath = Join-Path $projectRoot "android"
if (!(Test-Path $androidPath)) {
    Write-Host "[SETUP] Android folder not found. Running prebuild from $projectRoot..." -ForegroundColor Yellow
    Write-Host ""
    Push-Location $projectRoot
    npx expo prebuild --platform android
    $prebuildResult = $LASTEXITCODE
    Pop-Location
    if ($prebuildResult -ne 0) {
        Write-Host "[ERROR] Prebuild failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Full clean: clear Gradle/Java caches and build outputs so we don't use stale code.
# assembleRelease will rebundle React/JS from current source as part of the build.
Write-Host "[CLEAN] Removing CMake build cache (.cxx directory)..." -ForegroundColor Yellow
$cxxPath = Join-Path $androidPath "app\.cxx"
if (Test-Path $cxxPath) {
    Remove-Item -Path $cxxPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[CLEAN] Removed .cxx directory" -ForegroundColor Green
} else {
    Write-Host "[CLEAN] No .cxx directory to remove (fresh build)" -ForegroundColor Gray
}

Write-Host "[CLEAN] Running gradlew clean (clears Java/native caches and build outputs)..." -ForegroundColor Yellow
Push-Location $androidPath
.\gradlew.bat clean 2>$null
$cleanResult = $LASTEXITCODE
Pop-Location
if ($cleanResult -ne 0) {
    Write-Host "[WARN] Clean had warnings, but continuing (build will regenerate needed files)..." -ForegroundColor Yellow
} else {
    Write-Host "[CLEAN] Done. Release build will bundle current React/JS code." -ForegroundColor Green
}
Write-Host ""

# Build the APK (bundles current JS from src/ and compiles native code)
Write-Host "[BUILD] Building APK (this may take a few minutes)..." -ForegroundColor Yellow
Write-Host ""

Push-Location $androidPath
.\gradlew.bat assembleRelease
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Build failed! Check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Build completed successfully!" -ForegroundColor Green
Write-Host ""

# APK path relative to repo root (android is under src/)
$apkPath = Join-Path $androidPath "app\build\outputs\apk\release\app-release.apk"
if (!(Test-Path $apkPath)) {
    Write-Host "[ERROR] APK file not found at expected location!" -ForegroundColor Red
    Write-Host "         Expected: $apkPath" -ForegroundColor Red
    exit 1
}

# Get APK file size
$apkSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 2)

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Output filenames (Accounting app)
$slug = "accounting"
$newFileName = "${slug}-v$version-$timestamp.apk"
$destinationPath = Join-Path $buildFolder $newFileName

# Copy APK to build folder
Write-Host "[PACKAGE] Copying APK to build folder..." -ForegroundColor Yellow
Copy-Item -Path $apkPath -Destination $destinationPath -Force

# Also create a "latest" copy
$latestFileName = "${slug}-latest.apk"
$latestPath = Join-Path $buildFolder $latestFileName
Copy-Item -Path $apkPath -Destination $latestPath -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Version:      $version" -ForegroundColor Cyan
Write-Host "Size:         $apkSize MB" -ForegroundColor Cyan
Write-Host "Location:     $destinationPath" -ForegroundColor Cyan
Write-Host "Latest Link:  $latestPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files in build folder:" -ForegroundColor Yellow
Get-ChildItem -Path $buildFolder -Filter "*.apk" | ForEach-Object {
    $fileSize = [math]::Round($_.Length / 1MB, 2)
    $sizeText = "$fileSize MB"
    Write-Host "  - $($_.Name) ($sizeText)" -ForegroundColor White
}
Write-Host ""
Write-Host "To install on device:" -ForegroundColor Yellow
Write-Host "  adb install $destinationPath" -ForegroundColor White
Write-Host ""
Write-Host "Done! APK ready for distribution." -ForegroundColor Green
Write-Host ""
