param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('Start', 'Stop', 'Status')]
  [string]$Action
)

$ErrorActionPreference = 'Stop'

function Test-PostgresPort {
  try {
    return Test-NetConnection -ComputerName '127.0.0.1' -Port 5432 -InformationLevel Quiet -WarningAction SilentlyContinue
  } catch {
    return $false
  }
}

$services = Get-Service | Where-Object {
  $_.Name -like 'postgresql*' -or $_.DisplayName -like '*PostgreSQL*'
} | Sort-Object @{ Expression = { if ($_.Status -eq 'Running') { 0 } else { 1 } } }, Name

$service = $services | Select-Object -First 1

if (-not $service) {
  if (Test-PostgresPort) {
    Write-Host 'PostgreSQL está respondendo em 127.0.0.1:5432, mas não foi localizado como serviço do Windows.'
    exit 0
  }

  Write-Error 'Nenhum serviço PostgreSQL foi localizado e a porta 5432 não está respondendo.'
  exit 1
}

switch ($Action) {
  'Status' {
    Write-Host "Serviço: $($service.Name)"
    Write-Host "Estado:  $($service.Status)"
    if (Test-PostgresPort) {
      Write-Host 'Porta:   127.0.0.1:5432 acessível'
      exit 0
    }
    Write-Warning 'A porta 5432 ainda não está acessível.'
    exit 1
  }

  'Start' {
    if ($service.Status -ne 'Running') {
      try {
        Start-Service -Name $service.Name
        $service.WaitForStatus('Running', [TimeSpan]::FromSeconds(20))
      } catch {
        Write-Error "Não foi possível iniciar $($service.Name). Abra o terminal como Administrador. Detalhe: $($_.Exception.Message)"
        exit 1
      }
    }

    Write-Host "PostgreSQL iniciado: $($service.Name)"
    exit 0
  }

  'Stop' {
    if ($service.Status -eq 'Stopped') {
      Write-Host "PostgreSQL já está parado: $($service.Name)"
      exit 0
    }

    try {
      Stop-Service -Name $service.Name
      $service.WaitForStatus('Stopped', [TimeSpan]::FromSeconds(20))
      Write-Host "PostgreSQL parado: $($service.Name)"
      exit 0
    } catch {
      Write-Error "Não foi possível parar $($service.Name). Abra o terminal como Administrador. Detalhe: $($_.Exception.Message)"
      exit 1
    }
  }
}
