$ErrorActionPreference = 'Stop'
$assetDir = Join-Path $PSScriptRoot 'assets\cards'
New-Item -ItemType Directory -Path $assetDir -Force | Out-Null
$ids = @(
    'me2pt5-113','me2pt5-112','me2pt5-105','me2pt5-106','me1-73','me1-72',
    'me1-119','me1-114','sv9-146','me3-76','sv9-143','sv8-177','me1-116',
    'me2pt5-198','me1-124','me1-131','me2pt5-196','zsv10pt5-79','sv6-163',
    'me1-130','sve-6','me3-87',
    'me2-13','me2pt5-22','me2-12','me2-11','me2-18','me2-17','sv6pt5-38','me3-62',
    'me2-89','sv10-176','me2-87','sv6-155','me2-85','me1-125','me4-108',
    'me3-108','me1-121','sv8-185','sve-2'
)
$cards = @(
    @('me1','me2','me2pt5','me3','me4','sv6','sv6pt5','sv8','sv9','sv10','zsv10pt5','sve') |
        ForEach-Object { Invoke-RestMethod -Uri "https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/$($_).json" }
)
$cards = @($cards | ForEach-Object { $_ })
$selected = @($cards | Where-Object { $ids -contains $_.id })
if ($selected.Count -ne $ids.Count) { throw "Jumlah kartu tidak sesuai: $($selected.Count)" }
foreach ($card in $selected) {
    if ($card.supertype -ne 'Energy' -and $card.regulationMark -notin @('H','I','J')) {
        throw "Kartu $($card.id) tidak sesuai rotasi"
    }
}
$json = ConvertTo-Json -InputObject $selected -Depth 40 -Compress
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'tcg-data.js'), "window.CARD_DATA = $json;", [System.Text.UTF8Encoding]::new($false))
foreach ($card in $selected) {
    $destination = Join-Path $assetDir "$($card.id).png"
    Invoke-WebRequest -Uri $card.images.small -OutFile $destination
    if ((Get-Item -LiteralPath $destination).Length -lt 1000) { throw "Gambar kartu $($card.id) tidak valid" }
}
Write-Output "Tersimpan $($selected.Count) data dan gambar kartu di $assetDir"
