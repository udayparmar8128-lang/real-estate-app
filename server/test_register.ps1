$base = "http://localhost:5000/api"

function Call-Api($method, $path, $body, [switch]$auth, $token) {
    $headers = @{ "Content-Type" = "application/json" }
    if ($auth -and $token) {
        $headers["Authorization"] = "Bearer " + $token
    }
    $uri = $base + $path
    try {
        $params = @{ Uri = $uri; Method = $method; Headers = $headers }
        if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 5) }
        $r = Invoke-RestMethod @params
        Write-Host "  STATUS : 200/201 OK" -ForegroundColor Green
        $r | ConvertTo-Json -Depth 5
        return $r
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $errBody = $reader.ReadToEnd()
        } catch { $errBody = "Could not read response body" }
        Write-Host "  STATUS : HTTP $code" -ForegroundColor Red
        Write-Host "  BODY   : $errBody" -ForegroundColor Red
        return $null
    }
}

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  TEST 1 — Register with DUPLICATE email (should return 400)" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Cyan
Call-Api "POST" "/auth/register" @{
    name = "Test User"; email = "testuser@realestate.com"; password = "Test@1234"
} | Out-Null

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  TEST 2 — Register with NEW email (should return 201)" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Cyan
$ts = Get-Date -Format "ssff"
$newEmail = "freshuser$ts@realestate.com"
Write-Host "  Using email: $newEmail"
$regRes = Call-Api "POST" "/auth/register" @{
    name = "Fresh User"; email = $newEmail; password = "Fresh@1234"
}
if ($regRes -and $regRes.data -and $regRes.data.token) {
    Write-Host "  Register SUCCESS — user._id: $($regRes.data._id)" -ForegroundColor Green
    Write-Host "  Token (first 40 chars): $($regRes.data.token.Substring(0,40))..." -ForegroundColor Magenta
}

Write-Host ""
Write-Host "ALL REGISTER TESTS DONE" -ForegroundColor Green
