const LINKS = [
  { id: 'home',       href: '/',            label: 'Home' },
  { id: 'log-viewer', href: '/log-viewer/', label: 'Log Viewer' },
];

export function mountNav(el, { active } = {}) {
  if (!el) return;
  const brand = document.createElement('span');
  brand.className = 'brand';
  brand.textContent = 'Trader Bot';
  el.appendChild(brand);

  for (const link of LINKS) {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;
    if (link.id === active) a.setAttribute('aria-current', 'page');
    el.appendChild(a);
  }
}
