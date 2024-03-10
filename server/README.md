# Testing with curl

## Get all traffic data
```bash
curl http://127.0.0.1:5000/api/traffic-data
```

## Get all traffic data for a specific junction
```bash
curl http://127.0.0.1:5000/api/traffic-data/1
```

## Add traffic data
```bash
curl -X POST -H "Content-Type: application/json" -d "{
  \"traffic_data\": [
    {
      \"traffic_id\": \"1\",
      \"lane_direction\": \"north\",
      \"number_of_vehicles\": 25,
      \"isEmergency\": false
    },
    {
      \"traffic_id\": \"2\",
      \"lane_direction\": \"south\",
      \"number_of_vehicles\": 18,
      \"isEmergency\": false
    },
    {
      \"traffic_id\": \"3\",
      \"lane_direction\": \"east\",
      \"number_of_vehicles\": 30,
      \"isEmergency\": false
    },
    {
      \"traffic_id\": \"4\",
      \"lane_direction\": \"west\",
      \"number_of_vehicles\": 12,
      \"isEmergency\": false
    }
  ]
}" http://127.0.0.1:5000/api/traffic-data
```
## One line version of ^ for command line users
```bash
curl -X POST -H "Content-Type: application/json" -d "{\"traffic_data\": [{ \"traffic_id\": \"1\", \"lane_direction\": \"north\",  \"number_of_vehicles\": 25,  \"isEmergency\": false}, {  \"traffic_id\": \"2\",  \"lane_direction\": \"south\",  \"number_of_vehicles\": 18,   \"isEmergency\": false }, {  \"traffic_id\": \"3\",  \"lane_direction\": \"east\",  \"number_of_vehicles\": 30,  \"isEmergency\": false }, {  \"traffic_id\": \"4\",   \"lane_direction\": \"west\",   \"number_of_vehicles\": 12,   \"isEmergency\": false } ]}" http://127.0.0.1:5000/api/addTrafficData
```

## Delete traffic data
```bash
curl -X POST -H "Content-Type: application/json" -d "{ \"id\": \"65e8a879fbabac3ccc0c44ca\" }" http://127.0.0.1:5000/api/deleteTrafficData
```