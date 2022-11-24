<#
# Set the default user browser on Chrome.
# See http://kolbi.cz/blog/?p=346
#>
Write-Output "::group::Setup Chrome"
$SetUserFTAPath = Resolve-Path '.\packages\cli-e2e\entrypoints\utils\SetUserFTA\SetUserFTA.exe'
Start-Process -FilePath $SetUserFTAPath -ArgumentList ' http ChromeHTML' -PassThru | Wait-Process
Start-Process -FilePath $SetUserFTAPath -ArgumentList ' https ChromeHTML' -PassThru | Wait-Process
Start-Process -FilePath $SetUserFTAPath -ArgumentList '.htm ChromeHTML' -PassThru | Wait-Process
Start-Process -FilePath $SetUserFTAPath -ArgumentList '.html ChromeHTML' -PassThru | Wait-Process
Write-Output "::endgroup::"

Write-Output "::group::Install NPM Global dependencies"
# TODO CDX-672 remove version lock
npm install -g @angular/cli@15.x
npm install -g netlify-cli@12.x
npm install -g ts-node
Write-Output "::endgroup::"

Write-Output "::group::Setup Git User"
git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"
Write-Output "::endgroup::"
