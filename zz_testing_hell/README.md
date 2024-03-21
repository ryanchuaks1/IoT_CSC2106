**INSTALLATION FOR PI1**
| Command | Description |
| --- | --- |
|sudo apt-get update|Update the package lists for upgrades and installations.|
|sudo apt-get upgrade|Upgrade all installed packages to their latest versions.|
|sudo apt-get install hostapd|Install the HostAP daemon for creating a wireless access point.|
|sudo apt-get install dnsmasq|Install DNSMasq for a lightweight DNS and DHCP server.|
|sudo apt install python3-pip|Install Python 3 package manager, pip.|
|sudo apt install -y mosquitto mosquitto-clients|Install the Mosquitto MQTT broker and its command-line clients.|
|pip3 install paho-mqtt|Install the Paho MQTT client library for Python 3.|

**INSTALLATION FOR PI2**
| Command | Description |
| --- | --- |
|sudo apt-get update|Update the package lists for upgrades and installations.|
|sudo apt-get upgrade|Upgrade all installed packages to their latest versions.|
|sudo apt install python3-pip|Install Python 3 package manager, pip.|
|sudo apt install -y mosquitto mosquitto-clients|Install the Mosquitto MQTT broker and its command-line clients.|
|pip3 install paho-mqtt|Install the Paho MQTT client library for Python 3.|


**MOSQUITTO CONFIGURATION**
| Command | Description |
| --- | --- |
|sudo nano /etc/mosquitto/mosquitto.conf|Edit the Mosquitto configuration file.|
```
per_listener_settings true

pid_file /run/mosquitto/mosquitto.pid

persistence true
persistence_location /var/lib/mosquitto/

log_dest file /var/log/mosquitto/mosquitto.log

include_dir /etc/mosquitto/conf.d

bind_address 10.20.1.1
listener 1883 0.0.0.0
allow_anonymous true
password_file /etc/mosquitto/passwd
```

| Command | Description |
| --- | --- |
|sudo systemctl enable mosquitto.service|Enable the Mosquitto MQTT broker service.|
|sudo rfkill list|List all the wireless devices.|
|sudo rfkill unblock wifi|Unblock the WiFi device.|
|mosquitto -d|Start the Mosquitto MQTT broker in the background.|

**ACCESS POINT CONFIGURATION**
|sudo systemctl stop hostapd|Stop HostAP daemon temporarily.|
|sudo systemctl stop dnsmasq|Stop DNSMasq service temporarily.|
|sudo service dhcpcd stop|Stop DHCP client daemon temporarily.|
|sudo nano /etc/dhcpcd.conf|Edit DHCP client configuration file.|
```
interface wlan0
    static ip_address=10.20.1.1/24
    nohook wpa_supplicant
```

| Command | Description |
| --- | --- |
|sudo nano /etc/dnsmasq.conf|Edit DNSMasq configuration file.|
```
interface=wlan0
dhcp-range=10.20.1.2,10.20.1.20,255.255.255.0,24h
```

| Command | Description |
| --- | --- |
|sudo nano /etc/hostapd/hostapd.conf|Edit HostAP daemon configuration file.|
```
country_code=SG
interface=wlan0
channel=9
auth_algs=1
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP CCMP
rsn_pairwise=CCMP
ssid=<SSID>
wpa_passphrase=<PASSWORD>
```

| Command | Description |
| --- | --- |
|sudo nano /etc/default/hostapd|Edit HostAP daemon default configuration file.|
```
#DAEMON_CONF=""
to
DAEMON_CONF="/etc/hostapd/hostapd.conf"
```

| Command | Description |
| --- | --- |
|sudo nano /etc/sysctl.conf|Edit system control configuration file.|

```
#net.ipv4.ip_forward=1
to
net.ipv4.ip_forward=1
```

**ENABLE ALL SERVICES**
| Command | Description |
| --- | --- |
|sudo systemctl unmask hostapd|Unmask hostAP daemon service.|
|sudo systemctl enable hostapd|Enable HostAP daemon service to start on boot.|
|sudo systemctl enable dnsmasq|Enable DNSMasq service to start on boot.|
|sudo systemctl enable dhcpcd|Enable DHCP client daemon to start on boot.|
|sudo systemctl enable mosquitto|Enable Mosquitto service to start on boot.|
|sudo systemctl start hostapd|Start HostAP daemon service.|
|sudo systemctl start dnsmasq|Start DNSMasq service.|
|sudo systemctl start dhcpcd|Start DHCP client daemon service.|
|sudo systemctl start mosquitto|Start Mosquitto service.|




