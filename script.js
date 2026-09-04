// Забороняємо браузеру запам'ятовувати позицію скролу при оновленні сторінки
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function forceScrollTop() {
  window.scrollTo(0, 0);
}

forceScrollTop();

window.addEventListener("load", forceScrollTop);

// Спрацьовує навіть при поверненні зі кешу браузера (кнопка "назад")
window.addEventListener("pageshow", forceScrollTop);

// Додаткова страховка з невеликою затримкою — на випадок,
// якщо браузер відновлює позицію вже ПІСЛЯ load
setTimeout(forceScrollTop, 100);
setTimeout(forceScrollTop, 300);

document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // Модальне вікно запису на масаж
  // ============================================================
  const modal = document.getElementById("bookingModal");
  const openButtons = document.querySelectorAll(".open-modal-btn");
  const closeBtn = document.querySelector(".close-btn");
  const form = document.getElementById("massageForm");
  const formMessage = document.getElementById("formMessage");
  const phoneInput = document.getElementById("phone");
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");

  const PHONE_TEMPLATE = "__ ___ __ __";
  const DEFAULT_MESSAGE_TEXT = "Доброго дня, хочу записатись на масаж";

  const TELEGRAM_BOT_TOKEN = "8977054136:AAEyw5YkqnPq_MdOvpJyJUVTLSCGvPj9l1s";
  const TELEGRAM_CHAT_ID = "5997199497";

  function closeModal() {
    if (!modal || !modal.classList.contains("show")) return;
    modal.classList.remove("show");
    modal.classList.add("hide");
    setTimeout(() => {
      modal.classList.remove("hide");
    }, 1200);
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (modal) modal.classList.add("show");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("show")) {
      closeModal();
    }
  });

  function formatPhoneValue(digits) {
    let result = "";
    let di = 0;
    for (let i = 0; i < PHONE_TEMPLATE.length; i++) {
      if (PHONE_TEMPLATE[i] === "_") {
        result += digits[di] !== undefined ? digits[di] : "_";
        di++;
      } else {
        result += PHONE_TEMPLATE[i];
      }
    }
    return result;
  }

  function cursorPosForDigits(count) {
    let di = 0;
    for (let i = 0; i < PHONE_TEMPLATE.length; i++) {
      if (PHONE_TEMPLATE[i] === "_") {
        di++;
        if (di === count) return i + 1;
      }
    }
    return 0;
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const digits = phoneInput.value.replace(/\D/g, "").slice(0, 9);
      phoneInput.value = formatPhoneValue(digits);
      const pos = cursorPosForDigits(digits.length);
      phoneInput.setSelectionRange(pos, pos);
    });

    phoneInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") return;
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });

    phoneInput.addEventListener("focus", () => {
      const digits = phoneInput.value.replace(/\D/g, "").length;
      const pos = digits === 0 ? 0 : cursorPosForDigits(digits);
      phoneInput.setSelectionRange(pos, pos);
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const phoneDigits = phoneInput.value.replace(/\D/g, "");
      const messageText = messageInput.value.trim();

      if (!name) {
        showFormMessage("Будь ласка, вкажіть ваше ім'я.", "error");
        return;
      }

      if (phoneDigits.length !== 9) {
        showFormMessage("Перевірте номер телефону — має бути 9 цифр після +380.", "error");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Надсилаємо...";
      }

      const fullPhone = "+380 " + phoneInput.value;
      const text =
        "📩 Нова заявка на масаж!\n\n" +
        "👤 Ім'я: " + name + "\n" +
        "📞 Телефон: " + fullPhone + "\n" +
        "💬 Повідомлення: " + messageText;

      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            showFormMessage("Дякуємо! Ваша заявка прийнята, ми зв'яжемося з вами найближчим часом.", "success");
          } else {
            showFormMessage("Заявку не вдалось надіслати. Зателефонуйте нам, будь ласка.", "error");
          }
        })
        .catch(() => {
          showFormMessage("Заявку не вдалось надіслати. Зателефонуйте нам, будь ласка.", "error");
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Надіслати";
          }

          setTimeout(() => {
            closeModal();
            if (formMessage) {
              formMessage.style.opacity = "0";
              formMessage.style.maxHeight = "0";
            }
            form.reset();
            phoneInput.value = PHONE_TEMPLATE;
            messageInput.value = DEFAULT_MESSAGE_TEXT;
          }, 4500);
        });
    });
  }

  function showFormMessage(text, type) {
    if (!formMessage) {
      alert(text);
      return;
    }

    formMessage.textContent = text;
    formMessage.style.display = "block";
    formMessage.style.opacity = "1";
    formMessage.style.maxHeight = "80px";
    formMessage.style.padding = "8px 12px";
    formMessage.style.marginTop = "8px";
    formMessage.style.borderRadius = "8px";
    formMessage.style.fontWeight = "600";
    formMessage.style.textAlign = "center";

    if (type === "success") {
      formMessage.style.background = "#e6f4ea";
      formMessage.style.color = "#2e7d32";
    } else {
      formMessage.style.background = "#fdecea";
      formMessage.style.color = "#c62828";
    }
  }







  
  // ============================================================
  // Топбар + перемикач мов (працює однаково на всіх сторінках)
  // ============================================================
    const topbarContainer = document.getElementById("topbar");

  if (topbarContainer) {
    fetch("top-bar.html")
      .then((res) => res.text())
      .then((html) => {
        topbarContainer.innerHTML = html;

        const links = topbarContainer.querySelectorAll(".topbar-nav a");
        links.forEach((link) => {
          if (link.href === window.location.href) {
            link.classList.add("active");
          }
        });

        setupLanguageSwitcher();
      });
  }

  const footerContainer = document.getElementById("footer");

  if (footerContainer) {
    fetch("footer.html")
      .then((res) => res.text())
      .then((html) => {
        footerContainer.innerHTML = html;
      });
  }

  function setupLanguageSwitcher() {
    const langSelect = document.getElementById("custom-lang-select");
    if (!langSelect) return;

    langSelect.addEventListener("change", function () {
      triggerGoogleTranslate(this.value);
    });

    loadGoogleTranslateScript();
  }

  function loadGoogleTranslateScript() {
    if (document.getElementById("google-translate-script")) return;

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);
  }

    function triggerGoogleTranslate(lang) {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    } else {
      setTimeout(() => triggerGoogleTranslate(lang), 500);
    }
  }

  // Примусово ховаємо панель Google Translate, якщо вона з'являється
  function forceHideGoogleBanner() {
    document.body.style.top = "0px";
    document.body.style.position = "static";

    document.querySelectorAll("iframe.goog-te-banner-frame, .goog-te-banner-frame").forEach((el) => {
      el.style.display = "none";
      el.style.visibility = "hidden";
      el.style.height = "0";
    });
  }

  const bannerObserver = new MutationObserver(forceHideGoogleBanner);
  bannerObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["style"],
    childList: true,
    subtree: true
  });

  setInterval(forceHideGoogleBanner, 300);
}); 


  // ============================================================
  // Fade-in анімація секцій при скролі
  // ============================================================
  const fadeElements = document.querySelectorAll(".fade-in");

  if (fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeElements.forEach((el) => fadeObserver.observe(el));
  }

  // ============================================================
  // Лічильники цифр у статистиці
  // ============================================================
  const statNumbers = document.querySelectorAll(".stat-number");

  if (statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => statsObserver.observe(el));
  }

  function animateCounter(el) { 
    const target = parseInt(el.getAttribute("data-target"), 10);
    const duration = 2900;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // ============================================================
  // Слайдер відгуків на сторінці "Про нас"
  // ============================================================
  const testimonialSwiperEl = document.querySelector(".testimonialSwiper");

  if (testimonialSwiperEl && typeof Swiper !== "undefined") {
    new Swiper(".testimonialSwiper", {
      slidesPerView: 2,
      spaceBetween: 24,
      loop: true,

      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },

      pagination: {
        el: ".testimonialSwiper .swiper-pagination",
        clickable: true
      },

      breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 }
      }
    });
  }

  // ============================================================
  // Слайдер "Відгуки клієнтів" (Swiper.js) — ті самі фішки, що й у популярних послугах
  // ============================================================
  const reviewSwiperEl = document.querySelector(".reviewSwiper");

  if (reviewSwiperEl && typeof Swiper !== "undefined") {
    const reviewSwiper = new Swiper(".reviewSwiper", {
      slidesPerView: 4,
      slidesPerGroup: 1,
      spaceBetween: 20,
      loop: true,

      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },

      navigation: {
        nextEl: ".review-button-next",
        prevEl: ".review-button-prev"
      },

      pagination: {
        el: ".review-pagination",
        clickable: true
      },

      grabCursor: true,

      keyboard: {
        enabled: true,
        onlyInViewport: true,
        pageUpDown: true
      },

      mousewheel: {
        forceToAxis: true,
        sensitivity: 1
      },

      breakpoints: {
        0: { slidesPerView: 1, slidesPerGroup: 1 },
        576: { slidesPerView: 2, slidesPerGroup: 1 },
        768: { slidesPerView: 3, slidesPerGroup: 1 },
        992: { slidesPerView: 4, slidesPerGroup: 1 }
      }
    });
  }







  // ============================================================
  // Фільтрація послуг на сторінці "Наші послуги"
  // ============================================================
  const filterButtons = document.querySelectorAll(".filter-btn");
  const serviceCards = document.querySelectorAll(".service-card");
  const noResultsMsg = document.querySelector(".no-results");

  if (filterButtons.length > 0 && serviceCards.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.getAttribute("data-filter");
        let visibleCount = 0;

        serviceCards.forEach((card) => {
          const category = card.getAttribute("data-category");

          if (filter === "all" || category === filter) {
            card.classList.remove("hidden");
            visibleCount++;
          } else {
            card.classList.add("hidden");
          }
        });

        if (noResultsMsg) {
          noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
        }
      });
    });
  }



  
  // ============================================================
  // Підбір чаю за симптомом на сторінці "Лікувальні трави"
  // ============================================================
  const finderButtons = document.querySelectorAll(".finder-btn");
  const finderResult = document.getElementById("finderResult");

  const herbRecommendations = {
    sleep: {
      icon: "fa-moon",
      title: "Валеріана з ромашкою",
      text: "Ця пара м'яко заспокоює нервову систему і допомагає швидше заснути. Пийте за годину до сну."
    },
    cold: {
      icon: "fa-mug-hot",
      title: "Липовий цвіт з чебрецем",
      text: "Класичне зігріваюче поєднання при перших ознаках застуди — знижує температуру і підтримує імунітет."
    },
    stress: {
      icon: "fa-sun",
      title: "Звіробій",
      text: "Природний антидепресант, який допомагає впоратись зі стресом і покращити настрій."
    },
    headache: {
      icon: "fa-seedling",
      title: "М'ята перцева",
      text: "Класичний засіб від головного болю — знімає напругу і освіжає одразу після кількох ковтків."
    },
    digestion: {
      icon: "fa-fire",
      title: "Материнка з м'ятою",
      text: "Знімає спазми і покращує травлення, особливо приємно пити після їжі."
    }
  };

  if (finderButtons.length > 0 && finderResult) {
    finderButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        finderButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const key = btn.getAttribute("data-herb");
        const herb = herbRecommendations[key];
        if (!herb) return;

        finderResult.style.opacity = "0";

        setTimeout(() => {
          finderResult.innerHTML = `
            <div class="finder-result-icon"><i class="fa-solid ${herb.icon}"></i></div>
            <div class="finder-result-text">
              <h3>${herb.title}</h3>
              <p>${herb.text}</p>
            </div>
          `;
          finderResult.style.opacity = "1";
        }, 250);
      });
    });
  }


  // ============================================================
  // FAQ-акордеон (працює на всіх сторінках, де є .faq-item)
  // ============================================================
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      faqItems.forEach((el) => el.classList.remove("open"));

      if (!isOpen) {
        item.classList.add("open");
      }
    });
  }); 





// Колбек для Google Translate API — має бути глобальною функцією
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: "uk",
    includedLanguages: "uk,en,pl,ru",
    autoDisplay: false
  }, "google_translate_element");
}