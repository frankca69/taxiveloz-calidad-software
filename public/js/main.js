document.addEventListener('DOMContentLoaded', () => {
    const hamburgerButton = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('main-nav-links');

    if (hamburgerButton && navLinks) {
        hamburgerButton.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburgerButton.classList.toggle('active');

            // Update aria-expanded attribute
            const isExpanded = navLinks.classList.contains('nav-active');
            hamburgerButton.setAttribute('aria-expanded', isExpanded);
        });
    }
});
