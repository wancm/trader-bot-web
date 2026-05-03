function pad2(n) { return String(n).padStart(2, '0'); }
function pad3(n) { return String(n).padStart(3, '0'); }

function formatTime(ms) {
  const d = new Date(ms);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}.${pad3(d.getMilliseconds())}`;
}

const DIRECTION_LABEL = {
  recv: '↓ recv',
  sent: '↑ sent',
  err:  '! err',
};

function summaryFor(entry) {
  if (entry.parsed && typeof entry.parsed === 'object' && entry.parsed.type) {
    return String(entry.parsed.type);
  }
  return entry.raw.length > 80 ? entry.raw.slice(0, 80) + '…' : entry.raw;
}

function renderRow(entry) {
  const li = document.createElement('li');
  li.className = 'log-row';
  li.dataset.direction = entry.direction;
  // searchable text used by the filter
  const searchable = `${entry.direction} ${entry.raw}`.toLowerCase();
  li.dataset.search = searchable;

  const details = document.createElement('details');

  const summary = document.createElement('summary');
  summary.className = 'log-row__summary';
  summary.innerHTML = `
    <span class="log-row__time"></span>
    <span class="log-row__dir"></span>
    <span class="log-row__title"></span>
  `;
  summary.querySelector('.log-row__time').textContent  = formatTime(entry.receivedAt);
  summary.querySelector('.log-row__dir').textContent   = DIRECTION_LABEL[entry.direction] ?? entry.direction;
  summary.querySelector('.log-row__title').textContent = summaryFor(entry);
  details.appendChild(summary);

  const pre = document.createElement('pre');
  pre.className = 'log-row__body';
  pre.textContent = entry.parsed
    ? JSON.stringify(entry.parsed, null, 2)
    : entry.raw;
  details.appendChild(pre);

  li.appendChild(details);
  return li;
}

export function createLogTable({ list, cap, rowCount, autoScrollEl }) {
  const entries = []; // newest at the end
  let filterText = '';

  function updateCount() {
    rowCount.textContent = `${entries.length} / ${cap}`;
  }

  function applyFilterToRow(li) {
    if (!filterText) {
      li.hidden = false;
      return;
    }
    li.hidden = !li.dataset.search.includes(filterText);
  }

  function append(entry) {
    entries.push(entry);
    const li = renderRow(entry);
    applyFilterToRow(li);
    list.appendChild(li);

    while (entries.length > cap) {
      entries.shift();
      if (list.firstChild) list.removeChild(list.firstChild);
    }
    updateCount();

    const autoScroll = autoScrollEl?.selected !== false;
    if (autoScroll && !li.hidden) {
      const pane = list.parentElement;
      if (pane) pane.scrollTop = pane.scrollHeight;
    }
  }

  function clear() {
    entries.length = 0;
    list.replaceChildren();
    updateCount();
  }

  function setFilter(s) {
    filterText = (s || '').trim().toLowerCase();
    for (const li of list.children) applyFilterToRow(li);
  }

  updateCount();
  return { append, clear, setFilter };
}
