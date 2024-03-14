#include <SPI.h>
#include <RH_RF95.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define BAUD_RATE 9600
#define ACK_TIMEOUT 5000
#define SERIAL_DELAY 1000
#define PAYLOAD_LENGTH 32
#define MAX_TTL 5
#define MAX_ADJ_TRAFFIC 4

// OLED stuff
#define SCREEN_WIDTH 128  // OLED display width, in pixels
#define SCREEN_HEIGHT 32  // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     -1 // Reset pin # (or -1 if sharing Arduino reset pin)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// LoRa stuff
#define RFM95_CS 10
#define RFM95_RST 9
#define RFM95_INT 2
#define TRAFFIC_ID 2
 
// Change to 434.0 or other frequency, must match RX's freq!
#define RF95_FREQ 500.0

// Singleton instance of the radio driver
RH_RF95 rf95(RFM95_CS, RFM95_INT);

void(* resetFunc) (void) = 0; //declare reset function at address 0

void lora_init(){
  // Manual reset
  digitalWrite(RFM95_RST, LOW);
  delay(10);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);

  while (!rf95.init()) {
    display.println("LoRa radio init Failed");
    display.display();
    Serial.println(F("LoRa radio init failed"));
    while (1);
  }
  Serial.println(F("LoRa radio init OK!"));

  // Defaults after init are 915.0MHz, modulation GFSK_Rb250Fd250, +13dbM
  if (!rf95.setFrequency(RF95_FREQ)) {
    display.println("setFrequency Failed");
    display.display();
    Serial.println(F("setFrequency failed"));
    while (1);
  }
  Serial.print(F("Set Freq to:"));
  Serial.println(RF95_FREQ);

  // Defaults after init are 915.0MHz, 13dBm, Bw = 125 kHz, Cr = 4/5, Sf = 128chips/symbol, CRC on

  // The default transmitter power is 13dBm, using PA_BOOST.
  // If you are using RFM95/96/97/98 modules which uses the PA_BOOST transmitter pin, then 
  // you can set transmitter powers from 5 to 23 dBm:
  rf95.setTxPower(13, false);
}

void oled_init(){
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address or 0x3D for
    Serial.println(F("SSD1306 allocation failed"));
    for (;;)
    {
        delay(1000);
    }
  }
  // Setup oled display
  display.setTextSize(1);      // Normal 1:1 pixel scale
  display.setTextColor(WHITE); // Draw white text
  display.setCursor(0, 0);     // Start at top-left corner

  // Simple text
  display.clearDisplay();
  delay(1000);
}

void oled_display(char* message){
  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("RF95: ");
  display.println(message);
  display.display();
}

// Packet related functions

uint8_t adj_traffic_ids[MAX_ADJ_TRAFFIC] = {1,3,4,5};

struct Packet{
  uint8_t sender_id; // node which sends this packet
  uint8_t destination_ids[MAX_ADJ_TRAFFIC]; // node which receives the packet
  uint8_t ttl;

  uint8_t traffic_id;
  uint8_t payload[PAYLOAD_LENGTH];
  uint32_t checksum;
};

void pkt_init(struct Packet* pkt){
  if(pkt == NULL){
    Serial.println(F("malloc failed. Exiting..."));
    exit(1);
  }
  else{
    pkt->sender_id = 0;
    // pkt->destination_id = 0;
    for(uint8_t i = 0; i < MAX_ADJ_TRAFFIC; i++){
      pkt->destination_ids[i] = 0;
    }
    pkt->ttl = 0;

    pkt->traffic_id = 0;
    for(uint8_t i = 0; i < PAYLOAD_LENGTH; i++){
      pkt->payload[i] = 0;
    }
    pkt->checksum = 0;
  }
}

struct Packet* generate_new_pkt(char* payload = NULL){
  struct Packet* new_pkt = (struct Packet*)malloc(sizeof(struct Packet));
  pkt_init(new_pkt);

  if(payload != NULL){
    new_pkt->traffic_id = TRAFFIC_ID;
    snprintf(new_pkt->payload, sizeof(new_pkt->payload), payload);
    new_pkt->checksum = new_pkt->traffic_id;
    for(uint8_t i = 0; i < PAYLOAD_LENGTH; i++){
      new_pkt->checksum += new_pkt->payload[i];
    }
  }

  return new_pkt;
}

void update_pkt_headers(struct Packet* pkt, uint8_t destination_ids[MAX_ADJ_TRAFFIC], uint8_t time_to_live){
  pkt->sender_id = TRAFFIC_ID;
  // pkt->destination_id = destination_id;
  for(uint8_t i = 0; i < MAX_ADJ_TRAFFIC; i++){
    pkt->destination_ids[i] = destination_ids[i];
  }
  pkt->ttl = time_to_live;
}

void transmit_pkt(struct Packet* pkt_ptr){
  rf95.send((uint8_t*)pkt_ptr, sizeof(*pkt_ptr));
  delay(10);
  rf95.waitPacketSent();
}

bool packet_is_ok(struct Packet* pkt){
  uint32_t my_checksum = 0;
  my_checksum = pkt->traffic_id;
  for(uint8_t i = 0; i < PAYLOAD_LENGTH; i++){
    my_checksum += pkt->payload[i];
  }

  return my_checksum == pkt->checksum;
}

bool packet_for_me(struct Packet* pkt){
  for(uint8_t i = 0; i < MAX_ADJ_TRAFFIC; i++){
    if(pkt->destination_ids[i] == TRAFFIC_ID){
      return true;
    }
  }
  // if(pkt->destination_id == TRAFFIC_ID){
  //   return true;
  // }
  return false;
}

bool is_ACK(struct Packet* pkt){
  return strncmp((char*)pkt->payload, "ACK", 3) == 0;
}

struct Packet* receive_pkt(){
  uint8_t pkt_size = sizeof(struct Packet);
  struct Packet* pkt_buffer = generate_new_pkt();

  if(rf95.recv((uint8_t*)pkt_buffer, &pkt_size)){
    Serial.print(F("Packet received. RSSI: "));
    Serial.println(rf95.lastRssi(), DEC);

    print_pkt(pkt_buffer);
    delay(10);

    if(pkt_buffer != NULL){
      if(packet_for_me(pkt_buffer) && packet_is_ok(pkt_buffer) && pkt_buffer->ttl > 0){
        pkt_buffer->ttl -= 1;
        return pkt_buffer;
      }

      Serial.println(F("Error: Packet conditions not met. Discarding..."));
    }
    else{
      Serial.println(F("Error: Packet is NULL"));
    }
  }
  else{
    Serial.println(F("Receive failed."));
  }

  free(pkt_buffer);
  return NULL;
}

void print_pkt(struct Packet* pkt){
  Serial.println(F("Packet Contents:"));
  Serial.print(F("Sender ID: "));
  Serial.println(pkt->sender_id);
  Serial.print(F("Destination IDs: "));
  //Serial.println(pkt->destination_id);
  for(uint8_t i = 0; i < MAX_ADJ_TRAFFIC; i++){
    Serial.print(pkt->destination_ids[i]);
    Serial.print(", ");
  }
  Serial.println("");
  Serial.print(F("TTL: "));
  Serial.println(pkt->ttl);
  Serial.print(F("Payload: "));
  Serial.println((char*)pkt->payload);
}

void broadcast_pkt(struct Packet* pkt, bool forward = false){
  if (forward){
    for (uint8_t i = 0; i < MAX_ADJ_TRAFFIC; i++){
      if (adj_traffic_ids[i] != pkt->sender_id && adj_traffic_ids[i] != pkt->traffic_id) {
        pkt->destination_ids[i] = adj_traffic_ids[i];
      }
      else{
        pkt->destination_ids[i] = 0;
      }
    }

    update_pkt_headers(pkt, pkt->destination_ids, pkt->ttl);
  }
  else{
    update_pkt_headers(pkt, adj_traffic_ids, MAX_TTL);
  }

  transmit_pkt(pkt);

  delay(10);
}

void listen_for_pkt(){
  if(rf95.available()){
    struct Packet* recv_pkt = receive_pkt();
    
    if(recv_pkt != NULL){
      broadcast_pkt(recv_pkt, true);
      //Serial.write()
      free(recv_pkt);
    }
  }
}

void check_serial(){
  if(Serial.available()){
    uint8_t payload[PAYLOAD_LENGTH];
    Serial.readBytes((char*)payload, sizeof(PAYLOAD_LENGTH));

    struct Packet* pkt_buffer = generate_new_pkt();

    Serial.readBytes((char*)pkt_buffer, sizeof(struct Packet));
    
    if (pkt_buffer != NULL) {
      broadcast_pkt(pkt_buffer);
    }

    free(pkt_buffer);
  }
}

unsigned long start_time;

void setup() {
  Serial.begin(BAUD_RATE);
  delay(100);

  // oled_init();
  // delay(1000);

  lora_init();
  delay(1000);

  start_time = millis();
}

void loop() {
  if(millis() - start_time >= SERIAL_DELAY){
    check_serial();
    start_time = millis();
  }
  else{
    listen_for_pkt();
    delay(100);
  }
}
