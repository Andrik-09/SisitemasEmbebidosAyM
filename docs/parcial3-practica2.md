# I2C — Reading a Real-Time Clock and an MPU6050 on One Bus

**Goal (one sentence):** Use the Pico 2's I2C bus (Inter-Integrated Circuit) to talk to two devices on the same two wires — a DS1307 real-time clock and an MPU6050 accelerometer and gyroscope — and print the time and the sensor readings once per second.

**Prediction — written before running anything:** I2C shares one data line and one clock line between every device, so each one has to answer to its own address. The DS1307's address is fixed at 0x68, the same as the MPU6050's default, so the MPU6050 has to be moved to 0x69 by pulling its AD0 pin high; otherwise the two would answer at the same time. The MPU6050 also starts in sleep mode, so nothing useful should come out of it until its power register is written. Once it is awake, the printed values should follow the simulator's sliders: acceleration in g, rotation in degrees per second and temperature in °C, with the clock counting up one second per line.

---

### Setup

- Simulated in Wokwi on a Raspberry Pi Pico 2.
- Bus: `i2c0` at 100 kHz, `SDA_PIN` = GP4, `SCL_PIN` = GP5, with the Pico's internal pull-ups enabled on both lines.
- Devices on the same bus: DS1307 RTC at `RTC_ADDR` = 0x68, and MPU6050 at `MPU_ADDR` = 0x69 (its AD0 pin tied to VCC). Both powered from the Pico and sharing ground.

### What I did

1. Configured GP4 and GP5 as I2C pins and started `i2c0` at 100 kHz.
2. Wrote two helper functions on top of the SDK: `escribir_registro`, which sends a register number and a value in one transfer, and `leer_registros`, which sends the register number and then reads a block of bytes back. Both check how many bytes actually went through and print an error with the device address if the transfer failed or was partial.
3. Woke the MPU6050 by writing `0x00` to its power management register (`0x6B`).
4. Read the time from the RTC's first three registers and converted them from BCD to decimal.
5. Read the MPU6050's 14 data registers starting at `0x3B` in a single transfer, joined each pair of bytes into a signed 16-bit value, and scaled them to g, °C and °/s.
6. Printed the time and the three readings every second, then moved the MPU6050's acceleration, rotation and temperature sliders in the simulator to watch the values change.

### What went wrong

- The only problem was in the connections: we wired the devices wrong at first. The code itself was fine and worked as expected once everything was connected correctly.

### Code — key parts

The full program is about 130 lines, many of them error checks. These are the parts that do the I2C work.

**Bus setup and addresses.** Both devices share `i2c0`; only their addresses tell them apart.

```c
#define I2C_PORT    i2c0
#define SDA_PIN     4
#define SCL_PIN     5
#define RTC_ADDR    0x68
#define MPU_ADDR    0x69
```

```c
    i2c_init(I2C_PORT, 100000);
    gpio_set_function(SDA_PIN, GPIO_FUNC_I2C);
    gpio_set_function(SCL_PIN, GPIO_FUNC_I2C);
    gpio_pull_up(SDA_PIN);
    gpio_pull_up(SCL_PIN);
```

**Writing a register — waking the MPU6050.** The register number and its new value travel together in one write. Writing `0x00` to register `0x6B` takes the MPU6050 out of sleep mode.

```c
    uint8_t memory[2];
    memory[0] = reg;
    memory[1] = value;

    int w = i2c_write_blocking(I2C_PORT, addr, memory, sizeof(memory), false);
```

```c
    if (escribir_registro(MPU_ADDR, 0x6B, 0x00)) {
        printf("MPU6050 listo\n");
    }
```

**Reading registers.** First the register number is written with the last argument set to `true`, so the Pico keeps control of the bus instead of sending a stop; the read that follows then starts from that register. Error checks between the two calls are left out here.

```c
    int w = i2c_write_blocking(I2C_PORT, addr, &reg, 1, true);

    int r = i2c_read_blocking(I2C_PORT, addr, memory, len, false);
```

**Turning MPU6050 bytes into units.** Each measurement arrives as a high byte and a low byte. They are joined into a signed 16-bit value and divided by the sensor's scale factor: 16384 per g at ±2 g, 131 per °/s at ±250 °/s, and the datasheet's formula for temperature.

```c
    int16_t ax_raw   = (memory[0] << 8)  | memory[1];
```

```c
    *ax = ax_raw / 16384.0f;
    *ay = ay_raw / 16384.0f;
    *az = az_raw / 16384.0f;

    *temp = temp_raw / 340.0f + 36.53f;

    *gx = gx_raw / 131.0f;
    *gy = gy_raw / 131.0f;
    *gz = gz_raw / 131.0f;
```

**Reading the clock.** The DS1307 stores each digit pair in BCD: the tens in the upper four bits and the units in the lower four. The masks drop the bits that are not part of the time (the clock-halt bit in the seconds and the 12/24-hour bits in the hours).

```c
uint8_t bcd_a_decimal(uint8_t valor) {
    return ((valor >> 4) * 10) + (valor & 0x0F);
}
```

```c
    *segundo = bcd_a_decimal(memory[0] & 0x7F);
    *minuto  = bcd_a_decimal(memory[1]);
    *hora    = bcd_a_decimal(memory[2] & 0x3F);
```

### Evidence

Wokwi simulation of both devices on the bus. The serial monitor prints the time every second and the MPU6050 readings follow the sliders: with acceleration at 0.95 g, rotation at 67, 52 and −84 °/s and temperature at 21.3 °C, the program prints `X=0.95`, `X=67.00  Y=52.00  Z=-84.00` and `21.30 C`.

<video controls width="100%" src="../recursos/videos/parcial3-practica2-i2c.mp4"></video>

### Open Question

Every second the program reads 14 bytes from the MPU6050 and 3 from the RTC at 100 kHz. Roughly how much of that second is the bus actually busy — and if more devices were added, or the readings were needed much faster, at what point would moving the bus to 400 kHz, or reading the MPU6050 only when its data-ready interrupt fires, start to matter?
