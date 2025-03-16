@echo off
echo Creating desktop shortcut for modCA_7web...

:: Get the full path to start_app.bat
set SCRIPT_PATH=%~dp0start_app.bat

:: Create a shortcut on the desktop
set SHORTCUT_PATH=%USERPROFILE%\Desktop\modCA_7web.lnk

:: Create the VBScript to make the shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%SHORTCUT_PATH%" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%SCRIPT_PATH%" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%~dp0" >> CreateShortcut.vbs
echo oLink.Description = "Launch modCA_7web Application" >> CreateShortcut.vbs
echo oLink.IconLocation = "shell32.dll,43" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

:: Run the VBScript
cscript //nologo CreateShortcut.vbs

:: Delete the VBScript
del CreateShortcut.vbs

echo Shortcut created on your desktop!
echo You can now launch modCA_7web by double-clicking the shortcut.
pause 