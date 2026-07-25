# Script de Teste Automatizado do Game Master (CRUD COMPLETO)
$baseUrl = "http://localhost:8085/api/v1"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  TESTE 1: REGISTRAR PRESENCA (PUBLICO)   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
$presenca = @{
    nome = "Carlos Oliveira"
    cidade = "Vila Velha"
    primeiraVez = $true
} | ConvertTo-Json

$resPresenca = Invoke-RestMethod -Uri "$baseUrl/presenca" -Method Post -ContentType "application/json; charset=utf-8" -Body $presenca
$resPresenca | Format-List

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  TESTE 2: CRIAR NOVO EVENTO (ADM)        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
$novoEvento = @{
    nome = "Game Master Shopping Vitoria - Edicao Agosto"
    dataEvento = "2026-08-15"
    local = "Praca Central Shopping Vitoria"
    ativo = $true
} | ConvertTo-Json

$resEvento = Invoke-RestMethod -Uri "$baseUrl/eventos" -Method Post -ContentType "application/json; charset=utf-8" -Body $novoEvento
$resEvento | Format-List

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  TESTE 3: EDITAR EVENTO (ADM)             " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
$idEvento = $resEvento.id
$eventoEditado = @{
    nome = "Game Master Shopping Vitoria - Edicao Agosto (ATUALIZADA)"
    dataEvento = "2026-08-20"
    local = "Praca de Eventos 2 Piso"
    ativo = $true
} | ConvertTo-Json

$resEventoEdit = Invoke-RestMethod -Uri "$baseUrl/eventos/$idEvento" -Method Put -ContentType "application/json; charset=utf-8" -Body $eventoEditado
$resEventoEdit | Format-List

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  TESTE 4: EXCLUIR EVENTO (ADM)            " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/eventos/$idEvento" -Method Delete
Write-Host "Evento ID $idEvento excluido com sucesso!" -ForegroundColor Green

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  TESTE 5: LISTAR EVENTOS RESTANTES       " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
$todosEventos = Invoke-RestMethod -Uri "$baseUrl/eventos"
$todosEventos | Format-Table id, nome, dataEvento, local, ativo
