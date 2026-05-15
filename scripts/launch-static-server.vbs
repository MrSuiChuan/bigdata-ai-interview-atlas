Set shell = CreateObject("WScript.Shell")
command = "D:\softDir\node\node.exe D:\mianshiti\scripts\serve-static.mjs D:\mianshiti\web\docs-site\build 3000"
shell.Run command, 0, False
