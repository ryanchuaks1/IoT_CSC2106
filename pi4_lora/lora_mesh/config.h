#ifndef CONFIG_H
#define CONFIG_H

#define BAUD_RATE 9600
#define SERIAL_DELAY 5000
#define PAYLOAD_LENGTH 32
#define MAX_TTL 5
#define MAX_ADJ_TRAFFIC 4
#define MAX_TRAFFIC_IDS 256

// When the difference in timestamp is >248, then we always prefer the packet that's smaller (because it will wrap back to 0 after 255)
#define PKT_THRESHOLD 248

#define TRAFFIC_ID 2
uint8_t adj_traffic_ids[MAX_ADJ_TRAFFIC] = {1,3,4,5};

#endif // CONFIG_H