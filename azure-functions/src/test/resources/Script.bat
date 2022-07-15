@echo off

echo "Backup and Restore"
echo "============================="
echo "*******Remote Backup*******"
echo "Type remote db hostname:"
read "hostname"
echo "Type remote db port:"
read "port"
echo "Type remote db username:"
read "remote_username"
echo "Retrieving Backup from server"
pg_dump -U "%remote_username%" -h "%hostname%" -p "%port%" -C -c --if-exists -f license_server.tar -F t -d licenses -W

IF "%?%" "-ne" "0" (
  echo "Error retrieving db backup"
  exit "-1"
)

postgres "-V"
IF "%?%" "-ne" "0" (
  echo "Postgres not installed, please install it manually and then run this script again."
  exit "-1"
) ELSE (
  echo "*******Local Restore*******"
  echo "Type your Postgres username"
  read "username"
  pg_restore -e -C -c --if-exists -d postgres -U "%username%" -W -O license_server.tar
  IF "%?%" "-ne" "0" (
    echo "Error executing DB restore"
    exit "-1"
  ) ELSE (
    echo "DB Restore finished!"
    exit "0"
  )
)