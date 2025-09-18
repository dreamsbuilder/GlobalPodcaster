import type { Agent, Message, Thread } from './threads';
import { toast } from 'svelte-sonner';

export class Session {
	private socket: WebSocket;
	public connected = $state(false);

	readonly host: string;
	readonly appId: string;
	readonly privKey: string;
	readonly session: string;

	public agentId: string | null = $state(null);

	public agents: { [id: string]: Agent } = $state({});
	public threads: { [id: string]: Thread & { unread: number } } = $state({});
	public messages: { [thread: string]: Message[] } = $state({});

	constructor({
		host,
		appId,
		privacyKey,
		session
	}: {
		host: string;
		appId: string;
		privacyKey: string;
		session: string;
	}) {
		this.host = host;
		this.appId = appId;
		this.privKey = privacyKey;
		this.session = session;
		let cleanHost = host.replace(/^https?:\/\//, '');
		const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
		this.socket = new WebSocket(
			`${wsProtocol}${cleanHost}/debug/${appId}/${privacyKey}/${session}/?timeout=10000`
		);

		this.socket.onopen = () => {
			toast.success('Connected to session.');
			this.connected = true;
		};
		this.socket.onerror = () => {
			toast.error(`Error connecting to session.`);
			this.connected = false;
			this.socket.close();
		};
		this.socket.onclose = (e) => {
			if (this.connected)
				toast.info(`Session connection closed${e.reason ? ` - ${e.reason}` : '.'}`);
			this.threads = {};
			this.agents = {};
			this.connected = false;
		};
		this.socket.onmessage = (ev) => {
			let data = null;
			try {
				data = JSON.parse(ev.data);
			} catch (e) {
				toast.warning(`ws: '${ev.data}'`);
				return;
			}

			switch (data.type ?? '') {
				case 'DebugAgentRegistered':
					this.agentId = data.id;
					break;
				case 'ThreadList':
					for (const thread of data.threads) {
						this.messages[thread.id] = thread.messages ?? [];
						this.threads[thread.id] = {
							...thread,
							messages: undefined,
							unread: 0
						};
					}
					break;
				case 'AgentList':
					for (const agent of data.agents) {
						this.agents[agent.id] = agent;
					}
					break;
				case 'org.coralprotocol.coralserver.session.Event.AgentStateUpdated':
					this.agents[data.agentId].state = data.state;
					break;
				case 'org.coralprotocol.coralserver.session.Event.ThreadCreated':
					console.log('new thread');
					this.threads[data.id] = {
						id: data.id,
						name: data.name,
						participants: data.participants,
						summary: data.summary,
						creatorId: data.creatorId,
						isClosed: data.isClosed,
						unread: 0
					};
					this.messages[data.id] = data.messages ?? [];
					break;
				case 'org.coralprotocol.coralserver.session.Event.MessageSent':
					if (data.threadId in this.messages) {
						console.log('message setn');
						this.messages[data.threadId].push(data.message);
						this.threads[data.threadId].unread += 1;
					} else {
						console.warn('uh oh', { data: data, messages: this.messages });
					}
					break;
			}
		};
	}

	public close() {
		this.socket.close();
	}
}
