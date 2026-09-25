# PRD & Guía de Implementación: Pixel Rush AI

**Evento:** Hackathon Nerdearla Showcase (Webflow Cloud)
**Categoría Objetivo:** Mejor del Show (1er Lugar) / Mejor Tech / Mejor Diseño
**Duración por Partida:** 3 - 5 minutos (Rondas rápidas de 15 segundos)
**Integrantes:** Product Designer + AI / Fullstack Engineer

## 1. Concepto del Juego

**Pixel Rush AI** es un juego de agilidad visual, reflejos y cultura pop. Los jugadores deben adivinar imágenes icónicas (memes, personajes, cultura dev, monumentos surrealistas) mientras una IA las des-zoomea y des-pixela progresivamente en tiempo real mediante llamadas al **MCP de Webflow**.

El jugador puede presionar un botón gigante de **PAUSA / ADIVINAR** en cualquier momento. Al pausar, el tiempo se detiene y se despliegan 4 opciones de respuesta rápida. Entre más rápido adivine con la imagen zoomeada/pixelada, mayor será el puntaje obtenido.

## 2. Roles y División de Trabajo (Sprint de 18 Horas)

| Área / Rol | Responsabilidades Principales | Entregables Clave |
| --- | --- | --- |
| **Product Designer** | Diseño de UI/UX en Figma y maquetación en Webflow.<br>Layout responsive (Mobile & Desktop).<br>Sistema de feedback visual (Confeti, flashes, temporizador circular).<br>Curaduría visual de las categorías (Memes, Pop Culture, Tech). | Componentes UI en Webflow.<br>Páginas: Landing/Inicio, Canvas de Juego, Modal de Victoria/Derrota.<br>Microinteracciones y animaciones CSS/Webflow. |
| **AI Engineer / Fullstack** | Integración con Webflow Cloud API & Webflow MCP.<br>Agente de IA para selección/generación de imágenes y opciones falsas (distractores).<br>Lógica de cronómetro, estado del juego y cálculo de puntaje.<br>Deploy y configuración del pipeline. | Backend de procesamiento de imágenes y MCP.<br>Lógica de interacción en tiempo real.<br>URL pública lista en Webflow Cloud. |

## 3. Arquitectura Técnica e Integración MCP

Para deslumbrar al jurado de Webflow, la interacción entre el motor de juego y la canvas de Webflow se gestiona a través del **Webflow MCP (Model Context Protocol)** y estilos CSS dinámicos.

### Flujo de Control del MCP

1. **Inicio de Ronda:** La IA selecciona la imagen objetivo y genera 3 opciones distractoras usando el LLM.
2. **Inyección MCP:** El agente inyecta la URL de la imagen y los textos de las 4 opciones dentro del CMS o componentes del DOM de Webflow mediante el MCP.
3. **Efecto Visual Progresivo:** El juego aplica variables CSS dinámicas (`--zoom-level` y `--blur-level`) que van descendiendo de forma continua.
4. **Pausa & Elección:** Al presionar PAUSA, el MCP congela las variables visuales y habilita la selección de respuesta.

```javascript
// Pseudo-código de interacción MCP / Webflow State
async function triggerRoundStart(roundData) {
  await webflowMCP.updateElement({
    elementId: 'game-image-target',
    attributes: {
      'src': roundData.imageUrl,
      'style': 'transform: scale(4); filter: blur(20px); transition: all 15s linear;'
    }
  });

  await webflowMCP.updateCMSCollection('Options', roundData.choices);
}
```

## 4. Mecánica del Juego y Sistema de Puntaje

### Estructura de la Partida

- **Total de Rondas:** 5 rondas por partida.
- **Duración de Ronda:** 15 segundos máximo por imagen.
- **Opciones:** 4 alternativas (1 correcta, 3 generadas por IA como distractores).

### Matriz de Puntaje

| Tiempo de Respuesta | Nivel de Revelado / Zoom | Puntaje Base |
| --- | --- | --- |
| 0.0s - 3.0s | Zoom 4x / Blur Alto (Casi irreconocible) | 1,000 pts (¡Brillante!) |
| 3.1s - 7.0s | Zoom 2.5x / Blur Medio | 700 pts |
| 7.1s - 12.0s | Zoom 1.5x / Blur Bajo | 400 pts |
| 12.1s - 15.0s | Imagen Completa | 100 pts |
| Sin respuesta / Incorrecto | N/A | 0 pts |

## 5. Roadmap de Implementación (Cronograma de 18 Horas)

### Bloque 1: Setup y MVP Lógico (Horas 0 - 4)

- **Designer:** Maquetar el layout principal en Webflow (Contenedor de imagen, botón gigante de PAUSA, grilla de 4 opciones, header con score y timer).
- **Dev:** Configurar el entorno en Webflow Cloud, autenticación con GitHub y prueba de concepto del MCP de Webflow modificando clases CSS en vivo.

### Bloque 2: Integración IA & Conexión MCP (Horas 4 - 10)

- **Designer:** Armar estilos de modales (Win/Loss), animaciones de conteo regresivo y pulido tipográfico/colorimetría.
- **Dev:** Conectar el LLM para generar las 3 opciones falsas a partir de la imagen elegida. Crear la función del temporizador que actualiza los filtros CSS.

### Bloque 3: Ensamble, UI/UX Polish y Audio (Horas 10 - 15)

- **Unión de partes:** Conectar el botón de PAUSA con la interrupción del timer y despliegue de las opciones.
- **Polish de UX:** Agregar efectos de sonido (clic, victoria, derrota), partículas/confeti en respuestas correctas y feedback visual instantáneo.

### Bloque 4: Testing, Deploy y Entrega (Horas 15 - 18)

- Probar la app en dispositivos móviles y desktops.
- Verificar que la URL pública en Webflow Cloud funcione sin errores.
- Enviar la URL antes del cierre oficial (18:00 hs).
