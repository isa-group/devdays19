Write-Host " SETTING ENV VARS FOR RELEASE MANAGER..."
Write-Host " ----------------------------------"

Write-Host " SETTING GITHUB_ACCESS_TOKEN..."
$env:GITHUB_ACCESS_TOKEN = "foo"

Write-Host " SETTING GITHUB_REPO..."
$env:GITHUB_REPO = "foo"

Write-Host " SETTING GITHUB_USERNAME..."
$env:GITHUB_USERNAME = "foo"

Write-Host " SETTING DOCKER_HUB_EMAIL..."
$env:DOCKER_HUB_EMAIL = "foo@foo.foo"

Write-Host " SETTING DOCKER_HUB_USERNAME..."
$env:DOCKER_HUB_USERNAME = "foo"

Write-Host "SETTING DOCKER_HUB_PASSWORD..."
$env:DOCKER_HUB_PASSWORD = "foo"

Write-Host ----------------------------------""
Write-Host " NOW YOU CAN EXECUTE 'grunt release' and 'grunt deliver' commands."
EXIT 0