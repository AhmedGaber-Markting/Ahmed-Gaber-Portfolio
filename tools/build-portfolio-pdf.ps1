$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$contentPath = Join-Path $root 'content.json'
$fallbackPath = Join-Path $root 'content-data.js'
$portfolioPath = Join-Path $root 'assets\downloads\ahmed-gaber-portfolio.pdf'
$data = Get-Content -Raw -Encoding UTF8 -LiteralPath $contentPath | ConvertFrom-Json
$previousPages = [int]$data.downloads.portfolio.pages
$previousBytes = [int64]$data.downloads.portfolio.bytes
$viewportWidth = 1600
$viewportHeight = 900
$portListener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 0)
$portListener.Start()
$debugPort = $portListener.LocalEndpoint.Port
$portListener.Stop()

$chromeCandidates = @(
  (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
  (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
  (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe')
)
$chromePath = $chromeCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (-not $chromePath) {
  throw 'Google Chrome is required to capture the website and create the PDF.'
}

function Invoke-Cdp([string]$method, [hashtable]$parameters = @{}) {
  $script:cdpRequestId++
  $request = @{ id = $script:cdpRequestId; method = $method; params = $parameters } | ConvertTo-Json -Compress -Depth 100
  $requestBytes = [System.Text.Encoding]::UTF8.GetBytes($request)
  $requestSegment = New-Object 'System.ArraySegment[byte]' -ArgumentList (,$requestBytes)
  $null = $script:cdpSocket.SendAsync(
    $requestSegment,
    [System.Net.WebSockets.WebSocketMessageType]::Text,
    $true,
    [System.Threading.CancellationToken]::None
  ).GetAwaiter().GetResult() | Out-Null

  while ($true) {
    $buffer = New-Object byte[] 65536
    $message = New-Object System.IO.MemoryStream
    do {
      $segment = New-Object 'System.ArraySegment[byte]' -ArgumentList (,$buffer)
      $receive = $script:cdpSocket.ReceiveAsync($segment, [System.Threading.CancellationToken]::None).GetAwaiter().GetResult()
      if ($receive.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) {
        throw "Chrome DevTools connection closed while running $method."
      }
      $message.Write($buffer, 0, $receive.Count)
    } while (-not $receive.EndOfMessage)

    $response = [System.Text.Encoding]::UTF8.GetString($message.ToArray()) | ConvertFrom-Json
    $message.Dispose()
    if ($response.id -ne $script:cdpRequestId) { continue }
    if ($response.error) { throw "Chrome DevTools $method failed: $($response.error.message)" }
    return $response.result
  }
}

function Get-PageValue([string]$expression) {
  $result = Invoke-Cdp 'Runtime.evaluate' @{
    expression = $expression
    returnByValue = $true
    awaitPromise = $true
  }
  if ($result.exceptionDetails) {
    throw "Website evaluation failed: $($result.exceptionDetails.text)"
  }
  return $result.result.value
}

function Wait-ForVisibleImages {
  $null = Get-PageValue @"
(async () => {
  const images = [...document.images].filter(image => {
    const rect = image.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  });
  await Promise.all(images.map(image => image.complete ? Promise.resolve() : new Promise(resolve => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
    setTimeout(resolve, 8000);
  })));
})()
"@
}

$tempDirectory = Join-Path $env:TEMP ('ahmed-gaber-site-pdf-' + [guid]::NewGuid().ToString('N'))
$captureDirectory = Join-Path $tempDirectory 'screenshots'
$chromeProfilePath = Join-Path $tempDirectory 'chrome-profile'
$printProfilePath = Join-Path $tempDirectory 'print-profile'
$tempPdfPath = Join-Path $tempDirectory 'portfolio.pdf'
$tempHtmlPath = Join-Path $tempDirectory 'slides.html'
$pdfDestinationTemp = Join-Path (Split-Path $portfolioPath -Parent) ('.ahmed-gaber-portfolio-' + [guid]::NewGuid().ToString('N') + '.pdf')
$chromeProcess = $null
$cdpSocket = $null

New-Item -ItemType Directory -Path $captureDirectory -Force | Out-Null

try {
  $siteUri = ([System.Uri](Resolve-Path -LiteralPath (Join-Path $root 'index.html')).Path).AbsoluteUri
  $chromeArguments = @(
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--allow-file-access-from-files',
    '--remote-allow-origins=*',
    "--remote-debugging-port=$debugPort",
    "--user-data-dir=$chromeProfilePath",
    "--window-size=$viewportWidth,$viewportHeight",
    $siteUri
  )
  $chromeProcess = Start-Process -FilePath $chromePath -ArgumentList $chromeArguments -PassThru -WindowStyle Hidden

  $pageTarget = $null
  for ($attempt = 0; $attempt -lt 80 -and -not $pageTarget; $attempt++) {
    try {
      $targets = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json/list" -TimeoutSec 2
      $pageTarget = $targets | Where-Object { $_.type -eq 'page' -and $_.webSocketDebuggerUrl } | Select-Object -First 1
    }
    catch {
      Start-Sleep -Milliseconds 250
    }
  }
  if (-not $pageTarget) { throw 'Chrome did not expose its DevTools page endpoint.' }

  $cdpSocket = New-Object System.Net.WebSockets.ClientWebSocket
  $null = $cdpSocket.ConnectAsync([System.Uri]$pageTarget.webSocketDebuggerUrl, [System.Threading.CancellationToken]::None).GetAwaiter().GetResult()
  $script:cdpRequestId = 0
  Invoke-Cdp 'Page.enable' @{} | Out-Null
  Invoke-Cdp 'Runtime.enable' @{} | Out-Null
  Invoke-Cdp 'Emulation.setDeviceMetricsOverride' @{
    width = $viewportWidth
    height = $viewportHeight
    deviceScaleFactor = 1
    mobile = $false
  } | Out-Null

  $ready = $false
  for ($attempt = 0; $attempt -lt 120 -and -not $ready; $attempt++) {
    $ready = [bool](Get-PageValue "document.readyState === 'complete' && document.querySelectorAll('#work-grid .project-card').length > 0")
    if (-not $ready) { Start-Sleep -Milliseconds 250 }
  }
  if (-not $ready) { throw 'The portfolio did not finish rendering in Chrome.' }

  $setupResult = Get-PageValue @"
(() => {
  if (document.documentElement.lang !== 'ar') document.querySelector('#language')?.click();
  document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
  document.querySelectorAll('.monthly-details').forEach(details => { details.open = true; });
  const motion = document.querySelector('#clients-motion');
  if (motion && motion.getAttribute('aria-pressed') === 'false') motion.click();
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
  document.head.appendChild(style);
  ['#work-more','#social-more','#evidence-more','#video-more','#plan-more'].forEach(selector => {
    const button = document.querySelector(selector);
    if (button && !button.hidden) button.click();
  });
  window.scrollTo(0, 0);
  return {
    projects: document.querySelectorAll('#work-grid .project-card').length,
    social: document.querySelectorAll('#social-grid .social-card').length,
    evidence: document.querySelectorAll('#evidence-grid .evidence-card').length,
    videos: document.querySelectorAll('#video-grid .video-card').length,
    plans: document.querySelectorAll('#plan-grid .plan-card').length
  };
})()
"@
  Start-Sleep -Milliseconds 400

  $slideCount = 0
  $scrollPosition = 0
  while ($true) {
    $null = Get-PageValue "window.scrollTo(0, $scrollPosition); true"
    Start-Sleep -Milliseconds 300
    Wait-ForVisibleImages
    Start-Sleep -Milliseconds 150

    $scrollInfo = Get-PageValue '({y:Math.round(window.scrollY),height:document.documentElement.scrollHeight,viewport:innerHeight})'
    $slideCount++
    $screenshot = Invoke-Cdp 'Page.captureScreenshot' @{
      format = 'png'
      captureBeyondViewport = $false
      fromSurface = $true
    }
    $screenshotPath = Join-Path $captureDirectory ('slide-{0:D3}.png' -f $slideCount)
    [System.IO.File]::WriteAllBytes($screenshotPath, [System.Convert]::FromBase64String($screenshot.data))

    $maxScroll = [Math]::Max(0, [int]$scrollInfo.height - $viewportHeight)
    if ([int]$scrollInfo.y -ge $maxScroll) { break }
    $scrollPosition = [Math]::Min([int]$scrollInfo.y + $viewportHeight, $maxScroll)
  }

  if ($slideCount -lt 5) { throw "Only $slideCount website screenshots were captured; expected a complete page deck." }
  $null = $cdpSocket.CloseAsync(
    [System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure,
    'Website screenshots captured',
    [System.Threading.CancellationToken]::None
  ).GetAwaiter().GetResult()
  $cdpSocket.Dispose()
  $cdpSocket = $null
  if ($chromeProcess -and -not $chromeProcess.HasExited) {
    Stop-Process -Id $chromeProcess.Id -ErrorAction SilentlyContinue
  }

  $html = New-Object System.Text.StringBuilder
  [void]$html.AppendLine(@"
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
@page { size: 16in 9in; margin: 0; }
* { box-sizing: border-box; }
html, body { width: 16in; margin: 0; padding: 0; background: #0b0910; }
.slide { width: 16in; height: 9in; overflow: hidden; break-after: page; page-break-after: always; }
.slide img { display: block; width: 16in; height: 9in; object-fit: fill; }
.slide:last-child { break-after: auto; page-break-after: auto; }
</style>
</head>
<body>
"@)
  for ($slide = 1; $slide -le $slideCount; $slide++) {
    $imagePath = Join-Path $captureDirectory ('slide-{0:D3}.png' -f $slide)
    $imageUri = ([System.Uri](Resolve-Path -LiteralPath $imagePath).Path).AbsoluteUri
    [void]$html.AppendLine("<section class=""slide""><img src=""$imageUri"" alt=""لقطة شاشة من الموقع — الشريحة $slide""></section>")
  }
  [void]$html.AppendLine('</body></html>')
  [System.IO.File]::WriteAllText($tempHtmlPath, $html.ToString(), (New-Object System.Text.UTF8Encoding($false)))

  $printArguments = @(
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--allow-file-access-from-files',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=30000',
    "--user-data-dir=$printProfilePath",
    "--print-to-pdf=$tempPdfPath",
    ([System.Uri](Resolve-Path -LiteralPath $tempHtmlPath).Path).AbsoluteUri
  )
  $stdoutPath = Join-Path $tempDirectory 'chrome.stdout.log'
  $stderrPath = Join-Path $tempDirectory 'chrome.stderr.log'
  $printProcess = Start-Process -FilePath $chromePath -ArgumentList $printArguments -PassThru -Wait -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath
  if ($printProcess.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $tempPdfPath -PathType Leaf)) {
    $diagnostics = if (Test-Path -LiteralPath $stderrPath) { Get-Content -Raw -LiteralPath $stderrPath } else { '' }
    throw "Chrome failed to create the screenshot PDF. Exit code: $($printProcess.ExitCode). $diagnostics"
  }

  $pdfBytes = [System.IO.File]::ReadAllBytes($tempPdfPath)
  if ($pdfBytes.Length -lt 1000 -or [System.Text.Encoding]::ASCII.GetString($pdfBytes, 0, 5) -ne '%PDF-') {
    throw 'The screenshot deck is not a valid PDF.'
  }
  $pdfText = [System.Text.Encoding]::ASCII.GetString($pdfBytes)
  $pageCount = [regex]::Matches($pdfText, '/Type\s*/Page(?!s)\b').Count
  if ($pageCount -ne $slideCount) {
    throw "The screenshot PDF contains $pageCount pages, but $slideCount website screenshots were captured."
  }

  [System.IO.File]::Copy($tempPdfPath, $pdfDestinationTemp, $false)
  Move-Item -LiteralPath $pdfDestinationTemp -Destination $portfolioPath -Force
  $newBytes = (Get-Item -LiteralPath $portfolioPath).Length
  $metadataPattern = '("pages"\s*:\s*)' + $previousPages + '(\s*,\s*"bytes"\s*:\s*)' + $previousBytes

  $contentText = Get-Content -Raw -Encoding UTF8 -LiteralPath $contentPath
  if ([regex]::Matches($contentText, $metadataPattern).Count -ne 1) {
    throw 'Could not uniquely locate the current portfolio PDF metadata in content.json.'
  }
  $updatedContent = [regex]::Replace($contentText, $metadataPattern, ('${1}' + $pageCount + '${2}' + $newBytes), 1)

  $fallbackText = Get-Content -Raw -Encoding UTF8 -LiteralPath $fallbackPath
  if ([regex]::Matches($fallbackText, $metadataPattern).Count -ne 1) {
    throw 'Could not uniquely locate the current portfolio PDF metadata in content-data.js.'
  }
  $updatedFallback = [regex]::Replace($fallbackText, $metadataPattern, ('${1}' + $pageCount + '${2}' + $newBytes), 1)
  $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($contentPath, $updatedContent, $utf8WithoutBom)
  [System.IO.File]::WriteAllText($fallbackPath, $updatedFallback, $utf8WithoutBom)

  Write-Output "Website screenshot PDF updated: $pageCount slides, $newBytes bytes."
  Write-Output "Captured Arabic desktop screens at ${viewportWidth}x${viewportHeight}; expanded projects, social designs, platform evidence, videos, and plans: $($setupResult.projects), $($setupResult.social), $($setupResult.evidence), $($setupResult.videos), $($setupResult.plans)."
}
finally {
  if ($cdpSocket) {
    $cdpSocket.Dispose()
  }
  if ($chromeProcess -and -not $chromeProcess.HasExited) {
    Stop-Process -Id $chromeProcess.Id -ErrorAction SilentlyContinue
  }
  if (Test-Path -LiteralPath $pdfDestinationTemp) {
    Remove-Item -LiteralPath $pdfDestinationTemp -Force
  }
  if (Test-Path -LiteralPath $tempDirectory) {
    Remove-Item -LiteralPath $tempDirectory -Recurse -Force
  }
}
