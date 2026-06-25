import { clipPage, ClipResult } from './utils/extractor';

chrome.runtime.onMessage.addListener(
  (
    message: { action: string; selection?: boolean },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ClipResult | { error: string }) => void
  ) => {
    if (message.action === 'clip') {
      try {
        const result = clipPage(message.selection ?? false);
        if (result) {
          sendResponse(result);
        } else {
          sendResponse({ error: 'Could not extract content from this page.' });
        }
      } catch (err) {
        sendResponse({ error: `Extraction failed: ${(err as Error).message}` });
      }
      return true;
    }
  }
);
