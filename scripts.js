// Dark mode detection
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

// Initialize Lucide icons
lucide.createIcons();

// Navigation
const menuToggle = document.getElementById('menuToggle');
const navigation = document.getElementById('navigation');
const navMenuContainer = navigation.querySelector('.container > div'); // Target the div containing nav-btns

function setMenuIcon(isOpen) {
    if (menuToggle) {
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
            lucide.createIcons(); // Re-render icon
        }
    }
}

function configureMobileMenu(isOpen) {
    if (navigation && navMenuContainer) {
        if (isOpen) {
            navigation.classList.add('mobile-menu-open');
            navMenuContainer.classList.add('flex-col', 'space-y-1');
            navMenuContainer.classList.remove('overflow-x-auto', 'scrollbar-hide', 'space-x-1');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
        } else {
            navigation.classList.remove('mobile-menu-open');
            navMenuContainer.classList.remove('flex-col', 'space-y-1');
            navMenuContainer.classList.add('overflow-x-auto', 'scrollbar-hide', 'space-x-1');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }
        setMenuIcon(isOpen);
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.remove('hidden');
    }

    // Update active navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-primary', 'text-white', 'md:bg-transparent', 'md:text-primary');
        btn.classList.add('text-gray-700', 'dark:text-gray-300', 'hover:text-primary');
    });

    const clickedButton = event.currentTarget;
    if (clickedButton) {
        clickedButton.classList.add('active', 'bg-primary', 'text-white');
        // For larger screens, active state might be different if the mobile menu is not open
        if (!navigation.classList.contains('mobile-menu-open')) {
             clickedButton.classList.add('md:bg-transparent', 'md:text-primary');
        }
        clickedButton.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:text-primary');
    }

    // If mobile menu is open and a section is clicked, close the menu
    if (window.innerWidth < 768 && navigation.classList.contains('mobile-menu-open')) {
        configureMobileMenu(false);
    }
}

// Mobile menu toggle
if (menuToggle && navigation) {
    menuToggle.addEventListener('click', function() {
        const isOpen = navigation.classList.toggle('mobile-menu-open');
        configureMobileMenu(isOpen);
    });
}

// Handle window resize to reset mobile menu if needed
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) { // md breakpoint
        // If menu was open on mobile, reset it for desktop view
        if (navigation.classList.contains('mobile-menu-open')) {
            configureMobileMenu(false);
        }
        navigation.style.display = ''; // Reset display style set by mobile CSS
    } else {
        // If menu is not open, ensure it's hidden on mobile (if that's the default)
         if (!navigation.classList.contains('mobile-menu-open')) {
            navigation.style.display = 'none';
        }
    }
});


// Checklist functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initial check for mobile menu state on page load
    if (window.innerWidth < 768) {
        if (!navigation.classList.contains('mobile-menu-open')) {
            navigation.style.display = 'none';
        }
         setMenuIcon(navigation.classList.contains('mobile-menu-open'));
    } else {
        navigation.style.display = ''; // Ensure nav is visible on desktop
        setMenuIcon(false); // Ensure menu icon is 'menu' on desktop
    }

    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const checklistKeyPrefix = 'checklist_item_';

    function saveChecklistState() {
        checkboxes.forEach((checkbox, index) => {
            // Ensure each checkbox has a unique ID for storage, or use index
            const itemId = checkbox.id || `${checklistKeyPrefix}${index}`;
            localStorage.setItem(itemId, checkbox.checked);
        });
    }

    function loadChecklistState() {
        checkboxes.forEach((checkbox, index) => {
            const itemId = checkbox.id || `${checklistKeyPrefix}${index}`;
            const savedState = localStorage.getItem(itemId);
            if (savedState !== null) {
                checkbox.checked = savedState === 'true';
            }
        });
    }

    function updateProgressAndSave() {
        const total = checkboxes.length;
        let checkedCount = 0;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkedCount++;
            }
        });

        const percentage = total > 0 ? (checkedCount / total) * 100 : 0;

        if (progressBar) {
            progressBar.style.width = percentage + '%';
            const progressBarContainer = progressBar.parentElement;
            if (progressBarContainer) {
                progressBarContainer.setAttribute('aria-valuenow', percentage.toFixed(0));
            }
             // Update color based on progress
            if (percentage === 100) {
                progressBar.className = 'progress-bar bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full';
            } else if (percentage >= 75) {
                progressBar.className = 'progress-bar bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full';
            } else {
                progressBar.className = 'progress-bar bg-gradient-to-r from-primary to-primary-light h-3 rounded-full';
            }
        }
        if (progressText) {
            progressText.textContent = `${checkedCount} de ${total} itens`;
        }
        saveChecklistState(); // Save state after updating progress
    }

    if (checkboxes.length > 0) {
        loadChecklistState(); // Load saved state first
        updateProgressAndSave(); // Then update progress (which also saves, ensuring consistency if nothing was loaded)

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateProgressAndSave);
        });
    }
});

// Calculator functions
function calculateRenewal() {
    const expirationDateInput = document.getElementById('expirationDate');
    const resultsDiv = document.getElementById('renewalResults');

    if (!expirationDateInput || !expirationDateInput.value) {
        alert('Por favor, selecione a data de vencimento da CRT.');
        return;
    }

    const expiry = new Date(expirationDateInput.value + "T00:00:00"); // Ensure correct date parsing
    const renewalStart = new Date(expiry);
    renewalStart.setDate(expiry.getDate() - 30);

    const renewalEnd = new Date(expiry);
    renewalEnd.setDate(expiry.getDate() + 30);

    const today = new Date();
    today.setHours(0,0,0,0); // Normalize today's date

    const currentStatus = document.getElementById('renewalStatus');

    document.getElementById('renewalStart').textContent = renewalStart.toLocaleDateString('pt-BR');
    document.getElementById('renewalEnd').textContent = renewalEnd.toLocaleDateString('pt-BR');

    // Determine status
    if (today < renewalStart) {
        currentStatus.className = 'p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg';
        currentStatus.innerHTML = '<strong>Status:</strong> Ainda não é possível renovar. Aguarde o período adequado.';
    } else if (today >= renewalStart && today <= expiry) {
        currentStatus.className = 'p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg';
        currentStatus.innerHTML = '<strong>Status:</strong> <span class="text-green-600">Período ideal para renovação!</span>';
    } else if (today > expiry && today <= renewalEnd) {
        currentStatus.className = 'p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg';
        currentStatus.innerHTML = '<strong>Status:</strong> <span class="text-yellow-600">CRT vencida! Renove urgentemente.</span>';
    } else {
        currentStatus.className = 'p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg';
        currentStatus.innerHTML = '<strong>Status:</strong> <span class="text-red-600">Prazo para renovação expirado. Será necessário novo processo.</span>';
    }

    if(resultsDiv) resultsDiv.classList.remove('hidden');
}

function validateHours() {
    const weeklyHoursInput = document.getElementById('weeklyHours');
    const serviceHoursInput = document.getElementById('serviceHours');
    const resultsDiv = document.getElementById('hoursResults');

    if (!weeklyHoursInput || !serviceHoursInput || !resultsDiv) return; // Defensive check

    const weeklyHours = parseInt(weeklyHoursInput.value);
    const serviceHours = parseInt(serviceHoursInput.value);

    if (isNaN(weeklyHours) || isNaN(serviceHours)) {
        alert('Por favor, preencha ambos os campos com números válidos.');
        return;
    }

    let resultHTML = '';
    let resultClass = '';

    if (serviceHours < 20 && weeklyHours === serviceHours) {
        resultClass = 'p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg';
        resultHTML = `
            <div class="flex items-center space-x-2 mb-2">
                <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
                <strong class="text-green-800 dark:text-green-200">Carga horária adequada!</strong>
            </div>
            <p class="text-green-700 dark:text-green-300 text-sm">
                Como o serviço funciona menos de 20h semanais, a carga horária de ${weeklyHours}h está adequada.
            </p>
        `;
    } else if (weeklyHours >= 20) {
        resultClass = 'p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg';
        resultHTML = `
            <div class="flex items-center space-x-2 mb-2">
                <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
                <strong class="text-green-800 dark:text-green-200">Carga horária adequada!</strong>
            </div>
            <p class="text-green-700 dark:text-green-300 text-sm">
                A carga horária de ${weeklyHours}h atende ao requisito mínimo de 20h semanais.
            </p>
        `;
    } else {
        resultClass = 'p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg';
        resultHTML = `
            <div class="flex items-center space-x-2 mb-2">
                <i data-lucide="x-circle" class="w-5 h-5 text-red-600"></i>
                <strong class="text-red-800 dark:text-red-200">Carga horária inadequada!</strong>
            </div>
            <p class="text-red-700 dark:text-red-300 text-sm">
                A carga horária de ${weeklyHours}h é inferior ao mínimo de 20h semanais exigido.
            </p>
        `;
    }

    resultsDiv.className = resultClass;
    resultsDiv.innerHTML = resultHTML;
    resultsDiv.classList.remove('hidden');

    // Re-initialize icons
    lucide.createIcons();
}

// FAQ functionality
function toggleFAQ(faqId) {
    const faqContent = document.getElementById(faqId);
    const icon = document.getElementById('icon-' + faqId);
    const button = document.querySelector(`button[aria-controls="${faqId}"]`);

    if (faqContent && icon && button) { // Defensive checks
        const isHidden = faqContent.classList.contains('hidden');
        if (isHidden) {
            faqContent.classList.remove('hidden');
            icon.style.transform = 'rotate(180deg)';
            button.setAttribute('aria-expanded', 'true');
        } else {
            faqContent.classList.add('hidden');
            icon.style.transform = 'rotate(0deg)';
            button.setAttribute('aria-expanded', 'false');
        }
    }
}

// Initialize active navigation state and attach event listeners to nav buttons
document.addEventListener('DOMContentLoaded', function() {
    // Set initial aria-expanded for menu toggle
    if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', navigation.classList.contains('mobile-menu-open').toString());
    }

    const navButtons = document.querySelectorAll('.nav-btn');
    if (navButtons.length > 0) {
        // Set the first button as active initially
        navButtons[0].classList.add('active', 'bg-primary', 'text-white');
        navButtons[0].classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:text-primary');

        // Add event listeners to all nav buttons
        navButtons.forEach(button => {
            // The onclick attribute in HTML already calls showSection.
            // We need to ensure showSection correctly identifies the clicked button if event.target is not reliable.
            // The `showSection` function was modified to use `event.currentTarget`.
        });
    }

    // Attach event listeners for calculator buttons
    const calculateRenewalButton = document.querySelector('button[onclick="calculateRenewal()"]');
    if (calculateRenewalButton) {
        calculateRenewalButton.addEventListener('click', calculateRenewal);
    }

    const validateHoursButton = document.querySelector('button[onclick="validateHours()"]');
    if (validateHoursButton) {
        validateHoursButton.addEventListener('click', validateHours);
    }

    // Attach event listeners for FAQ buttons
    const faqButtons = document.querySelectorAll('button[onclick^="toggleFAQ"]');
    faqButtons.forEach(button => {
        const faqId = button.getAttribute('onclick').match(/toggleFAQ\('([^']+)'\)/)[1];
        if (faqId) {
            button.addEventListener('click', () => toggleFAQ(faqId));
        }
    });
});

// Ensure showSection is globally available if called by inline onclick attributes
window.showSection = showSection;
// Ensure toggleFAQ is globally available
window.toggleFAQ = toggleFAQ;
// Ensure calculateRenewal and validateHours are globally available if necessary, though direct listeners are better
window.calculateRenewal = calculateRenewal;
window.validateHours = validateHours;
