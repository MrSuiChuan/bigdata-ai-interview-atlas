Remove-Item 'D:\mianshiti\wscript-test.txt' -Force -ErrorAction SilentlyContinue
$shell = New-Object -ComObject WScript.Shell
$cmd = 'cmd.exe /c "echo WSCRIPT_OK>D:\mianshiti\wscript-test.txt"'
$shell.Run($cmd, 0, $false) | Out-Null
Write-Output 'LAUNCHED'
