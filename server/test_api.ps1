$base = "http://localhost:5000/api"
$global:token = ""
$global:propId = ""

function Sep($title) {
    Write-Host ""
    Write-Host "============================================================"
    Write-Host "  $title"
    Write-Host "============================================================"
}

function Call-Api($method, $path, $body, [switch]$auth) {
    $headers = @{ "Content-Type" = "application/json" }
    if ($auth -and $global:token) {
        $headers["Authorization"] = "Bearer " + $global:token
    }
    $uri = $base + $path
    try {
        $params = @{ Uri = $uri; Method = $method; Headers = $headers }
        if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 5) }
        $r = Invoke-RestMethod @params
        Write-Host "SUCCESS: $method $path" -ForegroundColor Green
        $r | ConvertTo-Json -Depth 5
        return $r
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $errBody = $reader.ReadToEnd()
        } catch { $errBody = $_.Exception.Message }
        Write-Host "FAILED: $method $path  HTTP $code" -ForegroundColor Red
        Write-Host $errBody -ForegroundColor Red
        return $null
    }
}

# ── 1. Register ──────────────────────────────────────────────────────────────
Sep "1. POST /api/auth/register"
$regRes = Call-Api "POST" "/auth/register" @{
    name     = "Test User"
    email    = "testuser@realestate.com"
    password = "Test@1234"
}

# ── 2. Login ─────────────────────────────────────────────────────────────────
Sep "2. POST /api/auth/login"
$loginRes = Call-Api "POST" "/auth/login" @{
    email    = "testuser@realestate.com"
    password = "Test@1234"
}
if ($loginRes -and $loginRes.data -and $loginRes.data.token) {
    $global:token = $loginRes.data.token
    $preview = $global:token.Substring(0, [Math]::Min(40, $global:token.Length))
    Write-Host "JWT Token: $preview..." -ForegroundColor Magenta
}

# ── 3. Get Me ────────────────────────────────────────────────────────────────
Sep "3. GET /api/auth/me  (requires JWT)"
Call-Api "GET" "/auth/me" -auth | Out-Null

# ── 4. Create Property ───────────────────────────────────────────────────────
Sep "4. POST /api/properties  (requires JWT)"
$propRes = Call-Api "POST" "/properties" @{
    title       = "Luxury 3BHK Apartment in Mumbai"
    description = "A beautiful fully furnished apartment with sea view in Bandra"
    type        = "Apartment"
    listingType = "sale"
    price       = 9500000
    area        = 1450
    bedrooms    = 3
    bathrooms   = 2
    furnished   = "Fully Furnished"
    amenities   = @("Gym", "Swimming Pool", "Parking")
    location    = @{
        address = "Bandra West"
        city    = "Mumbai"
        state   = "Maharashtra"
        pincode = "400050"
    }
} -auth

if ($propRes -and $propRes.data -and $propRes.data._id) {
    $global:propId = $propRes.data._id
    Write-Host "Property ID: $($global:propId)" -ForegroundColor Magenta
}

# ── 5. Get All Properties ────────────────────────────────────────────────────
Sep "5. GET /api/properties  (public)"
$allRes = Call-Api "GET" "/properties"
if ($allRes) {
    Write-Host "Total properties returned: $($allRes.count)"
}

# ── 6. Get Single Property ───────────────────────────────────────────────────
if ($global:propId) {
    Sep "6. GET /api/properties/:id"
    Call-Api "GET" "/properties/$($global:propId)" | Out-Null
}

# ── 7. Health Check ──────────────────────────────────────────────────────────
Sep "7. GET /api/health"
Call-Api "GET" "/health" | Out-Null

Write-Host ""
Write-Host "ALL TESTS COMPLETE" -ForegroundColor Green
