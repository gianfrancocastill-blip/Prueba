# Subasta Pornera — versión online

Esta versión ya no es un HTML aislado: utiliza Node.js + Express + Socket.IO.

## Ejecutar en tu PC

1. Instala Node.js.
2. Abre una terminal dentro de esta carpeta.
3. Ejecuta:
   npm install
   npm start
4. En el navegador abre:
   http://localhost:3000

Para jugar desde otras computadoras por Internet, el servidor debe estar publicado en un servicio de hosting que permita Node.js/WebSockets. Después todos entran a la misma URL y usan el código de sala.

Reglas implementadas:
- 3 a 8 jugadores.
- El anfitrión elige la cantidad exacta de jugadores.
- €1.000M iniciales.
- Formación 4-3-3.
- Posición, altura y nacionalidad visibles antes de la revelación.
- Nombre, categoría y OVR ocultos.
- Puja mediante +€5M, +€10M, +€50M y +€100M.
- Una posición se completa para todos antes de pasar a la siguiente.
