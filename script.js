// ========================================
// DOM Elements
// ========================================
const slotReel = document.getElementById('slotReel');
const pickButton = document.getElementById('pickButton');
const activityCard = document.getElementById('activityCard');
const activityName = document.getElementById('activityName');
const activityDescription = document.getElementById('activityDescription');
const activityLink = document.getElementById('activityLink');
const categoryBadge = document.getElementById('categoryBadge');
const activityGrid = document.getElementById('activityGrid');
const filterToggle = document.getElementById('filterToggle');
const filterDropdown = document.getElementById('filterDropdown');
const confettiContainer = document.getElementById('confetti');
const particleContainer = document.getElementById('particles');

// ========================================
// State
// ========================================
let selectedCategories = new Set(['all']);
let isSpinning = false;
let filteredActivities = [...activities];

// ========================================
// Initialization
// ========================================
function init() {
    createParticles();
    populateSlotReel();
    populateActivityGrid();
    populateFilters();
    setupEventListeners();
}

// ========================================
// Background Particles
// ========================================
function createParticles() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.width = `${5 + Math.random() * 10}px`;
        particle.style.height = particle.style.width;
        particle.style.opacity = `${0.2 + Math.random() * 0.4}`;
        particleContainer.appendChild(particle);
    }
}

// ========================================
// Slot Reel
// ========================================
function populateSlotReel() {
    slotReel.innerHTML = '';
    // Create multiple copies for smooth scrolling effect
    const copies = 3;
    for (let i = 0; i < copies; i++) {
        filteredActivities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'slot-item';
            item.textContent = activity.name;
            slotReel.appendChild(item);
        });
    }
}

// ========================================
// Activity Grid
// ========================================
function populateActivityGrid() {
    activityGrid.innerHTML = '';
    filteredActivities.forEach(activity => {
        const card = document.createElement('a');
        card.href = activity.url;
        card.target = '_blank';
        card.className = 'grid-card';
        card.innerHTML = `
            <span class="category-badge">${activity.category}</span>
            <h3>${activity.name}</h3>
            <p>${activity.description}</p>
        `;
        activityGrid.appendChild(card);
    });
}

// ========================================
// Filters
// ========================================
function populateFilters() {
    filterDropdown.innerHTML = `
        <label class="filter-option">
            <input type="checkbox" value="all" checked> All Activities
        </label>
    `;
    
    categories.forEach(category => {
        const option = document.createElement('label');
        option.className = 'filter-option';
        option.innerHTML = `
            <input type="checkbox" value="${category}"> ${category}
        `;
        filterDropdown.appendChild(option);
    });
}

function handleFilterChange(e) {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    if (value === 'all') {
        if (isChecked) {
            selectedCategories = new Set(['all']);
            filterDropdown.querySelectorAll('input').forEach(input => {
                input.checked = input.value === 'all';
            });
        }
    } else {
        // Uncheck "all" when specific category is selected
        const allCheckbox = filterDropdown.querySelector('input[value="all"]');
        allCheckbox.checked = false;
        selectedCategories.delete('all');
        
        if (isChecked) {
            selectedCategories.add(value);
        } else {
            selectedCategories.delete(value);
        }
        
        // If no categories selected, select all
        if (selectedCategories.size === 0) {
            selectedCategories.add('all');
            allCheckbox.checked = true;
        }
    }
    
    updateFilteredActivities();
}

function updateFilteredActivities() {
    if (selectedCategories.has('all')) {
        filteredActivities = [...activities];
    } else {
        filteredActivities = activities.filter(a => selectedCategories.has(a.category));
    }
    
    populateSlotReel();
    populateActivityGrid();
}

// ========================================
// Slot Machine Spin
// ========================================
async function spin() {
    if (isSpinning || filteredActivities.length === 0) return;
    
    isSpinning = true;
    pickButton.disabled = true;
    pickButton.classList.add('spinning');
    activityCard.classList.add('hidden');
    activityCard.classList.remove('revealed');
    
    // Random selection
    const randomIndex = Math.floor(Math.random() * filteredActivities.length);
    const selectedActivity = filteredActivities[randomIndex];
    
    // Animation parameters
    const itemHeight = 60; // Match CSS .slot-item height
    const totalItems = filteredActivities.length;
    const spins = 3; // Number of full spins
    const targetPosition = (spins * totalItems + randomIndex) * itemHeight;
    
    // Easing function for slot machine effect
    const duration = 4000; // 4 seconds
    const startTime = performance.now();
    
    // Play sound effect (visual feedback instead)
    createSpinEffect();
    
    return new Promise(resolve => {
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing: fast start, slow end (cubic ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentPosition = targetPosition * easeOut;
            
            // Center the item in the viewport
            const offset = currentPosition - 30; // Adjust for visual centering
            slotReel.style.transform = `translateY(-${offset}px)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete
                isSpinning = false;
                pickButton.disabled = false;
                pickButton.classList.remove('spinning');
                
                // Show selected activity
                showSelectedActivity(selectedActivity);
                resolve();
            }
        }
        
        requestAnimationFrame(animate);
    });
}

function createSpinEffect() {
    // Visual feedback during spin - flashing border
    const slotMachine = document.querySelector('.slot-machine');
    slotMachine.style.boxShadow = '0 0 30px var(--sky-blue), 0 20px 60px rgba(0, 0, 0, 0.3)';
    
    setTimeout(() => {
        slotMachine.style.boxShadow = '';
    }, 4000);
}

// ========================================
// Show Selected Activity
// ========================================
function showSelectedActivity(activity) {
    activityName.textContent = activity.name;
    activityDescription.textContent = activity.description;
    activityLink.href = activity.url;
    categoryBadge.textContent = activity.category;
    
    activityCard.classList.remove('hidden');
    activityCard.classList.add('revealed');
    
    // Trigger confetti
    createConfetti();
}

// ========================================
// Confetti Effect
// ========================================
function createConfetti() {
    const colors = ['#ffe119', '#29b6f6', '#4caf50', '#7b1fa2', '#ffffff', '#9c4dcc'];
    const shapes = ['square', 'circle'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = 5 + Math.random() * 10;
            
            confetti.style.cssText = `
                left: ${Math.random() * 100}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${shape === 'circle' ? '50%' : '0'};
                animation-delay: ${Math.random() * 0.5}s;
                animation-duration: ${2 + Math.random() * 2}s;
            `;
            
            confettiContainer.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 20);
    }
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    pickButton.addEventListener('click', spin);
    
    filterToggle.addEventListener('click', () => {
        filterDropdown.classList.toggle('hidden');
        filterToggle.classList.toggle('active');
    });
    
    filterDropdown.addEventListener('change', handleFilterChange);
    
    // Close filter dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!filterToggle.contains(e.target) && !filterDropdown.contains(e.target)) {
            filterDropdown.classList.add('hidden');
            filterToggle.classList.remove('active');
        }
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isSpinning) {
            e.preventDefault();
            spin();
        }
    });
}

// ========================================
// Initialize on DOM Load
// ========================================
document.addEventListener('DOMContentLoaded', init);
