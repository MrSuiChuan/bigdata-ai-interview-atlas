Remove-Item 'D:\mianshiti\web\docs-site\server.out.log', 'D:\mianshiti\web\docs-site\server.err.log' -Force -ErrorAction SilentlyContinue
Remove-Item 'D:\mianshiti\web\docs-site\launch.trace.log' -Force -ErrorAction SilentlyContinue
$shell = New-Object -ComObject WScript.Shell
$cmd = 'cmd.exe /c D:\mianshiti\scripts\run-static-server.cmd'
$shell.Run($cmd, 0, $false) | Out-Null
Write-Output 'LAUNCHED'
