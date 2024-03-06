#! /bin/bash
mongosh --host mongodb --port 27017 --authenticationDatabase admin --username root --password password < mongo_init.js
