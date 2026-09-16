export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'style') node.setAttribute('style', value);
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(4)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sample(list, count, exclude = []) {
  const pool = list.filter((item) => !exclude.includes(item));
  return shuffle(pool).slice(0, count);
}

export function noteStyle(note) {
  return `--note-color:${note.color};--note-ink:${note.ink}`;
}

/** A circle with the note name, painted in the note's colour. */
export function noteBubble(note, { colored = true, sub = null } = {}) {
  return el('div', { class: `bubble ${colored ? 'bubble--color' : 'bubble--plain'}`, style: noteStyle(note) },
    el('span', { class: 'bubble__main' }, note.ru),
    sub ? el('span', { class: 'bubble__sub' }, sub) : null,
  );
}

/** A circle with the colour only, no name. */
export function colorBubble(note) {
  return el('div', { class: 'bubble bubble--color bubble--blank', style: noteStyle(note) });
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function svgEl(tag, props = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value === null || value === undefined || value === false) continue;
    node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(4)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Safe append: skips null/undefined (plain DOM would insert the text "null"). */
export function mount(parent, ...children) {
  for (const child of children.flat(4)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child);
  }
}
