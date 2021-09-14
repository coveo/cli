$VerdaccioConfigPath = Resolve-Path './packages/cli-e2e/docker/config/config.yaml' 
Start-Process "npx" -ArgumentList "verdaccio --config $VerdaccioConfigPath"
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


do {
    $ChromeTest = Test-NetConnection -ComputerName localhost -Port 9222 -InformationLevel Quiet
    Write-Output "Chrome Test $ChromeTest"
} while (!$ChromeTest)

do {
    $VerdaccioTest = Test-NetConnection -ComputerName localhost -Port 4873 -InformationLevel Quiet
    Write-Output "Verdaccio Test $VerdaccioTest"
} while (!$VerdaccioTest)

git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"

npm install -g @angular/cli

npm set registry http://localhost:4873
yarn config set registry http://localhost:4873
Write-Output "--mutex network" | Out-File -FilePath ~/.yarnrc -Encoding utf8 -Append
Write-Output "--install.silent true" | Out-File -FilePath ~/.yarnrc -Encoding utf8 -Append
Write-Output "--silent true" | Out-File -FilePath ~/.yarnrc -Encoding utf8 -Append

npm run npm:bump:template -- -- "0.0.0"
npm run npm:publish:template

Set-Location packages/cli-e2e

node entrypoints/utils/wait-for-published-packages.js
# `( )` are important here. See https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_operators?view=powershell-7.1#grouping-operator--
(Get-Content ~/.yarnrc) | Select-String -Pattern "--mutex network" -NotMatch | Set-Content -Path ~/.yarnrc
npm run jest
