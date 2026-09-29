# 5-LED Roulette with Win Detection and Speed Control

**Goal (one sentence):** Build a 5-LED "roulette" chase driven entirely by GPIO interrupts, where one button stops the roulette and checks for a win on the middle LED, and two more buttons speed the chase up or slow it down.

**Prediction — written before running anything:** All three buttons share one ISR on `GPIO_IRQ_EDGE_FALL` with internal pull-ups, so a press only registers once the pin has actually gone low; `BTN_STP` should only set a win if the chase happens to be sitting on the middle LED (`posicion == 2`) at that exact instant, and `BTN_UP`/`BTN_DWN` should each nudge `velocidad` by 30 ms per press, clamped between `VEL_MIN` and `VEL_MAX`, so holding a button down should ramp the chase speed gradually instead of jumping straight to an extreme.

---

### Setup

- Pin map: `LED1`–`LED5` = GPIO2–GPIO6 (`LED_MASK` covers all five), `BTN_STP` = GPIO16 (stop / win check), `BTN_UP` = GPIO17 (speed up), `BTN_DWN` = GPIO18 (speed down). All three buttons use the internal pull-up (`gpio_pull_up`), so idle reads high and a press pulls the pin low.
- All three buttons are wired to a single shared ISR, `button_isr`, triggered on `GPIO_IRQ_EDGE_FALL`, with a 200 ms software debounce (`ANTIRREBOTE_MS`) implemented by comparing `to_ms_since_boot(get_absolute_time())` against a timestamp from the previous press.

### What I did

1. Wired the 5-LED bus on GPIO2–GPIO6 and the three push-buttons on GPIO16–GPIO18, all with internal pull-ups.
2. Registered `button_isr` on `BTN_STP` through `gpio_set_irq_enabled_with_callback`, then attached `BTN_UP` and `BTN_DWN` to the same callback with `gpio_set_irq_enabled`.
3. Inside `button_isr`, added the debounce check first, then branched on `gpio`: `BTN_STP` sets `ganador = true` only when `posicion == 2` (the middle LED); `BTN_UP` decreases `velocidad` by 30 and clamps it to `VEL_MIN`; `BTN_DWN` increases `velocidad` by 30 and clamps it to `VEL_MAX`.
4. In the main loop, while `ganador` is false, lit the LED at the current `posicion`, waited `velocidad` ms, then advanced `posicion` and flipped `direccion` at both ends (0 and 4) for the back-and-forth chase.
5. When `ganador` becomes true, blinked all 5 LEDs together 5 times (200 ms on / 200 ms off) as a win animation, then reset `posicion`, `direccion`, and `ganador` to start the roulette over.

### What went wrong

- At first, only the stop button (`BTN_STP`) actually worked — pressing `BTN_UP` or `BTN_DWN` did nothing to the chase speed at all. We fixed it by adding a dedicated `if` block for `BTN_UP` that lowers `velocidad` (clamped to `VEL_MIN`) and a separate `if` block for `BTN_DWN` that raises it (clamped to `VEL_MAX`), both inside the same `button_isr` alongside the win check.

### Code

```c
#include "pico/stdlib.h"
#include "hardware/gpio.h"

#define LED1 2
#define LED2 3
#define LED3 4
#define LED4 5
#define LED5 6

#define BTN_STP 16
#define BTN_UP  17
#define BTN_DWN 18

#define VEL_MIN 30      
#define VEL_MAX 1000          
#define ANTIRREBOTE_MS 200    


volatile int  posicion  = 0;
volatile int  velocidad = 200;
volatile bool ganador   = false;

static void button_isr(uint gpio, uint32_t events) {
    // CORREGIDO: antirrebote
    static uint32_t ultimo = 0;
    uint32_t ahora = to_ms_since_boot(get_absolute_time());
    if (ahora - ultimo < ANTIRREBOTE_MS) return;
    ultimo = ahora;

    if (gpio == BTN_STP) {
        if (posicion == 2) {
            ganador = true;        
        }
    }

    if (gpio == BTN_UP) {
        velocidad = velocidad - 30;
        if (velocidad < VEL_MIN) {
            velocidad = VEL_MIN;
        }
    }

    if (gpio == BTN_DWN) {
        velocidad = velocidad + 30;
        if (velocidad > VEL_MAX) {  
            velocidad = VEL_MAX;
        }
    }
   
}

int main(void) {
    const uint32_t LED_MASK = 1u << LED1 | 1u << LED2 | 1u << LED3 | 1u << LED4 | 1u << LED5;

    gpio_init(LED1);
    gpio_init(LED2);
    gpio_init(LED3);
    gpio_init(LED4);
    gpio_init(LED5);
    sio_hw->gpio_oe_set = LED_MASK;
    sio_hw->gpio_clr    = LED_MASK;

    gpio_init(BTN_STP);
    gpio_init(BTN_UP);
    gpio_init(BTN_DWN);

   
    gpio_pull_up(BTN_STP);
    gpio_pull_up(BTN_UP);
    gpio_pull_up(BTN_DWN);

   
    gpio_set_irq_enabled_with_callback(BTN_STP, GPIO_IRQ_EDGE_FALL, true, &button_isr);
    gpio_set_irq_enabled(BTN_UP,  GPIO_IRQ_EDGE_FALL, true);
    gpio_set_irq_enabled(BTN_DWN, GPIO_IRQ_EDGE_FALL, true);

    int direccion = 1;

    while (true) {
        if (ganador == true) {
            for (int i = 0; i < 5; i++) {
                sio_hw->gpio_set = LED_MASK;
                sleep_ms(200);
                sio_hw->gpio_clr = LED_MASK;
                sleep_ms(200);
            }
            ganador   = false;
            posicion  = 0;
            direccion = 1;
        }
        else {
            sio_hw->gpio_clr = LED_MASK;              
            sio_hw->gpio_set = 1u << (LED1 + posicion);
            sleep_ms(velocidad);

       
            posicion = posicion + direccion;
            if (posicion == 4 || posicion == 0) {
                direccion = -direccion;                
            }
        }
    }
}
```

Video:

<video controls width="100%" src="../recursos/videos/practica5-roulette.mp4"></video>

### Open Question

`posicion` is `volatile`, shared between the main loop (which keeps incrementing it every `velocidad` ms) and `button_isr` (which reads it once to check `posicion == 2`). Could an interrupt landing in the middle of the main loop's read-modify-write of `posicion` ever make the win check compare against a half-updated value — and would wrapping the check in `save_and_disable_interrupts()`/`restore_interrupts()` be the right way to rule that out, or is a single `volatile int` read already atomic enough on this core?
