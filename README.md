# bloom-ui-mcp

> **[English](#english)** | **[Español](#español)**

---

<a name="english"></a>
## 🌸 English

### What is bloom-ui-mcp?

A generator for creating **MCP Apps with interactive UI** in seconds. Stop wrestling with boilerplate, bundling configs, and SDK setup — just bloom your ideas into working apps.

Think of it as **create-react-app but for MCP Apps with UI**.

### The Problem It Solves

Creating an MCP App with UI requires:
- Correct Node version (v20+ for `import.meta.dirname`)
- Vite config with `vite-plugin-singlefile` for bundling
- The `--stdio` flag for Claude Desktop
- Proper SDK imports and App class setup
- Build scripts that actually work

**bloom-ui-mcp** handles all of this automatically.

### Installation

```bash
# Clone the repository
git clone https://github.com/Rixmerz/bloom-ui-mcp.git
cd bloom-ui-mcp

# Install dependencies
npm install

# Build
npm run build
```

### Add to Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bloom-ui-mcp": {
      "command": "/path/to/node/v22/bin/node",
      "args": [
        "/path/to/bloom-ui-mcp/dist/index.js",
        "--stdio"
      ]
    }
  }
}
```

> **Note:** Requires Node.js v20+ (v22 recommended). Find your path with `which node` or `nvm which 22`.

### Usage

#### List Available Templates

```
"List the available MCP App templates"
```

Returns: `blank`, `calculator`, `form`, `chart`

#### Create a New MCP App

```
"Create a new MCP App called 'my-dashboard' with the form template in /Users/me/projects"
```

This generates a complete project with:
- All config files (package.json, tsconfig, vite.config)
- Server with tool and resource registration
- UI template with SDK properly bundled
- Build scripts that work out of the box

#### Validate an Existing Project

```
"Validate my MCP App project at /path/to/project"
```

Checks for:
- ✅ Node version >= 20
- ✅ Bun installed
- ✅ Required dependencies
- ✅ File structure
- ✅ Build script correctness
- ✅ Build output exists

### Templates

| Template | Description |
|----------|-------------|
| **blank** | Minimal starting point with a button |
| **calculator** | Interactive calculator that sends results to agent |
| **form** | Form with inputs that submits data to agent |
| **chart** | Canvas-based bar chart with sample data |

### Requirements

- **Node.js** v20+ (v22 recommended)
- **Bun** (for building generated projects)
- **Claude Desktop** or compatible MCP host

### How It Works

1. **Templates** are embedded in the generator with proper SDK setup
2. **Placeholders** (`{{NAME}}`, `{{DESCRIPTION}}`, etc.) are replaced with your values
3. **Validation** ensures common mistakes are avoided
4. **Build scripts** use the exact configuration that works with Claude Desktop

---

<a name="español"></a>
## 🌸 Español

### ¿Qué es bloom-ui-mcp?

Un generador para crear **MCP Apps con UI interactiva** en segundos. Deja de luchar con boilerplate, configuraciones de bundling y setup del SDK — simplemente haz florecer tus ideas en apps funcionales.

Piensa en él como **create-react-app pero para MCP Apps con UI**.

### El Problema que Resuelve

Crear un MCP App con UI requiere:
- Versión correcta de Node (v20+ para `import.meta.dirname`)
- Config de Vite con `vite-plugin-singlefile` para bundling
- El flag `--stdio` para Claude Desktop
- Imports correctos del SDK y setup de la clase App
- Scripts de build que realmente funcionen

**bloom-ui-mcp** maneja todo esto automáticamente.

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Rixmerz/bloom-ui-mcp.git
cd bloom-ui-mcp

# Instalar dependencias
npm install

# Compilar
npm run build
```

### Agregar a Claude Desktop

Agrega esto a tu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bloom-ui-mcp": {
      "command": "/ruta/a/node/v22/bin/node",
      "args": [
        "/ruta/a/bloom-ui-mcp/dist/index.js",
        "--stdio"
      ]
    }
  }
}
```

> **Nota:** Requiere Node.js v20+ (v22 recomendado). Encuentra tu ruta con `which node` o `nvm which 22`.

### Uso

#### Listar Templates Disponibles

```
"Lista los templates de MCP App disponibles"
```

Retorna: `blank`, `calculator`, `form`, `chart`

#### Crear un Nuevo MCP App

```
"Crea un nuevo MCP App llamado 'mi-dashboard' con el template form en /Users/yo/proyectos"
```

Esto genera un proyecto completo con:
- Todos los archivos de config (package.json, tsconfig, vite.config)
- Servidor con registro de tool y resource
- Template de UI con SDK correctamente bundleado
- Scripts de build que funcionan desde el inicio

#### Validar un Proyecto Existente

```
"Valida mi proyecto MCP App en /ruta/al/proyecto"
```

Verifica:
- ✅ Versión de Node >= 20
- ✅ Bun instalado
- ✅ Dependencias requeridas
- ✅ Estructura de archivos
- ✅ Script de build correcto
- ✅ Output de build existe

### Templates

| Template | Descripción |
|----------|-------------|
| **blank** | Punto de partida mínimo con un botón |
| **calculator** | Calculadora interactiva que envía resultados al agente |
| **form** | Formulario con inputs que envía datos al agente |
| **chart** | Gráfico de barras en canvas con datos de ejemplo |

### Requisitos

- **Node.js** v20+ (v22 recomendado)
- **Bun** (para compilar proyectos generados)
- **Claude Desktop** u host MCP compatible

### Cómo Funciona

1. Los **templates** están embebidos en el generador con setup correcto del SDK
2. Los **placeholders** (`{{NAME}}`, `{{DESCRIPTION}}`, etc.) se reemplazan con tus valores
3. La **validación** asegura que se eviten errores comunes
4. Los **scripts de build** usan la configuración exacta que funciona con Claude Desktop

---

## License / Licencia

MIT

---

Made with 🌸 by the community | Hecho con 🌸 por la comunidad
