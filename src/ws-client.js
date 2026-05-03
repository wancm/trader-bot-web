export class WsClient extends EventTarget {
  constructor() {
    super();
    this._sock = null;
    this.state = 'disconnected';
  }

  connect(url) {
    if (this._sock) this.disconnect();
    this._setState('connecting');

    let sock;
    try {
      sock = new WebSocket(url);
    } catch (err) {
      this._setState('error');
      this.dispatchEvent(new CustomEvent('failure', { detail: String(err) }));
      return;
    }
    this._sock = sock;

    sock.addEventListener('open', () => this._setState('connected'));
    sock.addEventListener('close', () => {
      this._sock = null;
      if (this.state !== 'error') this._setState('disconnected');
    });
    sock.addEventListener('error', () => this._setState('error'));
    sock.addEventListener('message', (ev) => {
      const raw = typeof ev.data === 'string' ? ev.data : '[binary]';
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch { /* leave parsed = null */ }
      this.dispatchEvent(new CustomEvent('message', {
        detail: { raw, parsed, receivedAt: Date.now() },
      }));
    });
  }

  send(obj) {
    if (!this._sock || this._sock.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    const text = JSON.stringify(obj);
    this._sock.send(text);
    return text;
  }

  disconnect() {
    if (this._sock) {
      try { this._sock.close(1000, 'client disconnect'); } catch { /* noop */ }
      this._sock = null;
    }
    this._setState('disconnected');
  }

  _setState(s) {
    this.state = s;
    this.dispatchEvent(new CustomEvent('state', { detail: s }));
  }
}
