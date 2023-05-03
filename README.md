# Git Tag Generate


Es una herramienta para generar tags de forma fácil y rápida, teniendo en cuenta el uso de prefix en los tags.

## Instalación

La instalación global genera el comando ``gtg``.

```bash
npm i -g git-tag-generate
```

## Uso

Al ejecutar el comando, inicia el menú interactivo para generar el nuevo tag

```bash
gtg

El último tag es: strapi-0.0.2
? ¿Seguir con el prefix o con uno nuevo?
  strapi
❯ web
  ──────────────
  Crear nuevo prefix
----
❯ Patch web-0.0.5
  Minor web-0.1.0
  Major web-1.0.0
----
Se creó el tag: web-0.0.5
Se pusheo el tag: web-0.0.5
```
