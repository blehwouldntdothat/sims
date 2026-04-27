export function clearElement(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}
