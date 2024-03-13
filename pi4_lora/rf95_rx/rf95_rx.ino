#include <SPI.h>
#include <RH_RF95.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define BAUD_RATE 9600
#define ACK_TIMEOUT 5000
#define PAYLOAD_LENGTH 32
#define MAX_TTL 5

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
    Serial.println("LoRa radio init failed");
    while (1);
  }
  Serial.println("LoRa radio init OK!");

  // Defaults after init are 915.0MHz, modulation GFSK_Rb250Fd250, +13dbM
  if (!rf95.setFrequency(RF95_FREQ)) {
    display.println("setFrequency Failed");
    display.display();
    Serial.println("setFrequency failed");
    while (1);
  }
  Serial.print("Set Freq to:"); Serial.println(RF95_FREQ);

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

struct Packet{
  uint8_t sender_id; // node which sends this packet
  uint8_t destination_id; // node which receives the packet
  uint8_t ttl;

  uint8_t traffic_id;
  uint8_t payload[PAYLOAD_LENGTH];
  uint32_t checksum;
};

void pkt_init(struct Packet* pkt){
  if(pkt == NULL){
    Serial.println("malloc failed. Exiting...");
    exit(1);
  }
  else{
    pkt->sender_id = 0;
    pkt->destination_id = 0;
    pkt->ttl = 0;

    pkt->traffic_id = 0;
    for(int i = 0; i < PAYLOAD_LENGTH; i++){
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
    for(int i = 0; i < PAYLOAD_LENGTH; i++){
      new_pkt->checksum += new_pkt->payload[i];
    }
  }

  return new_pkt;
}

void update_pkt_headers(struct Packet* pkt, uint8_t destination_id, uint8_t time_to_live){
  pkt->sender_id = TRAFFIC_ID;
  pkt->destination_id = destination_id;
  pkt->ttl = time_to_live;
}

void transmit_pkt(struct Packet* pkt_ptr){
  oled_display("Transmitting message...");

  rf95.send((uint8_t*)pkt_ptr, sizeof(*pkt_ptr));
  delay(10);
  rf95.waitPacketSent();
}

bool packet_is_ok(struct Packet* pkt){
  uint32_t my_checksum = 0;
  my_checksum = pkt->traffic_id;
  for(int i = 0; i < PAYLOAD_LENGTH; i++){
    my_checksum += pkt->payload[i];
  }

  return my_checksum == pkt->checksum;
}

bool is_ACK(struct Packet* pkt){
  return strncmp((char*)pkt->payload, "ACK", 3) == 0;
}

struct Packet* receive_pkt(){
  uint8_t pkt_size = sizeof(struct Packet);
  struct Packet* pkt_buffer = generate_new_pkt();

  if(rf95.recv((uint8_t*)pkt_buffer, &pkt_size)){
    Serial.println("Packet received.");
    // Serial.println((char*)pkt_buffer->payload);
    Serial.print("RSSI: ");
    Serial.println(rf95.lastRssi(), DEC);
    return pkt_buffer;
  }
  else{
    Serial.println("Receive failed.");
    return NULL;
  }
}

bool broadcast_pkt(struct Packet* pkt, uint8_t destination_id, uint8_t retransmit_count = 1){
  bool success = false;
  update_pkt_headers(pkt, destination_id, MAX_TTL);

  transmit_pkt(pkt);

  delay(10);

  unsigned long start_time = millis();
  //unsigned long remaining_time = ACK_TIMEOUT - (millis() - start_time) > 0 ? ACK_TIMEOUT - (millis() - start_time) : 0;
  unsigned long remaining_time = ACK_TIMEOUT;

  while (rf95.waitAvailableTimeout(remaining_time)){
    struct Packet* recv_pkt = receive_pkt();

    if(recv_pkt != NULL && recv_pkt->destination_id == TRAFFIC_ID && packet_is_ok(recv_pkt) && is_ACK(recv_pkt)){
      success = true;
      break;
    }

    else{
      free(recv_pkt); //discard the packet
      continue;
    }
  }

  if(!success && retransmit_count > 0){
    success = broadcast_pkt(pkt, destination_id, retransmit_count - 1);
  }

  return success;
}

struct Packet* listen_for_pkt(){
  if(rf95.available()){
    struct Packet* recv_pkt = receive_pkt();
    
    if(recv_pkt != NULL && recv_pkt->destination_id == TRAFFIC_ID && packet_is_ok(recv_pkt)){
      struct Packet* ack_pkt = generate_new_pkt("ACK");
      update_pkt_headers(ack_pkt, recv_pkt->sender_id, 1);

      transmit_pkt(ack_pkt);
      return recv_pkt;
    }
  }

  return NULL;
}

void setup() {
  Serial.begin(BAUD_RATE);
  delay(100);

  oled_init();
  delay(1000);

  lora_init();
  delay(1000);
}

void loop() {
  struct Packet* received_pkt = listen_for_pkt();
  if(received_pkt != NULL){
    Serial.println("Packet Contents:");
    Serial.print("Sender ID: ");
    Serial.println(received_pkt->sender_id);

    Serial.print("Destination ID: ");
    Serial.println(received_pkt->destination_id);

    Serial.print("TTL: ");
    Serial.println(received_pkt->ttl);

    Serial.print("Payload: ");
    Serial.println((char*)received_pkt->payload);

    while(1);
  }
}
