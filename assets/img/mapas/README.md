# Mapas de las campañas

Acá van las imágenes de los mapas que usa el grupo. La galería aparece dentro de cada
campaña (Campañas → *Ver más* → sección **Mapas**).

## Cómo agregar un mapa

1. **Subí la imagen** a esta carpeta, idealmente en una subcarpeta por campaña. Ejemplo:

   ```
   assets/img/mapas/echoes-first-call/mapa-region-inicial.jpg
   assets/img/mapas/echoes-first-call/mazmorra-del-eco.png
   ```

   - Formatos: `.jpg`, `.png` o `.webp`.
   - Nombres sin espacios ni acentos (usá guiones): `mapa-puerto-norte.jpg`.
   - Tamaño recomendado: lado largo ≤ 2000 px para que el repo no se infle.

2. **Enlazá la imagen** en `content/site-data.js`, dentro de la campaña, en su lista `maps`:

   ```javascript
   maps: [
     { img: "assets/img/mapas/echoes-first-call/mapa-region-inicial.jpg", title: "Región inicial" },
     { img: "assets/img/mapas/echoes-first-call/mazmorra-del-eco.png", title: "Mazmorra del Eco" },
   ],
   ```

3. Guardá y pusheá. La galería se arma sola (miniaturas que se abren en grande al hacer clic).

> Nota: GitHub Pages sirve las imágenes tal cual. Para mapas interactivos en vivo (fog of
> war, tokens) está la **Sala de Mapas**: https://lodte-sala-de-mapas.onrender.com/
