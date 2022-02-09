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

Write-Output "::group::Publishing UI templates"
git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"

Write-Output "::group::Setup mitmproxy"
choco.exe install mitmproxy -y
$env:Path = $env:Path + ";C:\Program Files (x86)\mitmproxy\bin"
Write-Output "::endgroup::"

Write-Output "::group::Run tests"
cd packages/cli-e2e
npm run jest
Write-Output "::endgroup::"