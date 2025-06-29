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

/**
 * Calcula la tarifa de la reserva basada en la distancia.
 * Tarifa = 5 (base) + 2 * distanciaEnKm.
 * @param {number} distanciaEnKm - La distancia en kilómetros.
 * @returns {number} La tarifa calculada, con dos decimales.
 */
function calcularTarifaReserva(distanciaEnKm) {
    const tarifaBase = 5;
    const costoPorKm = 2;
    let distancia = parseFloat(distanciaEnKm);

    if (isNaN(distancia) || distancia < 0) {
        distancia = 0; // Si la distancia no es válida o es negativa, tratarla como 0 para el cálculo.
    }

    const tarifaTotal = tarifaBase + (costoPorKm * distancia);
    return parseFloat(tarifaTotal.toFixed(2)); // Asegurar dos decimales
}
