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

// Фон модалки = розмита версія активної картинки слайдера.
// Два шари, що чергуються: нову картинку спершу довантажуємо через
// new Image(), тоді проявляємо поверх старої — кросфейд без блимання.
const bgLayers = document.querySelectorAll('.modal-bg .modal-bg_layer');
if (bgLayers.length === 2) {
  let topLayer = 0;
  let bgToken = 0; // захист від «пізніх» onload при швидкому гортанні

  const slideImgUrl = (index) => {
    const slide = modalSlider.slides[index];
    const img = slide && slide.querySelector('img');
    return img ? (img.currentSrc || img.src) : '';
  };

  const setModalBg = (url) => {
    const prev = bgLayers[topLayer];
    const next = bgLayers[1 - topLayer];

    // Скидаємо прозорість нового шару миттєво — він схований під верхнім
    next.style.transition = 'none';
    next.classList.remove('loaded');
    next.offsetHeight; // форсуємо reflow, щоб transition:none спрацював
    next.style.transition = '';

    next.style.backgroundImage = `url("${url}")`;
    next.style.zIndex = '2';
    prev.style.zIndex = '1';
    next.classList.add('loaded'); // 0 → 1 поверх повністю видимого старого
    topLayer = 1 - topLayer;
  };

  const updateModalBg = () => {
    const url = slideImgUrl(modalSlider.activeIndex);
    if (!url) return;

    const token = ++bgToken;
    const preload = new Image();
    preload.onload = () => { if (token === bgToken) setModalBg(url); };
    preload.src = url;

    // Гріємо сусідні слайди, щоб наступне гортання було миттєвим
    [modalSlider.activeIndex - 1, modalSlider.activeIndex + 1].forEach(i => {
      const u = slideImgUrl(i);
      if (u) new Image().src = u;
    });
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

      // Клік по пункту меню: закриваємо оверлей, далі спрацьовує
      // нативний перехід до якоря секції
      menuBody.querySelectorAll('.header_link').forEach(link => {
        link.addEventListener('click', function () {
          document.body.classList.remove('_lock');
          iconMenu.classList.remove('_active');
          menuBody.classList.remove('_active');
          iconMenuWrap.classList.remove('_active');
        });
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
// MODAL — єдина точка входу в галерею: сітка проєктів, CTA, фото
// процесу і фото команди. Активний слайд ставимо за data-gallery
// (loop → slideToLoop, бо є клони); без data-gallery — з першого.
// ВАЖЛИВО: селектори скоуплені, бо слайди модалки самі містять
// .gallery_item[data-gallery] — глобальний біндінг зациклив би кліки.
// --------------------------------------------------------------------
const modal = document.querySelector('.modal');
const modalExit = document.querySelector('.modal-exit');
const modalOverlay = document.querySelector('.modal-overlay');

if (modal) {
  const openModal = (num) => {
    modalSlider.slideToLoop(num ? Number(num) - 1 : 0, 0);
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden'; // блокуємо скрол сторінки
  };

  const closeModal = () => {
    modal.classList.remove('visible');
    document.body.style.overflow = ''; // повертаємо скрол
  };

  document.querySelectorAll(
    '.gallery_list .gallery_item, .gallery_cta, .process_list-images-item, .team_image'
  ).forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.gallery));
  });

  if (modalExit) modalExit.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  // CTA в модалці: закриваємо модалку (далі спрацює нативний перехід на #inquiry)
  const modalCta = modal.querySelector('.cta-main');
  if (modalCta) modalCta.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// REVIEWS — «показати ще»: розкриває блок із 34 письмовими відгуками
const cta = document.querySelector('.reviews_cta');
const arrow = document.querySelector('.reviews_cta .reviews_arrow');
const label = document.querySelector('.reviews_cta .text-label-extra-small');
const writtenList = document.querySelector('.reviews_written');

if (cta && arrow && label && writtenList) {
  let expanded = false;

  cta.addEventListener('click', () => {
    expanded = !expanded;

    writtenList.classList.toggle('expanded', expanded);
    arrow.classList.toggle('active', expanded);
    label.textContent = expanded ? 'SHOW LESS REVIEWS' : 'SHOW 34 MORE REVIEWS';

    // Згортання з глибини списку: повертаємо користувача до кнопки
    if (!expanded) cta.scrollIntoView({ block: 'center' });
  });
}

// --------------------------------------------------------------------
// PROCESS/TEAM — ховер-бейдж «expand full image» (той самий, що в
// галереї); клік відкриває спільну Swiper-модалку (окремий лайтбокс
// прибрано, все веде в одну галерею).
// --------------------------------------------------------------------
(() => {
  const items = document.querySelectorAll('.process_list-images-item, .team_image');
  const badgeTemplate = document.querySelector('.gallery_list .gallery_hover');
  if (!items.length || !badgeTemplate) return;

  items.forEach(item => {
    if (!item.querySelector('.gallery_hover')) {
      item.appendChild(badgeTemplate.cloneNode(true));
    }
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

  // Автозаповнення браузера не тригерить focus — лейбл лишався поверх
  // значення і поле виглядало зламаним. Синхронізуємо лейбл зі значенням
  // на input/change і при завантаженні сторінки.
  const syncLabel = () => {
    if (document.activeElement !== input) {
      label.classList.toggle('active', Boolean(input.value.trim()));
    }
  };
  input.addEventListener('input', () => label.classList.add('active'));
  input.addEventListener('change', syncLabel);
  syncLabel();

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