Dim oShell : Set oShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentPath = fso.GetAbsolutePathName(CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName))
oShell.CurrentDirectory = currentPath

oShell.Run "npm run start", 0, False