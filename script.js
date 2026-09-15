document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('scrubVideo');
  const divisionOverlay = document.getElementById('divisionOverlay');
  const scrollScrubZone = document.getElementById('scrollScrubZone');
  const heroSection = document.getElementById('hero');
  const preloader = document.getElementById('preloader');
  const headerLogo = document.getElementById('headerLogo');
  const header = document.getElementById('header');

  // Preloader Kaldırma
  setTimeout(() => {
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => preloader.remove(), 600);
    }
    if (heroSection) heroSection.classList.add('is-revealed');
    if (headerLogo) headerLogo.classList.add('is-visible');
  }, 800);

  // VİDEOYU İLK HAREKETE HAZIRLAMA (DECODE)
  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.load();

    const forceDecode = () => {
      video.currentTime = 0.01;
      video.play().then(() => {
        video.pause();
        video.currentTime = 0;
        video.classList.add('is-loaded');
      }).catch(() => {
        video.currentTime = 0;
        video.classList.add('is-loaded');
      });
    };

    if (video.readyState >= 2) {
      forceDecode();
    } else {
      video.addEventListener('loadeddata', forceDecode, { once: true });
    }
  }

  // Akıcı Scroll Scrubbing (En tepeden başlar)
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScrollScrub();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  function handleScrollScrub() {
    if (!video || !scrollScrubZone || !divisionOverlay) return;

    const scrollTop = window.scrollY;
    const totalScrollHeight = scrollScrubZone.offsetTop + scrollScrubZone.offsetHeight - window.innerHeight;
    
    let progress = scrollTop / totalScrollHeight;
    progress = Math.max(0, Math.min(1, progress));

    // VİDEOYU İLK HAREKETLE ANINDA OYNAT
    if (video.duration && !isNaN(video.duration)) {
      video.currentTime = progress * video.duration;
    }

    // --- VİDEO BİTİNCE ARKADA SABİT KALSIN VE MASKESİ ÇALIŞSIN ---
    const screenMask = document.getElementById('screenMask');
    if (screenMask) {
      if (progress >= 0.94) { 
        screenMask.classList.add('is-active');
        // DİKKAT: Artık videoyu gizlemiyoruz (opacity = '0' yapmıyoruz), 
        // böylece video son karesinde arkada sabit kalıyor.
      } else {
        screenMask.classList.remove('is-active');
      }
    }
    // -------------------------------------------------------------

    // YAZI EVRELERİ
    let newState = -1;
    if (progress > 0.01 && progress < 0.45) {
      newState = 0; // AN IDEA APPEARS...
    } else if (progress >= 0.45 && progress <= 0.95) {
      const stepProgress = (progress - 0.45) / 0.50;
      newState = Math.min(4, Math.floor(stepProgress * 4) + 1); // BUILD · LAUNCH · SCALE · REPEAT
    }

    updateDivisionOverlay(newState);

    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  let currentState = null;

  function updateDivisionOverlay(newState) {
    if (currentState === newState) return;
    currentState = newState;

    if (newState === 0) {
      divisionOverlay.innerHTML = `
        <div class="dna-text-wrapper">
          <p class="dna-line">AN IDEA APPEARS.</p>
          <p class="dna-line gold">WE ADD THE DNA.</p>
          <p class="dna-line">IDEAS BECOME BUSINESSES.</p>
        </div>
      `;
    } else if (newState >= 1) {
      divisionOverlay.innerHTML = `
        <div class="steps-wrapper">
          <span class="step-word ${newState >= 1 ? 'is-active' : ''}">BUILD</span>
          <span class="step-dot ${newState >= 2 ? 'is-active' : ''}">·</span>
          <span class="step-word ${newState >= 2 ? 'is-active' : ''}">LAUNCH</span>
          <span class="step-dot ${newState >= 3 ? 'is-active' : ''}">·</span>
          <span class="step-word ${newState >= 3 ? 'is-active' : ''}">SCALE</span>
          <span class="step-dot ${newState >= 4 ? 'is-active' : ''}">·</span>
          <span class="step-word ${newState >= 4 ? 'is-active' : ''}">REPEAT</span>
        </div>
      `;
    } else {
      divisionOverlay.innerHTML = '';
    }
  }
});