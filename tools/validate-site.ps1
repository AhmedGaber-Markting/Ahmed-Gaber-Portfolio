$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$contentPath = Join-Path $root 'content.json'
$dataBundlePath = Join-Path $root 'content-data.js'
$documentBundlePath = Join-Path $root 'document-content.js'
$indexPath = Join-Path $root 'index.html'
$content = Get-Content -Raw -Encoding UTF8 -LiteralPath $contentPath | ConvertFrom-Json
$dataBundleText = Get-Content -Raw -Encoding UTF8 -LiteralPath $dataBundlePath
$documentBundleText = Get-Content -Raw -Encoding UTF8 -LiteralPath $documentBundlePath

function Read-GeneratedBundle([string]$text, [string]$variable) {
  $pattern = '(?s)window\.' + [regex]::Escape($variable) + ' = (?<json>.*);\s*$'
  $match = [regex]::Match($text, $pattern)
  if (-not $match.Success) {
    throw "Could not read generated bundle variable $variable."
  }
  return $match.Groups['json'].Value | ConvertFrom-Json
}

$documentContent = [ordered]@{}
foreach ($document in $content.documents) {
  $documentContent[$document.id] = @($document.blocks)
  $null = $document.PSObject.Properties.Remove('blocks')
}

$bundledContent = Read-GeneratedBundle $dataBundleText 'AHMED_PORTFOLIO_DATA'
$bundledDocumentContent = Read-GeneratedBundle $documentBundleText 'AHMED_PORTFOLIO_DOCUMENT_CONTENT'
$expectedContentJson = ConvertTo-Json -InputObject $content -Depth 100 -Compress
$bundledContentJson = ConvertTo-Json -InputObject $bundledContent -Depth 100 -Compress
if ($expectedContentJson -cne $bundledContentJson) {
  throw 'content-data.js is out of sync. Run tools/sync-content.py.'
}

$expectedDocumentJson = ConvertTo-Json -InputObject $documentContent -Depth 100 -Compress
$bundledDocumentJson = ConvertTo-Json -InputObject $bundledDocumentContent -Depth 100 -Compress
if ($expectedDocumentJson -cne $bundledDocumentJson) {
  throw 'document-content.js is out of sync. Run tools/sync-content.py.'
}

$assetPaths = [System.Collections.Generic.List[string]]::new()
function Find-AssetPaths($value) {
  if ($null -eq $value) {
    return
  }
  if ($value -is [string]) {
    if ($value -match '^assets/') {
      $assetPaths.Add($value)
    }
    return
  }
  if ($value -is [System.Collections.IDictionary]) {
    foreach ($key in $value.Keys) {
      Find-AssetPaths $value[$key]
    }
    return
  }
  if ($value -is [System.Collections.IEnumerable]) {
    foreach ($item in $value) {
      Find-AssetPaths $item
    }
    return
  }
  foreach ($property in $value.PSObject.Properties) {
    Find-AssetPaths $property.Value
  }
}

Find-AssetPaths $content
foreach ($assetPath in ($assetPaths | Sort-Object -Unique)) {
  $fullPath = Join-Path $root ($assetPath.Replace('/', [IO.Path]::DirectorySeparatorChar))
  if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
    throw "Missing local asset: $assetPath"
  }
}

$expectedPlatforms = @{
  'traffic-4450' = 'tiktok'
  'traffic-484' = 'tiktok'
  'video-7569' = 'tiktok'
  'paid-12511' = 'snapchat'
}
foreach ($id in $expectedPlatforms.Keys) {
  $result = $content.results | Where-Object id -eq $id
  if (-not $result -or $result.platform -ne $expectedPlatforms[$id]) {
    throw "Unexpected platform assignment for $id."
  }
}

$optimizedImages = @(
  Get-ChildItem -LiteralPath (Join-Path $root 'assets\projects\qelaa') -Filter 'skni-*.webp'
)
if ($optimizedImages.Count -ne 6) {
  throw "Expected six optimized Qelaa images; found $($optimizedImages.Count)."
}
$optimizedBytes = ($optimizedImages | Measure-Object -Property Length -Sum).Sum
if ($optimizedImages.Where({ $_.Length -gt 300KB }).Count -gt 0 -or $optimizedBytes -gt 1MB) {
  throw 'Optimized Qelaa images exceed the image size budget.'
}
$thumbnails = @(
  Get-ChildItem -LiteralPath (Join-Path $root 'assets\projects\qelaa') -Filter 'thumb-skni-*.webp'
)
if ($thumbnails.Count -ne 6) {
  throw "Expected six Qelaa thumbnails; found $($thumbnails.Count)."
}
$thumbnailBytes = ($thumbnails | Measure-Object -Property Length -Sum).Sum
if ($thumbnails.Where({ $_.Length -gt 60KB }).Count -gt 0 -or $thumbnailBytes -gt 300KB) {
  throw 'Qelaa thumbnails exceed the image size budget.'
}

$index = Get-Content -Raw -Encoding UTF8 -LiteralPath $indexPath
$cvPath = Join-Path $root 'assets\downloads\Ahmed-Gaber-CV-ATS-AR.pdf'
if (-not (Test-Path -LiteralPath $cvPath -PathType Leaf) -or $index -notmatch 'assets/downloads/Ahmed-Gaber-CV-ATS-AR\.pdf') {
  throw 'The updated Arabic CV is missing or is not linked from the site.'
}

Write-Output "Validated $($assetPaths | Sort-Object -Unique | Measure-Object | Select-Object -ExpandProperty Count) local asset references."
Write-Output "Validated $($optimizedImages.Count) optimized Qelaa images and $($thumbnails.Count) thumbnails ($([math]::Round(($optimizedBytes + $thumbnailBytes) / 1KB)) KB total)."
Write-Output 'Content bundles, campaign platforms, and CV links are valid.'
