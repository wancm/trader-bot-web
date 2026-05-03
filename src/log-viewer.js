import './md-bootstrap.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/switch/switch.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/icon/icon.js';

import { WsClient } from './ws-client.js';
import { mountNav } from './ui/nav.js';
import { createLogTable } from './ui/log-table.js';
import { setStatus } from './ui/status-chip.js';

const DEFAULT_WS_URL =
  import.meta.env.VITE_WS_URL ??
  `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
const BUFFER_CAP = 500;

mountNav(document.getElementById('app-nav'), { active: 'log-viewer' });

const $ = (id) => document.getElementById(id);
const urlInput   = $('ws-url');
const btnConnect = $('btn-connect');
const btnDisc    = $('btn-disconnect');
const btnSend    = $('btn-send-state');
const btnClear   = $('btn-clear');
const filterEl   = $('filter');
const autoScroll = $('auto-scroll');
const rowCount   = $('row-count');
const statusEl   = $('status-chip');
const list       = $('log-list');
const formSend   = $('form-send-state');
const formJson   = $('form-send-json');
const rawJson    = $('raw-json');
const btnSendJson  = $('btn-send-json');
const autoReqId    = $('auto-request-id');
const rawJsonError = $('raw-json-error');

urlInput.value = DEFAULT_WS_URL;

const client = new WsClient();
const table  = createLogTable({ list, cap: BUFFER_CAP, rowCount, autoScrollEl: autoScroll });

client.addEventListener('state', (ev) => {
  setStatus(statusEl, ev.detail);
  const connected   = ev.detail === 'connected';
  const connecting  = ev.detail === 'connecting';
  btnConnect.disabled  = connected || connecting;
  btnDisc.disabled     = !connected;
  btnSend.disabled     = !connected;
  btnSendJson.disabled = !connected;
});

client.addEventListener('message', (ev) => {
  table.append({ direction: 'recv', ...ev.detail });
});

btnConnect.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) return;
  client.connect(url);
});

btnDisc.addEventListener('click', () => client.disconnect());

btnClear.addEventListener('click', () => table.clear());

let filterTimer;
filterEl.addEventListener('input', () => {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(() => table.setFilter(filterEl.value), 150);
});

formSend.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(formSend);
  const req = {
    type: 'get_portfolio_state',
    request_id: crypto.randomUUID(),
    user_alias: String(fd.get('user_alias') || '').trim(),
    symbol:     String(fd.get('symbol')     || '').trim(),
  };
  try {
    const text = client.send(req);
    table.append({ direction: 'sent', raw: text, parsed: req, receivedAt: Date.now() });
  } catch (err) {
    table.append({
      direction: 'err',
      raw: String(err?.message ?? err),
      parsed: null,
      receivedAt: Date.now(),
    });
  }
});

const PRESETS = {
  get_portfolio_state: {
    type: 'get_portfolio_state',
    request_id: '',
    user_alias: 'wancm',
    symbol: 'EURUSD',
  },
  validate_order: {
    type: 'validate_order',
    request_id: '',
    user_alias: 'wancm',
    symbol: 'EURUSD',
    action: 'BUY',
    quantity: 100,
    price: 1.0850,
  },
};

formJson.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-preset]');
  if (!btn) return;
  const key = btn.dataset.preset;
  if (!PRESETS[key]) return;
  rawJson.value = JSON.stringify(PRESETS[key], null, 2);
  rawJsonError.textContent = '';
});

formJson.addEventListener('submit', (e) => {
  e.preventDefault();
  rawJsonError.textContent = '';
  let payload;
  try {
    payload = JSON.parse(rawJson.value);
  } catch (err) {
    rawJsonError.textContent = `Invalid JSON: ${err.message}`;
    return;
  }
  if (autoReqId.checked && payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (!payload.request_id) payload.request_id = crypto.randomUUID();
  }
  try {
    const text = client.send(payload);
    table.append({ direction: 'sent', raw: text, parsed: payload, receivedAt: Date.now() });
    if (autoReqId.checked) rawJson.value = JSON.stringify(payload, null, 2);
  } catch (err) {
    table.append({
      direction: 'err',
      raw: String(err?.message ?? err),
      parsed: null,
      receivedAt: Date.now(),
    });
  }
});
