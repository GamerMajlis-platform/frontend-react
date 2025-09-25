// Lightweight, safe formatter for a couple markdown-like features used in bios.
// - Escapes HTML
// - Converts **bold** to <strong>
// - Converts *italic* to <em>
// - Preserves newlines as <br/>
export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatBio(raw: string) {
  const escaped = escapeHtml(raw || "");
  // Bold: **text** -> <strong>
  let formatted = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text* -> <em>
  formatted = formatted.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Preserve line breaks
  formatted = formatted.replace(/\n/g, "<br/>");
  return formatted;
}

export default formatBio;
