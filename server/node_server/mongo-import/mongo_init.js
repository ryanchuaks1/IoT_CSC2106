sh.enableSharding("mongo_db");
sh.shardCollection("mongo_db.trafficdata", {"_id": 1});