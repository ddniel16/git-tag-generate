# Git Tag Generate

Herramienta CLI moderna para generar tags Git siguiendo Semantic Versioning (SemVer) con soporte para prefijos, prerelease y gestión avanzada de tags.

## Características

- ✨ **CLI Híbrido**: comandos explícitos y atajos ergonómicos
- 🎯 **SemVer Completo**: patch, minor, major, prepatch, preminor, premajor, prerelease
- 🏷️ **Prefijos Flexibles**: organiza tags por proyecto/módulo con prefijos normalizados
- 🚀 **Prerelease**: soporte para beta, alpha, rc y identificadores personalizados
- 🗑️ **Borrado Múltiple**: elimina varios tags a la vez con multi-select
- 🔍 **Listado**: agrupa tags por prefijo, muestra historial ordenado
- ✅ **Validaciones**: verifica repo Git, remote origin, rama actual, duplicados

## Requisitos

- **Node.js** ≥ 20.0.0

## Instalación

### Global (recomendado)

```bash
npm install -g git-tag-generate
```

o

```bash
pnpm install -g git-tag-generate
```

## Uso

### Comportamiento Inteligente

Al ejecutar `gtg` sin argumentos, la herramienta detecta automáticamente el estado del repositorio:

- **Sin tags existentes**: ejecuta `gtg new` para crear el primer tag (0.0.1)
- **Con tags existentes**: ejecuta `gtg next` para incrementar desde el último tag

### Comandos

| Comando | Descripción |
| - | - |
| `gtg` | Flujo inteligente: `new` si no hay tags, `next` si ya existen |
| `gtg new` | Crear primer tag con versión inicial `0.0.1` |
| `gtg next` | Generar siguiente tag con incremento SemVer |
| `gtg list` | Listar todos los tags agrupados por prefijo |
| `gtg delete` | Eliminar tags con selección múltiple |

### Atajos

Los siguientes atajos ejecutan `gtg next --level <nivel>`:

| Atajo | Equivalente | Descripción |
| - | - | - |
| `gtg patch` | `gtg next -l patch` | Incrementa versión patch (0.0.X) |
| `gtg minor` | `gtg next -l minor` | Incrementa versión minor (0.X.0) |
| `gtg major` | `gtg next -l major` | Incrementa versión major (X.0.0) |
| `gtg prepatch` | `gtg next -l prepatch` | Prepatch con prerelease (0.0.X-beta.0) |
| `gtg preminor` | `gtg next -l preminor` | Preminor con prerelease (0.X.0-beta.0) |
| `gtg premajor` | `gtg next -l premajor` | Premajor con prerelease (X.0.0-beta.0) |
| `gtg prerelease` | `gtg next -l prerelease` | Incrementa número de prerelease |

### Flags

| Flag | Alias | Descripción |
| - | - | - |
| `--level <nivel>` | `-l` | Especifica nivel de incremento SemVer |
| `--beta` | - | Usa identificador `beta` para prerelease |
| `--alpha` | - | Usa identificador `alpha` para prerelease |
| `--id <id>` | - | Identificador personalizado para prerelease |
| `--noPush` | - | Crea el tag localmente sin subirlo al remote |
| `--dry-run` | - | Simula la operación sin crear el tag |
| `--prefixes` | - | Lista solo los prefijos disponibles (con `list`) |
| `--help` | `-h` | Muestra ayuda |

## Ejemplos

### Crear primer tag

```bash
# Interactivo: pregunta por prefijo y crea tag 0.0.1
gtg new

# Ejemplo de flujo:
# ¿Deseas usar un prefijo para el tag? (y/N): y
# Ingresa el prefijo: my-app
# Prefijo normalizado: my-app
# Versión inicial: 0.0.1
# ¿Crear tag 'my-app-0.0.1'? (Y/n): y
# ✓ Tag 'my-app-0.0.1' creado exitosamente y subido al remote
```

### Incrementar versiones

```bash
# Incremento básico con atajos
gtg patch    # 0.0.1 → 0.0.2
gtg minor    # 0.0.2 → 0.1.0
gtg major    # 0.1.0 → 1.0.0

# Con flags explícitos
gtg next --level patch
gtg next -l minor
```

### Prerelease

```bash
# Crear prerelease beta
gtg prepatch --beta           # 1.0.0 → 1.0.1-beta.0
gtg preminor --beta           # 1.0.1 → 1.1.0-beta.0
gtg premajor --beta           # 1.0.0 → 2.0.0-beta.0

# Incrementar prerelease existente
gtg prerelease --beta         # 1.0.1-beta.0 → 1.0.1-beta.1

# Con identificadores personalizados
gtg prepatch --alpha          # 1.0.0 → 1.0.1-alpha.0
gtg prepatch --id rc          # 1.0.0 → 1.0.1-rc.0
gtg next -l prepatch --id canary
```

### Listar tags

```bash
# Listar todos los tags agrupados por prefijo
gtg list

# Ejemplo de salida:
# Tags encontrados: 8
#
# my-app:
#   → my-app-1.0.0 (2026-01-25T10:30:00)
#     my-app-0.1.0 (2026-01-24T15:20:00)
#     my-app-0.0.1 (2026-01-23T09:00:00)
#
# (sin prefijo):
#   → 2.0.0 (2026-01-22T12:00:00)

# Listar solo prefijos
gtg list --prefixes
```

### Eliminar tags

```bash
# Multi-select interactivo
gtg delete

# Ejemplo de flujo:
# Selecciona los tags a eliminar:
#   ◉ my-app-0.0.1 (2026-01-23)
#   ◯ my-app-0.1.0 (2026-01-24)
#   ◉ my-app-1.0.0-beta.0 (2026-01-25)
#
# Tags a eliminar (2):
#   - my-app-0.0.1
#   - my-app-1.0.0-beta.0
#
# ¿Estás seguro de eliminar 2 tag(s)? (y/N): y
# ✓ my-app-0.0.1: eliminado local y remotamente
# ✓ my-app-1.0.0-beta.0: eliminado local y remotamente
```

### Opciones avanzadas

```bash
# Crear tag sin subirlo al remote
gtg patch --noPush

# Simular creación (dry run)
gtg major --dry-run

# Combinar flags
gtg prepatch --beta --noPush --dry-run
```

## Prefijos

Los prefijos permiten organizar tags por proyecto, módulo o entorno:

- **Con prefijo**: `my-app-1.0.0`, `backend-2.5.0`, `frontend-0.3.1`
- **Sin prefijo**: `1.0.0`, `2.0.0`

### Normalización automática

Los prefijos se normalizan siguiendo estas reglas:

- Convertidos a minúsculas
- Espacios y guiones bajos → guiones (`-`)
- Caracteres especiales eliminados
- Solo alfanuméricos y guiones permitidos
- No pueden empezar/terminar con guión

```bash
# Entrada → Salida normalizada
"My App"     → "my-app"
"backend_v2" → "backend-v2"
"Front-End!" → "front-end"
```

## Validaciones

La CLI realiza las siguientes validaciones automáticas:

- ✓ **Repositorio Git válido**: verifica que estés en un repo Git
- ✓ **Remote origin**: confirma existencia del remote antes de push
- ✓ **Rama actual**: advierte si no estás en `main`/`master` y pide confirmación
- ✓ **Tags duplicados**: previene creación de tags existentes
- ✓ **Formato SemVer**: valida que las versiones cumplan el estándar

## Licencia

[GPL-3.0 license](LICENSE.md)

## Autor

[GitHub](https://github.com/ddniel16) | [X](https://x.com/ddniel16) | [Website](https://ddniel16.dev)
