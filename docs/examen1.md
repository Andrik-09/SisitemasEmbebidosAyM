# Examen 1er Parcial

```c
#include "pico/stdlib.h"
#include "hardware/gpio.h"

#define L1C0  0
#define L1C1  1
#define L1C2  2
#define L1C3  3
#define L2C0  4
#define L2C1  5
#define L2C2  6
#define L2C3  7
#define L3C0  8
#define L3C1  9
#define L3C2  10
#define L3C3  11
#define L4C0  12
#define L4C1  13
#define L4C2  14
#define L4C3  15
#define L5C0  16
#define L5C1  17
#define L5C2  18
#define L5C3  19

#define BTN_STP  20
#define BTN_RST  21

#define COLUMNAS        4
#define NIVELES         5
#define MASCARA_NIVEL   0xFu
#define PATRON_INICIAL  0b0011u

#define VEL_N1  320
#define VEL_N2  260
#define VEL_N3  200
#define VEL_N4  150
#define VEL_N5  100

#define ANTIRREBOTE_MS  200

#define JUGANDO  0
#define GANO     1
#define PERDIO   2

const uint32_t LED_MASK =
      1u << L1C0 | 1u << L1C1 | 1u << L1C2 | 1u << L1C3
    | 1u << L2C0 | 1u << L2C1 | 1u << L2C2 | 1u << L2C3
    | 1u << L3C0 | 1u << L3C1 | 1u << L3C2 | 1u << L3C3
    | 1u << L4C0 | 1u << L4C1 | 1u << L4C2 | 1u << L4C3
    | 1u << L5C0 | 1u << L5C1 | 1u << L5C2 | 1u << L5C3;

volatile bool flag_stop = false;
volatile bool flag_rst  = false;

static void button_isr(uint gpio, uint32_t events) {
    static uint32_t ultimo = 0;
    uint32_t ahora = to_ms_since_boot(get_absolute_time());

    if (ahora - ultimo < ANTIRREBOTE_MS) return;
    ultimo = ahora;

    if (gpio == BTN_STP) {
        flag_stop = true;
    }
    if (gpio == BTN_RST) {
        flag_rst = true;
    }
}

static void mostrar(uint32_t tablero) {
    sio_hw->gpio_set =  tablero & LED_MASK;
    sio_hw->gpio_clr = ~tablero & LED_MASK;
}

int main(void) {
    gpio_init(L1C0);  gpio_set_dir(L1C0, GPIO_OUT);  gpio_disable_pulls(L1C0);
    gpio_init(L1C1);  gpio_set_dir(L1C1, GPIO_OUT);  gpio_disable_pulls(L1C1);
    gpio_init(L1C2);  gpio_set_dir(L1C2, GPIO_OUT);  gpio_disable_pulls(L1C2);
    gpio_init(L1C3);  gpio_set_dir(L1C3, GPIO_OUT);  gpio_disable_pulls(L1C3);

    gpio_init(L2C0);  gpio_set_dir(L2C0, GPIO_OUT);  gpio_disable_pulls(L2C0);
    gpio_init(L2C1);  gpio_set_dir(L2C1, GPIO_OUT);  gpio_disable_pulls(L2C1);
    gpio_init(L2C2);  gpio_set_dir(L2C2, GPIO_OUT);  gpio_disable_pulls(L2C2);
    gpio_init(L2C3);  gpio_set_dir(L2C3, GPIO_OUT);  gpio_disable_pulls(L2C3);

    gpio_init(L3C0);  gpio_set_dir(L3C0, GPIO_OUT);  gpio_disable_pulls(L3C0);
    gpio_init(L3C1);  gpio_set_dir(L3C1, GPIO_OUT);  gpio_disable_pulls(L3C1);
    gpio_init(L3C2);  gpio_set_dir(L3C2, GPIO_OUT);  gpio_disable_pulls(L3C2);
    gpio_init(L3C3);  gpio_set_dir(L3C3, GPIO_OUT);  gpio_disable_pulls(L3C3);

    gpio_init(L4C0);  gpio_set_dir(L4C0, GPIO_OUT);  gpio_disable_pulls(L4C0);
    gpio_init(L4C1);  gpio_set_dir(L4C1, GPIO_OUT);  gpio_disable_pulls(L4C1);
    gpio_init(L4C2);  gpio_set_dir(L4C2, GPIO_OUT);  gpio_disable_pulls(L4C2);
    gpio_init(L4C3);  gpio_set_dir(L4C3, GPIO_OUT);  gpio_disable_pulls(L4C3);

    gpio_init(L5C0);  gpio_set_dir(L5C0, GPIO_OUT);  gpio_disable_pulls(L5C0);
    gpio_init(L5C1);  gpio_set_dir(L5C1, GPIO_OUT);  gpio_disable_pulls(L5C1);
    gpio_init(L5C2);  gpio_set_dir(L5C2, GPIO_OUT);  gpio_disable_pulls(L5C2);
    gpio_init(L5C3);  gpio_set_dir(L5C3, GPIO_OUT);  gpio_disable_pulls(L5C3);

    sio_hw->gpio_clr = LED_MASK;

    gpio_init(BTN_STP);
    gpio_set_dir(BTN_STP, GPIO_IN);
    gpio_pull_up(BTN_STP);

    gpio_init(BTN_RST);
    gpio_set_dir(BTN_RST, GPIO_IN);
    gpio_pull_up(BTN_RST);

    gpio_set_irq_enabled_with_callback(BTN_STP, GPIO_IRQ_EDGE_FALL, true, &button_isr);
    gpio_set_irq_enabled(BTN_RST, GPIO_IRQ_EDGE_FALL, true);

    while (true) {
        flag_rst  = false;
        flag_stop = false;

        uint32_t tablero   = 0;
        uint32_t sobrevive = PATRON_INICIAL;
        int estado = JUGANDO;

        mostrar(tablero);

        for (int nivel = 0; nivel < NIVELES; nivel++) {
            uint32_t patron = sobrevive;
            uint32_t hueco;
            int desp = COLUMNAS * nivel;
            int direccion = 1;
            int velocidad;

            hueco = MASCARA_NIVEL << desp;

            if (nivel == 0) {
                velocidad = VEL_N1;
            } else if (nivel == 1) {
                velocidad = VEL_N2;
            } else if (nivel == 2) {
                velocidad = VEL_N3;
            } else if (nivel == 3) {
                velocidad = VEL_N4;
            } else {
                velocidad = VEL_N5;
            }

            while (flag_stop == false && flag_rst == false) {
                tablero = (tablero & ~hueco) | (patron << desp);
                mostrar(tablero);
                sleep_ms(velocidad);

                if (flag_stop == true || flag_rst == true) {
                    break;
                }

                if (direccion > 0 && (patron & (1u << (COLUMNAS - 1)))) {
                    direccion = -1;
                } else if (direccion < 0 && (patron & 1u)) {
                    direccion = 1;
                }

                if (direccion > 0) {
                    patron = patron << 1;
                } else {
                    patron = patron >> 1;
                }

                patron = patron & MASCARA_NIVEL;
            }

            if (flag_rst == true) {
                break;
            }

            flag_stop = false;

            if (nivel == 0) {
                sobrevive = patron;
            } else {
                uint32_t abajo = (tablero >> (desp - COLUMNAS)) & MASCARA_NIVEL;
                sobrevive = patron & abajo;
            }

            tablero = (tablero & ~hueco) | (sobrevive << desp);
            mostrar(tablero);

            if (sobrevive == 0) {
                estado = PERDIO;
                break;
            }

            if (nivel == NIVELES - 1) {
                estado = GANO;
            }
        }

        while (estado != JUGANDO && flag_rst == false) {
            flag_stop = false;

            if (estado == GANO) {
                mostrar(LED_MASK);
                sleep_ms(120);
                mostrar(0);
                sleep_ms(120);
            } else {
                mostrar(tablero);
                sleep_ms(400);
                mostrar(0);
                sleep_ms(400);
            }
        }
    }
}
```

<video controls width="100%" src="../recursos/videos/examen1-stacker.mp4"></video>
