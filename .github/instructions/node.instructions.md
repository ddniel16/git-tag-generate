---
applyTo: '**'
description: Instrucciones para trabajar con Node.js
---

- Al trabajar con Node.js, la versión definida en `.node-version` es la principal para desarrollo. Si el archivo no existe, está vacío o la versión indicada no está instalada, informa al usuario antes de ejecutar comandos de Node.js y no asumas una versión por defecto.
- Usa `pnpm` únicamente para gestionar dependencias (instalar, actualizar o eliminar); no lo uses para ejecutar scripts.
- Usa `node <archivo>` para ejecutar un archivo JavaScript o TypeScript concreto. Usa `node --run <script>` solo para ejecutar scripts definidos en la sección `scripts` de `package.json`.
