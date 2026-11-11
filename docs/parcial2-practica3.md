# PWM — Piano with a Buzzer

**Goal (one sentence):** Build an eight-key piano on the Pico 2 where each button plays one note of the scale on a buzzer, using PWM to set the frequency of the sound and two extra buttons to raise or lower the volume.

**Prediction — written before running anything:** The PWM counter wraps at `TOP + 1` = 4096 counts, so the output frequency is `f_clk / (div × 4096)`; solving for the divider with `div = f_clk / (frec × (TOP + 1))` should make the buzzer play exactly the frequency of the key being pressed, and releasing every key should set the level to 0 and silence it. The volume only changes the duty cycle, `(TOP + 1) × volumen / (2 × VOL_MAX)`, so with `VOL_MAX = 10` each press of `UP` or `DWN` should move it in 5 % steps, from 0 % up to a maximum of 50 %, without changing the note.

---

### Setup

- Simulated in Wokwi on a Raspberry Pi Pico 2.
- Pin map: the eight keys `DO1`, `RE`, `MI`, `FA`, `SOL`, `LA`, `SI`, `DO2` = GPIO2–GPIO9; buzzer `BUZZ` = GPIO10 (PWM); volume buttons `UP` = GPIO11 and `DWN` = GPIO12. All buttons use the internal pull-down (`gpio_pull_down`), so a pressed button reads 1.
- PWM: `TOP` = 4095, system clock taken as 150 MHz, volume from 0 to `VOL_MAX` = 10 (starting at 5).

### What I did

1. Set the ten buttons as inputs with pull-down and put GPIO10 in PWM mode, getting its slice and channel with `pwm_gpio_to_slice_num` and `pwm_gpio_to_channel`.
2. Configured the slice with `pwm_set_wrap(slice, TOP)` and an initial divider, started it at level 0, and added a one-second test note (523.25 Hz at 50 % duty) when the program starts, to check that the buzzer responds.
3. In the main loop, read the eight keys in order and assigned the frequency of the first one pressed.
4. Read `UP` and `DWN` to change `volumen` between 0 and `VOL_MAX`, with a 200 ms pause so one press counts once.
5. When a key is pressed, recalculated the divider from that frequency with `pwm_set_clkdiv` and set the level from the volume with `pwm_set_chan_level`; with no key pressed, set the level to 0.
6. Ran the simulation and pressed each key and the volume buttons, watching the volume, level and duty cycle printed on the serial monitor.

### What went wrong

- At first the key buttons did not send any signal to the buzzer: when the simulation started, the only sound was the initial beep. The frequency signal was not set correctly; we fixed it at the end by sending the frequency signal properly, and after that the keys reached the buzzer.

### Code

```c
#include "pico/stdlib.h"
#include "hardware/pwm.h"
#include "hardware/clocks.h" // only if using
 
#define DO1 2    // "do" es palabra reservada en C
#define RE  3
#define MI  4
#define FA  5
#define SOL 6
#define LA  7
#define SI  8
#define DO2 9    // Do agudo
 
#define BUZZ 10
 
#define UP  11
#define DWN 12
 
#define TOP 4095
#define VOL_MAX 10
 
int main() {
    stdio_init_all();
 
    gpio_init(DO1);
    gpio_set_dir(DO1, GPIO_IN);
    gpio_pull_down(DO1);
 
    gpio_init(RE);
    gpio_set_dir(RE, GPIO_IN);
    gpio_pull_down(RE);
 
    gpio_init(MI);
    gpio_set_dir(MI, GPIO_IN);
    gpio_pull_down(MI);
 
    gpio_init(FA);
    gpio_set_dir(FA, GPIO_IN);
    gpio_pull_down(FA);
 
    gpio_init(SOL);
    gpio_set_dir(SOL, GPIO_IN);
    gpio_pull_down(SOL);
 
    gpio_init(LA);
    gpio_set_dir(LA, GPIO_IN);
    gpio_pull_down(LA);
 
    gpio_init(SI);
    gpio_set_dir(SI, GPIO_IN);
    gpio_pull_down(SI);
 
    gpio_init(DO2);
    gpio_set_dir(DO2, GPIO_IN);
    gpio_pull_down(DO2);
 
    gpio_init(UP);
    gpio_set_dir(UP, GPIO_IN);
    gpio_pull_down(UP);
 
    gpio_init(DWN);
    gpio_set_dir(DWN, GPIO_IN);
    gpio_pull_down(DWN);
 
    gpio_set_function(BUZZ, GPIO_FUNC_PWM);
    uint slice = pwm_gpio_to_slice_num(BUZZ);
    uint chan = pwm_gpio_to_channel(BUZZ);
 
    // Compute the divider
    float f_clk = 150000000.0f; // 150 MHz
    // Or
    // float f_clk = clock_get_hz(clk_sys);
    float div = 10;
    pwm_set_clkdiv(slice, div);
    pwm_set_wrap(slice, TOP);
 
    pwm_set_chan_level(slice, chan, 0);
    pwm_set_enabled(slice, true);
 
    // Prueba del buzzer: Do agudo durante 1 segundo al encender
    div = f_clk / (523.25f * (TOP + 1));
    pwm_set_clkdiv(slice, div);
    pwm_set_chan_level(slice, chan, (TOP + 1) / 2);
    sleep_ms(1000);
    pwm_set_chan_level(slice, chan, 0);
 
    int volumen = 5;
 
    while (true) {
 
        float frec = 0;
 
        if (gpio_get(DO1))      frec = 1046.50f;  // Do
        else if (gpio_get(RE))  frec = 1174.66f;  // Re
        else if (gpio_get(MI))  frec = 1318.51f;  // Mi
        else if (gpio_get(FA))  frec = 1396.91f;  // Fa
        else if (gpio_get(SOL)) frec = 1567.98f;  // Sol
        else if (gpio_get(LA))  frec = 1760.00f;  // La
        else if (gpio_get(SI))  frec = 1975.53f;  // Si
        else if (gpio_get(DO2)) frec = 2093.00f;  // Do agudo
 
        if (gpio_get(UP) && volumen < VOL_MAX) {
            volumen++;
            sleep_ms(200);  
        }
        if (gpio_get(DWN) && volumen > 0) {
            volumen--;
            sleep_ms(200);   
        }
 
        if (frec > 0) {
           
            div = f_clk / (frec * (TOP + 1));
            pwm_set_clkdiv(slice, div);
 
            // volumen 10 = 50% (maximo)
            float nivel = (TOP + 1) * volumen / (2 * VOL_MAX);
            pwm_set_chan_level(slice, chan, nivel);
        } else {
            pwm_set_chan_level(slice, chan, 0);   // Sin boton = silencio
        }
 
        sleep_ms(10);
    }
}
```

### Evidence

Wokwi simulation of the piano. The serial monitor shows the volume, the PWM level and the duty cycle each time `UP` or `DWN` is pressed.

<video controls width="100%" src="../recursos/videos/parcial2-practica3-piano.mp4"></video>

### Open Question

The volume is set only by the duty cycle, but a buzzer driven by a square wave changes its timbre as the duty cycle moves away from 50 %, not just its loudness. Is changing the duty cycle really controlling the volume, or mostly the shape of the sound — and would something like scaling the supply to the buzzer, or a filtered PWM, give a cleaner volume control?
