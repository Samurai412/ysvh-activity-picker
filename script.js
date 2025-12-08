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
let selectedTags = new Set(['all']);
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

function getTags() {
    const tagSet = new Set();
    currentActivities.forEach(a => {
        if (a.tags && Array.isArray(a.tags)) {
            a.tags.forEach(tag => tagSet.add(tag));
        } else if (a.category) {
            tagSet.add(a.category);
        }
    });
    return [...tagSet].sort();
}

// Get tags for an activity (handles both new tags format and old category format)
function getActivityTags(activity) {
    if (activity.tags && Array.isArray(activity.tags)) {
        return activity.tags;
    } else if (activity.category) {
        return [activity.category];
    }
    return [];
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
    populateTagSelect();
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
        const tags = getActivityTags(activity);
        const tagsHtml = tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('');
        
        const card = document.createElement('a');
        card.href = activity.url;
        card.target = '_blank';
        card.className = 'grid-card';
        card.innerHTML = `
            <div class="tags-container">${tagsHtml}</div>
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
    const tags = getTags();
    filterDropdown.innerHTML = `
        <label class="filter-option">
            <input type="checkbox" value="all" checked> All Activities
        </label>
    `;
    
    tags.forEach(tag => {
        const option = document.createElement('label');
        option.className = 'filter-option';
        option.innerHTML = `
            <input type="checkbox" value="${tag}"> ${tag}
        `;
        filterDropdown.appendChild(option);
    });
    
    // Add click handlers to prevent scroll
    filterDropdown.querySelectorAll('.filter-option').forEach(label => {
        label.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const checkbox = label.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            handleFilterChange({ target: checkbox, preventDefault: () => {}, stopPropagation: () => {} });
        });
    });
}

function handleFilterChange(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    if (value === 'all') {
        if (isChecked) {
            selectedTags = new Set(['all']);
            filterDropdown.querySelectorAll('input').forEach(input => {
                input.checked = input.value === 'all';
            });
        }
    } else {
        // Uncheck "all" when specific tag is selected
        const allCheckbox = filterDropdown.querySelector('input[value="all"]');
        allCheckbox.checked = false;
        selectedTags.delete('all');
        
        if (isChecked) {
            selectedTags.add(value);
        } else {
            selectedTags.delete(value);
        }
        
        // If no tags selected, select all
        if (selectedTags.size === 0) {
            selectedTags.add('all');
            allCheckbox.checked = true;
        }
    }
    
    updateFilteredActivities();
}

function updateFilteredActivities() {
    if (selectedTags.has('all')) {
        filteredActivities = [...currentActivities];
    } else {
        // Filter activities that have at least one of the selected tags
        filteredActivities = currentActivities.filter(a => {
            const activityTags = getActivityTags(a);
            return activityTags.some(tag => selectedTags.has(tag));
        });
    }
    
    populateSlotReel();
    populateActivityGrid();
}

// ========================================
// Slot Machine Spin - DRAMATIC VERSION
// ========================================
async function spin() {
    if (isSpinning || filteredActivities.length === 0) return;
    
    isSpinning = true;
    pickButton.disabled = true;
    pickButton.classList.add('spinning');
    activityCard.classList.add('hidden');
    activityCard.classList.remove('revealed');
    
    // Random selection (decide winner now, but reveal dramatically)
    const randomIndex = Math.floor(Math.random() * filteredActivities.length);
    const selectedActivity = filteredActivities[randomIndex];
    
    // Start the dramatic sequence
    await dramaticSelection(selectedActivity);
}

async function dramaticSelection(selectedActivity) {
    const slotMachine = document.querySelector('.slot-machine');
    const container = document.querySelector('.slot-window');
    
    // Phase 1: INTENSE FLICKERING (2 seconds)
    await intenseFastFlicker(1500);
    
    // Phase 2: SLOWDOWN with fake-outs (3 seconds)
    await slowdownWithFakeouts(selectedActivity, 3000);
    
    // Phase 3: DRAMATIC PAUSE
    await dramaticPause(800);
    
    // Phase 4: FINAL REVEAL
    await epicReveal(selectedActivity);
    
    // Reset states
    isSpinning = false;
    pickButton.disabled = false;
    pickButton.classList.remove('spinning');
}

async function intenseFastFlicker(duration) {
    const slotMachine = document.querySelector('.slot-machine');
    const container = document.querySelector('.container');
    
    // Add visual intensity
    slotMachine.classList.add('intense-spin');
    container.classList.add('screen-shake');
    
    const startTime = Date.now();
    let flickerSpeed = 30; // Start very fast
    
    return new Promise(resolve => {
        function flicker() {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < duration) {
                // Show random activity
                const randomAct = filteredActivities[Math.floor(Math.random() * filteredActivities.length)];
                updateSlotDisplay(randomAct.name, 'flickering');
                
                // Gradually slow down flicker
                flickerSpeed = 30 + (elapsed / duration) * 100;
                setTimeout(flicker, flickerSpeed);
            } else {
                slotMachine.classList.remove('intense-spin');
                container.classList.remove('screen-shake');
                resolve();
            }
        }
        flicker();
    });
}

async function slowdownWithFakeouts(winner, duration) {
    const slotMachine = document.querySelector('.slot-machine');
    
    // Create pool of activities for fake-outs (exclude winner initially)
    const fakeoutPool = filteredActivities.filter(a => a.name !== winner.name);
    const fakeoutCount = 4 + Math.floor(Math.random() * 3); // 4-6 fake-outs
    
    return new Promise(resolve => {
        let i = 0;
        const baseDelay = 200;
        
        function showNext() {
            if (i < fakeoutCount) {
                // Pick a random activity (not the winner until the end)
                const fakeActivity = fakeoutPool[Math.floor(Math.random() * fakeoutPool.length)];
                
                updateSlotDisplay(fakeActivity.name, 'slowing');
                slotMachine.classList.add('near-stop');
                
                // Each pause gets longer (building tension)
                const delay = baseDelay + (i * 150) + (Math.random() * 100);
                
                // Pulse effect on near-miss
                setTimeout(() => {
                    slotMachine.classList.remove('near-stop');
                    i++;
                    showNext();
                }, delay);
            } else {
                // Now show winner in slot
                updateSlotDisplay(winner.name, 'winner-preview');
                resolve();
            }
        }
        showNext();
    });
}

async function dramaticPause(duration) {
    const slotMachine = document.querySelector('.slot-machine');
    slotMachine.classList.add('dramatic-pause');
    
    // Pulse effect
    slotMachine.classList.add('pulse-glow');
    
    return new Promise(resolve => {
        setTimeout(() => {
            slotMachine.classList.remove('dramatic-pause');
            slotMachine.classList.remove('pulse-glow');
            resolve();
        }, duration);
    });
}

async function epicReveal(activity) {
    const slotMachine = document.querySelector('.slot-machine');
    const container = document.querySelector('.container');
    
    // Flash effect
    container.classList.add('flash-reveal');
    slotMachine.classList.add('winner-glow');
    
    // Show the winner name with special styling
    updateSlotDisplay(activity.name, 'winner');
    
    // Confetti explosion (more intense)
    createEpicConfetti();
    
    // Small delay then show card
    await sleep(500);
    
    // Show selected activity card with animation
    showSelectedActivity(activity);
    
    // Clean up effects
    setTimeout(() => {
        container.classList.remove('flash-reveal');
        slotMachine.classList.remove('winner-glow');
    }, 1500);
}

function updateSlotDisplay(text, state) {
    // Update all slot items to show the current text with state styling
    const displayItem = slotReel.querySelector('.slot-item.active') || slotReel.querySelector('.slot-item');
    
    if (displayItem) {
        slotReel.querySelectorAll('.slot-item').forEach(item => {
            item.classList.remove('active', 'flickering', 'slowing', 'winner-preview', 'winner');
        });
        displayItem.textContent = text;
        displayItem.classList.add('active', state);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createSpinEffect() {
    // Legacy - replaced by new dramatic effects
}

function createEpicConfetti() {
    const colors = ['#ffe119', '#29b6f6', '#4caf50', '#7b1fa2', '#ffffff', '#9c4dcc', '#ff6b6b', '#ffd93d'];
    const shapes = ['square', 'circle', 'triangle'];
    
    // First burst - center explosion
    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            createConfettiPiece(colors, shapes, 'burst');
        }, i * 10);
    }
    
    // Second burst - sides
    setTimeout(() => {
        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                createConfettiPiece(colors, shapes, 'sides');
            }, i * 15);
        }
    }, 300);
    
    // Continuous rain
    setTimeout(() => {
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                createConfettiPiece(colors, shapes, 'rain');
            }, i * 30);
        }
    }, 600);
}

function createConfettiPiece(colors, shapes, type) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = 6 + Math.random() * 12;
    
    let startX, startY, animClass;
    
    switch(type) {
        case 'burst':
            startX = 45 + Math.random() * 10;
            startY = 30;
            animClass = 'confetti-burst';
            break;
        case 'sides':
            startX = Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
            startY = 20 + Math.random() * 20;
            animClass = 'confetti-sides';
            break;
        default:
            startX = Math.random() * 100;
            startY = -5;
            animClass = 'confetti-rain';
    }
    
    let borderRadius = shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '2px';
    let clipPath = shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none';
    
    confetti.style.cssText = `
        left: ${startX}%;
        top: ${startY}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${borderRadius};
        clip-path: ${clipPath};
        animation-duration: ${2 + Math.random() * 2}s;
    `;
    confetti.classList.add(animClass);
    
    confettiContainer.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 4500);
}

// ========================================
// Show Selected Activity
// ========================================
function showSelectedActivity(activity) {
    activityName.textContent = activity.name;
    activityDescription.textContent = activity.description;
    activityLink.href = activity.url;
    
    // Display tags
    const tags = getActivityTags(activity);
    categoryBadge.innerHTML = tags.map(tag => `<span class="selected-tag">${tag}</span>`).join('');
    
    activityCard.classList.remove('hidden');
    activityCard.classList.add('revealed');
    
    // Confetti already triggered in epicReveal
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
    
    filterToggle.addEventListener('click', (e) => {
        e.preventDefault();
        filterDropdown.classList.toggle('hidden');
        filterToggle.classList.toggle('active');
    });
    
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
        populateTagSelect();
    } else {
        passcodeError.classList.remove('hidden');
        passcodeInput.value = '';
        passcodeInput.focus();
    }
}

function populateTagSelect() {
    const allTags = getTags();
    const container = document.getElementById('newActivityCategory');
    
    if (!container) {
        console.error('Tag container not found');
        return;
    }
    
    container.innerHTML = '';
    
    allTags.forEach(tag => {
        const label = document.createElement('label');
        label.className = 'tag-checkbox';
        label.innerHTML = `
            <span class="checkmark"></span>
            <span class="tag-text">${tag}</span>
            <input type="checkbox" value="${tag}" name="activityTag" style="display:none;">
        `;
        // Add click handler to toggle selected class
        label.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const checkbox = label.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            label.classList.toggle('selected', checkbox.checked);
        });
        container.appendChild(label);
    });
    
    // Add "new tag" button
    const addTagBtn = document.createElement('button');
    addTagBtn.type = 'button';
    addTagBtn.className = 'admin-btn add-tag-btn';
    addTagBtn.textContent = '+ Add New Tag';
    addTagBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newTag = prompt('Enter new tag name:');
        if (newTag && newTag.trim()) {
            const label = document.createElement('label');
            label.className = 'tag-checkbox selected';
            label.innerHTML = `
                <span class="checkmark"></span>
                <span class="tag-text">${newTag.trim()}</span>
                <input type="checkbox" value="${newTag.trim()}" name="activityTag" checked style="display:none;">
            `;
            // Add click handler to new tag
            label.addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const checkbox = label.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                label.classList.toggle('selected', checkbox.checked);
            });
            container.insertBefore(label, addTagBtn);
        }
    });
    container.appendChild(addTagBtn);
}

function populateAdminActivityList() {
    adminActivityList.innerHTML = '';
    currentActivities.forEach((activity, index) => {
        const isCustom = activity.custom === true;
        const tags = getActivityTags(activity);
        const tagsDisplay = tags.slice(0, 3).join(', ') + (tags.length > 3 ? '...' : '');
        
        const item = document.createElement('div');
        item.className = `admin-activity-item${isCustom ? ' custom' : ''}`;
        item.innerHTML = `
            <div class="activity-info">
                <div class="activity-name">${activity.name}</div>
                <div class="activity-category">${tagsDisplay}${isCustom ? ' • Custom' : ''}</div>
            </div>
            <div class="activity-actions">
                <button class="edit-btn" data-index="${index}" title="Edit Tags">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="delete-btn" data-index="${index}" title="Delete">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        `;
        adminActivityList.appendChild(item);
    });
    
    // Add edit handlers
    adminActivityList.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            openEditTagsModal(index);
        });
    });
    
    // Add delete handlers
    adminActivityList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            deleteActivity(index);
        });
    });
}

// ========================================
// Edit Tags Modal
// ========================================
let editingActivityIndex = null;

function openEditTagsModal(index) {
    const activity = currentActivities[index];
    if (!activity) return;
    
    editingActivityIndex = index;
    const activityTags = getActivityTags(activity);
    const allTags = getTags();
    
    // Create modal content
    const modalContent = `
        <div class="edit-tags-modal" id="editTagsModal">
            <div class="edit-tags-overlay" id="editTagsOverlay"></div>
            <div class="edit-tags-panel">
                <button class="edit-tags-close" id="editTagsClose">&times;</button>
                <h3>Edit Tags for "${activity.name}"</h3>
                <div class="edit-tags-container" id="editTagsContainer">
                    <!-- Tags will be populated here -->
                </div>
                <div class="edit-tags-actions">
                    <button class="admin-btn" id="cancelEditTags">Cancel</button>
                    <button class="admin-btn add-btn" id="saveEditTags">Save Tags</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    const editTagsModal = document.getElementById('editTagsModal');
    const editTagsContainer = document.getElementById('editTagsContainer');
    const editTagsClose = document.getElementById('editTagsClose');
    const editTagsOverlay = document.getElementById('editTagsOverlay');
    const cancelEditTags = document.getElementById('cancelEditTags');
    const saveEditTags = document.getElementById('saveEditTags');
    
    // Populate tags
    allTags.forEach(tag => {
        const isSelected = activityTags.includes(tag);
        const label = document.createElement('label');
        label.className = `tag-checkbox${isSelected ? ' selected' : ''}`;
        label.innerHTML = `
            <span class="checkmark"></span>
            <span class="tag-text">${tag}</span>
            <input type="checkbox" value="${tag}" name="editTag" ${isSelected ? 'checked' : ''} style="display:none;">
        `;
        label.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const checkbox = label.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            label.classList.toggle('selected', checkbox.checked);
        });
        editTagsContainer.appendChild(label);
    });
    
    // Add new tag button
    const addTagBtn = document.createElement('button');
    addTagBtn.type = 'button';
    addTagBtn.className = 'admin-btn add-tag-btn';
    addTagBtn.textContent = '+ New Tag';
    addTagBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const newTag = prompt('Enter new tag name:');
        if (newTag && newTag.trim()) {
            const label = document.createElement('label');
            label.className = 'tag-checkbox selected';
            label.innerHTML = `
                <span class="checkmark"></span>
                <span class="tag-text">${newTag.trim()}</span>
                <input type="checkbox" value="${newTag.trim()}" name="editTag" checked style="display:none;">
            `;
            label.addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const checkbox = label.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                label.classList.toggle('selected', checkbox.checked);
            });
            editTagsContainer.insertBefore(label, addTagBtn);
        }
    });
    editTagsContainer.appendChild(addTagBtn);
    
    // Close handlers
    const closeEditModal = () => {
        editTagsModal.remove();
        editingActivityIndex = null;
    };
    
    editTagsClose.addEventListener('click', closeEditModal);
    editTagsOverlay.addEventListener('click', closeEditModal);
    cancelEditTags.addEventListener('click', closeEditModal);
    
    // Save handler
    saveEditTags.addEventListener('click', async () => {
        const selectedTagCheckboxes = editTagsContainer.querySelectorAll('input[name="editTag"]:checked');
        const newTags = Array.from(selectedTagCheckboxes).map(cb => cb.value);
        
        if (newTags.length === 0) {
            alert('Please select at least one tag');
            return;
        }
        
        currentActivities[editingActivityIndex].tags = newTags;
        // Remove old category if exists
        delete currentActivities[editingActivityIndex].category;
        
        const saved = await saveActivitiesToFirebase();
        if (saved) {
            closeEditModal();
            refreshUI();
            populateAdminActivityList();
        } else {
            alert('Failed to save changes');
        }
    });
}

async function handleAddActivity(e) {
    e.preventDefault();
    
    const name = document.getElementById('newActivityName').value.trim();
    const url = document.getElementById('newActivityUrl').value.trim();
    const description = document.getElementById('newActivityDescription').value.trim();
    
    // Get selected tags from checkboxes
    const tagCheckboxes = document.querySelectorAll('input[name="activityTag"]:checked');
    const selectedTagsArray = Array.from(tagCheckboxes).map(cb => cb.value);
    
    if (!name || !url || selectedTagsArray.length === 0 || !description) {
        alert('Please fill in all fields and select at least one tag');
        return;
    }
    
    const newActivity = {
        name,
        url,
        tags: selectedTagsArray,
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
}

// ========================================
// Initialize on DOM Load
// ========================================
document.addEventListener('DOMContentLoaded', init);
