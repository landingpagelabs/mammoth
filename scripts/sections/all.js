import FALLBACK_COUNTRIES from './countries.js';

const modalSlider = new Swiper('#modalSlider', {
  loop: true,
  slidesPerView: 'auto',
  centeredSlides: true,
  spaceBetween: 164,
  navigation: {
    nextEl: '#sliderNext',
    prevEl: '#sliderPrev',
  },
  pagination: {
    el: '#modal-pag'
  }
});

// Фон модалки = розмита версія активної картинки слайдера
const modalBg = document.querySelector('.modal-bg');
if (modalBg) {
  const updateModalBg = () => {
    const activeSlide = modalSlider.slides[modalSlider.activeIndex];
    const img = activeSlide && activeSlide.querySelector('img');
    if (!img) return;
    modalBg.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    modalBg.classList.add('loaded');
  };

  modalSlider.on('slideChange', updateModalBg);
  updateModalBg(); // стартовий слайд
}

 document.addEventListener("DOMContentLoaded", function () {
    const iconMenu = document.querySelector('.menu_icon');
    const iconMenuWrap = document.querySelector('.menu_icon-wrap');
    const menuBody = document.querySelector('.header_menu');

    if (iconMenu && iconMenuWrap && menuBody) {
      iconMenuWrap.addEventListener('click', function () {
        document.body.classList.toggle('_lock');
        iconMenu.classList.toggle('_active');
        menuBody.classList.toggle('_active');
        iconMenuWrap.classList.toggle('_active');
      });
    }
  });



document.addEventListener("DOMContentLoaded", function () {
  const now = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  document.querySelectorAll('[dyn]').forEach(el => {
    const type = el.getAttribute('dyn');

    if (type === 'Month') {
      el.textContent = monthNames[now.getMonth()];
    } else if (type === 'Year') {
      el.textContent = now.getFullYear();
    }
  });
});


// Favicon Change Script
const favicon = document.querySelector('link[rel="shortcut icon"]');
const standardFavicon = "images/header/tab-default.png";
const changedFavicon = "images/header/tab-change.png";

document.addEventListener("visibilitychange", () => {
  if (!favicon) return;
  favicon.href = document.hidden ? changedFavicon : standardFavicon;
});


const originalTitle = document.title;
let flashInterval = null;
let preventFlashing = false;

function startFlashing() {
  if (preventFlashing) return; // Prevent flashing if set

  let isFlashing = false;
  if (!flashInterval) {
    flashInterval = setInterval(() => {
      document.title = isFlashing ? "(1) New Message!" : originalTitle;
      isFlashing = !isFlashing;
    }, 1000);
  }
}

function stopFlashing() {
  if (flashInterval) {
    clearInterval(flashInterval);
    flashInterval = null;
    document.title = originalTitle;
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden && !preventFlashing) {
    startFlashing();
  } else {
    stopFlashing();
  }
});

// Prevent flashing when buttons with data-stop-flashing="true" are clicked
document.querySelectorAll("[data-stop-flashing='true']").forEach(button => {
  button.addEventListener("click", () => {
    preventFlashing = true;
    stopFlashing(); // Ensure no flashing starts
  });
});






// --------------------------------------------------------------------
// MODAL — клік по gallery_item відкриває модалку й ставить активний
// слайд за data-gallery (loop → slideToLoop, бо є клони).
// --------------------------------------------------------------------
const modal = document.querySelector('.modal');
const galleryItems = document.querySelectorAll('.gallery_list .gallery_item');
const modalExit = document.querySelector('.modal-exit');
const modalOverlay = document.querySelector('.modal-overlay');

if (modal) {
  const openModal = (num) => {
    if (num) modalSlider.slideToLoop(Number(num) - 1, 0);
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden'; // блокуємо скрол сторінки
  };

  const closeModal = () => {
    modal.classList.remove('visible');
    document.body.style.overflow = ''; // повертаємо скрол
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openModal(item.dataset.gallery));
  });

  const galleryCta = document.querySelector('.gallery_cta');
  if (galleryCta) galleryCta.addEventListener('click', () => openModal(galleryCta.dataset.gallery));

  if (modalExit) modalExit.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  // CTA в модалці: закриваємо модалку (далі спрацює нативний перехід на #inquiry)
  const modalCta = modal.querySelector('.cta-main');
  if (modalCta) modalCta.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

const cta = document.querySelector('.reviews_cta');
const arrow = document.querySelector('.reviews_cta .reviews_arrow');
const label = document.querySelector('.reviews_cta .text-label-extra-small');
const hiddenItems = document.querySelectorAll('.reviews_item:nth-child(n+4)');

let expanded = false;

cta.addEventListener('click', () => {
  expanded = !expanded;

  hiddenItems.forEach(item => item.classList.toggle('expanded', expanded));
  arrow.classList.toggle('active', expanded);
  label.textContent = expanded ? 'SHOW LESS REVIEWS' : 'SHOW 34 MORE REVIEWS';
});

// --------------------------------------------------------------------
// PROCESS IMAGES — ховер-бейдж «expand full image» (той самий, що в
// галереї) + клік відкриває повне зображення в простому лайтбоксі
// (окремо від галерейної Swiper-модалки).
// --------------------------------------------------------------------
(() => {
  const items = document.querySelectorAll('.process_list-images-item');
  if (!items.length) return;

  // Лайтбокс будуємо один раз
  const lightbox = document.createElement('div');
  lightbox.className = 'img-lightbox';
  lightbox.innerHTML =
    '<div class="img-lightbox_overlay"></div>' +
    '<button class="img-lightbox_close" aria-label="Close">&times;</button>' +
    '<img class="img-lightbox_img" src="" alt="">';
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('.img-lightbox_img');

  const openLightbox = (src, alt) => {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lightbox.classList.add('visible');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('visible');
    document.body.style.overflow = '';
  };

  // Бейдж «EXPAND FULL IMAGE» клонуємо з галереї, щоб не дублювати SVG
  const badgeTemplate = document.querySelector('.gallery_list .gallery_hover');

  items.forEach(item => {
    if (badgeTemplate && !item.querySelector('.gallery_hover')) {
      item.appendChild(badgeTemplate.cloneNode(true));
    }
    const img = item.querySelector('img');
    item.addEventListener('click', () => {
      if (img) openLightbox(img.currentSrc || img.src, img.alt);
    });
  });

  lightbox.querySelector('.img-lightbox_overlay').addEventListener('click', closeLightbox);
  lightbox.querySelector('.img-lightbox_close').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();

// --------------------------------------------------------------------
// INQUIRY FORM — нативна валідація + AJAX-надсилання у Formspree.
// Після успіху редіректимо на /congrats (відносний шлях, працює на
// будь-якому домені); при збої показуємо повідомлення про помилку.
// --------------------------------------------------------------------
(() => {
  const form = document.querySelector('.form');
  if (!form) return;

  const errorBox = form.querySelector('.form_error');
  const submitBtn = form.querySelector('[type="submit"]');

  const showError = (msg) => {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1) Нативна валідація (required, type=email, pattern ZIP тощо)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (errorBox) errorBox.classList.remove('visible');
    if (submitBtn) submitBtn.disabled = true;

    // 2) AJAX-надсилання у Formspree
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        window.location.href = '/congrats';
        return;
      }
      throw new Error('Bad response');
    } catch (err) {
      showError('Something went wrong. Please try again, or email us directly.');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();



const acc = document.querySelectorAll(".item-faq");
acc.forEach((accItem) => {
  accItem.addEventListener("click", function () {
    this.classList.toggle("active");
    const head = this.querySelector('.item-faq_head');
    const panel = this.querySelector('.item-faq_panel');
    panel.classList.toggle("active");
    head.classList.toggle("active");
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + 24 + "px";
    }
  });
});

document.querySelectorAll('.form_input-wrap').forEach(wrap => {
  const input = wrap.querySelector('input, textarea, select');
  const label = wrap.querySelector('label');

  if (!input || !label) return;

  // При фокусі — активуємо лейбл
  input.addEventListener('focus', () => {
    label.classList.add('active');
  });

  // При блурі — прибираємо тільки якщо поле порожнє
  input.addEventListener('blur', () => {
    if (!input.value.trim()) {
      label.classList.remove('active');
    }
  });

  // Для select — тримаємо лейбл активним, поки вибрано країну
  if (input.tagName === 'SELECT') {
    input.addEventListener('change', () => {
      label.classList.toggle('active', Boolean(input.value));
    });
  }
});

// --------------------------------------------------------------------
// COUNTRY SELECT — список усіх країн через REST Countries API.
// Якщо API недоступний — підставляємо резервний список.
// --------------------------------------------------------------------
const countrySelect = document.querySelector('#country-select');

if (countrySelect) {
  const fillCountries = (names) => {
    const frag = document.createDocumentFragment();
    names.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      frag.appendChild(opt);
    });
    countrySelect.appendChild(frag);
  };

  fetch('https://restcountries.com/v3.1/all?fields=name')
    .then(res => {
      if (!res.ok) throw new Error('Country API error');
      return res.json();
    })
    .then(data => {
      const names = data
        .map(c => c && c.name && c.name.common)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      fillCountries(names);
    })
    .catch(() => fillCountries(FALLBACK_COUNTRIES));
}