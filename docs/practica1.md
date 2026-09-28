# Practice 1

## Exercise 1 — Binary counter from 0 to 15

**Goal (one sentence):** Display a repeating 4-bit binary counter (0 to 15) on four LEDs wired to GPIO 2–5, writing directly to the SIO GPIO registers instead of `gpio_put`.

**Prediction — written before running anything:** With `sleep_ms(300)` per step and 16 steps, one full counting cycle should take 16 × 300 ms = 4.8 s before wrapping back to 0. The least significant bit (`PIN_A`, GPIO2) should toggle every step, while the most significant bit (`PIN_D`, GPIO5) should only turn on for counts 8–15 (8 steps = 2.4 s per cycle). Before counting starts, all four LEDs should stay on together for exactly 2 s, from `sio_hw->gpio_set = MASK;` followed by `sleep_ms(2000);` right after enabling the outputs.

---

### Setup

- Pin map: `PIN_A` = GPIO2 (bit 0, LSB), `PIN_B` = GPIO3 (bit 1), `PIN_C` = GPIO4 (bit 2), `PIN_D` = GPIO5 (bit 3, MSB). Each GPIO drives one LED with a series resistor to GND.
- Video:

<video controls width="100%" src="../recursos/videos/practica1-ejercicio1.mp4"></video>

### What I did

1. Wrote the program straight against the SDK's SIO registers (`hardware/structs/sio.h`) instead of `gpio_put`, after `gpio_init` on the four pins.
2. Wired four LEDs with series resistors on a breadboard, one per GPIO (2–5), with the Pico 2 on the same board.
3. Compiled and flashed the UF2 with BOOTSEL held, dragging it to the RPI-RP2 drive.
4. Powered the board and recorded the LED sequence on video to confirm the binary count.

### Code

```c
#include "pico/stdlib.h"
#include "hardware/structs/sio.h"

#define PIN_A 2
#define PIN_B 3
#define PIN_C 4
#define PIN_D 5

int main(void) {
    const uint32_t MASK =
        (1u << PIN_A) |
        (1u << PIN_B) |
        (1u << PIN_C) |
        (1u << PIN_D) ;

    gpio_init(PIN_A);
    gpio_init(PIN_B);
    gpio_init(PIN_C);
    gpio_init(PIN_D);

    sio_hw->gpio_oe_set = MASK;
    sio_hw->gpio_set = MASK;
    sleep_ms(2000);

    while (true) {

        for (int counter = 0; counter < 16; counter++) {
            sio_hw->gpio_clr = MASK;
            sio_hw->gpio_set = counter << PIN_A;
            sleep_ms(300);
        }

    }
}
```

---

## Exercise 2 — Light back and forth

**Goal (one sentence):** Move a single lit LED back and forth across four LEDs (GPIO 2–5) — a "Knight Rider" style chase — by shifting one bit at a time through the SIO register instead of chaining `gpio_put` calls.

**Prediction — written before running anything:** Six steps per full cycle (four going out from `PIN_A` to `PIN_D`, two coming back through `PIN_C` and `PIN_B`) at 300 ms each ⇒ 1.8 s per cycle. Only one LED should be lit at any instant; the two end LEDs (GPIO2 and GPIO5) should light once per cycle, while the two middle LEDs (GPIO3 and GPIO4) should light twice per cycle (once going out, once coming back), with the pattern never stalling or repeating the ends.

---

### Setup

- Pin map: `PIN_A` = GPIO2, `PIN_B` = GPIO3, `PIN_C` = GPIO4, `PIN_D` = GPIO5. Same wiring as Exercise 1: each GPIO to one LED with a series resistor to GND.
- Video:

<video controls width="100%" src="../recursos/videos/practica1-ejercicio2.mp4"></video>

### What I did

1. Reused the wiring from Exercise 1 and swapped in new firmware with two `for` loops: one counting up (0→3) to walk the light out, one counting down (2→0) to walk it back.
2. Compiled and flashed the UF2 the same way (BOOTSEL → drag to RPI-RP2).
3. Watched the LED move out from `PIN_A` to `PIN_D` and back, and recorded it on video.

### What went wrong

- First version: the return loop also counted **up** again instead of down, so after reaching `PIN_D` the light jumped straight back to `PIN_A` and restarted — it looked like a reset, not a bounce. Fixed by counting the second loop **down** (`for (int counter = 2; counter > 0; counter--)`), so it retraces `PIN_C` → `PIN_B` before the forward pass starts again.

### Code

```c
#include "pico/stdlib.h"
#include "hardware/structs/sio.h"

#define PIN_A 2
#define PIN_B 3
#define PIN_C 4
#define PIN_D 5

int main(void) {
    const uint32_t MASK =
        (1u << PIN_A) |
        (1u << PIN_B) |
        (1u << PIN_C) |
        (1u << PIN_D) ;

    gpio_init(PIN_A);
    gpio_init(PIN_B);
    gpio_init(PIN_C);
    gpio_init(PIN_D);

    sio_hw->gpio_oe_set = MASK;
    sio_hw->gpio_set = MASK;
    sleep_ms(2000);

    while (true) {

        for (int counter = 0; counter < 4; counter++) {
            sio_hw->gpio_clr = MASK;
            sio_hw->gpio_set = (1 << counter) << PIN_A;
            sleep_ms(300);
        }

        for (int counter = 2; counter > 0; counter--) {
            sio_hw->gpio_clr = MASK;
            sio_hw->gpio_set = (1 << counter) << PIN_A;
            sleep_ms(300);
        }
    }
}
```
