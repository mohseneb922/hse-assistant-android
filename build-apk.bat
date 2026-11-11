@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js 20+ is required.& pause & exit /b 1)
where npm >nul 2>nul || (echo npm is required.& pause & exit /b 1)
for /f %%v in ('node -p "Number(process.versions.node.split('.')[0])"') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 20 (echo Node.js 20 or newer is required. Current major: %NODE_MAJOR%& pause & exit /b 1)
if not exist node_modules (
  echo Installing project dependencies. Internet is required for this first build.
  call npm install || (echo Dependency installation failed.& pause & exit /b 1)
)
call npm run check || (echo Source checks failed.& pause & exit /b 1)
call npm test || (echo Project integrity tests failed.& pause & exit /b 1)
call npm run build || (echo Web build failed.& pause & exit /b 1)
if not exist android\gradlew.bat (
  echo Creating native Android project...
  call npx cap add android || (echo Android project creation failed.& pause & exit /b 1)
)
call npx cap sync android || (echo Capacitor sync failed.& pause & exit /b 1)
if not exist android\local.properties (
  echo Android SDK path is not configured. Open Android Studio once and configure the SDK.
)
cd android
call gradlew.bat assembleDebug || (echo APK build failed. Check Android Studio, SDK and JDK setup.& pause & exit /b 1)
echo.
echo APK created at:
echo %CD%\app\build\outputs\apk\debug\app-debug.apk
pause
