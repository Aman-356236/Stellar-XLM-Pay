<#!
.SYNOPSIS
Builds and deploys the two Soroban contracts to Stellar Testnet.

.DESCRIPTION
Uses STELLAR_SECRET_KEY and STELLAR_PUBLIC_KEY only from the current process.
It never writes a secret to the repository. Run this script manually after
funding the source account with Testnet XLM. The hello-world contract is
initialized and configured to call the newly deployed activity registry.
#>

[CmdletBinding()]
param(
    [string]$SourceAccount = 'orange-belt-deployer'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$contractsRoot = Join-Path $projectRoot 'contracts'

if (-not $env:STELLAR_SECRET_KEY -or -not $env:STELLAR_PUBLIC_KEY) {
    throw 'Set STELLAR_SECRET_KEY and its matching funded STELLAR_PUBLIC_KEY before deploying.'
}

if (-not (Get-Command stellar -ErrorAction SilentlyContinue)) {
    throw 'Stellar CLI is required. Install it from https://developers.stellar.org/docs/tools/cli.'
}

Push-Location $contractsRoot
try {
    stellar contract build

    $registryWasm = Join-Path $contractsRoot 'target/wasm32v1-none/release/activity_registry.wasm'
    $helloWasm = Join-Path $contractsRoot 'target/wasm32v1-none/release/hello_world.wasm'

    $registryId = stellar contract deploy --wasm $registryWasm --source $env:STELLAR_SECRET_KEY --network testnet
    $helloId = stellar contract deploy --wasm $helloWasm --source $env:STELLAR_SECRET_KEY --network testnet
    $adminAddress = $env:STELLAR_PUBLIC_KEY

    stellar contract invoke --id $helloId --source $env:STELLAR_SECRET_KEY --network testnet -- initialize --admin $adminAddress | Out-Null
    stellar contract invoke --id $helloId --source $env:STELLAR_SECRET_KEY --network testnet -- set_registry --admin $adminAddress --registry $registryId | Out-Null

    Write-Host "Activity registry contract: $registryId"
    Write-Host "Hello contract: $helloId"
    Write-Host 'Update VITE_HELLO_CONTRACT_ID with the Hello contract ID before publishing the frontend.'
}
finally {
    Pop-Location
}
