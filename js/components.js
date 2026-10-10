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

    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const links = Array.from(nav.querySelectorAll('a'));
    const slider = nav.querySelector('.liquid-slider');
    if (!slider || links.length === 0) return;

    const closeMenu = () => {
        nav.classList.remove('is-open');
        if (menuToggle) {
            menuToggle.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    };

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

        if (window.innerWidth > 860) {
            moveSlider(currentLink);
        }
    };

    const moveSlider = link => {
        const navRect = nav.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        const offset = linkRect.left - navRect.left - nav.clientLeft - 6;
        nav.style.setProperty('--slider-x', `${offset}px`);
        nav.style.setProperty('--slider-width', `${linkRect.width}px`);
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', event => {
            event.stopPropagation();
            const isOpen = nav.classList.toggle('is-open');
            menuToggle.classList.toggle('is-open', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    document.addEventListener('click', event => {
        const topbar = document.querySelector('.topbar-inner');
        if (!topbar || topbar.contains(event.target)) return;
        closeMenu();
    });

    links.forEach(link => {
        link.addEventListener('pointerenter', () => {
            if (window.innerWidth > 860) moveSlider(link);
        });
        link.addEventListener('focus', () => {
            if (window.innerWidth > 860) moveSlider(link);
        });
        link.addEventListener('click', () => {
            if (window.innerWidth <= 860) closeMenu();
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
    window.addEventListener('resize', () => {
        if (window.innerWidth > 860) {
            closeMenu();
        }
        setCurrentLink();
    });
    window.addEventListener('hashchange', setCurrentLink);
    setCurrentLink();
}

loadLayoutComponents().catch(error => {
    console.error('Unable to load shared portfolio layout.', error);
});
