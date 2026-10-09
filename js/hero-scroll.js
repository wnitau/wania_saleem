(() => {
    const beliefSection = document.querySelector('.belief-section');
    if (beliefSection) {
        const beliefObserver = new IntersectionObserver(([entry]) => {
            beliefSection.classList.toggle('is-active', entry.isIntersecting);
        }, { threshold: 0.55 });

        beliefObserver.observe(beliefSection);
    }

    const section = document.querySelector('.hero-scroll');
    const stage = document.querySelector('.hero-stage');
    if (!section || !stage) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        stage.style.setProperty('--portrait-rotation', '0deg');
        stage.style.setProperty('--portrait-opacity', '1');
        stage.style.setProperty('--title-opacity', '0');
        stage.style.setProperty('--copy-opacity', '1');
        stage.style.setProperty('--portrait-x', `${-Math.min(window.innerWidth * 0.2, 300)}px`);
        return;
    }

    let framePending = false;

    const updateHero = () => {
        const rect = section.getBoundingClientRect();
        const scrollableDistance = section.offsetHeight - stage.offsetHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
        const flipProgress = Math.min(progress / 0.62, 1);
        const shiftProgress = Math.max(0, Math.min(1, (progress - 0.48) / 0.42));
        const copyProgress = Math.max(0, Math.min(1, (progress - 0.68) / 0.24));
        const shift = Math.min(window.innerWidth * (window.innerWidth <= 760 ? 0.2 : 0.19), 300);

        stage.style.setProperty('--portrait-rotation', `${-180 + flipProgress * 180}deg`);
        stage.style.setProperty('--portrait-x', `${-shift * shiftProgress}px`);
        stage.style.setProperty('--portrait-scale', `${1.2 - shiftProgress * 0.24}`);
        stage.style.setProperty('--portrait-opacity', `${0.48 + flipProgress * 0.52}`);
        stage.style.setProperty('--title-opacity', `${1 - Math.min(progress / 0.22, 1)}`);
        stage.style.setProperty('--copy-opacity', String(copyProgress));
        stage.style.setProperty('--copy-x', `${70 * (1 - copyProgress)}px`);
    };

    const requestUpdate = () => {
        if (framePending) return;
        framePending = true;
        window.requestAnimationFrame(() => {
            updateHero();
            framePending = false;
        });
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    updateHero();
})();
