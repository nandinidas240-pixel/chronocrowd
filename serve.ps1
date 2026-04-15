$root = "c:\Users\xtrm0\.gemini\antigravity\scratch\festival-app\chronocrowd"
$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add("http://localhost:3000/")
$http.Start()
Write-Host "ChronoCrowd server started at http://localhost:3000" -ForegroundColor Green

while ($http.IsListening) {
    $ctx  = $http.GetContext()
    $req  = $ctx.Request
    $res  = $ctx.Response
    $path = $req.Url.LocalPath.TrimStart("/")
    if ($path -eq "" -or $path -eq "/") { $path = "index.html" }
    $file = Join-Path $root $path
    if (Test-Path $file) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ext   = [System.IO.Path]::GetExtension($file)
        $ct    = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".css"  { "text/css" }
            ".js"   { "application/javascript" }
            ".ico"  { "image/x-icon" }
            default { "text/plain" }
        }
        $res.ContentType     = $ct
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
    }
    $res.Close()
}
