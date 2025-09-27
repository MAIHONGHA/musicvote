param(
  [Parameter(Mandatory=$true)]
  [string]$File      # path to the .mp3/.wav file to upload
)

# 1) Check JWT
if (-not $env:VITE_PINATA_JWT) {
  Write-Error "Missing VITE_PINATA_JWT in environment (.env)."
  exit 1
}

# 2) Check if file exists & size (≤ 25MB as in the app UI)
if (-not (Test-Path $File)) {
  Write-Error "File not found: $File"
  exit 1
}
$info = Get-Item $File
if ($info.Length -gt 25MB) {
  Write-Error "File too large ($([math]::Round($info.Length/1MB,2)) MB). Keep it ≤ 25MB."
  exit 1
}

Write-Host "Uploading to Pinata..." -ForegroundColor Cyan

# 3) Call Pinata (multipart/form-data)
$headers = @{ "Authorization" = "Bearer $env:VITE_PINATA_JWT" }
$form = @{ file = $info }   # PowerShell automatically creates multipart boundary

try {
  $res = Invoke-RestMethod 
    -Uri "https://api.pinata.cloud/pinning/pinFileToIPFS" 
    -Method Post 
    -Headers $headers 
    -Form $form

  # 4) Print useful result
  $cid = $res.IpfsHash
  if (-not $cid) { throw "Pinata response missing IpfsHash" }

  Write-Host "`n✅ Uploaded!" -ForegroundColor Green
  Write-Host "CID: $cid"
  Write-Host "Gateway URL: https://gateway.pinata.cloud/ipfs/$cid"
}
catch {
  Write-Error ("Upload failed: " + $_.Exception.Message)
  if ($_.ErrorDetails) { Write-Host $_.ErrorDetails }
  exit 1
}