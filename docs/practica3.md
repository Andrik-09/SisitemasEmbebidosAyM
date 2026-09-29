# Session 5 — AND, OR, and XOR Logic Gates from Two Buttons

**Goal (one sentence):** Build three two-input logic gates (AND, OR, XOR) in software, lighting one LED from the state of two push-buttons read straight from the SIO input register.

**Prediction — written before running anything:** With both buttons wired to an external pull-up (pressed reads as 0), the AND version should only light the LED when both `BTN_A_BIT` and `BTN_B_BIT` read 0 at the same time; the OR version should light it whenever either button reads 0; and the XOR version should light it only when exactly one button is pressed, turning off again if both are pressed together or both are released — matching the truth table of each gate.

---

### Setup

- Pin map: `LED_BIT` = GPIO0 (LED, active-high: set = on), `button_A_pin` = GPIO16, `button_B_pin` = GPIO17. Both buttons use an external pull-up, so the internal pulls are disabled with `gpio_disable_pulls`.
- Closing activity: reuses the same two buttons (GPIO16/17) as advance/retreat, driving a 4-LED bus on `PIN_A`–`PIN_D` = GPIO18–21 (`MASK_LED`).

### What I did

1. Set GPIO0 as output for the LED and GPIO16/17 as inputs for the two buttons, disabling the internal pulls since the buttons already have external pull-ups.
2. Wrote the AND version first: the LED turns on only when both `BTN_A_BIT` and `BTN_B_BIT` read low.
3. Copied the AND code and changed the condition to `||` for the OR version.
4. Copied it again and compared the two button states for inequality to get the XOR version.
5. Called `stdio_init_all()` and used `printf` to also print the raw `gpio_in` value over serial while testing each gate.
6. Added a closing activity: a 4-LED position counter on GPIO18–21, reusing the same two buttons — button A advances the position (wrapping from 3 back to 0), button B retreats it (wrapping from 0 back to 3) — with a `mover1`/`mover2` flag per button so a single press only steps once instead of free-running while held.

### What went wrong

- We spent about an hour chasing a bug that, in the end, had nothing to do with the AND/OR/XOR logic itself — we had written the check for button A twice instead of comparing A against B, a copy-paste mistake that meant we'd never actually wired B's state into the condition. We lost so much time on it that we had to finish the XOR gate code at home.

### Code

**AND**

```c
#include "pico/stdlib.h"
#include "hardware/structs/sio.h"
#include <stdio.h>

#define button_A_pin 16
#define button_B_pin 17

int main(void) {
    stdio_init_all();
    const uint32_t LED_BIT = 1u << 0; // LED (e.g. 25 on Pico/Pico2)
    const uint32_t BTN_A_BIT = 1u << button_A_pin;                    // Button on GPIO16
    const uint32_t BTN_B_BIT = 1u << button_B_pin;   

    // Ensure GPIO function
    gpio_init(0);
    gpio_init(button_A_pin);
    gpio_init(button_B_pin);

    // LED as output; button as input
    sio_hw->gpio_oe_set = LED_BIT; // output
    sio_hw->gpio_oe_clr = BTN_A_BIT; // input
    sio_hw->gpio_oe_clr = BTN_B_BIT;

    // IMPORTANT: external pull-up -> disable internal pulls
    gpio_disable_pulls(button_A_pin);
    gpio_disable_pulls(button_B_pin);

    while (true) {
        // With an (external) pull-up, pressed = 0 (low level)
        int memory = sio_hw->gpio_in;
        printf("%d\n", memory);
        if ((sio_hw->gpio_in & BTN_A_BIT) == 0 && (sio_hw->gpio_in & BTN_B_BIT) ==0) {
            sio_hw->gpio_set = LED_BIT;   // LED ON
            printf("ON");
        } else {
            sio_hw->gpio_clr = LED_BIT;   // LED OFF
        }

        // Brief rest / minimal debounce
        sleep_ms(100);
    }
}
```

Video:

<video controls width="100%" src="../recursos/videos/practica3-and.mp4"></video>

**OR**

```c
#include "pico/stdlib.h"
#include "hardware/structs/sio.h"
#include <stdio.h>

#define button_A_pin 16
#define button_B_pin 17

int main(void) {
    stdio_init_all();
    const uint32_t LED_BIT = 1u << 0; // LED (e.g. 25 on Pico/Pico2)
    const uint32_t BTN_A_BIT = 1u << button_A_pin;                    // Button on GPIO16
    const uint32_t BTN_B_BIT = 1u << button_B_pin;   

    // Ensure GPIO function
    gpio_init(0);
    gpio_init(button_A_pin);
    gpio_init(button_B_pin);

    // LED as output; button as input
    sio_hw->gpio_oe_set = LED_BIT; // output
    sio_hw->gpio_oe_clr = BTN_A_BIT; // input
    sio_hw->gpio_oe_clr = BTN_B_BIT;

    // IMPORTANT: external pull-up -> disable internal pulls
    gpio_disable_pulls(button_A_pin);
    gpio_disable_pulls(button_B_pin);

    while (true) {
        // With an (external) pull-up, pressed = 0 (low level)
        int memory = sio_hw->gpio_in;
        printf("%d\n", memory);
        
        if ((sio_hw->gpio_in & BTN_A_BIT) == 0 || (sio_hw->gpio_in & BTN_B_BIT) == 0) {
            sio_hw->gpio_set = LED_BIT;   // LED ON
            printf("ON");
        } else {
            sio_hw->gpio_clr = LED_BIT;   // LED OFF
        }

        // Brief rest / minimal debounce
        sleep_ms(100);
    }
}
```

Video:

<video controls width="100%" src="../recursos/videos/practica3-or.mp4"></video>

**XOR**

```c
#include "pico/stdlib.h"
#include "hardware/structs/sio.h"
#include <stdio.h>

#define button_A_pin 16
#define button_B_pin 17

int main(void) {
    stdio_init_all();
    const uint32_t LED_BIT = 1u << 0; // LED (e.g. 25 on Pico/Pico2)
    const uint32_t BTN_A_BIT = 1u << button_A_pin;                    // Button on GPIO16
    const uint32_t BTN_B_BIT = 1u << button_B_pin;   

    // Ensure GPIO function
    gpio_init(0);
    gpio_init(button_A_pin);
    gpio_init(button_B_pin);

    // LED as output; button as input
    sio_hw->gpio_oe_set = LED_BIT; // output
    sio_hw->gpio_oe_clr = BTN_A_BIT; // input
    sio_hw->gpio_oe_clr = BTN_B_BIT;

    // IMPORTANT: external pull-up -> disable internal pulls
    gpio_disable_pulls(button_A_pin);
    gpio_disable_pulls(button_B_pin);

    while (true) {
        // With an (external) pull-up, pressed = 0 (low level)
        int memory = sio_hw->gpio_in;
        printf("%d\n", memory);
        
        // XOR: Compara si el estado de presionado del botón A es DIFERENTE al del botón B
        if (((sio_hw->gpio_in & BTN_A_BIT) == 0) != ((sio_hw->gpio_in & BTN_B_BIT) == 0)) {
            sio_hw->gpio_set = LED_BIT;
            printf("ON");
        } else {
            sio_hw->gpio_clr = LED_BIT;
        }

        // Brief rest / minimal debounce
        sleep_ms(100);
    }
}
```

Video:

<video controls width="100%" src="../recursos/videos/practica3-xor.mp4"></video>

**Closing Activity — 4-Position LED Counter**

```c
#include "pico/stdlib.h"
#include "hardware/structs/sio.h"
#include <stdio.h>

#define button_A_pin 16
#define button_B_pin 17

#define PIN_A 18
#define PIN_B 19
#define PIN_C 20
#define PIN_D 21

int main(void) {
    stdio_init_all();

    const uint32_t MASK_LED = 
        (1u << PIN_A) | 
        (1u << PIN_B) | 
        (1u << PIN_C) | 
        (1u << PIN_D);

    const uint32_t BTN_A_BIT = 1u << button_A_pin; // Botón avanzar en GPIO 16
    const uint32_t BTN_B_BIT = 1u << button_B_pin; // Botón retroceder en GPIO 17

    // Inicializar pines
    gpio_init(PIN_A);
    gpio_init(PIN_B);
    gpio_init(PIN_C);
    gpio_init(PIN_D);
    gpio_init(button_A_pin);
    gpio_init(button_B_pin);

   
    sio_hw->gpio_oe_set = MASK_LED;
    sio_hw->gpio_oe_clr = BTN_A_BIT;
    sio_hw->gpio_oe_clr = BTN_B_BIT;

    // desactivamos pulls internos porque usamos pull-up externo, o sea la resistencia
    gpio_disable_pulls(button_A_pin);
    gpio_disable_pulls(button_B_pin);

    int counter = 0;
    int mover1 = 0;
    int mover2 = 0;

    while (true) {
        // Con pull-up externo: Presionado = 0 
        int a = (sio_hw->gpio_in & BTN_A_BIT) == 0;
        int b = (sio_hw->gpio_in & BTN_B_BIT) == 0;

        // Botón A: avanza
        if (a && !mover1) {
            counter++;
            if (counter > 3) {
                counter = 0; 
            }
            mover1 = 1;
        } else if (!a && mover1) {
            mover1 = 0;
        }

        // Botón B: retrocede
        if (b && !mover2) {
            counter--;
            if (counter < 0) {
                counter = 3; 
            }
            mover2 = 1;
        } else if (!b && mover2) {
            mover2 = 0;
        }

        
        sio_hw->gpio_clr = MASK_LED;                  // Apaga todos
        sio_hw->gpio_set = (1u << (PIN_A + counter)); // Prende LED actual

        sleep_ms(100); 
    }
}
```

Video:

<video controls width="100%" src="../recursos/videos/practica3-closing.mp4"></video>

### Open Question

All three gates poll `gpio_in` once every 100 ms through `sleep_ms`, so a very quick press on one button right between two polls could be missed. Would wiring both buttons to a single GPIO interrupt (triggered on either pin's edge) actually catch that, or would debouncing two independent buttons from one shared ISR need its own edge-case handling?
