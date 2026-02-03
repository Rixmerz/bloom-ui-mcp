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

### Advanced Patterns & Known Limitations

#### Passing Server Data to UI

If your MCP App needs data from the server (API calls, database, etc.), **do NOT use `callServerTool` from the UI**. This causes JSON-RPC errors.

Instead, inject data directly into the HTML when the resource loads:

**In server.ts:**
```typescript
registerAppResource(server, resourceUri, resourceUri, { mimeType: RESOURCE_MIME_TYPE },
  async (): Promise<ReadResourceResult> => {
    const data = await fetchMyData();  // Your server-side data
    let html = await fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");

    // Inject as global variable
    const dataScript = `<script>window.__MY_DATA__ = ${JSON.stringify(data)};</script>`;
    html = html.replace("</head>", `${dataScript}</head>`);

    return { contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }] };
  },
);
```

**In mcp-app.ts:**
```typescript
declare global {
  interface Window {
    __MY_DATA__?: MyDataType[];
  }
}

// Use the injected data
const data = window.__MY_DATA__ || [];
```

#### Known Limitations

| Issue | Cause | Solution |
|-------|-------|----------|
| Claude Desktop hangs | Wrong `registerAppResource` args | Use `resourceUri` as both 2nd and 3rd argument |
| UI not showing | Wrong URI scheme | Use `ui://name/mcp-app.html` (not `name://ui/...`) |
| JSON-RPC errors | Calling `callServerTool` from UI | Embed data in HTML instead |
| UI hidden after tool call | Returning JSON from tool | Return simple text like `"App opened."` |
| Build fails | Wrong registration order | Register tool FIRST, resource SECOND |
| External images blocked | CSP policy in Claude Desktop | Convert to base64 on server (see below) |

#### Loading External Images

Claude Desktop blocks external images due to Content Security Policy (CSP). To display images from external APIs, **convert them to base64 on the server** and embed as data URIs:

**In server.ts:**
```typescript
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Detect mime type from URL extension
    const ext = url.split(".").pop()?.toLowerCase();
    const mimeType = ext === "gif" ? "image/gif"
                   : ext === "png" ? "image/png"
                   : "image/jpeg";

    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  }
}

// Usage in registerAppResource:
const imageBase64 = await fetchImageAsBase64("https://example.com/image.png");
const dataScript = `<script>window.__IMAGE__ = ${JSON.stringify(imageBase64)};</script>`;
```

**In mcp-app.ts:**
```typescript
const imageData = window.__IMAGE__;
if (imageData) {
  document.getElementById("my-image")!.innerHTML =
    `<img src="${imageData}" alt="description" />`;
}
```

This bypasses CSP by embedding the image directly in the HTML as a data URI.

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

### Patrones Avanzados y Limitaciones Conocidas

#### Pasar Datos del Servidor a la UI

Si tu MCP App necesita datos del servidor (llamadas API, base de datos, etc.), **NO uses `callServerTool` desde la UI**. Esto causa errores de JSON-RPC.

En su lugar, inyecta los datos directamente en el HTML cuando se carga el resource:

**En server.ts:**
```typescript
registerAppResource(server, resourceUri, resourceUri, { mimeType: RESOURCE_MIME_TYPE },
  async (): Promise<ReadResourceResult> => {
    const data = await fetchMyData();  // Tus datos del servidor
    let html = await fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");

    // Inyectar como variable global
    const dataScript = `<script>window.__MY_DATA__ = ${JSON.stringify(data)};</script>`;
    html = html.replace("</head>", `${dataScript}</head>`);

    return { contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }] };
  },
);
```

**En mcp-app.ts:**
```typescript
declare global {
  interface Window {
    __MY_DATA__?: MyDataType[];
  }
}

// Usar los datos inyectados
const data = window.__MY_DATA__ || [];
```

#### Limitaciones Conocidas

| Problema | Causa | Solución |
|----------|-------|----------|
| Claude Desktop se cuelga | Args incorrectos en `registerAppResource` | Usar `resourceUri` como 2do y 3er argumento |
| UI no se muestra | Esquema de URI incorrecto | Usar `ui://nombre/mcp-app.html` (no `nombre://ui/...`) |
| Errores JSON-RPC | Llamar `callServerTool` desde UI | Embeber datos en HTML |
| UI oculta tras tool call | Retornar JSON desde tool | Retornar texto simple como `"App abierta."` |
| Build falla | Orden de registro incorrecto | Registrar tool PRIMERO, resource DESPUÉS |
| Imágenes externas bloqueadas | Política CSP en Claude Desktop | Convertir a base64 en servidor (ver abajo) |

#### Cargar Imágenes Externas

Claude Desktop bloquea imágenes externas por política de seguridad (CSP). Para mostrar imágenes de APIs externas, **conviértelas a base64 en el servidor** y embébelas como data URIs:

**En server.ts:**
```typescript
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Detectar tipo MIME por extensión
    const ext = url.split(".").pop()?.toLowerCase();
    const mimeType = ext === "gif" ? "image/gif"
                   : ext === "png" ? "image/png"
                   : "image/jpeg";

    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  }
}

// Uso en registerAppResource:
const imageBase64 = await fetchImageAsBase64("https://ejemplo.com/imagen.png");
const dataScript = `<script>window.__IMAGE__ = ${JSON.stringify(imageBase64)};</script>`;
```

**En mcp-app.ts:**
```typescript
const imageData = window.__IMAGE__;
if (imageData) {
  document.getElementById("mi-imagen")!.innerHTML =
    `<img src="${imageData}" alt="descripción" />`;
}
```

Esto evita el CSP al embeber la imagen directamente en el HTML como data URI.

---

## License / Licencia

MIT

---

Made with 🌸 by the community | Hecho con 🌸 por la comunidad
