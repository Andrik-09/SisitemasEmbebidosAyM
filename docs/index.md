<div class="port-page" markdown>

<div class="hero" id="inicio">
  <div class="hero__photo" role="img" aria-label="Fotografía macro de un microcontrolador sobre una placa de circuito, representando los sistemas embebidos"></div>
  <div class="hero__scrim"></div>
  <div class="hero__content">
    <div class="hero__brand">
      <a class="hero__institution" href="https://www.iberopuebla.mx/" target="_blank" rel="noopener" title="Ir al sitio de la Universidad Iberoamericana Puebla">
        <img src="recursos/imgs/ibero.jpeg" alt="Universidad Iberoamericana Puebla">
      </a>
    </div>
    <p class="hero__eyebrow">Departamento de Ciencias e Ingenierías · Universidad Iberoamericana Puebla, México</p>
    <h1 class="hero__title">Portafolio de Actividades</h1>
    <p class="hero__subtitle">Sistemas Embebidos y Mecatrónica</p>
    <p class="hero__desc">
      Bitácora de las prácticas y proyectos desarrollados durante el semestre: proceso,
      herramientas utilizadas y aprendizajes obtenidos en cada actividad.
    </p>
    <p class="hero__credit">
      Foto: microcontrolador RP2350 en una Raspberry Pi Pico 2 ·
      <a href="https://commons.wikimedia.org/wiki/File:Macro_photograph_of_the_RP2350_microcontroller_on_a_Raspberry_Pi_Pico_2_board.jpg" target="_blank" rel="noopener">Fritzchens Fritz, Wikimedia Commons (CC0)</a>
    </p>
  </div>
</div>

<section class="section" id="equipo">
  <div class="section__header">
    <span class="section__kicker">Quiénes somos</span>
    <h2>Equipo</h2>
    <p>
      Esta página reúne el trabajo realizado en la materia de <strong>Sistemas Embebidos y
      Mecatrónica</strong>. Cada integrante documenta aquí sus prácticas, con el objetivo de
      reflejar los aprendizajes y soluciones aplicadas a distintos retos de la ingeniería.
    </p>
  </div>

  <div class="profiles">
    <article class="profile-card" style="--accent:#d62839">
      <div class="profile-card__avatar" aria-hidden="true">APL</div>
      <h3>Andrik Pérez Luna</h3>
      <p class="profile-card__role">Ingeniería Mecatrónica</p>
      <div class="profile-card__tags">
        <span class="tag">Ing. Mecatrónica</span>
      </div>
      <a class="profile-card__email" href="mailto:200851@iberopuebla.mx">
        <i class="fa-solid fa-envelope" aria-hidden="true"></i> 200851@iberopuebla.mx
      </a>
    </article>

    <article class="profile-card" style="--accent:#3a3a3a">
      <div class="profile-card__avatar" aria-hidden="true">MSA</div>
      <h3>Mauro David Sánchez Arenas</h3>
      <p class="profile-card__role">Ingeniería Mecatrónica</p>
      <div class="profile-card__tags">
        <span class="tag tag--alt">5.º semestre</span>
      </div>
      <a class="profile-card__email" href="mailto:202209@iberopuebla.mx">
        <i class="fa-solid fa-envelope" aria-hidden="true"></i> 202209@iberopuebla.mx
      </a>
    </article>
  </div>
</section>

<section class="section section--tinted" id="practicas">
  <div class="section__header">
    <span class="section__kicker">Bitácora</span>
    <h2>Reportes de Prácticas</h2>
    <p>
      Aquí se irán agregando, práctica por práctica, los reportes realizados en clase.
      Por ahora estas tarjetas son una plantilla base: se completarán con imagen,
      etiquetas, título y descripción conforme avance el semestre.
    </p>
  </div>

  <div class="practices-grid">
    <!--
      PLANTILLA DE TARJETA — copia este bloque para cada práctica nueva
      y sustituye imagen, etiquetas, título y descripción:

      <article class="practice-card">
        <div class="practice-card__image">
          <img src="recursos/imgs/NOMBRE_DE_LA_IMAGEN.jpg" alt="Descripción de la imagen">
        </div>
        <div class="practice-card__body">
          <div class="practice-card__tags">
            <span class="tag">Etiqueta 1</span>
            <span class="tag tag--alt">Etiqueta 2</span>
          </div>
          <h3>Práctica N: Título de la práctica</h3>
          <p>Breve descripción de qué se hizo, con qué herramientas y qué se aprendió.</p>
        </div>
      </article>
    -->

    <article class="practice-card">
      <div class="practice-card__image practice-card__image--empty">
        <i class="fa-solid fa-wave-square" aria-hidden="true"></i>
      </div>
      <div class="practice-card__body">
        <div class="practice-card__tags">
          <span class="tag">Registros SIO</span>
          <span class="tag tag--alt">Osciloscopio</span>
        </div>
        <h3>Práctica 1: SDK vs. registros</h3>
        <p>Comparación de la señal y la velocidad de ejecución entre <code>gpio_put</code> del SDK y escritura directa a registros SIO en GP18.</p>
        <a class="practice-card__link" href="practica2/">Ver documentación →</a>
      </div>
    </article>

    <article class="practice-card">
      <div class="practice-card__image practice-card__image--empty">
        <i class="fa-solid fa-microchip" aria-hidden="true"></i>
      </div>
      <div class="practice-card__body">
        <div class="practice-card__tags">
          <span class="tag">Registros SIO</span>
          <span class="tag tag--alt">GPIO</span>
        </div>
        <h3>Práctica 2: Contador binario y luz ida y vuelta</h3>
        <p>Dos ejercicios con GPIO 2–5 escritos directo a los registros SIO: contador binario del 0 al 15 y un LED que se mueve de ida y vuelta.</p>
        <a class="practice-card__link" href="practica1/">Ver documentación →</a>
      </div>
    </article>

    <article class="practice-card">
      <div class="practice-card__image practice-card__image--empty">
        <i class="fa-solid fa-code-branch" aria-hidden="true"></i>
      </div>
      <div class="practice-card__body">
        <div class="practice-card__tags">
          <span class="tag">Registros SIO</span>
          <span class="tag tag--alt">Session 5</span>
        </div>
        <h3>Práctica 3: AND, OR y XOR con dos botones</h3>
        <p>Tres compuertas lógicas de dos entradas implementadas en software, leyendo dos botones y encendiendo un LED directo desde el registro SIO.</p>
        <a class="practice-card__link" href="practica3/">Ver documentación →</a>
      </div>
    </article>

    <article class="practice-card">
      <div class="practice-card__image practice-card__image--empty">
        <i class="fa-solid fa-bolt" aria-hidden="true"></i>
      </div>
      <div class="practice-card__body">
        <div class="practice-card__tags">
          <span class="tag">GPIO IRQ</span>
          <span class="tag tag--alt">Interrupciones</span>
        </div>
        <h3>Práctica 4: HIGH, LOW, RISE y FALL</h3>
        <p>Los cuatro tipos de interrupción de GPIO probados con un dip switch y un LED, observando la diferencia entre disparo por nivel y por flanco.</p>
        <a class="practice-card__link" href="practica4/">Ver documentación →</a>
      </div>
    </article>

    <article class="practice-card">
      <div class="practice-card__image practice-card__image--empty">
        <i class="fa-solid fa-dice" aria-hidden="true"></i>
      </div>
      <div class="practice-card__body">
        <div class="practice-card__tags">
          <span class="tag">GPIO IRQ</span>
          <span class="tag tag--alt">Ruleta</span>
        </div>
        <h3>Práctica 5: Ruleta de 5 LEDs con interrupciones</h3>
        <p>Ruleta de 5 LEDs controlada por interrupciones: un botón detiene el recorrido y detecta si ganaste en el LED del medio, y otros dos suben o bajan la velocidad.</p>
        <a class="practice-card__link" href="practica5/">Ver documentación →</a>
      </div>
    </article>

    <article class="practice-card">
      <div class="practice-card__image practice-card__image--empty">
        <i class="fa-solid fa-microchip" aria-hidden="true"></i>
      </div>
      <div class="practice-card__body">
        <div class="practice-card__tags">
          <span class="tag">Examen</span>
          <span class="tag tag--alt">Pico 2</span>
        </div>
        <h3>Examen 1er Parcial: Stacker 5x4</h3>
        <p>Juego Stacker de 5 niveles con LEDs y botones por interrupción. Código completo y video de la demostración.</p>
        <a class="practice-card__link" href="examen1/">Ver código y video →</a>
      </div>
    </article>

    <div class="practice-card practice-card--add">
      <div class="practice-card__add-icon" aria-hidden="true">
        <i class="fa-solid fa-plus"></i>
      </div>
      <span>Nueva práctica<br>se agregará aquí</span>
    </div>
  </div>
</section>

</div>
