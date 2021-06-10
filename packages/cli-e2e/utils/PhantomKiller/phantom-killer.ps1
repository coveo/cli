<#
.SYNOPSIS
    Kills zombie processes where the parent has already exited
.DESCRIPTION
    phantom-killer.ps1 is designed to find zombie processes (where the parent process who spawned them has died) and stop them.
    On Windows machines running Powershell 5.1, the processes uses a CIM call to get a Win32_Process in order to get
    parent-process information and determine if its still running. Then it's translated into Process object references
    in order to be killed.
    For Linux/Windows environments using Powershell 6 (Core) and above, the Get-Process command already has references to
    the parent process and can easily determine its state.
.PARAMETER ProcessName
    Name of the process to kill. Do not include the extension.
.PARAMETER DryRun
    List the processes to kill without actuall killing them.
.EXAMPLE
    PS C:\> .\phantom-killer.ps1 -ProcessName 'phantomjs'
    Kills all phantomjs processes on the machine where the parent is no longer running
.EXAMPLE
    PS C:\> .\phantom-killer.ps1 -ProcessName 'phantomjs' -DryRun
    Simulates the processes that would be killed if run, but does not stop them. Useful for sanity checks.
.NOTES
    While this script is compatible with Windows Powershell 5.1, it works best when being run in Powershell 6 (Core)/Powershell 7 and above.
    It is strongly reccomended that you upgrade to Powershell 7 LTS (which installs side-by-side with Powershell 5.1) and use the "pwsh" executable.
    See https://aka.ms/powershell for more info
    Version: 2.0.1
    Author: Chris Sekira
#>
[CmdletBinding()]
param (
    [Parameter(Position = 0, Mandatory = $true)]
    [Alias("Name")]
    [ValidateNotNullOrEmpty()]
    [string]
    $ProcessName,

    [Parameter(Mandatory = $false)]
    [switch]
    $DryRun
)

# ----------------------------------------------------------------------------------------------- #
# REQUIREMENTS                                                                                    #
# ----------------------------------------------------------------------------------------------- #

#Requires -Version 5.1

# ----------------------------------------------------------------------------------------------- #
# HELPER FUNCTIONS                                                                                #
# ----------------------------------------------------------------------------------------------- #

# Simple logging output formatting helper
function Log
{
    [OutputType([System.Void])]
    param(
        [Parameter(Position = 0, Mandatory = $true)]
        [string]
        $Message,

        [Parameter(Mandatory = $false)]
        [switch]
        $ForceStandardOutput
    )

    # If it's a DryRun AND ForceStandardInput is not used, then prepend "DRYRUN -- " to the output and write it in yellow
    if ($DryRun -and (-not $ForceStandardOutput))
    {
        Write-Host "DRYRUN -- $Message" -ForegroundColor DarkYellow;
    }
    else # Otherwise output as normal
    {
        Write-Host $Message;
    }
}

# Query system for Zombie Processes
function GetZombieProcesses
{
    [OutputType([System.Diagnostics.Process[]])]
    param (
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]
        $ProcessName
    )

    # Prior to Powershell 6, the Get-Process method did not return an instance of the parent process or a ParentProcessId so the legacy API must be used in order to get a ParentProcessId
    if ($PSVersionTable.PSVersion.Major -le 5)
    {
        # Store the time of execution as a baseline for converting processes later
        $timeOfQuery = [datetime]::Now;

        # Use the legacy Get-CimInstance query to get an initial set of processes that somewhat match the process name, this will be filtered down in the first Where-Object step
        return (Get-CimInstance -Class Win32_Process -Filter "Name LIKE '%$ProcessName%'" -ErrorAction SilentlyContinue | Where-Object {

                # Secondary level of filtering to ensure that the executable name without the extension is an exact match
                # This is a backwards compatibility patch since Get-CimInstance returns the full executable name while Get-Process does not
                return ([System.IO.Path]::GetFileNameWithoutExtension($_.Name) -eq $ProcessName);

            } | Where-Object {

                # In order to determine if a ProcessId is actually the parent, the CreationDate field of the Win32_Process must be before-or-equal-to the StartTime of it's child
                # See the notes on the Win32_Process ParentProcessId documentation here https://docs.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process
                $parentProcessId = $_.ParentProcessId;
                $currentProcessStartTime = $_.CreationDate;
                $parentProcess = Get-Process -Id $parentProcessId -ErrorAction SilentlyContinue | Where-Object { $_.StartTime -le $currentProcessStartTime } | Select-Object -First 1;

                return ($null -eq $parentProcess);

            } | ForEach-Object {

                # Additional logic is needed when determining if the parent process is still running since ProcessIds are only unique for the lifetime of the application and could potentially be resued
                # Translate the original Win32_Process back into an actual Process object as a sanity check that it has not changed since the query above
                return (Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue);

            } | Where-Object {

                # Check that we're still referencing a phantomjs process by confirming it's name and that it hasn't been created after the start of this pipeline statement/CimInstance query
                # The likelyhood that the original process has died and a new phantomjs process has started (that is not a zombie) with the exact same ProcessId is very VERY low
                return (($_.Name -eq $ProcessName) -and ($_.StartTime -le $timeOfQuery));

            });
    }
    else  # For PowerShell 6 (Core), Powershell 7, and above the Get-Process command returns a reference to the parent process and it can easily check if its running
    {
        return (Get-Process -Name $ProcessName -ErrorAction SilentlyContinue | Where-Object { ($null -eq $_.Parent) -or $($_.Parent.HasExited) });
    }

}

# ----------------------------------------------------------------------------------------------- #
# SCRIPT ENTRYPOINT                                                                               #
# ----------------------------------------------------------------------------------------------- #

# Alert user if they're performing a dry-run
if ($DryRun)
{
    Log -Message "Listing processes that will be stopped only, no changes will be made.";
}

# Collect all the Processes to be stopped
$zombieProcesses = GetZombieProcesses -ProcessName $ProcessName;

# If any processes to be killed were found, terminate them. Otherwise alert the user that no matches were found
if ($zombieProcesses)
{
    $zombieProcesses | ForEach-Object {

        $message = [string]::Format("Zombie Process ""{0}"" Id: {1} Path: ""{2}""", $_.Name, $_.Id, $_.Path);

        # If it's a DryRun then just print what processes would be killed, otherwise actually kill them
        if ($DryRun)
        {
            Log -Message "Found $message";
        }
        else
        {
            Log -Message "Killing $message";
            $_.Kill();
        }
    }
}
else
{
    Log -Message "No running processes with name ""$ProcessName"" were found";
}