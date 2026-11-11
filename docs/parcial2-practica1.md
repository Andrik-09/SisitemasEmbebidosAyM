# Repeating Timers — Periodic Toggling and Callback Timing

**Goal (one sentence):** Use the Pico SDK's repeating timer to toggle a pin from a callback instead of from the main loop, then check how the toggle interval and the callback's own duration show up on the output signal.

**Prediction — written before running anything:** Each callback flips the pin once, so one full period should take two callbacks: `TOGGLE_MS = 250` should give a 500 ms period (2 Hz), and 100, 50 and 10 should give 200 ms (5 Hz), 100 ms (10 Hz) and 20 ms (50 Hz), always at a 50 % duty cycle. In Part C, with a negative delay the timer counts from the start of one callback to the start of the next, so the period on `TEST_PIN` should stay the same no matter how long the callback works; with a positive delay it counts from the end of one callback to the start of the next, so any time spent in `busy_wait_us_32(WORK_US)` should be added to every interval and stretch the period.

---

### Setup

- Pin map: `TEST_PIN` = GPIO15 (output toggled by the timer callback), `CALLBACK_MARK_PIN` = GPIO14 (Part C only: high while the callback is running, low the rest of the time).
- Oscilloscope probe on the output pin, reading frequency, period and duty cycle.

### What I did

1. **Part A:** flashed the base code, which registers `timer_callback` with `add_repeating_timer_ms(-TOGGLE_MS, ...)` and leaves the main loop empty (`tight_loop_contents()`), so the pin is driven only by the timer.
2. **Part B:** changed `TOGGLE_MS` to 100, 50 and 10, reflashing each time and looking at the signal on the oscilloscope.
3. **Part C:** flashed the second program, which adds `CALLBACK_MARK_PIN` to mark how long the callback runs, `WORK_US` to make the callback take longer on purpose, and `USE_NEGATIVE_DELAY` to switch between a negative and a positive timer delay.

### What went wrong

- Nothing went wrong — this practice was only about checking the theory against the hardware, and everything we did was a test.

### Code

**Part A — Base code**

```c
#include "pico/stdlib.h"
#include "pico/time.h"

#define TEST_PIN   15
#define TOGGLE_MS  250

static repeating_timer_t timer;

static bool timer_callback(repeating_timer_t *rt) {
    static bool state = false;
    state = !state;
    gpio_put(TEST_PIN, state);
    return true;
}

int main() {
    gpio_init(TEST_PIN);
    gpio_set_dir(TEST_PIN, GPIO_OUT);
    gpio_put(TEST_PIN, 0);

    add_repeating_timer_ms(-TOGGLE_MS, timer_callback, NULL, &timer);

    while (true) {
        tight_loop_contents();
    }
}
```

**Part B — Changing the toggle interval**

Same code as Part A; only `TOGGLE_MS` changes, to 100, 50 and 10.

**Part C — Callback duration and delay sign**

```c
#include "pico/stdlib.h"
#include "pico/time.h"

#define TEST_PIN            15
#define CALLBACK_MARK_PIN   14
#define TIMER_DELAY_MS      100
#define WORK_US             0
#define USE_NEGATIVE_DELAY  1

static repeating_timer_t timer;

static bool timer_callback(repeating_timer_t *rt) {
    static bool state = false;

    gpio_put(CALLBACK_MARK_PIN, 1);

    state = !state;
    gpio_put(TEST_PIN, state);

    busy_wait_us_32(WORK_US);

    gpio_put(CALLBACK_MARK_PIN, 0);
    return true;
}

int main() {
    gpio_init(TEST_PIN);
    gpio_set_dir(TEST_PIN, GPIO_OUT);

    gpio_init(CALLBACK_MARK_PIN);
    gpio_set_dir(CALLBACK_MARK_PIN, GPIO_OUT);

    int32_t delay_ms = USE_NEGATIVE_DELAY ? -TIMER_DELAY_MS : TIMER_DELAY_MS;
    add_repeating_timer_ms(delay_ms, timer_callback, NULL, &timer);

    while (true) {
        tight_loop_contents();
    }
}
```

### Evidence

**Base code**

<video controls width="100%" src="../recursos/videos/parcial2-practica1-base.mp4"></video>

**Toggle a 1**

<video controls width="100%" src="../recursos/videos/parcial2-practica1-toggle-a-1.mp4"></video>

**Toggle 55**

<video controls width="100%" src="../recursos/videos/parcial2-practica1-toggle-55.mp4"></video>

**Toggle 10**

<video controls width="100%" src="../recursos/videos/parcial2-practica1-toggle-10.mp4"></video>

**Toggle 20**

<video controls width="100%" src="../recursos/videos/parcial2-practica1-toggle-20.mp4"></video>

**83 %**

<video controls width="100%" src="../recursos/videos/parcial2-practica1-83.mp4"></video>

### Open Question

With a negative delay the timer keeps the start-to-start interval fixed, but that only works while the callback finishes before the next one is due. If `WORK_US` were made longer than `TIMER_DELAY_MS`, would the SDK skip the missed callbacks, queue them and run them back to back, or let the period drift — and is there a way to detect that overrun from inside the callback itself?
