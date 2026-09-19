/**
 * RENT & RÄKNAT - STÄD & REDOVISNING
 * Interaktiv skriptfil (script.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Element-referenser ---
    const header = document.querySelector('.main-header');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.querySelector('.back-to-top');
    const contactForm = document.getElementById('contactForm');
    const successBox = document.getElementById('successBox');
    const resetFormBtn = document.getElementById('resetFormBtn');
    const interestSelect = document.getElementById('interest');
    const serviceButtons = document.querySelectorAll('[data-service]');

    // --- 1. Mobil Navigering ---
    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';

            // Uppdatera tillstånd
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('show');

            // Förhindra skrollning i bakgrunden när menyn är öppen
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });

        // Stäng menyn när en länk klickas (mobilvy)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('show');
                document.body.style.overflow = '';
            });
        });
    }

    // --- 2. Dynamisk Header-skuggning vid Skroll ---
    const handleScrollHeader = () => {
        if (window.scrollY > 30) {
            header.style.padding = '0.5rem 0';
            header.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)';
        } else {
            header.style.padding = '0.75rem 0';
            header.style.boxShadow = 'var(--shadow-sm)';
        }
    };

    window.addEventListener('scroll', handleScrollHeader);
    handleScrollHeader(); // Kör en gång initialt

    // --- 3. Scrollspy (Markera aktiv länk under skroll) ---
    const sections = document.querySelectorAll('section[id]');

    const scrollSpy = () => {
        const scrollPosition = window.scrollY + 120; // Tröskelvärde för att aktivera i tid

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });

        // Hantera startsidan (om man är högst upp)
        if (window.scrollY < 200) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#') {
                    link.classList.add('active');
                }
            });
        }
    };

    window.addEventListener('scroll', scrollSpy);

    // --- 4. Tillbaka-till-toppen knapp ---
    const handleBackToTopVisibility = () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    };

    window.addEventListener('scroll', handleBackToTopVisibility);

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- 5. Boka-knappar (Välj tjänst automatiskt i formuläret) ---
    serviceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const serviceName = button.getAttribute('data-service');

            if (interestSelect && serviceName) {
                // Hitta rätt option i selecten
                let optionFound = false;
                for (let i = 0; i < interestSelect.options.length; i++) {
                    if (interestSelect.options[i].value === serviceName ||
                        interestSelect.options[i].text.includes(serviceName)) {
                        interestSelect.selectedIndex = i;
                        optionFound = true;
                        break;
                    }
                }

                // Om vi klickade på en städkorts-knapp men inte hittade exakt, testa 'Båda' eller 'Städtjänster' kategorier
                if (!optionFound) {
                    if (button.closest('.cleaning-section')) {
                        // Sätt till första städtjänst om specifik saknas
                        interestSelect.value = "Hemstädning";
                    } else if (button.closest('.accounting-section')) {
                        interestSelect.value = "Ekonomitjänster";
                    }
                }

                // Skrolla mjukt till kontaktformuläret
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    e.preventDefault();
                    const yOffset = -80; // Offset för headern
                    const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });

                    // Fokusera på namnfältet efter skroll
                    setTimeout(() => {
                        document.getElementById('name').focus();
                    }, 800);
                }
            }
        });
    });

    // --- 6. Formulärvalidering & Inskickning ---
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('input[required], textarea[required]');

        // Hjälpfunktioner för validering
        const validateEmail = (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        };

        const validatePhone = (phone) => {
            // Tar bort mellanslag och bindestreck för kontroll av längd
            const cleaned = phone.replace(/[\s\-\(\)]/g, '');
            return cleaned.length >= 6 && /^\+?[0-9]+$/.test(cleaned);
        };

        const validateField = (field) => {
            const value = field.value.trim();
            let isValid = true;
            const errorElementId = `${field.id}Error`;
            const errorElement = document.getElementById(errorElementId);

            if (value === '') {
                isValid = false;
            } else if (field.type === 'email' && !validateEmail(value)) {
                isValid = false;
            } else if (field.type === 'tel' && !validatePhone(value)) {
                isValid = false;
            } else if (field.id === 'message' && value.length < 10) {
                isValid = false;
            }

            const formGroup = field.closest('.form-group');
            if (formGroup) {
                if (isValid) {
                    formGroup.classList.remove('has-error');
                } else {
                    formGroup.classList.add('has-error');
                }
            }

            return isValid;
        };

        // Realtidsvalidering när användaren skriver/lämnar ett fält
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                // Om fältet redan har markerats som felaktigt, validera live för att ta bort felmeddelandet direkt
                const formGroup = input.closest('.form-group');
                if (formGroup && formGroup.classList.contains('has-error')) {
                    validateField(input);
                }
            });
        });

        // Hantera inskickning av formulär
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isFormValid = true;

            // Validera alla obligatoriska fält
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                const submitBtn = document.getElementById('submitBtn');

                // Visa laddningsindikator & inaktivera knappen
                submitBtn.classList.add('is-submitting');
                submitBtn.disabled = true;

                // Simulera ett API-anrop (1.5 sekunder)
                setTimeout(() => {
                    // Återställ knapp
                    submitBtn.classList.remove('is-submitting');

                    // Göm formuläret & Visa lyckat-meddelande
                    contactForm.style.display = 'none';
                    successBox.classList.add('show');
                    successBox.setAttribute('aria-hidden', 'false');

                    // Skrolla upp lite så att lyckat-meddelandet syns optimalt
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                        const yOffset = -100;
                        const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }, 1500);
            } else {
                // Fokusera på det första fältet med fel
                const firstErrorField = contactForm.querySelector('.has-error input, .has-error textarea');
                if (firstErrorField) {
                    firstErrorField.focus();
                }
            }
        });
    }

    // Återställ formuläret för att skicka nytt meddelande
    if (resetFormBtn && contactForm && successBox) {
        resetFormBtn.addEventListener('click', () => {
            // Töm alla fält
            contactForm.reset();

            // Ta bort eventuella fel-klasser
            const formGroups = contactForm.querySelectorAll('.form-group');
            formGroups.forEach(group => group.classList.remove('has-error'));

            // Göm lyckat-meddelande & Visa formulär
            successBox.classList.remove('show');
            successBox.setAttribute('aria-hidden', 'true');

            // Liten fördröjning innan formuläret visas för mjukare övergång
            setTimeout(() => {
                contactForm.style.display = 'block';
                const submitBtn = document.getElementById('submitBtn');
                if (submitBtn) submitBtn.disabled = false;
            }, 200);
        });
    }
});
