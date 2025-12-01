# Dark Theme Batch Converter for SEO Analyzer
# This script converts all remaining light-themed pages to premium dark theme

$files = @(
    "frontand/src/pages/LinkChecker.tsx",
    "frontand/src/pages/OGValidator.tsx",
    "frontand/src/pages/RankTracker.tsx",
    "frontand/src/pages/AlertsDashboard.tsx",
    "frontand/src/pages/AlertSettings.tsx",
    "frontand/src/pages/SchemaValidator.tsx",
    "frontand/src/pages/SecurityHeadersChecker.tsx",
    "frontand/src/pages/MultiLanguageSeoChecker.tsx",
    "frontand/src/pages/ReadabilityChecker.tsx",
    "frontand/src/pages/DuplicateContentDetector.tsx",
    "frontand/src/pages/ToxicBacklinkDetector.tsx",
    "frontand/src/pages/TwitterCardValidator.tsx",
    "frontand/src/pages/PinterestRichPinValidator.tsx",
    "frontand/src/pages/SocialPresenceValidator.tsx",
    "frontand/src/pages/SocialShareTracker.tsx",
    "frontand/src/pages/Scan.tsx",
    "frontand/src/pages/Compare.tsx",
    "frontand/src/pages/ChartsGallery.tsx",
    "frontand/src/pages/Settings.tsx",
    "frontand/src/pages/Login.tsx",
    "frontand/src/pages/Register.tsx",
    "frontand/src/pages/About.tsx",
    "frontand/src/pages/Contact.tsx",
    "frontand/src/pages/Privacy.tsx",
    "frontand/src/pages/Terms.tsx",
    "frontand/src/pages/NotFound.tsx",
    "frontand/src/pages/Pricing.tsx"
)

# Color mappings
$replacements = @{
    # Backgrounds
    "bg-white" = "bg-slate-800/50 backdrop-blur-xl border border-white/10"
    "bg-gray-50" = "bg-slate-900/30"
    "bg-gray-100" = "bg-slate-900/50"
    "bg-gray-200" = "bg-slate-800/50"
    "from-gray-50" = "from-slate-950"
    "to-gray-100" = "to-slate-950"
    "from-blue-50" = "from-slate-950"
    "via-white" = "via-slate-900"
    "to-blue-50" = "to-slate-950"
    
    # Text colors
    "text-gray-900" = "text-white"
    "text-gray-800" = "text-white"
    "text-gray-700" = "text-slate-300"
    "text-gray-600" = "text-slate-400"
    "text-gray-500" = "text-slate-500"
    
    # Borders
    "border-gray-300" = "border-white/10"
    "border-gray-200" = "border-white/10"
    "border-2 border-gray-300" = "border-2 border-white/10"
    "border-2 border-gray-200" = "border-2 border-white/10"
    
    # Hover states
    "hover:bg-gray-100" = "hover:bg-white/10"
    "hover:bg-gray-50" = "hover:bg-white/5"
    "hover:bg-gray-200" = "hover:bg-white/20"
    
    # Placeholders
    "placeholder-gray-400" = "placeholder-slate-500"
    "placeholder-gray-500" = "placeholder-slate-500"
}

Write-Host "Starting dark theme conversion..." -ForegroundColor Cyan
Write-Host "Total files to process: $($files.Count)" -ForegroundColor Yellow

$converted = 0
$skipped = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "  [SKIP] $file - File not found" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    try {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        $originalContent = $content
        
        # Apply all replacements
        foreach ($old in $replacements.Keys) {
            $new = $replacements[$old]
            $content = $content -replace [regex]::Escape($old), $new
        }
        
        # Only write if content changed
        if ($content -ne $originalContent) {
            Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  [OK] $file" -ForegroundColor Green
            $converted++
        } else {
            Write-Host "  [SKIP] $file - No changes needed" -ForegroundColor Gray
            $skipped++
        }
    }
    catch {
        Write-Host "  [ERROR] $file - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nConversion complete!" -ForegroundColor Cyan
Write-Host "  Converted: $converted files" -ForegroundColor Green
Write-Host "  Skipped: $skipped files" -ForegroundColor Yellow
Write-Host "`nNote: Some files may need manual adjustments for complex components." -ForegroundColor Gray
