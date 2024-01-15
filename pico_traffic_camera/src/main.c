#include "FreeRTOS.h"
#include "task.h"
#include <stdio.h>
#include "pico/stdlib.h"


void test_rtos()
{   
    printf("Hello World!\n");
}

int main()
{
    stdio_init_all();

    xTaskCreate(test_rtos, "LED_Task", 256, NULL, 1, NULL);
    vTaskStartScheduler();

    while(1){};
}