**INSTALLATION FOR PI1**

| Command | Description |
| --- | --- |
|sudo apt-get update|
|sudo apt-get upgrade|
|sudo apt-get install hostapd|
|sudo apt-get install dnsmasq|
|sudo apt-get install netfilter-persistent|
|sudo apt install python3-pip|
|sudo apt install -y mosquitto mosquitto-clients|
|pip3 install paho-mqtt|

**INSTALLATION FOR PI2**

| Command | Description |
| --- | --- |
|sudo apt-get update|
|sudo apt-get upgrade|
|sudo apt install python3-pip|
|sudo apt install -y mosquitto mosquitto-clients|
|pip3 install paho-mqtt|


**MOSQUITTO CONFIGURATION**
| Command | Description |
| --- | --- |
|sudo nano /etc/mosquitto/mosquitto.conf|

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
|sudo systemctl enable mosquitto.service|
|sudo rfkill list|
|sudo rfkill unblock wifi|
|mosquitto -d|
|sudo ufw enable|
|sudo ufw allow 22|
|sudo ufw allow 1883/tcp|


sudo systemctl stop hostapd
sudo systemctl stop dnsmasq
sudo service dhcpcd stop

sudo nano /etc/dhcpcd.conf

interface wlan0
    static ip_address=10.20.1.1/24
    nohook wpa_supplicant

sudo nano /etc/dnsmasq.conf

interface=wlan0
dhcp-range=10.20.1.2,10.20.1.20,255.255.255.0,24h

sudo nano /etc/hostapd/hostapd.conf

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

sudo nano /etc/default/hostapd

#DAEMON_CONF=""
to
DAEMON_CONF="/etc/hostapd/hostapd.conf"

sudo nano /etc/sysctl.conf

#net.ipv4.ip_forward=1
to
net.ipv4.ip_forward=1

sudo iptables -t nat -A  POSTROUTING -o eth0 -j MASQUERADE
sudo netfilter-persistent save

sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl start hostapd
sudo systemctl enable dnsmasq
sudo systemctl start dnsmasq
sudo systemctl enable dhcpcd
sudo systemctl start dhcpcd

