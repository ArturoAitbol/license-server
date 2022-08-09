@echo off

echo "DB Restore"
echo "============================="
postgres "-V"

if %ERRORLEVEL% NEQ 0 (
  echo Postgres not installed, please install it manually and then run this script again.
  goto :error)

echo "*******Local Restore*******"
if not defined DB_USERNAME (
    set /p DB_USERNAME="Type your Postgres username:"
    set /p DB_PASSWORD="Type the password of %db_username% user:"
)
psql "dbname=postgres user=%DB_USERNAME% password=%DB_PASSWORD%" < db_scripts/latest_license_server.sql -q
  IF %ERRORLEVEL% NEQ 0 (
    echo Error executing DB restore
    goto :error) ELSE (
    echo DB Restore finished!
    psql "dbname=licenses user=%DB_USERNAME% password=%DB_PASSWORD%" < db_scripts/test_data.sql -q
      IF %ERRORLEVEL% NEQ 0 (
        echo Error executing test data restore
        goto :error) ELSE (
        echo Test data restore finished!
        exit /b %errorlevel%
        )
    )
:error
echo Failed with error: %errorlevel%.
exit /b %errorlevel%