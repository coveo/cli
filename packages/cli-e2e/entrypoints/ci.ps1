Write-Output "::group::Setup and start Chrome"
Start-Process "C:/Program Files/Google/Chrome/Application/chrome.exe" -ArgumentList "--no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage --window-size=1080,720"
<#
# Set the default user browser on Chrome.
# See http://kolbi.cz/blog/?p=346
#>
$SetUserFTAPath = Resolve-Path '.\packages\cli-e2e\entrypoints\utils\SetUserFTA\SetUserFTA.exe'
Start-Process -FilePath $SetUserFTAPath -ArgumentList ' http ChromeHTML' -PassThru | Wait-Process
Start-Process -FilePath $SetUserFTAPath -ArgumentList ' https ChromeHTML' -PassThru | Wait-Process
Start-Process -FilePath $SetUserFTAPath -ArgumentList '.htm ChromeHTML' -PassThru | Wait-Process
Start-Process -FilePath $SetUserFTAPath -ArgumentList '.html ChromeHTML' -PassThru | Wait-Process
Write-Output "::endgroup::"

Write-Output "::group::Install NPM Global dependencies"
# TODO CDX-672 remove version lock
npm install -g @angular/cli@13.x
npm install -g ts-node
Write-Output "::endgroup::"

Write-Output "::group::Setup Verdaccio"
New-Item -Path "./packages/cli-e2e/docker/config/verdaccio/storage/htpasswd" -Force
$VerdaccioConfigPath = Resolve-Path './packages/cli-e2e/docker/config/config.yaml' 
Start-Process "npx" -ArgumentList "verdaccio --config $VerdaccioConfigPath"

do {
    $VerdaccioTest = Test-NetConnection -ComputerName localhost -Port 4873 -InformationLevel Quiet
    Write-Output "Verdaccio Test $VerdaccioTest"
} while (!$VerdaccioTest)
Write-Output "::endgroup::"

Write-Output "::group::Publishing UI templates"
git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"

Write-Output "::group::Setup mitmproxy"
choco.exe install mitmproxy -y
$env:Path = $env:Path + ";C:\Program Files (x86)\mitmproxy\bin"
Write-Output "::endgroup::"
npm set registry http://localhost:4873
ts-node --transpile-only ./packages/cli-e2e/utils/npmLogin.ts
yarn config set registry http://localhost:4873
Write-Output "--mutex network" | Out-File -FilePath ~/.yarnrc -Encoding utf8 -Append
Write-Output "--install.silent true" | Out-File -FilePath ~/.yarnrc -Encoding utf8 -Append
Write-Output "--silent true" | Out-File -FilePath ~/.yarnrc -Encoding utf8 -Append

npm run npm:e2e:template
npm run npm:publish:template

Set-Location packages/cli-e2e

node entrypoints/utils/wait-for-published-packages.js
Write-Output "::endgroup::"

Write-Output "::group:: Ensure Chrome is up"
do {
    $ChromeTest = Test-NetConnection -ComputerName localhost -Port 9222 -InformationLevel Quiet
    Write-Output "Chrome Test $ChromeTest"
} while (!$ChromeTest)
Write-Output "::endgroup::"

# `( )` are important here. See https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_operators?view=powershell-7.1#grouping-operator--
(Get-Content ~/.yarnrc) | Select-String -Pattern "--mutex network" -NotMatch | Set-Content -Path ~/.yarnrc

Write-Output "::group::Run tests"
npm run jest
Write-Output "::endgroup::"