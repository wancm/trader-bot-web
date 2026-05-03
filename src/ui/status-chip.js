const LABELS = {
  disconnected: 'Disconnected',
  connecting:   'Connecting…',
  connected:    'Connected',
  error:        'Error',
};

export function setStatus(el, state) {
  if (!el) return;
  el.dataset.state = state;
  el.textContent = LABELS[state] ?? state;
}
