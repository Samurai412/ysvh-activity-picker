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

// Admin Elements
const adminToggle = document.getElementById('adminToggle');
const adminModal = document.getElementById('adminModal');
const adminOverlay = document.getElementById('adminOverlay');
const adminClose = document.getElementById('adminClose');
const adminPasscode = document.getElementById('adminPasscode');
const adminDashboard = document.getElementById('adminDashboard');
const passcodeInput = document.getElementById('passcodeInput');
const passcodeSubmit = document.getElementById('passcodeSubmit');
const passcodeError = document.getElementById('passcodeError');
const addActivityForm = document.getElementById('addActivityForm');
const adminActivityList = document.getElementById('adminActivityList');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');
const newActivityCategory = document.getElementById('newActivityCategory');

// ========================================
// Constants
// ========================================
const ADMIN_PASSCODE = '4869';
const FIREBASE_URL = 'https://ysvh-activities-default-rtdb.europe-west1.firebasedatabase.app';

// ========================================
// State
// ========================================
let selectedCategories = new Set(['all']);
let isSpinning = false;
let currentActivities = [];
let filteredActivities = [];
let isAdminUnlocked = false;
let isLoading = true;

// ========================================
// Firebase Functions
// ========================================
async function loadActivitiesFromFirebase() {
    try {
        showLoadingState();
        const response = await fetch(`${FIREBASE_URL}/activities.json`);
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            currentActivities = data;
        } else {
            // First time - initialize with default activities
            currentActivities = [...activities];
            await saveActivitiesToFirebase();
        }
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        // Fallback to default activities
        currentActivities = [...activities];
    }
    isLoading = false;
    hideLoadingState();
    updateFilteredActivities();
}

async function saveActivitiesToFirebase() {
    try {
        const response = await fetch(`${FIREBASE_URL}/activities.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentActivities)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save to Firebase');
        }
        return true;
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        alert('Failed to save changes. Please try again.');
        return false;
    }
}

function showLoadingState() {
    if (pickButton) {
        pickButton.disabled = true;
        pickButton.querySelector('.button-text').innerHTML = `
            <span class="icon">⏳</span>
            Loading...
        `;
    }
}

function hideLoadingState() {
    if (pickButton) {
        pickButton.disabled = false;
        pickButton.querySelector('.button-text').innerHTML = `
            <span class="icon">🎲</span>
            Pick Random Activity
        `;
    }
}

function getCategories() {
    return [...new Set(currentActivities.map(a => a.category))].sort();
}

// ========================================
// Initialization
// ========================================
async function init() {
    createParticles();
    await loadActivitiesFromFirebase();
    populateSlotReel();
    populateActivityGrid();
    populateFilters();
    populateCategorySelect();
    setupEventListeners();
    setupAdminListeners();
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
    const cats = getCategories();
    filterDropdown.innerHTML = `
        <label class="filter-option">
            <input type="checkbox" value="all" checked> All Activities
        </label>
    `;
    
    cats.forEach(category => {
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
        filteredActivities = [...currentActivities];
    } else {
        filteredActivities = currentActivities.filter(a => selectedCategories.has(a.category));
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
        if (e.code === 'Space' && !isSpinning && !adminModal.classList.contains('hidden') === false) {
            e.preventDefault();
            spin();
        }
    });
}

// ========================================
// Admin Panel Functions
// ========================================
function setupAdminListeners() {
    // Open admin modal
    adminToggle.addEventListener('click', () => {
        adminModal.classList.remove('hidden');
        passcodeInput.focus();
    });
    
    // Close admin modal
    adminClose.addEventListener('click', closeAdminModal);
    adminOverlay.addEventListener('click', closeAdminModal);
    
    // Passcode submit
    passcodeSubmit.addEventListener('click', checkPasscode);
    passcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPasscode();
    });
    
    // Add activity form
    addActivityForm.addEventListener('submit', handleAddActivity);
    
    // Export/Import/Reset
    exportBtn.addEventListener('click', exportActivities);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', handleImport);
    resetBtn.addEventListener('click', resetActivities);
}

function closeAdminModal() {
    adminModal.classList.add('hidden');
    adminPasscode.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    passcodeInput.value = '';
    passcodeError.classList.add('hidden');
    isAdminUnlocked = false;
}

function checkPasscode() {
    if (passcodeInput.value === ADMIN_PASSCODE) {
        isAdminUnlocked = true;
        adminPasscode.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        populateAdminActivityList();
        populateCategorySelect();
    } else {
        passcodeError.classList.remove('hidden');
        passcodeInput.value = '';
        passcodeInput.focus();
    }
}

function populateCategorySelect() {
    const cats = getCategories();
    newActivityCategory.innerHTML = '<option value="">Select Category</option>';
    cats.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        newActivityCategory.appendChild(option);
    });
    // Add "New Category" option
    const newOption = document.createElement('option');
    newOption.value = '__new__';
    newOption.textContent = '+ Add New Category';
    newActivityCategory.appendChild(newOption);
    
    // Handle new category
    newActivityCategory.addEventListener('change', (e) => {
        if (e.target.value === '__new__') {
            const newCat = prompt('Enter new category name:');
            if (newCat && newCat.trim()) {
                const option = document.createElement('option');
                option.value = newCat.trim();
                option.textContent = newCat.trim();
                newActivityCategory.insertBefore(option, newActivityCategory.lastChild);
                newActivityCategory.value = newCat.trim();
            } else {
                newActivityCategory.value = '';
            }
        }
    });
}

function populateAdminActivityList() {
    adminActivityList.innerHTML = '';
    currentActivities.forEach((activity, index) => {
        const isCustom = activity.custom === true;
        const item = document.createElement('div');
        item.className = `admin-activity-item${isCustom ? ' custom' : ''}`;
        item.innerHTML = `
            <div class="activity-info">
                <div class="activity-name">${activity.name}</div>
                <div class="activity-category">${activity.category}${isCustom ? ' • Custom' : ''}</div>
            </div>
            <button class="delete-btn" data-index="${index}" title="Delete">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
            </button>
        `;
        adminActivityList.appendChild(item);
    });
    
    // Add delete handlers
    adminActivityList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            deleteActivity(index);
        });
    });
}

async function handleAddActivity(e) {
    e.preventDefault();
    
    const name = document.getElementById('newActivityName').value.trim();
    const url = document.getElementById('newActivityUrl').value.trim();
    const category = document.getElementById('newActivityCategory').value;
    const description = document.getElementById('newActivityDescription').value.trim();
    
    if (!name || !url || !category || !description) {
        alert('Please fill in all fields');
        return;
    }
    
    const newActivity = {
        name,
        url,
        category,
        description,
        custom: true
    };
    
    currentActivities.push(newActivity);
    const saved = await saveActivitiesToFirebase();
    
    if (saved) {
        refreshUI();
        // Reset form
        addActivityForm.reset();
        populateAdminActivityList();
        alert(`Added "${name}" to activities! Changes are live for everyone.`);
    } else {
        // Rollback on failure
        currentActivities.pop();
    }
}

async function deleteActivity(index) {
    const activity = currentActivities[index];
    if (confirm(`Delete "${activity.name}"?`)) {
        currentActivities.splice(index, 1);
        const saved = await saveActivitiesToFirebase();
        if (saved) {
            refreshUI();
            populateAdminActivityList();
        }
    }
}

function exportActivities() {
    const data = JSON.stringify(currentActivities, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ysvh-activities.json';
    a.click();
    URL.revokeObjectURL(url);
}

async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported) && imported.length > 0) {
                if (confirm(`Import ${imported.length} activities? This will replace current activities for EVERYONE.`)) {
                    currentActivities = imported;
                    const saved = await saveActivitiesToFirebase();
                    if (saved) {
                        refreshUI();
                        populateAdminActivityList();
                        alert('Activities imported successfully!');
                    }
                }
            } else {
                alert('Invalid file format');
            }
        } catch (err) {
            alert('Error reading file: ' + err.message);
        }
    };
    reader.readAsText(file);
    importFile.value = '';
}

async function resetActivities() {
    if (confirm('Reset to default activities? This will affect EVERYONE!')) {
        currentActivities = [...activities];
        const saved = await saveActivitiesToFirebase();
        if (saved) {
            refreshUI();
            populateAdminActivityList();
            alert('Reset to default activities!');
        }
    }
}

function refreshUI() {
    updateFilteredActivities();
    populateSlotReel();
    populateActivityGrid();
    populateFilters();
    populateCategorySelect();
}

// ========================================
// Initialize on DOM Load
// ========================================
document.addEventListener('DOMContentLoaded', init);
