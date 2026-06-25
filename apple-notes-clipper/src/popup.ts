import { ClipResult } from './utils/extractor';
import { copyHtmlToClipboard } from './utils/clipboard';
import { SHORTCUT_URL } from './utils/constants';

const titleEl = document.getElementById('clip-title') as HTMLHeadingElement;
const sourceEl = document.getElementById('clip-source') as HTMLElement;
const previewEl = document.getElementById('clip-preview') as HTMLElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLElement;
const selectionToggle = document.getElementById('selection-toggle') as HTMLInputElement;
const loadingEl = document.getElementById('loading') as HTMLElement;
const contentEl = document.getElementById('content') as HTMLElement;

let currentClip: ClipResult | null = null;

async function init() {
  showLoading(true);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showError('No active tab found.');
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'clip',
      selection: false,
    });

    if ('error' in response) {
      showError(response.error);
      return;
    }

    currentClip = response as ClipResult;
    renderPreview(currentClip);
  } catch {
    showError('Cannot clip this page. Try refreshing the page first.');
  }
}

function renderPreview(clip: ClipResult) {
  showLoading(false);
  titleEl.textContent = clip.metadata.title;
  sourceEl.textContent = clip.metadata.siteName || clip.metadata.url;
  sourceEl.title = clip.metadata.url;
  previewEl.textContent = clip.textContent + (clip.textContent.length >= 300 ? '...' : '');

  if (clip.isSelection) {
    selectionToggle.checked = true;
  }
}

selectionToggle?.addEventListener('change', async () => {
  showLoading(true);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'clip',
      selection: selectionToggle.checked,
    });

    if (!('error' in response)) {
      currentClip = response as ClipResult;
      renderPreview(currentClip);
    }
  } catch {
    showError('Failed to re-clip. Try refreshing the page.');
  }
});

saveBtn?.addEventListener('click', async () => {
  if (!currentClip) return;

  saveBtn.disabled = true;
  statusEl.textContent = 'Copying to clipboard...';
  statusEl.className = 'status';

  try {
    const fullHtml = buildNoteHtml(currentClip);
    const plainText = currentClip.textContent;

    await copyHtmlToClipboard(fullHtml, plainText);

    statusEl.textContent = 'Opening Shortcuts...';

    setTimeout(() => {
      window.open(SHORTCUT_URL, '_blank');
      statusEl.textContent = 'Sent to Apple Notes!';
      statusEl.className = 'status success';
      saveBtn.disabled = false;
    }, 100);
  } catch (err) {
    statusEl.textContent = `Error: ${(err as Error).message}`;
    statusEl.className = 'status error';
    saveBtn.disabled = false;
  }
});

function buildNoteHtml(clip: ClipResult): string {
  const { metadata, content } = clip;
  const dateStr = metadata.publishedDate
    ? new Date(metadata.publishedDate).toLocaleDateString()
    : '';

  const parts: string[] = [
    `<h1>${escapeHtml(metadata.title)}</h1>`,
    '<p>',
    `<strong>Source:</strong> <a href="${escapeAttr(metadata.url)}">${escapeHtml(metadata.siteName || metadata.url)}</a><br>`,
  ];

  if (metadata.author) {
    parts.push(`<strong>Author:</strong> ${escapeHtml(metadata.author)}<br>`);
  }
  if (dateStr) {
    parts.push(`<strong>Date:</strong> ${escapeHtml(dateStr)}<br>`);
  }
  parts.push(`<strong>Clipped:</strong> ${new Date().toLocaleDateString()}`);
  parts.push('</p>');
  parts.push('<hr>');
  parts.push(content);

  return parts.join('\n');
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showLoading(loading: boolean) {
  loadingEl.style.display = loading ? 'flex' : 'none';
  contentEl.style.display = loading ? 'none' : 'block';
}

function showError(msg: string) {
  showLoading(false);
  previewEl.textContent = msg;
  previewEl.className = 'preview error-text';
  saveBtn.disabled = true;
}

init();
