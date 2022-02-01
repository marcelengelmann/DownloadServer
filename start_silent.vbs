Dim oShell : Set oShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentPath = fso.GetAbsolutePathName(".")
oShell.CurrentDirectory = currentPath

oShell.Run "node ./App/Server/Backend/server.js", 0, True