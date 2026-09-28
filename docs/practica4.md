# GPIO Interrupt Triggers — HIGH, LOW, RISE, and FALL

**Goal (one sentence):** Observe how each of the four GPIO interrupt trigger types (HIGH level, LOW level, rising edge, falling edge) behaves on a single dip switch, toggling one onboard LED from inside the same ISR.

**Prediction — written before running anything:** The switch uses an external pull-up to 3V3 (idle = high, pressed/closed = low), so `GPIO_IRQ_LEVEL_HIGH` should fire over and over for as long as the switch is open, toggling the LED rapidly instead of reacting once; `GPIO_IRQ_LEVEL_LOW` should do the same but only while the switch is closed; `GPIO_IRQ_EDGE_RISE` should fire exactly once when the switch opens (low → high); and `GPIO_IRQ_EDGE_FALL` should fire exactly once when the switch closes (high → low) — the classic difference between level-triggered and edge-triggered interrupts.

---

### Setup

- Pin map: `LED_PIN` = GPIO2 (onboard LED), `BTN_PIN` = GPIO16, wired to a dip switch with an external pull-up to 3V3 (switch to GND).

### What I did

1. Set `LED_PIN` as output and `BTN_PIN` as input with the internal pulls disabled, since the dip switch already has its own external pull-up.
2. Wrote one shared ISR, `button_isr`, that toggles the LED with `gpio_xor_mask` whenever it fires, registered through `gpio_set_irq_enabled_with_callback`.
3. Ran the HIGH version first, then for each of the other three just changed the event mask in two places — the `gpio_set_irq_enabled_with_callback` call and the `events &` check inside the ISR — and reflashed.
4. Flipped the dip switch on and off for each version and recorded how the LED reacted on video.

### What went wrong

- Nothing went wrong here — this session was only about observing how each trigger type behaves, not building something new, so there was nothing to debug.

### Code

**HIGH**

```c
#include "pico/stdlib.h"
#include "hardware/gpio.h"

#define LED_PIN 2  // onboard LED (Pico 2)
#define BTN_PIN 16   // button with external pull-up to 3V3, switch to GND

static void button_isr(uint gpio, uint32_t events) {
    if (gpio == BTN_PIN && (events & GPIO_IRQ_LEVEL_HIGH)) {
        gpio_xor_mask(1u << LED_PIN);
    }
    gpio_acknowledge_irq(gpio, events);  // clears the IRQ flag
}

int main(void) {
    stdio_init_all();

    // LED
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);
    gpio_put(LED_PIN, 0);

    // Button: input without internal pulls (uses the hardware's external pull-up)
    gpio_init(BTN_PIN);
    gpio_set_dir(BTN_PIN, GPIO_IN);
    gpio_disable_pulls(BTN_PIN);   // important: don't mix with an internal pull

    // Interrupt on rising edge
    gpio_set_irq_enabled_with_callback(BTN_PIN,
                                       GPIO_IRQ_LEVEL_HIGH,
                                       true,
                                       &button_isr);

    while (true) {
        tight_loop_contents();
    }
}
```

Video:

<!-- VIDEO_HIGH: replace the "Video: pending" line above and/or insert here
     <video controls width="100%" src="../recursos/videos/practica4-high.mp4"></video>
-->

**LOW**

```c
#include "pico/stdlib.h"
#include "hardware/gpio.h"

#define LED_PIN 2  // onboard LED (Pico 2)
#define BTN_PIN 16   // button with external pull-up to 3V3, switch to GND

static void button_isr(uint gpio, uint32_t events) {
    if (gpio == BTN_PIN && (events & GPIO_IRQ_LEVEL_LOW)) {
        gpio_xor_mask(1u << LED_PIN);
    }
    gpio_acknowledge_irq(gpio, events);  // clears the IRQ flag
}

int main(void) {
    stdio_init_all();

    // LED
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);
    gpio_put(LED_PIN, 0);

    // Button: input without internal pulls (uses the hardware's external pull-up)
    gpio_init(BTN_PIN);
    gpio_set_dir(BTN_PIN, GPIO_IN);
    gpio_disable_pulls(BTN_PIN);   // important: don't mix with an internal pull

    // Interrupt while the pin is held low
    gpio_set_irq_enabled_with_callback(BTN_PIN,
                                       GPIO_IRQ_LEVEL_LOW,
                                       true,
                                       &button_isr);

    while (true) {
        tight_loop_contents();
    }
}
```

Video:

<!-- VIDEO_LOW: replace the "Video: pending" line above and/or insert here
     <video controls width="100%" src="../recursos/videos/practica4-low.mp4"></video>
-->

**RISE**

```c
#include "pico/stdlib.h"
#include "hardware/gpio.h"

#define LED_PIN 2  // onboard LED (Pico 2)
#define BTN_PIN 16   // button with external pull-up to 3V3, switch to GND

static void button_isr(uint gpio, uint32_t events) {
    if (gpio == BTN_PIN && (events & GPIO_IRQ_EDGE_RISE)) {
        gpio_xor_mask(1u << LED_PIN);
    }
    gpio_acknowledge_irq(gpio, events);  // clears the IRQ flag
}

int main(void) {
    stdio_init_all();

    // LED
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);
    gpio_put(LED_PIN, 0);

    // Button: input without internal pulls (uses the hardware's external pull-up)
    gpio_init(BTN_PIN);
    gpio_set_dir(BTN_PIN, GPIO_IN);
    gpio_disable_pulls(BTN_PIN);   // important: don't mix with an internal pull

    // Interrupt on rising edge
    gpio_set_irq_enabled_with_callback(BTN_PIN,
                                       GPIO_IRQ_EDGE_RISE,
                                       true,
                                       &button_isr);

    while (true) {
        tight_loop_contents();
    }
}
```

Video:

<!-- VIDEO_RISE: replace the "Video: pending" line above and/or insert here
     <video controls width="100%" src="../recursos/videos/practica4-rise.mp4"></video>
-->

**FALL**

```c
#include "pico/stdlib.h"
#include "hardware/gpio.h"

#define LED_PIN 2  // onboard LED (Pico 2)
#define BTN_PIN 16   // button with external pull-up to 3V3, switch to GND

static void button_isr(uint gpio, uint32_t events) {
    if (gpio == BTN_PIN && (events & GPIO_IRQ_EDGE_FALL)) {
        gpio_xor_mask(1u << LED_PIN);
    }
    gpio_acknowledge_irq(gpio, events);  // clears the IRQ flag
}

int main(void) {
    stdio_init_all();

    // LED
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);
    gpio_put(LED_PIN, 0);

    // Button: input without internal pulls (uses the hardware's external pull-up)
    gpio_init(BTN_PIN);
    gpio_set_dir(BTN_PIN, GPIO_IN);
    gpio_disable_pulls(BTN_PIN);   // important: don't mix with an internal pull

    // Interrupt on falling edge
    gpio_set_irq_enabled_with_callback(BTN_PIN,
                                       GPIO_IRQ_EDGE_FALL,
                                       true,
                                       &button_isr);

    while (true) {
        tight_loop_contents();
    }
}
```

Video:

<!-- VIDEO_FALL: replace the "Video: pending" line above and/or insert here
     <video controls width="100%" src="../recursos/videos/practica4-fall.mp4"></video>
-->

### Open Question

The level-triggered versions can fire dozens of times a second just from the switch sitting in that level, which makes the LED look like it's blinking on its own instead of reacting to one action. Would debouncing even fix that, or does a level trigger fundamentally need to be swapped for an edge trigger (with debounce) to ever get a single, clean toggle per flip of the switch?
