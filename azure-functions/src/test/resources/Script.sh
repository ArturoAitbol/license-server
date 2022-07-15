#!/bin/bash
echo "Backup and Restore"
echo "============================="
echo "*******Remote Backup*******"
echo "Type remote db hostname:"
read hostname
echo "Type remote db port:"
read port
echo "Type remote db username:"
read remote_username
echo "Retrieving Backup from server"
pg_dump -U $remote_username -h $hostname -p $port -C -c --if-exists -f license_server.sql -F p -x -d licenses -W -O
if [ $? -ne 0 ];
    then
        echo "Error retrieving db backup"
        exit -1
else
    sed -i "" "s/LOCALE = 'English_United States.1252';/\;/g" license_server.sql
fi

postgres -V
if [ $? -ne 0 ];
    then
        echo "Postgres not installed, please install it manually and then run this script again."
        exit -1
else
    echo "*******Local Restore*******"
    echo "Type your Postgres username"
    read username
    psql -U $username -d postgres < license_server.sql -q
    if [ $? -ne 0 ];
        then
            echo "Error executing DB restore"
            exit -1
    else
        echo "DB Restore finished!"
        exit 0
    fi
fi
