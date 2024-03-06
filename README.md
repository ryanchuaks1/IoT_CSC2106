
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

**Raspberry Pi**
1. Setup MQTT Broker
1) *update system*
sudo apt update && sudo apt upgrade

2) *install mosquitto package*
sudo apt install -y mosquitto mosquitto-clients
pip3 install paho-mqtt

3) *enable launch on startup*
sudo systemctl enable mosquitto.service

*disable launch on startup*
sudo systemctl disable mosquitto.service

4) *test installation*
mosquitto -v

5) *set user & password*
sudo mosquitto_passwd -c /etc/mosquitto/passwd <USERNAME>

6) *add new user*
mosquitto_passwd /etc/mosquitto/passwd <USERNAME>

7) *check status*
sudo systemctl status mosquitto

9) *get ip addr*
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

listener 1883 0.0.0.0
allow_anonymous true
password_file /etc/mosquitto/passwd
***************************************

9) launch mqtt broker in background
mosquitto -d

10) enable external device connection
sudo ufw allow 1883/tcp


**Pico Pi-W**
1) *install thonny application*
https://thonny.org/

2) *install mosquitto package*
tools -> manage packages -> umqtt simple -> umqtt.simple @ micropython-lib

