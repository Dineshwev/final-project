# Start the frontend and backend servers with environment variables
# PowerShell script for Windows

# Import .env file variables
function Import-DotEnv {
    param (
        [string]$envFile
    )
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -ErrorAction Stop
        foreach ($line in $content) {
            if ($line -match '^\s*([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Remove quotes if present
                $value = $value -replace '^["'']|["'']$', ''
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-Host "Loaded $name from .env file"
            }
        }
    }
    else {
        Write-Error "Environment file $envFile not found."
    }
}

# Change to project directory
Set-Location -Path "c:\Users\dines\OneDrive\Desktop\seo analyzer"

# Load environment variables for backend
$backendEnvFile = ".\backend\.env"
if (Test-Path $backendEnvFile) {
    Import-DotEnv -envFile $backendEnvFile
    Write-Host "Backend environment variables loaded."
} else {
    Write-Host "No backend .env file found at $backendEnvFile"
}

# Load environment variables for frontend
$frontendEnvFile = ".\frontand\.env"
if (Test-Path $frontendEnvFile) {
    Import-DotEnv -envFile $frontendEnvFile
    Write-Host "Frontend environment variables loaded."
} else {
    Write-Host "No frontend .env file found at $frontendEnvFile"
}

# Inject environment variables into HTML files
Write-Host "Injecting environment variables into HTML files..."
Set-Location -Path ".\frontand"
if (Test-Path .\inject-env.js) {
    Write-Host "Using existing inject-env.js in frontand"
    node inject-env.js
} elseif (Test-Path ..\frontand-backup\inject-env.js) {
    Write-Host "Copying inject-env.js from frontand-backup"
    Copy-Item ..\frontand-backup\inject-env.js .\inject-env.js -Force
    node inject-env.js
} else {
    Write-Host "inject-env.js not found; skipping env injection"
}

# Start backend server
Write-Host "Starting backend server..."
Start-Process powershell -ArgumentList "-Command", "Set-Location 'c:\Users\dines\OneDrive\Desktop\seo analyzer\backend'; node server.js"

# Start frontend HTTP server
Write-Host "Starting frontend server..."
Set-Location -Path "c:\Users\dines\OneDrive\Desktop\seo analyzer\frontand"
python -m http.server 8080

Write-Host "Servers started. Backend on port 3002, Frontend on port 8080"