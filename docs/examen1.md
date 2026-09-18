# Examen 1er Parcial

```c
/* ==========================================================================
   STACKER 5 x 4  -  Raspberry Pi Pico 2

   --------------------------------------------------------------------------
   MAPA DE PINES
   --------------------------------------------------------------------------
   Señal   GPIO  Dirección  Pull             Propósito
   L1C0     0    salida     deshabilitado    Nivel 1 (abajo), columna 0 (izq)
   L1C1     1    salida     deshabilitado    Nivel 1, columna 1
   L1C2     2    salida     deshabilitado    Nivel 1, columna 2
   L1C3     3    salida     deshabilitado    Nivel 1, columna 3 (der)
   L2C0     4    salida     deshabilitado    Nivel 2, columna 0
   L2C1     5    salida     deshabilitado    Nivel 2, columna 1
   L2C2     6    salida     deshabilitado    Nivel 2, columna 2
   L2C3     7    salida     deshabilitado    Nivel 2, columna 3
   L3C0     8    salida     deshabilitado    Nivel 3, columna 0
   L3C1     9    salida     deshabilitado    Nivel 3, columna 1
   L3C2    10    salida     deshabilitado    Nivel 3, columna 2
   L3C3    11    salida     deshabilitado    Nivel 3, columna 3
   L4C0    12    salida     deshabilitado    Nivel 4, columna 0
   L4C1    13    salida     deshabilitado    Nivel 4, columna 1
   L4C2    14    salida     deshabilitado    Nivel 4, columna 2
   L4C3    15    salida     deshabilitado    Nivel 4, columna 3
   L5C0    16    salida     deshabilitado    Nivel 5 (arriba), columna 0
   L5C1    17    salida     deshabilitado    Nivel 5, columna 1
   L5C2    18    salida     deshabilitado    Nivel 5, columna 2
   L5C3    19    salida     deshabilitado    Nivel 5, columna 3
   BTN_STP 20    entrada    pull-up interno  Botón STOP, a GND, IRQ flanco de bajada
   BTN_RST 21    entrada    pull-up interno  Botón RESTART, a GND, IRQ flanco de bajada

   Conexión de cada LED:  GPIO --- R 220 ohm --- ánodo LED --- cátodo --- GND
   Conexión de cada botón: GPIO --- botón --- GND  (pull-up interno activado)

   --------------------------------------------------------------------------
   CÁLCULO DE LAS RESISTENCIAS (220 ohm, una por LED)
   --------------------------------------------------------------------------
   Datos:
     Vcc (salida del GPIO en alto) = 3.3 V
     Vf  (caída directa del LED rojo) = 2.0 V
     R   = 220 ohm

   Ley de Ohm sobre la resistencia:
     V_R = Vcc - Vf = 3.3 - 2.0 = 1.3 V
     I   = V_R / R  = 1.3 / 220 = 0.0059 A = 5.9 mA por LED

   Potencia disipada:
     P_R   = I^2 * R = (0.0059)^2 * 220 = 7.7 mW   (resistencia de 1/4 W: sobra)
     P_LED = Vf * I  = 2.0 * 0.0059     = 11.8 mW

   Peor caso de consumo (los 20 LEDs encendidos en el parpadeo de victoria):
     I_total = 20 * 5.9 mA = 118 mA
   El riel de 3V3 de la Pico 2 entrega bastante más que eso, así que es seguro.


   --------------------------------------------------------------------------
   MAPEO DE BITS
   --------------------------------------------------------------------------
   El tablero completo son 20 bits dentro de un solo uint32_t:
     bit = 4 * nivel + columna      (nivel 0 = abajo, columna 0 = izquierda)
   El bit N está cableado al GPIO N.
     Nivel 1 -> bits 0-3     Nivel 2 -> bits 4-7     Nivel 3 -> bits 8-11
     Nivel 4 -> bits 12-15   Nivel 5 -> bits 16-19
   Patrón inicial del nivel 1: 0b0011 (columnas 0 y 1).
   ========================================================================== */

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

// Velocidad fija de cada nivel, en milisegundos por paso
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
        // Cada vuelta de este while es una partida nueva
        flag_rst  = false;
        flag_stop = false;

        uint32_t tablero   = 0;
        uint32_t sobrevive = PATRON_INICIAL;
        int estado = JUGANDO;

        mostrar(tablero);

        // Un ciclo por nivel: nivel 0 = fila de abajo, nivel 4 = fila de arriba
        for (int nivel = 0; nivel < NIVELES; nivel++) {
            uint32_t patron = sobrevive;
            uint32_t hueco;
            int desp = COLUMNAS * nivel;
            int direccion = 1;
            int velocidad;

            hueco = MASCARA_NIVEL << desp;

            // Velocidad fija que le toca a este nivel
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

            // Loop de movimiento de este nivel: se repite hasta que llega STOP
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

        // Victoria o derrota: parpadea hasta que presionen RESTART
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
