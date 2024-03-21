
# IoT_CSC2106

**To install freeRTOS**
```bash
git submodule update --init
```

**To run web app**
```bash
cd trafficsg
npm run dev
```

**To run server**
1. Open docker desktop
2. Start the docker containers
```bash
cd server
bash start.sh
```
Exit code
 ```bash
bash stop.sh
```

2. Setup MQTT Broker
0) *prerequisite and mosquitto package*
sudo apt install python3-pip
sudo apt install -y mosquitto mosquitto-clients
pip3 install paho-mqtt

2) *enable launch on startup*
sudo systemctl enable mosquitto.service

*disable launch on startup*
sudo systemctl disable mosquitto.service

3) *test installation*
mosquitto -v

4) *set user & password*
sudo mosquitto_passwd -c /etc/mosquitto/passwd <USERNAME>

5) *add new user*
mosquitto_passwd /etc/mosquitto/passwd <USERNAME>

6) *check status*
sudo systemctl status mosquitto

7) *get ip addr*
hostname -I

8) *modify config file*
sudo nano /etc/mosquitto/mosquitto.conf

***************************************
per_listener_settings true

pid_file /run/mosquitto/mosquitto.pid

persistence true
persistence_location /var/lib/mosquitto/

log_dest file /var/log/mosquitto/mosquitto.log

include_dir /etc/mosquitto/conf.d

bind_address 192.168.137.150
listener 1883 0.0.0.0
allow_anonymous true
password_file /etc/mosquitto/passwd
***************************************

9) launch mqtt broker in background
mosquitto -d

10) enable external device connection
sudo ufw enable
sudo ufw allow 1883/tcp
