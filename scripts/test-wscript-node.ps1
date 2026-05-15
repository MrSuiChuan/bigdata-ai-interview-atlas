Remove-Item 'D:\mianshiti\node-hidden.txt' -Force -ErrorAction SilentlyContinue
$shell = New-Object -ComObject WScript.Shell
$cmd = 'cmd.exe /c ""D:\softDir\node\node.exe" -v > "D:\mianshiti\node-hidden.txt""'
$shell.Run($cmd, 0, $false) | Out-Null
Write-Output 'LAUNCHED'
