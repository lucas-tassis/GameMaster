/**
 * Game Master — Controlador Principal da Aplicação (app.js)
 */
import { store } from './store.js';
import { renderDashboard } from './components/dashboard.js';
import { renderPresenca } from './components/presenca.js';
import { renderAcervo } from './components/acervo.js';
import { renderFotos } from './components/fotos.js';
import { renderNotas } from './components/notas.js';
import { renderConfig } from './components/config.js';

class App {
  constructor() {
    this.currentTab = 'dashboard';
    this.initElements();
    this.initEvents();
    this.renderCurrentTab();
  }

  initElements() {
    this.navBtns = document.querySelectorAll('.nav-btn');
    this.tabPanels = document.querySelectorAll('.tab-panel');
    this.toastContainer = document.getElementById('toast-container');
    
    // Modal
    this.modalBackdrop = document.getElementById('app-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
  }

  initEvents() {
    // Navegação por Abas
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.navigateToTab(tab);
      });
    });

    // Modal Close
    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.closeModal();
    });

    // Re-renderizar quando o estado mudar
    store.addEventListener('state-changed', () => {
      this.renderCurrentTab();
    });
  }

  navigateToTab(tabName) {
    this.currentTab = tabName;

    // Atualiza botões
    this.navBtns.forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Atualiza painéis
    this.tabPanels.forEach(panel => {
      if (panel.id === `tab-${tabName}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    this.renderCurrentTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentTab() {
    const container = document.getElementById(`tab-${this.currentTab}`);
    if (!container) return;

    switch (this.currentTab) {
      case 'dashboard':
        renderDashboard(container, (tab) => this.navigateToTab(tab));
        break;
      case 'presenca':
        renderPresenca(container, (msg, type) => this.showToast(msg, type));
        break;
      case 'acervo':
        renderAcervo(
          container, 
          (msg, type) => this.showToast(msg, type),
          (title, htmlContent) => this.openModal(title, htmlContent),
          () => this.closeModal()
        );
        break;
      case 'fotos':
        renderFotos(container, (msg, type) => this.showToast(msg, type));
        break;
      case 'notas':
        renderNotas(container, (msg, type) => this.showToast(msg, type));
        break;
      case 'config':
        renderConfig(container, (msg, type) => this.showToast(msg, type));
        break;
    }
  }

  openModal(title, htmlContent) {
    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = htmlContent;
    this.modalBackdrop.classList.remove('hidden');
  }

  closeModal() {
    this.modalBackdrop.classList.add('hidden');
    this.modalBody.innerHTML = '';
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Inicializa a aplicação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
