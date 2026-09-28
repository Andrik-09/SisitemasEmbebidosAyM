# Práctica 1

## Ejercicio 1 — Contador binario del 0 al 15

**Goal (one sentence):** Mostrar un contador binario de 4 bits (0 a 15) en cuatro LEDs conectados a GPIO 2–5, escribiendo directamente en los registros SIO en vez de usar `gpio_put`.

**Prediction — written before running anything:** Con `sleep_ms(300)` por paso y 16 pasos, un ciclo completo de conteo debería tardar 16 × 300 ms = 4.8 s antes de reiniciarse en 0; el bit menos significativo (`PIN_A`, GPIO2) debería alternar en cada paso, mientras que el bit más significativo (`PIN_D`, GPIO5) solo debería encenderse durante las cuentas 8–15 (8 pasos = 2.4 s por ciclo). Antes de empezar a contar, los cuatro LEDs deberían encender juntos durante exactamente 2 s, por el `sio_hw->gpio_set = MASK;` seguido de `sleep_ms(2000);` justo después de habilitar las salidas.

---

### Setup

- Pin map: `PIN_A` = GPIO2 (bit 0, LSB), `PIN_B` = GPIO3 (bit 1), `PIN_C` = GPIO4 (bit 2), `PIN_D` = GPIO5 (bit 3, MSB). Cada GPIO va a un LED con su resistencia en serie hacia GND.
- Video: _pendiente — se agregará en cuanto se envíe._
- Foto de la señal: _pendiente — se agregará en cuanto se envíe._

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

<!-- VIDEO_EJERCICIO_1: reemplazar el bullet "Video: pendiente" de arriba y/o insertar aquí
     <video controls width="100%" src="../recursos/videos/practica1-ejercicio1.mp4"></video>
     y la foto de la señal como
     <img src="../recursos/imgs/practica1-ejercicio1-senal.jpg" alt="Señal capturada del contador binario">
-->

---

## Ejercicio 2 — Luz ida y vuelta

**Goal (one sentence):** Mover un solo LED encendido de ida y vuelta a través de cuatro LEDs (GPIO 2–5) — un patrón tipo "Knight Rider" — desplazando un bit a la vez en el registro SIO en vez de encadenar llamadas a `gpio_put`.

**Prediction — written before running anything:** Seis pasos por ciclo completo (cuatro de ida, de `PIN_A` a `PIN_D`, y dos de vuelta, por `PIN_C` y `PIN_B`) a 300 ms cada uno ⇒ 1.8 s por ciclo. En todo momento debería estar encendido un único LED; los dos LEDs de los extremos (GPIO2 y GPIO5) deberían encender una sola vez por ciclo, mientras que los dos LEDs de en medio (GPIO3 y GPIO4) deberían encender dos veces por ciclo (una de ida y otra de vuelta), sin que el patrón se detenga ni repita los extremos.

---

### Setup

- Pin map: `PIN_A` = GPIO2, `PIN_B` = GPIO3, `PIN_C` = GPIO4, `PIN_D` = GPIO5. Mismo cableado que el Ejercicio 1: cada GPIO a un LED con su resistencia en serie hacia GND.
- Video: _pendiente — se agregará en cuanto se envíe._

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

<!-- VIDEO_EJERCICIO_2: reemplazar el bullet "Video: pendiente" de arriba y/o insertar aquí
     <video controls width="100%" src="../recursos/videos/practica1-ejercicio2.mp4"></video>
-->
