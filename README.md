# Colección MKT web

Aplicación web para gestionar tu colección de **Mario Kart Tour**: lleva el registro de pilotos, vehículos y alas que has obtenido, su nivel y puntos de habilidad, y consulta un ranking con los mejores elementos según los circuitos disponibles.

🔗 **Demo:** <https://coleccion-mkt-web.web.app/>

> ⚠️ **Estado del proyecto:** este proyecto ya no recibe mantenimiento activo. El código se conserva con fines de referencia y archivo. Las dependencias (Firebase 8.x, Bootstrap 4, jQuery) están desactualizadas y la web puede dejar de funcionar si los servicios externos cambian.

---

## Funcionalidades

- 🔐 Inicio de sesión con Google (Firebase Auth).
- 🗂️ Colección personal de **pilotos**, **vehículos** y **alas** con nivel y puntos de habilidad, sincronizada en Firestore.
- 🏆 Vista de **ranking** con filtros (por circuito, excluir elementos no obtenidos, etc.) que sugiere la mejor opción disponible.
- 🔄 Sincronización no agresiva: los cambios se guardan tras un breve periodo de inactividad.
- 📜 Changelog accesible desde la propia app.

## Stack técnico

Es un sitio **estático** (sin paso de build, sin `node_modules`) servido por Firebase Hosting:

| Categoría        | Herramienta                                                         |
| ---------------- | ------------------------------------------------------------------- |
| UI               | Bootstrap 4, [BLK Design System React](https://demos.creative-tim.com/blk-design-system-react/) (tema CSS), Font Awesome |
| Lógica cliente   | jQuery 3                                                            |
| Backend          | [Firebase](https://firebase.google.com/) — Auth, Firestore, Hosting, Analytics |
| Datos del juego  | [Sheetrock](https://chriszarate.github.io/sheetrock/) (lectura de Google Sheets como BD) |
| Caché local      | [Lovefield](https://github.com/google/lovefield) (BD relacional en el navegador), [Lazysizes](https://github.com/aFarkas/lazysizes) (lazy load de imágenes) |

Las imágenes proceden de la [wiki de Mario Kart Tour](https://www.mariowiki.com/Gallery:Mario_Kart_Tour_sprites_and_models) y de Firebase Storage.

## Estructura del repositorio

```
src/                           Sitio estático (lo que se sirve)
  index.html                   Layout principal + modales (changelog, detalles, menú)
  login.html                   Pantalla de inicio de sesión con Google
  collection.html              Vista parcial: colección del usuario
  ranking.html                 Vista parcial: ranking con filtros
  css/                         Tema BLK + estilos propios (style.css)
  js/
    main.js                    Bootstrap de la app, Firebase, sync, helpers
    login.js                   Flujo de auth con Google
    collection.js              Lógica de la vista de colección
    ranking.js                 Lógica de la vista de ranking
    lovefield.min.js           BD local
    lazysizes.min.js           Lazy load de imágenes
  raw/changelog.json           Registro de cambios mostrado en la app
firebase.json                  Configuración de Firebase Hosting
firebase_config.json           Config del SDK web de Firebase (apiKey, etc.)
firebase_config_json.base64    La misma config codificada en base64 (la usa login.js)
```

> **Nota:** `firebase.json` apunta a `dist/` como carpeta pública; antes del despliegue se generaba una versión minificada de `src/` en `dist/`. Puedes desplegar directamente `src/` cambiando `"public": "dist"` por `"public": "src"`.

## Configuración local

La configuración del SDK web de Firebase **no es secreta** (se sirve al cliente), pero el proyecto la consume en dos formatos:

1. **`firebase_config.json`** — JSON legible (referencia/edición).
2. **`firebase_config_json.base64`** — el mismo JSON codificado en base64; es lo que está embebido en [src/js/login.js](src/js/login.js) en la variable `firebaseConfigBase64`.

Si quieres clonar el proyecto y apuntar a **tu propio proyecto Firebase**:

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com/) y habilita **Authentication (Google)**, **Firestore** y **Hosting**.
2. Copia tu config web (`apiKey`, `authDomain`, `projectId`, etc.) sobre `firebase_config.json`.
3. Genera la versión base64:

   ```powershell
   # PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("firebase_config.json")) `
     | Set-Content firebase_config_json.base64 -NoNewline
   ```

   ```bash
   # bash
   base64 -w0 firebase_config.json > firebase_config_json.base64
   ```
4. Sustituye el valor de `firebaseConfigBase64` en [src/js/login.js](src/js/login.js#L7) por el contenido del archivo `.base64` generado.

## Desarrollo local

Como es un sitio estático, basta con servir `src/` desde cualquier servidor HTTP local (no funciona abriendo el HTML con `file://` por la auth de Firebase):

```powershell
# Opción 1: Firebase emulators
firebase emulators:start --only hosting

# Opción 2: cualquier servidor estático
npx serve src
# o
python -m http.server 5000 --directory src
```

## Despliegue en Firebase Hosting

Requisitos: [Firebase CLI](https://firebase.google.com/docs/cli) instalado y haber hecho `firebase login`.

1. Asocia el proyecto local con tu proyecto Firebase:

   ```powershell
   firebase use --add
   ```

2. (Opcional) Si quieres mantener la separación `src/` → `dist/` con minificación, puedes minificar manualmente con:

   - [CSS minifier](https://www.freeformatter.com/css-minifier.html)
   - [JavaScript minifier](https://skalman.github.io/UglifyJS-online/)
   - [HTML minifier](http://minifycode.com/html-minifier/)

   …o simplemente copiar `src/` a `dist/` tal cual.

3. Despliega:

   ```powershell
   firebase deploy --only hosting
   ```

   Si vas a desplegar `src/` directamente, edita primero [firebase.json](firebase.json) y cambia `"public": "dist"` por `"public": "src"`.

## Licencia

Distribuido bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

## Aviso legal / Disclaimer

Este es un proyecto **no oficial** hecho por fans y sin fines de lucro.

> *Mario Kart Tour*, *Mario Kart*, los nombres de personajes, vehículos, circuitos, sprites, iconos y demás material gráfico relacionado son **marcas registradas y propiedad intelectual de Nintendo Co., Ltd.** Este proyecto **no está afiliado, respaldado ni patrocinado por Nintendo**.

Las imágenes utilizadas en la web se enlazan desde fuentes públicas (Super Mario Wiki / MarioWiki Gallery) y se incluyen únicamente con fines informativos y de referencia para la comunidad de jugadores. La licencia MIT cubre **el código fuente** de este repositorio, **no** el material gráfico ni los nombres protegidos por Nintendo. Si eres titular de derechos y deseas que se retire algún recurso, abre una incidencia.