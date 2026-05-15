@echo off
setlocal
cd /d D:\mianshiti\api\content-service
del /q server.out.log server.err.log 2>nul
start "mianshiti-backend" /min cmd /c ""D:\softDir\node\node.exe" server.mjs 1>server.out.log 2>server.err.log"

