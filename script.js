document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('scrubVideo');
  const divisionOverlay = document.getElementById('divisionOverlay');
  const scrollScrubZone = document.getElementById('scrollScrubZone');
  const heroSection = document.getElementById('hero');
  const preloader = document.getElementById('preloader');
  const headerLogo = document.getElementById('headerLogo');
  const header = document.getElementById('header');

  const screenMask = document.getElementById('screenMask');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => preloader.remove(), 600);
    }
    if (heroSection) heroSection.classList.add('is-revealed');
    if (headerLogo) headerLogo.classList.add('is-visible');
  };
  setTimeout(reveal, 2500);

  if (video && !reducedMotion) {
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    video.src = isMobile ? video.dataset.srcMobile : video.dataset.srcDesktop;
    video.muted = true;
    video.playsInline = true;

    video.addEventListener('loadeddata', () => {
      video.play().then(() => video.pause()).catch(() => {}).finally(() => {
        video.currentTime = 0;
        video.classList.add('is-loaded');
      });
      reveal();
    }, { once: true });
    video.addEventListener('error', reveal, { once: true });
    video.load();
  } else {
    if (video) video.classList.add('is-loaded');
    reveal();
  }

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

    if (!reducedMotion && video.duration && !isNaN(video.duration)) {
      video.currentTime = progress * video.duration;
    }

    if (screenMask) {
      if (progress >= 0.94) { 
        screenMask.classList.add('is-active');
      } else {
        screenMask.classList.remove('is-active');
      }
    }

    let newState = -1;
    if (progress > 0.01 && progress < 0.45) {
      newState = 0;    } else if (progress >= 0.45 && progress <= 0.95) {
      const stepProgress = (progress - 0.45) / 0.50;
      newState = Math.min(4, Math.floor(stepProgress * 4) + 1);    }

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