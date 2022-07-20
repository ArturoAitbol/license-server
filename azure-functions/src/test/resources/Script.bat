@echo off

echo "DB Restore"
echo "============================="
postgres "-V"

if %ERRORLEVEL% NEQ 0 (
  echo Postgres not installed, please install it manually and then run this script again.
  goto :error)

echo "*******Local Restore*******"
set /p username="Type your Postgres username:"
set /p password="Type the password of %username% user:"

REM psql -d postgres -U %username% < db_scripts/latest_license_server.sql -q
psql "dbname=postgres user=%username% password=%password%" < db_scripts/latest_license_server.sql -q

  IF %ERRORLEVEL% NEQ 0 (
    echo Error executing DB restore
    goto :error) ELSE (
    echo DB Restore finished!
    exit /b %errorlevel%
    )

:error
echo Failed with error: %errorlevel%.
exit /b %errorlevel%