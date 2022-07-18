#!/bin/bash
echo "DB Restore"
echo "============================="
echo "*******Remove Locale String*******"
sed -i "" "s/LOCALE = 'English_United States.1252';/\;/g" db_scripts/latest_license_server.sql
postgres -V
if [ $? -ne 0 ];
    then
        echo "Postgres not installed, please install it manually and then run this script again."
        exit -1
else
    echo "*******Local Restore*******"
    # echo "Type your Postgres username"
    # read username
    psql -U root -d postgres < db_scripts/latest_license_server.sql -q
    if [ $? -ne 0 ];
        then
            echo "Error executing DB restore"
            exit -1
    else
        echo "DB Restore finished!"
        exit 0
    fi
fi
