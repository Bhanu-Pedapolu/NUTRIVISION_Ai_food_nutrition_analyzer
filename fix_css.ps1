$files = @(
  "src\pages\LandingPage.css",
  "src\pages\FoodAnalyzerPage.css",
  "src\pages\DashboardPage.css",
  "src\pages\AnalyticsPage.css",
  "src\pages\ChatbotPage.css",
  "src\pages\MealPlannerPage.css",
  "src\pages\AuthPage.css",
  "src\pages\ProfilePage.css",
  "src\pages\GroceryPage.css",
  "src\pages\OnboardingPage.css",
  "src\pages\WeatherFoodPage.css",
  "src\pages\ChallengesPage.css",
  "src\pages\QRCompanionPage.css",
  "src\pages\SeasonalFoodsPage.css",
  "src\components\EntryVideoModal.css",
  "src\components\Navbar.css"
)

foreach ($f in $files) {
  if (Test-Path $f) {
    $content = Get-Content $f -Raw
    # Replace white backgrounds with dark card backgrounds
    $content = $content -replace 'background:\s*#ffffff', 'background: var(--bg-card)'
    $content = $content -replace 'background-color:\s*#ffffff', 'background-color: var(--bg-card)'
    # Replace walnut text color references with the CSS variable
    $content = $content -replace 'color:\s*var\(--walnut\)', 'color: var(--text-primary)'
    $content = $content -replace 'color:\s*var\(--text-walnut\)', 'color: var(--text-primary)'
    Set-Content $f $content -NoNewline
    Write-Host "Updated: $f"
  } else {
    Write-Host "Not found: $f"
  }
}
Write-Host "Done!"
