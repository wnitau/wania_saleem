async function loadComponent(containerId, componentPath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const response = await fetch(componentPath);
    if (!response.ok) {
        throw new Error(`Unable to load ${componentPath}: ${response.status}`);
    }
    container.innerHTML = await response.text();
}

async function loadLayoutComponents() {
    await Promise.all([
        loadComponent('site-header', 'components/header.html'),
        loadComponent('site-footer', 'components/footer.html')
    ]);

    const year = document.querySelector('[data-current-year]');
    if (year) year.textContent = String(new Date().getFullYear());
    initializeNavigation();
}

function initializeNavigation() {
    const nav = document.querySelector('.liquid-group');
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll('a'));
    const slider = nav.querySelector('.liquid-slider');
    if (!slider || links.length === 0) return;

    const setCurrentLink = () => {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        const currentLink = links.find(link => {
            const url = new URL(link.href);
            return url.pathname === currentPath &&
                (url.hash === currentHash || (!currentHash && url.hash === '#hero-section'));
        }) || links[0];

        links.forEach(link => {
            const isCurrent = link === currentLink;
            link.classList.toggle('is-current', isCurrent);
            if (isCurrent) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
        moveSlider(currentLink);
    };

    const moveSlider = link => {
        const navRect = nav.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        const offset = linkRect.left - navRect.left - nav.clientLeft - 6;
        nav.style.setProperty('--slider-x', `${offset}px`);
        nav.style.setProperty('--slider-width', `${linkRect.width}px`);
    };

    links.forEach(link => {
        link.addEventListener('pointerenter', () => moveSlider(link));
        link.addEventListener('focus', () => moveSlider(link));
        link.addEventListener('click', () => {
            links.forEach(item => {
                const isCurrent = item === link;
                item.classList.toggle('is-current', isCurrent);
                if (isCurrent) item.setAttribute('aria-current', 'page');
                else item.removeAttribute('aria-current');
            });
        });
    });

    nav.addEventListener('pointerleave', setCurrentLink);
    nav.addEventListener('focusout', event => {
        if (!nav.contains(event.relatedTarget)) setCurrentLink();
    });
    window.addEventListener('resize', setCurrentLink);
    window.addEventListener('hashchange', setCurrentLink);
    setCurrentLink();
}

loadLayoutComponents().catch(error => {
    console.error('Unable to load shared portfolio layout.', error);
});
