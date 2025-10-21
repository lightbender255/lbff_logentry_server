# PowerShell script to start the log entry server
$env:PORT = 3000
$env:LOG_FILE = $(Join-Path $PSScriptRoot 'logs' | Join-Path -ChildPath 'bedrock.log')
node "$(Join-Path $PSScriptRoot 'server.js')"
