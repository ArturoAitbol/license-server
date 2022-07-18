@echo off

echo "DB Restore"
echo "============================="
postgres "-V"
IF "%?%" "-ne" "0" (
  echo "Postgres not installed, please install it manually and then run this script again."
  exit "-1"
) ELSE (
  echo "*******Local Restore*******"
@REM   echo "Type your Postgres username"
@REM   read "username"
  psql -d postgres -U root < db_scripts/latest_license_server.sql -q
  IF "%?%" "-ne" "0" (
    echo "Error executing DB restore"
    exit "-1"
  ) ELSE (
    echo "DB Restore finished!"
    exit "0"
  )
)