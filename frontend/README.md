<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
>>>>>>> fd3be08 (Move frontend repo into frontend/ folder)
# 🏓 Global Podcaster App
`Global Podcaster App` is a multi-agent pipeline that fetches podcast audio from any RSS feed, transcribes it to text using Deepgram, and translates the transcript to your target language using Mistral AI—all orchestrated via Coral Protocol.  
This project demonstrates how to build composable, language-agnostic agent workflows for global podcast accessibility and discovery.

## 🛠️ How the Automated Feed Monitoring Works

### feeds.txt: Managing RSS Feeds
- The `feeds.txt` file contains one RSS feed URL per line.
- You can add or remove feeds at any time. Lines starting with `#` are comments and ignored.
- Example:
  ```
  https://feeds.npr.org/500005/podcast.xml
  https://feeds.megaphone.fm/sciencevs
  #https://another-feed.com/rss
  ```

### seen_episodes files
- For each RSS feed, the system creates a state file named `seen_episodes_<hash>.json`.
- This file stores the identifiers of episodes already processed for that feed, preventing duplicate processing.
- You can delete these files to force reprocessing of all episodes for a feed.

### Monitoring process
- The `monitor_feeds.py` script reads all URLs from `feeds.txt` and, every 2 minutes, runs the pipeline for each feed.
- The pipeline flow is:
  1. **rss-monitor-agent**: Detects new (unseen) episodes for each feed.
  2. **rss-fetch-agent**: Fetches metadata for all episodes in the feed.
  3. **transcription-agent**: Transcribes the audio of each new episode using Deepgram.
  4. **translation-agent**: Translates the transcript using Mistral AI.
  5. The final result is a JSON with title, audio_url, transcript, and translation for each new episode.

### Customization
- You can change the monitoring interval by editing the `POLL_INTERVAL` variable in `monitor_feeds.py` (value in seconds).
- You can add/remove feeds at any time by editing `feeds.txt`.

### Notes
- If an episode is very long, the translation may be limited by the `max_tokens` parameter in the translation agent.
- To reset tracking for a feed, delete its corresponding `seen_episodes_<hash>.json` file.

-----
#  🎙️Global Podcaster

### **Global Podcaster: Breaking language barriers in podcasting**

What if your podcast could instantly reach millions of new listeners in Japan, Spain, or Germany, all while speaking in **your own authentic voice**? Global Podcaster is a revolutionary platform that breaks the language barrier for content creators, turning your local podcast into a global phenomenon. 


We solve a major problem for creators: reaching international audiences is expensive, time-consuming, and often results in robotic, impersonal dubbing. Global Podcaster changes everything with a seamless, AI-powered workflow.

## Overview

* **Track**: App Builder
* **Problem**: Podcasts have a global audience, but language barriers limit their reach. Dubbing a podcast is expensive and time-consuming.
* **Solution**: A web app where a podcaster can submit their RSS feed. The app automatically fetches new episodes, transcribes them, translates the text into a target language, and then uses a clone of the host's voice to generate a fully translated audio episode. The new translated podcast gets its own RSS feed.
* **Tech Stack**:
	* **Coral Protocol**: To orchestrate the entire pipeline: an "RSS Fetch Agent," a "**Transcription Agent**," a "**Translation Agent**," and a "**Voice Synthesis Agent**."
    * **ElevenLabs**: The star of the show for the voice cloning and audio generation.
    * **Mistral AI**: To provide high-quality, context-aware translations.
    * **Frontend**: Simple web app for podcasters
 
## How It Works

Simply provide your podcast's RSS feed and a short sample of your voice. Our autonomous agent network, orchestrated by **Coral Protocol**, takes over:

1.  **Listen & Transcribe:** An agent automatically detects new episodes and converts them to text.
2.  **Translate & Adapt:** The script is translated with nuanced, context-aware understanding by **Mistral AI**.
3.  **Recreate & Publish:** Here's the magic. Using **ElevenLabs'** cutting-edge technology, we regenerate the entire episode in the new language, perfectly cloned in *your voice*.

The result is a new, translated RSS feed, ready for distribution. It's not just a translation; it's your show, for a new culture, with the personality and trust that only your voice can provide.

## Key Features

* **Fully Automated:** Set it up once and new episodes are translated as they're released.
* **Authentic Voice Cloning:** Maintain your brand and connection with your audience.
* **Multi-Language Support:** Instantly create versions for multiple new markets.
* **Seamless Distribution:** Get a simple RSS feed for every language, compatible with all major podcast platforms.

## The Vision

Global Podcaster is more than a tool; it's a bridge connecting creators and cultures. We are building a world where great ideas and compelling stories are no longer limited by language, empowering every podcaster to speak to the world.

-----

## System Design & Architecture

### 1\. User Flow: From the Podcaster's Perspective

This describes the journey a user (the podcaster) would take when interacting with the app.

**Step 1: Onboarding & Setup (One-time action)**

1.  **Sign Up:** The podcaster creates an account on the web application.
2.  **Submit RSS Feed:** On their dashboard, they submit the public RSS feed URL of their original podcast (e.g., their Spotify or Apple Podcasts feed).
3.  **Voice Cloning:**
      * The app prompts the podcaster to provide a voice sample for cloning.
      * The simplest way is an uploader where they can provide a 1-5 minute MP3 file of them speaking clearly with no background noise.
      * The app sends this sample to **ElevenLabs** to create a unique voice clone and stores the resulting Voice ID associated with the user's account.
4.  **Select Languages:** The podcaster chooses one or more target languages they want their podcast translated into (e.g., Spanish, French, German).
5.  **Receive New Feed URL:** The system immediately generates a new, unique RSS feed URL for each selected language and displays it on the dashboard. This feed will be empty at first, but the podcaster can already submit it to podcasting platforms.

**Step 2: Automated Episode Processing (Ongoing)**

1.  **Detection:** The application's backend automatically checks the podcaster's original RSS feed periodically (e.g., every hour).
2.  **Processing:** When it detects a new episode, the entire agent pipeline is triggered automatically.
3.  **Notification:** Once the translation is complete (this could take several minutes depending on the episode length), the podcaster receives an email notification: "Your new episode of '[Podcast Name] - Spanish Edition' is now live\!"
4.  **Distribution:** The newly generated, translated episode is automatically added to the corresponding translated RSS feed, making it available on all platforms where that new feed has been added.
-----

### 2\. Application Architecture

#### Architecture Diagram

This diagram provides a high-level overview of the entire system, showing how the user, frontend, backend, agents, and external services all interact.

```mermaid
graph LR
    subgraph "User Interaction"
        User["Podcaster"] -- "Interacts via Browser" --> Frontend["Frontend Web App <br> (React/Vue)"];
    end

    subgraph "Your Application Infrastructure"
        Frontend -- "HTTPS API Calls" --> Backend["Backend Orchestrator <br> (Node.js/Python)"];
        Backend <--> DB[("Database <br> Users, RSS Feeds, Voice IDs")];
        Backend -- "Initiates Job" --> Coral;
        
        subgraph "Coral Protocol Network"
            Coral["Agent Network <br> (Coral Protocol)"];
            Agent1["RSS-Monitor-Agent"];
            Agent2["Transcription-Agent"];
            Agent3["Translation-Agent"];
            Agent4["Voice-Synthesis-Agent"];
            Agent5["RSS-Publisher-Agent"];
        end

        Coral -.-> Agent1;
        Coral -.-> Agent2;
        Coral -.-> Agent3;
        Coral -.-> Agent4;
        Coral -.-> Agent5;
    end

    subgraph "External Services"
        Agent3 -- "API Call" --> Mistral["Mistral AI"];
        Agent4 -- "API Call" --> ElevenLabs["ElevenLabs"];
        Agent2 -- "API Call" --> STT["AI/ML API <br> (Speech-to-Text)"];
    end

    style User fill:#D3D3D3,stroke:#333,stroke-width:2px
    style Frontend fill:#FFFACD,stroke:#333,stroke-width:2px
    style Backend fill:#FFFACD,stroke:#333,stroke-width:2px
    style DB fill:#FFFACD,stroke:#333,stroke-width:2px
    style Agent1 fill:#ADD8E6,stroke:#333,stroke-width:1px
    style Agent2 fill:#ADD8E6,stroke:#333,stroke-width:1px
    style Agent3 fill:#ADD8E6,stroke:#333,stroke-width:1px
    style Agent4 fill:#ADD8E6,stroke:#333,stroke-width:1px
    style Agent5 fill:#ADD8E6,stroke:#333,stroke-width:1px
    style Mistral fill:#FFDDC1,stroke:#333,stroke-width:1px
    style ElevenLabs fill:#FFDDC1,stroke:#333,stroke-width:1px
    style STT fill:#FFDDC1,stroke:#333,stroke-width:1px
```

-----

This is how all the pieces fit together.

**Components:**

1.  **Frontend (Client-Side):**

      * **Technology:** A simple static web app (e.g., built with React, Vue, or basic HTML/CSS/JS).
      * **Responsibilities:** User registration/login, dashboard UI, form for submitting RSS feed, voice sample uploader, displaying the translated RSS feed URLs and episode statuses.
      * **Hosted On:** Vercel, Netlify, or similar.

2.  **Backend (Orchestrator & API):**

      * **Technology:** A lightweight server (e.g., Node.js with Express, or Python with Flask).
      * **Responsibilities:**
          * Manages user authentication and data.
          * Provides API endpoints for the frontend.
          * **Acts as the primary client for Coral Protocol.** When a new episode is found, this backend is what initiates the first job in the Coral network.
          * Serves the generated XML RSS feed files.
      * **Database:** A simple DB (e.g., Supabase, Firebase, or even SQLite for a hackathon) to store user info, RSS feeds, voice IDs, and job statuses.

3.  **Agent Services (The Workers):**

      * **Technology:** Each of the 5 agents described above is deployed as a separate, lightweight service. Serverless functions (e.g., Vercel Functions, AWS Lambda, Google Cloud Functions) are *perfect* for this.
      * **Responsibilities:** Each agent does only its one specific job. They are stateless and only communicate with each other via the **Coral Protocol** network.

4.  **External APIs (The Brains):**

      * **Mistral AI:** For high-quality text translation.
      * **ElevenLabs:** For the core voice cloning and text-to-speech synthesis.
      * **AI/ML API (or similar):** For audio transcription.

This architecture is robust, scalable, and perfectly aligns with the theme of the "Internet of Agents." It showcases a real, working product built on a foundation of secure, interoperable, and collaborative agents orchestrated by **Coral Protocol**.

-----

### 3\. Agent Flow Breakdown

#### Flow Diagram

This diagram shows the step-by-step pipeline of how a new podcast episode is processed. The entire flow is orchestrated by **Coral Protocol**, which passes a job from one specialized agent to the next until the process is complete.

```mermaid
graph TD
    A[Start: New Episode Detected] --> B(RSS-Monitor-Agent);
    B -->|1. Sends Audio URL via Coral| C(Transcription-Agent);
    C -->|2. Sends Transcript via Coral| D(Translation-Agent);
    D -->|3. Sends Translated Text via Coral| E(Voice-Synthesis-Agent);
    E -->|4. Sends New Audio URL via Coral| F(RSS-Publisher-Agent);
    F --> G[End: Translated Episode Published];

    subgraph External APIs
        D -- Calls --> Mistral(Mistral AI API);
        E -- Calls --> ElevenLabs(ElevenLabs API);
        C -- Calls --> STT(Speech-to-Text API);
    end

    style A fill:#90EE90,stroke:#333,stroke-width:2px
    style G fill:#90EE90,stroke:#333,stroke-width:2px
    style B fill:#ADD8E6,stroke:#333,stroke-width:2px
    style C fill:#ADD8E6,stroke:#333,stroke-width:2px
    style D fill:#ADD8E6,stroke:#333,stroke-width:2px
    style E fill:#ADD8E6,stroke:#333,stroke-width:2px
    style F fill:#ADD8E6,stroke:#333,stroke-width:2px
```

#### **Flow Breakdown:**

1.  **`RSS-Monitor-Agent`** detects a new episode and initiates the workflow by passing the original audio URL to the next agent.
2.  **`Transcription-Agent`** receives the audio, converts it to text using a Speech-to-Text API, and passes the resulting transcript onward.
3.  **`Translation-Agent`** takes the transcript, translates it using **Mistral AI**, and sends the translated text to the synthesis agent.
4.  **`Voice-Synthesis-Agent`** uses the podcaster's cloned voice on **ElevenLabs** to convert the translated text into a new audio file.
5.  **`RSS-Publisher-Agent`** takes the final audio file URL and all the translated metadata (title, description) and updates the new, language-specific RSS feed.

-----

## **Getting Started**

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
3. Run monitor: `python3 monitor_feeds.py`

> The monitor prints to the console how many feeds are pending and the progress for each one.
> State files and results are stored in the project root directory.
=======
<<<<<<< HEAD
=======
>>>>>>> c0e20a9 (Move frontend repo into frontend/ folder)
>>>>>>> fd3be08 (Move frontend repo into frontend/ folder)
# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
<<<<<<< HEAD
>>>>>>> a977d89 (app set-up)
=======
<<<<<<< HEAD
=======
>>>>>>> a977d89 (app set-up)
>>>>>>> c0e20a9 (Move frontend repo into frontend/ folder)
>>>>>>> fd3be08 (Move frontend repo into frontend/ folder)
