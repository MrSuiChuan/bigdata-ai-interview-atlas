$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'D:\softDir\node\node.exe'
$psi.UseShellExecute = $true
$psi.CreateNoWindow = $true
$psi.Arguments = 'D:\mianshiti\scripts\serve-static.mjs D:\mianshiti\web\docs-site\build 3000'
[System.Diagnostics.Process]::Start($psi) | Out-Null
