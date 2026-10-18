$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($PSScriptRoot)
$listener = New-Object Net.HttpListener
$listener.Prefixes.Add('http://localhost:8765/')
try { $listener.Start() } catch { Write-Host 'Não foi possível abrir a porta 8765. Feche outra cópia do jogo e tente novamente.'; throw }
Start-Process 'http://localhost:8765/'
Write-Host 'Jogo do Sarney: http://localhost:8765/ — mantenha esta janela aberta. Ctrl+C para encerrar.'
try {
 while ($listener.IsListening) {
  $context = $listener.GetContext()
  try {
   $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart('/')
   if (-not $relative) { $relative = 'index.html' }
   $path = [IO.Path]::GetFullPath((Join-Path $root $relative))
   if (-not $path.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or -not [IO.File]::Exists($path)) { $context.Response.StatusCode=404; continue }
   $mime = switch ([IO.Path]::GetExtension($path)) { '.html' {'text/html; charset=utf-8'} '.mjs' {'application/javascript'} '.js' {'application/javascript'} '.wasm' {'application/wasm'} '.css' {'text/css'} '.png' {'image/png'} '.jpg' {'image/jpeg'} '.mp4' {'video/mp4'} default {'application/octet-stream'} }
   $context.Response.ContentType=$mime
   $context.Response.Headers['Cache-Control']='no-store'
   $bytes=[IO.File]::ReadAllBytes($path)
   $context.Response.ContentLength64=$bytes.Length
   $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
  } catch { Write-Host $_.Exception.Message } finally { $context.Response.Close() }
 }
} finally { $listener.Stop(); $listener.Close() }
