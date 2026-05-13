/* =========================================================
   Page interactions (auto-rolling, accordion, etc.)
   섹션별 인터랙션은 작업 진행하며 누적됩니다.
   ========================================================= */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    /* ---- kid-sci/kid-ma 롤링 표지 동적 복제 (섹션 8, 9, 10) ---- */
    document.querySelectorAll('.kid-sci__rolling-track').forEach(track => {
      const origItems = Array.from(track.children);
      const setSize = Math.round(origItems.length / 2);
      if (setSize <= 0) return;
      const oneSet = origItems.slice(0, setSize);
      const coverW = parseFloat(getComputedStyle(oneSet[0]).width) || 100;
      const gapW   = parseFloat(getComputedStyle(track).gap)       || 12;
      while (track.scrollWidth < window.innerWidth * 3) {
        oneSet.forEach(item => track.appendChild(item.cloneNode(true)));
      }
      track.style.setProperty('--roll-dist', `${setSize * (coverW + gapW)}px`);
    });

    /* ---- s14 Logo Roll 거리 계산 (섹션 14) ---- */
    const logoTrack = document.querySelector('.s14__logos-track');
    if (logoTrack) {
      const logoItems = logoTrack.querySelectorAll('.s14__logo-item');
      const logoImgs  = logoTrack.querySelectorAll('img');

      function calcLogoRollDist() {
        if (logoItems.length < 20) return;
        // item[10]이 item[0] 대비 얼마나 아래에 있는지 = 한 세트 이동거리
        const dist = logoItems[10].getBoundingClientRect().top
                   - logoItems[0].getBoundingClientRect().top;
        if (dist > 0) logoTrack.style.setProperty('--s14-scroll-dist', `-${dist}px`);
      }

      let imgLoadCount = 0;
      const imgTotal = logoImgs.length;
      logoImgs.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          imgLoadCount++;
        } else {
          img.addEventListener('load',  () => { imgLoadCount++; if (imgLoadCount >= imgTotal) calcLogoRollDist(); });
          img.addEventListener('error', () => { imgLoadCount++; if (imgLoadCount >= imgTotal) calcLogoRollDist(); });
        }
      });
      if (imgLoadCount >= imgTotal) calcLogoRollDist();
    }

    /* ---- s16 과동이 일상 슬라이더 (섹션 16) ---- */
    const morningSlides = document.querySelectorAll('.s16__morning-slide');
    const morningDots   = document.querySelectorAll('.s16__dot');
    const s16Section    = document.getElementById('section-16');
    if (morningSlides.length && s16Section) {
      let s16Current = 0;
      let s16Timer   = null;
      function s16Show(idx) {
        morningSlides[s16Current].classList.remove('s16__morning-slide--active');
        morningDots[s16Current].classList.remove('s16__dot--active');
        s16Current = idx % morningSlides.length;
        morningSlides[s16Current].classList.add('s16__morning-slide--active');
        morningDots[s16Current].classList.add('s16__dot--active');
      }
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !s16Timer) {
            s16Timer = setInterval(() => s16Show(s16Current + 1), 1500);
          } else if (!entry.isIntersecting && s16Timer) {
            clearInterval(s16Timer);
            s16Timer = null;
          }
        });
      }, { threshold: 0.2 }).observe(s16Section);
    }

    /* ---- Sticky CTA (섹션 20에서 숨김) ---- */
    const stickyCta = document.getElementById('sticky-cta');
    const section20 = document.getElementById('section-20');
    if (stickyCta && section20) {
      function updateStickyCta() {
        const rect = section20.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        stickyCta.classList.toggle('sticky-cta--hide', inView);
      }
      window.addEventListener('scroll', updateStickyCta, { passive: true });
      updateStickyCta();
    }

    /* ---- Card drag scroll (섹션 8, 9, 10) ---- */
    document.querySelectorAll('.kid-sci__cards-scroll, .kid-ma__cards-scroll').forEach(el => {
      let isDown = false, startX = 0, origScrollLeft = 0;
      el.addEventListener('mousedown', e => {
        isDown = true;
        startX = e.pageX;
        origScrollLeft = el.scrollLeft;
        el.classList.add('is-dragging');
      });
      el.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        el.scrollLeft = origScrollLeft - (e.pageX - startX);
      });
      el.addEventListener('mouseup', () => { isDown = false; el.classList.remove('is-dragging'); });
      el.addEventListener('mouseleave', () => { isDown = false; el.classList.remove('is-dragging'); });
    });

    /* ---- s23 유의사항 아코디언 (섹션 23) ---- */
    document.querySelectorAll('.s23__header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.s23__item');
        const isOpen = item.classList.contains('s23__item--open');
        item.classList.toggle('s23__item--open', !isOpen);
        header.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    /* ---- s22 FAQ 아코디언 (섹션 22) ---- */
    const chevronDown = './images/section-22/chevron-down.svg';
    const chevronUp   = './images/section-22/chevron-up.svg';
    document.querySelectorAll('.s22__header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.s22__item');
        const isOpen = item.classList.contains('s22__item--open');
        item.classList.toggle('s22__item--open', !isOpen);
        header.setAttribute('aria-expanded', String(!isOpen));
        header.querySelector('.s22__chevron').src = isOpen ? chevronDown : chevronUp;
      });
    });

    /* ---- s20 구독 선택 버튼 (섹션 20) ---- */
    document.querySelectorAll('.s20__select-row').forEach(row => {
      const mode = row.dataset.mode; // 'single' | 'multi'
      row.querySelectorAll('.s20__btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (mode === 'single') {
            row.querySelectorAll('.s20__btn').forEach(b => b.classList.remove('s20__btn--on'));
            btn.classList.add('s20__btn--on');
          } else {
            btn.classList.toggle('s20__btn--on');
          }
        });
      });
    });

    /* ---- Sticky Tabs (섹션 8~10) ---- */
    const tabs = document.querySelectorAll('.tabs-sticky__tab');
    const tabBar = document.getElementById('tabs-sticky');
    const tabSectionIds = ['section-8', 'section-9', 'section-10'];
    const tabSections = tabSectionIds.map(id => document.getElementById(id)).filter(Boolean);

    if (tabs.length && tabBar && tabSections.length) {
      /* 클릭 → 해당 섹션으로 스크롤 */
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = document.getElementById(tab.dataset.target);
          if (!target) return;
          const offset = tabBar.offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        });
      });

      /* 스크롤 → 현재 섹션에 맞게 활성 탭 업데이트 */
      const updateActiveTab = () => {
        const barBottom = tabBar.getBoundingClientRect().bottom + 1;
        let active = tabSections[0];
        tabSections.forEach(sec => {
          if (sec.getBoundingClientRect().top <= barBottom) active = sec;
        });
        tabs.forEach(tab => {
          tab.classList.toggle('tabs-sticky__tab--active', tab.dataset.target === active.id);
        });
      };

      window.addEventListener('scroll', updateActiveTab, { passive: true });
      updateActiveTab();
    }

  });
})();
