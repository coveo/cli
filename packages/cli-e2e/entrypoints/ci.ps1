Start-Process "npx" -ArgumentList "verdaccio --config ./docker/config/config.yaml"
Start-Process "C:/Program Files/Google/Chrome/Application/chrome.exe" -ArgumentList "--no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage --window-size=1080,720"

<#
 # Set the default user browser on Chrome.
 # See http://kolbi.cz/blog/?p=346
 #>
./utils/SetUserFTA/SetUserFTA.exe  http ChromeHTML
./utils/SetUserFTA/SetUserFTA.exe  https ChromeHTML
./utils/SetUserFTA/SetUserFTA.exe  .htm ChromeHTML
./utils/SetUserFTA/SetUserFTA.exe  .html ChromeHTML

git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"

npm set registry http://localhost:4873
yarn config set registry http://localhost:4873
Write-Output "--mutex network" | Out-File -FilePath ~/.yarnrc -Encoding utf8 -Append
Write-Output "--install.silent true" | Out-File -FilePath ~/.yarnrc -Encoding utf8 -Append
Write-Output "--silent true" | Out-File -FilePath ~/.yarnrc -Encoding utf8 -Append

npm run npm:bump:template -- -- "0.0.0"
npm run npm:publish:template

Set-Location packages/cli-e2e

node entrypoints/utils/wait-for-published-packages.js
npm run jest