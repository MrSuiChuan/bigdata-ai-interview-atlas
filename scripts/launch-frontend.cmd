@echo off
setlocal
cd /d D:\mianshiti\web\docs-site
del /q server.out.log server.err.log 2>nul
start "mianshiti-frontend" /min cmd /c ""D:\mianshiti\web\docs-site\node_modules\.bin\docusaurus.cmd" start --host 0.0.0.0 --port 3000 1>server.out.log 2>server.err.log"
