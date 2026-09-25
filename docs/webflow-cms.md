# Webflow CMS: Pixel Rush

Sitio: `Pixel Rush` (`6ab67289a2a8f7482185d627`)
Colección: `Challenges` (`6ab675fc3256ae2be2c803b5`)

La colección fue creada mediante Webflow MCP el 25 de septiembre de 2026. Su esquema se verificó leyendo los detalles de la colección.

| Campo | Slug | Tipo | Uso |
| --- | --- | --- | --- |
| Nombre | `name` | Texto | Identificador legible para editores |
| Slug | `slug` | Texto | URL/identificador en Webflow |
| Imagen | `imagen` | Imagen | Imagen que se revela durante la ronda |
| Categoría | `categoria` | Texto | Una de: `Logos & Tech`, `Cultura Arg`, `Pelis & Series`, `Memes de Internet`, `Fútbol` (acepta alias, ver `src/lib/game/categories.ts`). Cada categoría necesita 5 desafíos activos para poder elegirse |
| Opción A | `opcion-a` | Texto | Respuesta visible |
| Opción B | `opcion-b` | Texto | Respuesta visible |
| Opción C | `opcion-c` | Texto | Respuesta visible |
| Opción D | `opcion-d` | Texto | Respuesta visible |
| Respuesta correcta | `respuesta-correcta` | Texto | Una letra: `A`, `B`, `C` o `D` |
| Activa | `activa` | Switch | Solo las rondas activas entran en partidas |

Se importaron cinco desafíos de memes y cultura dev desde [content/challenges-memes-dev.csv](../content/challenges-memes-dev.csv) y se publicaron inicialmente. La importación solo completó nombre e imagen; categoría, cuatro opciones y respuesta correcta se corrigieron mediante MCP el 25/09/2026, y después se publicaron mediante la Data API. Los cinco ítems están publicados, activos y completos. Se comprobó una partida Webflow de cinco rondas con 5000 puntos. El backend debe leer `respuesta-correcta` solo en el servidor; nunca enviarla al navegador antes de responder.

El MCP está autorizado para esta sesión de desarrollo. La app de Webflow Cloud necesita su propia credencial para leer el CMS: crear un Site Token con alcance `cms:read` y guardarlo como secreto `WEBFLOW_SITE_TOKEN` en Cloud. El token no debe guardarse en Git ni pasarse al cliente.
