@echo off
cd /d D:\mianshiti
echo CMD_STARTED>D:\mianshiti\web\docs-site\launch.trace.log
echo NODE_COMMAND="D:\softDir\node\node.exe" D:\mianshiti\scripts\serve-static.mjs D:\mianshiti\web\docs-site\build 3000>>D:\mianshiti\web\docs-site\launch.trace.log
"D:\softDir\node\node.exe" D:\mianshiti\scripts\serve-static.mjs D:\mianshiti\web\docs-site\build 3000 1>>D:\mianshiti\web\docs-site\server.out.log 2>>D:\mianshiti\web\docs-site\server.err.log
echo NODE_EXIT=%ERRORLEVEL%>>D:\mianshiti\web\docs-site\launch.trace.log
