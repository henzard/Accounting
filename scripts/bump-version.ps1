# Version Bump Script
# Usage: .\scripts\bump-version.ps1 -Type patch|minor|major [-Message "Custom message"]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("patch", "minor", "major")]
    [string]$Type,
    
    [string]$Message = ""
)

Write-Host "🔄 Bumping $Type version..." -ForegroundColor Cyan

# Change to src directory
Push-Location src

try {
    # Build commit message
    $commitMessage = "chore: bump version to %s"
    if ($Message) {
        $commitMessage += "`n`n$Message"
    }
    
    # Bump version using npm (this will automatically sync app.json via hooks)
    Write-Host "📦 Running npm version $Type..." -ForegroundColor Yellow
    Write-Host "   (This will automatically sync app.json)" -ForegroundColor Gray
    npm version $Type -m $commitMessage
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Version bump failed!" -ForegroundColor Red
        exit 1
    }
    
    # Get the new version
    $newVersion = node -p "require('./package.json').version"
    Write-Host "✅ Version bumped to $newVersion" -ForegroundColor Green
    
    # Push commits and tags
    Write-Host "📤 Pushing commits..." -ForegroundColor Yellow
    git push
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push commits!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📤 Pushing tags..." -ForegroundColor Yellow
    git push --tags
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push tags!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Version $newVersion bumped and pushed successfully!" -ForegroundColor Green
    Write-Host "🏷️  Tag: v$newVersion" -ForegroundColor Cyan
    
} finally {
    Pop-Location
}
