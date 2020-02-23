#!/bin/bash

MASTER_MONGODB=`ping -c 1 mongo | head -1  | cut -d "(" -f 2 | cut -d ")" -f 1`

mongo --host ${MASTER_MONGODB}:27017 <<EOF
    var cfg = {
        "_id": "rs0",
        "version": 1,
        "members": [
            {
                "_id": 0,
                "host": "${MASTER_MONGODB}:27017"
            }
        ]
    };
    rs.initiate(cfg);
EOF
