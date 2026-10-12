// Easy Bookmark Select: reorder bookmarks by dragging them in the side panel.
// Uses only the standard chrome.bookmarks API, so it works in Chrome too.
const t = (key) => chrome.i18n.getMessage(key);
document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });

const rootSelect = document.getElementById('root');
const list = document.getElementById('list');
const crumbs = document.getElementById('crumbs');
let path = [];          // folders opened from the root, as [{id, title}]
let folderId = null;    // folder shown now
let dragId = null;

function favicon(url) {
  const u = new URL(chrome.runtime.getURL('/_favicon/'));
  u.searchParams.set('pageUrl', url);
  u.searchParams.set('size', '16');
  return u.toString();
}

async function loadRoots() {
  const [tree] = await chrome.bookmarks.getTree();
  const names = { '1': t('bar'), '2': t('other'), '3': t('mobile') };
  rootSelect.replaceChildren();
  for (const node of tree.children || []) {
    const opt = document.createElement('option');
    opt.value = node.id;
    opt.textContent = names[node.id] || node.title;
    rootSelect.append(opt);
  }
  rootSelect.onchange = () => { path = []; open(rootSelect.value); };
  open(rootSelect.value || '1');
}

function renderCrumbs() {
  crumbs.replaceChildren();
  if (!path.length) return;
  const up = document.createElement('button');
  up.textContent = `← ${t('up')}`;
  up.onclick = () => { path.pop(); open(path.length ? path[path.length - 1].id : rootSelect.value, true); };
  crumbs.append(up, ' ', path.map((p) => p.title).join(' / '));
}

async function open(id, keepPath = false) {
  folderId = id;
  if (!keepPath && id !== rootSelect.value) {
    const [node] = await chrome.bookmarks.get(id);
    path.push({ id, title: node.title });
  }
  renderCrumbs();
  render(await chrome.bookmarks.getChildren(id));
}

function render(children) {
  list.replaceChildren();
  if (!children.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = t('empty');
    list.append(p);
    return;
  }
  children.forEach((node, index) => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = node.id;
    li.dataset.index = String(index);
    li.dataset.folder = node.url ? '' : '1';
    if (node.url) {
      const img = document.createElement('img');
      img.src = favicon(node.url);
      img.alt = '';
      li.append(img);
    } else {
      const f = document.createElement('span');
      f.className = 'fold';
      f.textContent = '▸';
      f.title = t('folder');
      li.append(f);
    }
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = node.title || node.url || '';
    title.title = node.url || node.title;
    li.append(title);

    li.addEventListener('click', () => {
      if (node.url) chrome.tabs.update({ url: node.url });
      else open(node.id);
    });
    li.addEventListener('dragstart', (e) => {
      dragId = node.id;
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    li.addEventListener('dragend', () => { dragId = null; li.classList.remove('dragging'); clearMarks(); });
    li.addEventListener('dragover', (e) => {
      if (!dragId || dragId === node.id) return;
      e.preventDefault();
      clearMarks();
      li.classList.add(zone(e, li));
    });
    li.addEventListener('drop', async (e) => {
      e.preventDefault();
      const where = zone(e, li);
      clearMarks();
      if (!dragId || dragId === node.id) return;
      const id = dragId;
      if (where === 'into') {
        await chrome.bookmarks.move(id, { parentId: node.id });
      } else {
        // "Insert before position k": Chrome adjusts the index itself when the
        // item moves down within the same folder.
        const k = index + (where === 'after' ? 1 : 0);
        await chrome.bookmarks.move(id, { parentId: folderId, index: k });
      }
    });
    list.append(li);
  });
}

// Top third: before, bottom third: after, middle of a folder: inside it.
function zone(e, li) {
  const r = li.getBoundingClientRect();
  const y = (e.clientY - r.top) / r.height;
  if (li.dataset.folder && y > 0.3 && y < 0.7) return 'into';
  return y < 0.5 ? 'before' : 'after';
}

function clearMarks() {
  list.querySelectorAll('.before,.after,.into').forEach((el) => el.classList.remove('before', 'after', 'into'));
}

// Keep the list in step with changes made anywhere (bookmark bar, other windows).
const refresh = () => { if (folderId) chrome.bookmarks.getChildren(folderId).then(render, () => open(rootSelect.value)); };
for (const ev of ['onMoved', 'onCreated', 'onRemoved', 'onChanged', 'onChildrenReordered']) chrome.bookmarks[ev].addListener(refresh);

loadRoots();
