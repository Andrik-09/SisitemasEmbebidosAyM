# UART — Two Picos Sending and Receiving

**Goal (one sentence):** Connect two Picos over UART so each one sends and receives at the same time — first text messages, then the state of two buttons that should drive two LEDs on the other board.

**Prediction — written before running anything:** With both boards on `uart0` at 115200 baud, 8 data bits, 1 stop bit and no parity, and the TX of each wired to the RX of the other, every Pico should send `Message N from MAIN` once per second and the serial monitor of the other one should show those messages arriving with `N` going up by one each time. In Exercise 2 each Pico keeps sending one character per button, so pressing the first button on one Pico should turn on the first LED of the other Pico, the second button the second LED, and the same in the opposite direction.

---

### Setup

- UART: `uart0` at 115200 baud, 8N1, `TX_PIN` = GPIO0, `RX_PIN` = GPIO1. The two Picos are wired crossed (TX of one to RX of the other) and share ground.
- Exercise 2, on each Pico: `LED1` = GPIO12, `LED2` = GPIO13, `BTN1` = GPIO14, `BTN2` = GPIO15. Both buttons use the internal pull-up (`gpio_pull_up`), so a pressed button reads 0.

### What I did

1. Wired the two Picos together over UART and flashed the same program on both.
2. **Exercise 1:** set GPIO0/GPIO1 to `GPIO_FUNC_UART`, initialised `uart0` with `uart_init` and `uart_set_format`, sent a numbered message every second with `uart_puts`, and printed over USB whatever arrived, checking `uart_is_readable` before each `uart_getc`. Watched the messages on the serial monitor.
3. **Exercise 2:** added two buttons and two LEDs to each Pico. On every pass of the loop the program sends `'0'` or `'1'` for `BTN1` and `'2'` or `'3'` for `BTN2`, then reads one received character and sets `LED1` or `LED2` from it.
4. Pressed the buttons on each Pico and watched the LEDs on the other one.

### What went wrong

- Only two of the LEDs turned on. It was not a wiring problem: the fault was in the logic we worked out for the code (the equation), and pressing the button did not send the signal to the other Pico.

### Code

**Exercise 1 — Sending and receiving messages**

```c
#include "pico/stdlib.h"
#include "hardware/uart.h"
#include <stdio.h>

#define UART_ID uart0
#define BAUD_RATE 115200
#define TX_PIN 0
#define RX_PIN 1

int main() {
    stdio_init_all();

    gpio_set_function(TX_PIN, GPIO_FUNC_UART);
    gpio_set_function(RX_PIN, GPIO_FUNC_UART);

    uart_init(uart0, BAUD_RATE);
    uart_set_format(UART_ID, 8, 1, UART_PARITY_NONE);

    printf("[MAIN] Sending messages every second...\n");

    int counter = 0;
    while (true) {
        char msg[64];
        sprintf(msg, "Message %d from MAIN\r\n", counter++);
        uart_puts(uart0, msg);
        sleep_ms(1000);
       
        if (uart_is_readable(uart0)) {
            char c = uart_getc(uart0);
            printf("%c", c);
        }
    }

    printf("[SUPPORT] Waiting for messages (polling)...\n");
}
```

Video:

<video controls width="100%" src="../recursos/videos/parcial2-practica2-ejercicio1.mp4"></video>

**Exercise 2 — Buttons on one Pico, LEDs on the other**

```c
#include "pico/stdlib.h"
#include "hardware/uart.h"
#include <stdio.h>

#define UART_ID uart0
#define BAUD_RATE 115200
#define TX_PIN 0
#define RX_PIN 1
#define LED1 12
#define LED2 13
#define BTN1 14
#define BTN2 15

int main() {
    stdio_init_all();

    gpio_init(BTN1);
    gpio_set_dir(BTN1, GPIO_IN);
    gpio_pull_up(BTN1);

    gpio_init(BTN2);
    gpio_set_dir(BTN2, GPIO_IN);
    gpio_pull_up(BTN2);



    gpio_init(LED1);
    gpio_set_dir(LED1, GPIO_OUT);
    gpio_put(LED1, 0);

    gpio_init(LED2);
    gpio_set_dir(LED2, GPIO_OUT);
    gpio_put(LED2, 0);


    
    gpio_set_function(TX_PIN, GPIO_FUNC_UART);
    gpio_set_function(RX_PIN, GPIO_FUNC_UART);

    uart_init(uart0, BAUD_RATE);
    uart_set_format(UART_ID, 8, 1, UART_PARITY_NONE);

    printf("[MAIN] Sending messages every second...\n");

    
    while (true) {

        if (gpio_get(BTN1)==0){
            uart_putc(uart0, '0');
            sleep_ms(10);    
        }else{
            uart_putc(uart0, '1');
            sleep_ms(10);    
        }        
        

        if (gpio_get(BTN2)==0){
            uart_putc(uart0, '2');
            sleep_ms(10);    
        }else{
            uart_putc(uart0, '3');
            sleep_ms(10);    
        }  
        
        if (uart_is_readable(uart0)) {
            char c = uart_getc(uart0);
           
        if (c=='0'){
            gpio_put(LED1,0);
        }
        else if(c=='1'){
            gpio_put(LED1, 1);
        } else if (c=='2'){
            gpio_put(LED2,1);
        } else if (c=='3'){
            gpio_put(LED2,0);
         }
    }
    }

    printf("[SUPPORT] Waiting for messages (polling)...\n");
}
```

Video:

<video controls width="100%" src="../recursos/videos/parcial2-practica2-ejercicio2.mp4"></video>

### Open Question

In Exercise 2 the two buttons are not decoded the same way: a pressed `BTN2` sends `'2'`, which turns `LED2` on, but a pressed `BTN1` sends `'0'`, which turns `LED1` off, and the released state `'1'` turns it on. The loop also sends two characters on every pass but reads only one. Would making both buttons use the same sense, and reading every character that is waiting instead of just one, be enough to get all four LEDs following the buttons — or does sending the state continuously need a different approach, such as sending a character only when a button changes?
