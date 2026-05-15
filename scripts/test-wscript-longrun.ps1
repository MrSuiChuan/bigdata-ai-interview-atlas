Remove-Item 'D:\mianshiti\ping.log' -Force -ErrorAction SilentlyContinue
$shell = New-Object -ComObject WScript.Shell
$cmd = 'cmd.exe /c "ping -t 127.0.0.1 > D:\mianshiti\ping.log"'
$shell.Run($cmd, 0, $false) | Out-Null
Write-Output 'LAUNCHED'
