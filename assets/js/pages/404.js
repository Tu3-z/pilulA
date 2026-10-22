import { iniciarLayout } from '../components/layout.js';

/* "Tela azul" do Windows 98 para páginas que não existem. Qualquer tecla volta pro início. */

await iniciarLayout();

document.addEventListener('keydown', (e) => {
  // deixa navegar pelo teclado e usar atalhos
  if (
    ['Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key) ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  )
    return;
  if (e.key === 'Enter' && document.activeElement?.tagName === 'A') return;
  if (e.target.closest('input, textarea, select')) return;
  location.href = 'index.html';
});
