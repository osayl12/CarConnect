# CarConnect - Rename JS to JSX and commit each file individually

Write-Host "Starting JSX rename..." -ForegroundColor Cyan

# Fix any git lock issues
if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force
}

# Remove old .js files and add new .jsx files - one commit at a time
$files = @(
    @{ old = "frontend/src/index.js";                        new = "frontend/src/index.jsx";                        msg = "refactor: rename index.js to index.jsx" },
    @{ old = "frontend/src/App.js";                          new = "frontend/src/App.jsx";                          msg = "refactor: rename App.js to App.jsx" },
    @{ old = "frontend/src/context/AuthContext.js";          new = "frontend/src/context/AuthContext.jsx";          msg = "refactor: rename AuthContext.js to AuthContext.jsx" },
    @{ old = "frontend/src/services/api.js";                 new = "frontend/src/services/api.jsx";                 msg = "refactor: rename api.js to api.jsx" },
    @{ old = "frontend/src/components/shared/Navbar.js";     new = "frontend/src/components/shared/Navbar.jsx";     msg = "refactor: rename Navbar.js to Navbar.jsx" },
    @{ old = "frontend/src/pages/LoginPage.js";              new = "frontend/src/pages/LoginPage.jsx";              msg = "refactor: rename LoginPage.js to LoginPage.jsx" },
    @{ old = "frontend/src/pages/RegisterPage.js";           new = "frontend/src/pages/RegisterPage.jsx";           msg = "refactor: rename RegisterPage.js to RegisterPage.jsx" },
    @{ old = "frontend/src/pages/ClientDashboard.js";        new = "frontend/src/pages/ClientDashboard.jsx";        msg = "refactor: rename ClientDashboard.js to ClientDashboard.jsx" },
    @{ old = "frontend/src/pages/MechanicDashboard.js";      new = "frontend/src/pages/MechanicDashboard.jsx";      msg = "refactor: rename MechanicDashboard.js to MechanicDashboard.jsx" },
    @{ old = "frontend/src/pages/FaultReportPage.js";        new = "frontend/src/pages/FaultReportPage.jsx";        msg = "refactor: rename FaultReportPage.js to FaultReportPage.jsx" },
    @{ old = "frontend/src/pages/VehicleDataPage.js";        new = "frontend/src/pages/VehicleDataPage.jsx";        msg = "refactor: rename VehicleDataPage.js to VehicleDataPage.jsx" },
    @{ old = "frontend/src/pages/AppointmentsPage.js";       new = "frontend/src/pages/AppointmentsPage.jsx";       msg = "refactor: rename AppointmentsPage.js to AppointmentsPage.jsx" },
    @{ old = "frontend/src/pages/FaultHistoryPage.js";       new = "frontend/src/pages/FaultHistoryPage.jsx";       msg = "refactor: rename FaultHistoryPage.js to FaultHistoryPage.jsx" },
    @{ old = "frontend/src/pages/NotFoundPage.js";           new = "frontend/src/pages/NotFoundPage.jsx";           msg = "refactor: rename NotFoundPage.js to NotFoundPage.jsx" }
)

foreach ($file in $files) {
    # Copy content to new .jsx file if old .js exists
    if (Test-Path $file.old) {
        Copy-Item $file.old $file.new -Force
        git rm $file.old --cached -q 2>$null
        git add $file.new
        git commit -m $file.msg
        Write-Host "✅ $($file.msg)" -ForegroundColor Green
    } elseif (Test-Path $file.new) {
        git add $file.new
        git commit -m $file.msg
        Write-Host "✅ $($file.msg)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Skipped: $($file.new) not found" -ForegroundColor Yellow
    }
}

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main --force

Write-Host ""
Write-Host "Done! All .js files renamed to .jsx and pushed to GitHub!" -ForegroundColor Green
