# 🏓 Agent Ping Pong with Coral Protocol
This is the stub project for **Agent Ping Pong**, created for the Internet of Agents Hackathon.  
The goal is to start simple and then extend it using **Coral Protocol** to connect multiple agents.

## 🚀 Getting Started
### Manual Setup
> only the first time
#### Clone the Coral Multi-Agent Demo repository:
```bash
git clone https://github.com/Coral-Protocol/Multi-Agent-Demo coral
cd coral
```
#### Install dependencies
```bash
./check-dependencies.sh
```

### (Optional) Install ngrok in codespace
> Only if you want to make the Coral Server and Coral Discovery URLs public so that the entire team uses the same Coral server.
#### Install ngrok
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update
sudo apt install ngrok
```

#### ngrok authentication

```bash
# Register on: ngrok.com and copy your authtoken.
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### Start Coral server and studio
In one terminal, start `coral server`:
```bash
cd coral
./start-server.sh
```

In other terminal, start `coral studio`:
```bash 
cd coral
./start-studio.sh
```

#### (Optional) Expose coral server port
> Only for external access
```bash
ngrok http 5555
```
> use the public address to conect the server on `Coral Discovery`

### Nota importante para Coral Studio y servidores públicos

Si necesitas conectar Coral Studio a un servidor Coral expuesto mediante HTTPS (por ejemplo, usando ngrok), debes permitir que el campo de host acepte URLs completas (con http o https). Por defecto, Coral Studio solo usaba http, lo que causaba errores de "mixed content" en navegadores modernos.

**Solución aplicada:**

En el archivo `coral/coral-studio/src/lib/components/server-switcher.svelte`, se ha modificado la línea que realiza la petición de test de conexión:

**Antes:**
```js
const res = await fetch(`http://${host}/api/v1/registry`);
```

**Después:**
```js
// Si el host ya incluye http o https, úsalo tal cual; si no, añade http:// por compatibilidad retro.
let url = host.startsWith('http://') || host.startsWith('https://')
	? host
	: `http://${host}`;
const res = await fetch(`${url}/api/v1/registry`);
```

Esto permite introducir la URL completa (por ejemplo, `https://xxxx.ngrok-free.app`) al añadir un server en Coral Studio, solucionando problemas de seguridad y permitiendo conexiones remotas seguras.

**Cambio adicional necesario:**

En el archivo `coral/coral-studio/src/lib/components/app-sidebar.svelte`, también es necesario modificar las llamadas al registry y a las sesiones para que usen el protocolo correcto (http o https) según lo introducido en el host.

**Antes:**
```js
const agents = (await fetch(`http://${sessCtx.connection.host}/api/v1/registry`).then((res) => res.json())) as RegistryAgent[];
const sessions = (await fetch(`http://${sessCtx.connection.host}/api/v1/sessions`).then((res) => res.json())) as string[];
```

**Después:**
```js
let url = sessCtx.connection.host.startsWith('http://') || sessCtx.connection.host.startsWith('https://')
	? sessCtx.connection.host
	: `http://${sessCtx.connection.host}`;
const agents = (await fetch(`${url}/api/v1/registry`).then((res) => res.json())) as RegistryAgent[];
const sessions = (await fetch(`${url}/api/v1/sessions`).then((res) => res.json())) as string[];
```

Esto asegura que todas las llamadas al registry y a las sesiones respeten el protocolo introducido, evitando errores de mixed content y permitiendo conexiones seguras.

**Cambio adicional para la creación de sesiones:**

En el archivo `coral/coral-studio/src/lib/components/dialogs/create-session.svelte`, también es necesario modificar la llamada para crear sesiones para que use el protocolo correcto (http o https) según lo introducido en el host.

**Antes:**
```js
const res = await fetch(`http://${ctx.connection.host}/sessions`, { ... });
```

**Después:**
```js
let url = ctx.connection.host.startsWith('http://') || ctx.connection.host.startsWith('https://')
	? ctx.connection.host
	: `http://${ctx.connection.host}`;
const res = await fetch(`${url}/sessions`, { ... });
```

Esto garantiza que la creación de sesiones también respete el protocolo introducido, evitando errores de mixed content y permitiendo conexiones seguras.

**Cambio adicional para WebSocket seguro:**

En el archivo `coral/coral-studio/src/lib/session.svelte.ts`, es necesario modificar la construcción de la URL del WebSocket para que use `wss://` si la página está en HTTPS.

**Antes:**
```js
this.socket = new WebSocket(
	`ws://${host}/debug/${appId}/${privacyKey}/${session}/?timeout=10000`
);
```

**Después:**
```js
const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
this.socket = new WebSocket(
	`${wsProtocol}${host}/debug/${appId}/${privacyKey}/${session}/?timeout=10000`
);
```

Esto evita errores de seguridad en navegadores modernos y permite la conexión de Coral Studio a través de HTTPS.

**Corrección final para WebSocket seguro:**

En el archivo `coral/coral-studio/src/lib/session.svelte.ts`, es necesario eliminar cualquier prefijo `http://` o `https://` del host antes de anteponer `wss://` o `ws://` al construir la URL del WebSocket.

**Antes:**
```js
const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
this.socket = new WebSocket(
	`${wsProtocol}${host}/debug/${appId}/${privacyKey}/${session}/?timeout=10000`
);
```

**Después:**
```js
let cleanHost = host.replace(/^https?:\/\//, '');
const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
this.socket = new WebSocket(
	`${wsProtocol}${cleanHost}/debug/${appId}/${privacyKey}/${session}/?timeout=10000`
);
```

Esto evita URLs mal formadas como `wss://https//...` y garantiza la compatibilidad con servidores públicos y entornos seguros.


### If you are using codespaces but do not want to use ngrok
- Copy the files in /temp to the corresponding locations in /coral, overwriting the existing ones.
- You must make the coral server and coral studio ports public.
- Then, in the coral studio console, use the public address of the coral server.

### 🔑 API Keys and Environment Variables
For the transcription agent to work with Deepgram, you need a valid API key. Create a `.env` file in the root of the project with the following content:

```env
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```
This variable will be automatically read by the transcription agent. If it is missing or incorrect, transcription will fail.

### Translation Agent: Mistral AI API Key

To use the translation agent with Mistral AI, you need a valid API key. Add the following line to your `.env` file in the root of the project:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

This variable will be automatically read by the translation agent. If it is missing or incorrect, translation will fail.

### How to run
1. Open in GitHub Codespaces / devcontainer or locally
2. Install dependencies: `pip install -r requirements.txt`
3. Run simulation: `echo '{"sender": "user", "receiver": "orchestrator", "content": "https://feeds.megaphone.fm/sciencevs"}' | python3 agents/agent.py`
