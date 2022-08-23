#!/bin/bash
echo "DB Restore"
echo "============================="
echo "*******Remove Locale String*******"
sed -i "s/LOCALE = 'English_United States.1252';/\;/g" ../../../../db/db_scripts/latest_license_server.sql
psql -V
if [ $? -ne 0 ];
    then
        echo "Postgres not installed, please install it manually and then run this script again."
        exit -1
else
    echo "*******Local Restore*******"
    if [[ -z "${DB_USERNAME}" ]]; then
		  echo "Type your Postgres username"
		  read DB_USERNAME
	  else
		  echo $DB_USERNAME
	  fi
    psql "dbname=postgres user=$DB_USERNAME password=postgres" < db_scripts/delete_db.sql -q
    psql "dbname=postgres user=$DB_USERNAME password=postgres" < ../../../../db/db_scripts/latest_license_server.sql -q
    if [ $? -ne 0 ];
        then
            echo "Error executing DB restore"
            exit -1
    else
        echo "DB Restore finished!"
        psql "dbname=licenses user=$DB_USERNAME password=postgres" < db_scripts/test_data.sql -q
        if [ $? -ne 0 ];
            then
                echo "Error executing test data restore"
                exit -1
        else
            echo "Test data restore finished!"
            exit 0
        fi
    fi
fi

