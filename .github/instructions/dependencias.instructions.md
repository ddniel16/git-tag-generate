---
applyTo: '**'
description: Instrucciones para gestionar dependencias (pnpm).
---

- Asegúrate de estar en el directorio raíz del proyecto al gestionar dependencias con `pnpm`.
- Para la instalación inicial o limpia de dependencias, usa `pnpm ci` (no modifica `pnpm-lock.yaml`).
- Para actualizar las dependencias a sus últimas versiones compatibles, usa `pnpm update`.
- Añadir dependencia para producción: `pnpm add <paquete>`
- Añadir dependencia de desarrollo: `pnpm add -D <paquete>`
- Si necesitas eliminar una dependencia, usa `pnpm remove <paquete>`.
- Para cambiar dependencias, usa los comandos de `pnpm` correspondientes, manteniendo `pnpm-lock.yaml` sincronizado con `package.json` (sin archivos de lock de otros gestores) y, para esta finalidad, no edites manualmente los archivos `package.json` ni `pnpm-lock.yaml`.
