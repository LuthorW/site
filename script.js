const body = document.body;
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = body.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

const progressBar = document.querySelector('#reading-progress-bar');

if (progressBar) {
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
}

const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
const trackedSections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (trackedSections.length && 'IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  trackedSections.forEach((section) => navObserver.observe(section));
}

const canvas = document.querySelector('#dust-canvas');

if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const context = canvas.getContext('2d');
  const particles = [];
  let width = 0;
  let height = 0;
  let lastFrame = 0;
  let frameId = 0;
  const targetFrame = 1000 / 30;

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const buildParticles = () => {
    particles.length = 0;
    const total = window.innerWidth < 700 ? 20 : 34;

    for (let i = 0; i < total; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.35,
        speedX: (Math.random() - 0.5) * 0.08,
        speedY: -0.025 - Math.random() * 0.08,
        alpha: Math.random() * 0.38 + 0.1,
        pulse: Math.random() * Math.PI * 2
      });
    }
  };

  const draw = (time) => {
    frameId = requestAnimationFrame(draw);
    if (time - lastFrame < targetFrame) return;
    lastFrame = time;

    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.pulse += 0.02;

      if (particle.y < -8) {
        particle.y = height + 8;
        particle.x = Math.random() * width;
      }
      if (particle.x < -8) particle.x = width + 8;
      if (particle.x > width + 8) particle.x = -8;

      const alpha = Math.max(0.04, particle.alpha + Math.sin(particle.pulse) * 0.08);
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(214, 184, 230, ${alpha})`;
      context.fill();
    });
  };

  resizeCanvas();
  buildParticles();
  frameId = requestAnimationFrame(draw);

  window.addEventListener('resize', () => {
    resizeCanvas();
    buildParticles();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
    } else {
      lastFrame = 0;
      frameId = requestAnimationFrame(draw);
    }
  });
}


// Livro — seleção de edição e simulação de pedido
const bookEditionSelect = document.querySelector('#book-edition');
const bookQuantityInput = document.querySelector('#book-quantity');
const bookSubtotal = document.querySelector('#book-subtotal');
const bookTotal = document.querySelector('#book-total');
const quantityMinus = document.querySelector('#quantity-minus');
const quantityPlus = document.querySelector('#quantity-plus');
const bookOrderForm = document.querySelector('#book-order-form');
const orderConfirmation = document.querySelector('#order-confirmation');
const editionCards = document.querySelectorAll('.edition-card[data-edition]');

const currency = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR'
});

const updateBookOrder = () => {
  if (!bookEditionSelect || !bookQuantityInput) return;

  const selectedOption = bookEditionSelect.options[bookEditionSelect.selectedIndex];
  const price = Number(selectedOption.dataset.price || 0);
  const quantity = Math.max(1, Math.min(9, Number(bookQuantityInput.value) || 1));
  const value = price * quantity;

  bookQuantityInput.value = String(quantity);
  if (bookSubtotal) bookSubtotal.textContent = currency.format(value);
  if (bookTotal) bookTotal.textContent = currency.format(value);

  editionCards.forEach((card) => {
    card.classList.toggle('selected', card.dataset.edition === bookEditionSelect.value);
  });
};

if (bookEditionSelect) {
  bookEditionSelect.addEventListener('change', updateBookOrder);
}

if (bookQuantityInput) {
  bookQuantityInput.addEventListener('input', updateBookOrder);
}

if (quantityMinus && bookQuantityInput) {
  quantityMinus.addEventListener('click', () => {
    bookQuantityInput.value = String(Math.max(1, Number(bookQuantityInput.value || 1) - 1));
    updateBookOrder();
  });
}

if (quantityPlus && bookQuantityInput) {
  quantityPlus.addEventListener('click', () => {
    bookQuantityInput.value = String(Math.min(9, Number(bookQuantityInput.value || 1) + 1));
    updateBookOrder();
  });
}

editionCards.forEach((card) => {
  const button = card.querySelector('.edition-select');
  if (!button || !bookEditionSelect) return;

  button.addEventListener('click', () => {
    bookEditionSelect.value = card.dataset.edition;
    updateBookOrder();
    document.querySelector('#comprar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

if (bookOrderForm) {
  updateBookOrder();
  bookOrderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const reference = `LL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const edition = bookEditionSelect?.value || 'Edição';
    const quantity = bookQuantityInput?.value || '1';

    if (orderConfirmation) {
      orderConfirmation.hidden = false;
      orderConfirmation.innerHTML = `<strong>Sendo redirecionado para a página de checkout...</strong><br>Referência ${reference} · ${quantity} × ${edition}.`;
    }
  });
}
