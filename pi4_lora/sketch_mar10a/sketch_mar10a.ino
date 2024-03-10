// LoRa 9x_RX
// -*- mode:C++ -*-
// Example sketch showing how to create a simple messaging client (receiver)
// with the RH_RF95 class. RH_RF95 class does not provide for addressing or
// reliability, so you should only use RH_RF95 if you do not need the higher
// level messaging abilities.
// It is designed to work with the other example LoRa9x_TX

#include <SPI.h>
#include <RH_RF95.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define RFM95_CS 10
#define RFM95_RST 9
#define RFM95_INT 2

RH_RF95 rf95(RFM95_CS, RFM95_INT);

#define SCREEN_WIDTH 128  // OLED display width, in pixels
#define SCREEN_HEIGHT 32  // OLED display height, in pixels
// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     -1 // Reset pin # (or -1 if sharing Arduino reset pin)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

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

void oled_display(String message){
  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("Pi4: ");
  display.println(message);
  display.display();
}

String receive(){
  //unsigned long start_time = millis();
  while (!Serial.available()){
    delay(1000);
    // if(millis() - start_time >= 20000){
    //   return "";
    // }
  }
  String opcode = Serial.readStringUntil('\0');

  if(opcode == "ACK"){
    return opcode;
  }
  else{
    String args = Serial.readStringUntil('\0');
    return args;
  }
}

void transmit(String opcode, String args = ""){
  // Convert the String to a C-style string and get its length
  char* opcodeBuffer = opcode.c_str();
  int length = opcode.length();
  // Write the bytes of the String followed by a null terminator
  for (int i = 0; i < length; i++) {
    Serial.write(opcodeBuffer[i]);
  }
  Serial.write('\0'); // Write the null terminator

  if(args != ""){
    // Convert the String to a C-style string and get its length
    char* argsBuffer = args.c_str();
    int length = args.length();

    // Write the bytes of the String followed by a null terminator
    for (int i = 0; i < length; i++) {
      Serial.write(argsBuffer[i]);
    }
    Serial.write('\0'); // Write the null terminator
  }
}

void setup() {
  Serial.begin(9600);
  delay(100);
  oled_init();

  // Manual reset
  digitalWrite(RFM95_RST, LOW);
  delay(10);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);

  if(!rf95.init()){
    oled_display("RF95 init failed!");
    while(1);
  }

}

void loop() {
  display.clearDisplay();
  display.setCursor(0, 0);     // Start at top-left corner
  display.println("Waiting for Message");
  display.display();

  oled_display(receive());
  delay(1000);
  transmit("ACK");
  delay(10000);
}
