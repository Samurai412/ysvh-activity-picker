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
let favorites = new Set(); // Activity names that are favorited
let recentHistory = []; // Last 10 picked activities
let spinStats = {}; // { activityName: count }
let showFavoritesOnly = false;

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
        
        // Load extras (favorites, history, stats)
        await loadExtrasFromFirebase();
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        // Fallback to default activities
        currentActivities = [...activities];
    }
    isLoading = false;
    hideLoadingState();
    updateFilteredActivities();
}

async function loadExtrasFromFirebase() {
    try {
        // Load favorites
        const favResponse = await fetch(`${FIREBASE_URL}/favorites.json`);
        const favData = await favResponse.json();
        if (favData && Array.isArray(favData)) {
            favorites = new Set(favData);
        }
        
        // Load recent history
        const histResponse = await fetch(`${FIREBASE_URL}/recentHistory.json`);
        const histData = await histResponse.json();
        if (histData && Array.isArray(histData)) {
            recentHistory = histData;
        }
        
        // Load spin stats
        const statsResponse = await fetch(`${FIREBASE_URL}/spinStats.json`);
        const statsData = await statsResponse.json();
        if (statsData && typeof statsData === 'object') {
            spinStats = statsData;
        }
    } catch (error) {
        console.error('Error loading extras from Firebase:', error);
    }
}

async function saveFavoritesToFirebase() {
    try {
        await fetch(`${FIREBASE_URL}/favorites.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([...favorites])
        });
        return true;
    } catch (error) {
        console.error('Error saving favorites:', error);
        return false;
    }
}

async function saveHistoryToFirebase() {
    try {
        await fetch(`${FIREBASE_URL}/recentHistory.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recentHistory)
        });
        return true;
    } catch (error) {
        console.error('Error saving history:', error);
        return false;
    }
}

async function saveStatsToFirebase() {
    try {
        await fetch(`${FIREBASE_URL}/spinStats.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spinStats)
        });
        return true;
    } catch (error) {
        console.error('Error saving stats:', error);
        return false;
    }
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
        const isFav = favorites.has(activity.name);
        const pickCount = spinStats[activity.name] || 0;
        
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'grid-card-wrapper';
        
        cardWrapper.innerHTML = `
            <button class="favorite-btn ${isFav ? 'active' : ''}" data-name="${activity.name}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                ${isFav ? '★' : '☆'}
            </button>
            <a href="${activity.url}" target="_blank" class="grid-card">
                <div class="tags-container">${tagsHtml}</div>
                <h3>${activity.name}</h3>
                <p>${activity.description}</p>
                ${pickCount > 0 ? `<span class="grid-pick-count">Picked ${pickCount}x</span>` : ''}
            </a>
        `;
        
        // Add favorite click handler
        const favBtn = cardWrapper.querySelector('.favorite-btn');
        favBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(activity.name);
        });
        
        activityGrid.appendChild(cardWrapper);
    });
    
    // Update empty state if showing favorites only
    if (showFavoritesOnly && filteredActivities.length === 0) {
        activityGrid.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⭐</span>
                <p>No favorite activities yet!</p>
                <p class="empty-hint">Click the ☆ on any activity to add it to favorites.</p>
            </div>
        `;
    }
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
    let result = [...currentActivities];
    
    // Apply tag filter
    if (!selectedTags.has('all')) {
        result = result.filter(a => {
            const activityTags = getActivityTags(a);
            return activityTags.some(tag => selectedTags.has(tag));
        });
    }
    
    // Apply favorites filter
    if (showFavoritesOnly) {
        result = result.filter(a => favorites.has(a.name));
    }
    
    filteredActivities = result;
    
    populateSlotReel();
    populateActivityGrid();
}

// ========================================
// Slot Machine Spin - SUSPENSEFUL REEL VERSION
// ========================================
async function spin() {
    if (isSpinning || filteredActivities.length === 0) return;
    
    isSpinning = true;
    pickButton.disabled = true;
    pickButton.classList.add('spinning');
    activityCard.classList.add('hidden');
    activityCard.classList.remove('revealed');
    
    // Random selection (decide winner now)
    const randomIndex = Math.floor(Math.random() * filteredActivities.length);
    const selectedActivity = filteredActivities[randomIndex];
    
    // Prepare the reel with multiple copies for scrolling effect
    prepareReelForSpin();
    
    // Start the suspenseful spin!
    await suspensefulSpin(randomIndex, selectedActivity);
}

function prepareReelForSpin() {
    slotReel.innerHTML = '';
    slotReel.style.transition = 'none';
    slotReel.style.transform = 'translateY(0)';
    
    // Create MANY copies for the scrolling effect (enough for long scroll)
    const copies = 15; // Lots of copies so we never run out
    for (let c = 0; c < copies; c++) {
        filteredActivities.forEach((activity, idx) => {
            const item = document.createElement('div');
            item.className = 'slot-item';
            item.textContent = activity.name;
            item.dataset.index = idx;
            item.dataset.copy = c;
            slotReel.appendChild(item);
        });
    }
}

async function suspensefulSpin(winnerIndex, selectedActivity) {
    const slotMachine = document.querySelector('.slot-machine');
    const itemHeight = 60; // Must match CSS
    const totalItems = filteredActivities.length;
    
    // Calculate final position (land on winner in the middle copies)
    const targetCopy = 8; // Land in copy 8 (middle-ish)
    const finalOffset = (targetCopy * totalItems + winnerIndex) * itemHeight;
    
    // Add excitement effects
    slotMachine.classList.add('spinning-active');
    
    // Single continuous animation with multiple phases
    await continuousSpinAnimation(finalOffset, itemHeight, totalItems, winnerIndex);
    
    // Phase: Final landing with bounce
    await landingBounce(finalOffset, itemHeight);
    
    // Phase: WINNER REVEAL!
    slotMachine.classList.remove('spinning-active');
    await revealWinner(selectedActivity);
    
    // Reset
    isSpinning = false;
    pickButton.disabled = false;
    pickButton.classList.remove('spinning');
}

async function continuousSpinAnimation(finalOffset, itemHeight, totalItems, winnerIndex) {
    const slotMachine = document.querySelector('.slot-machine');
    const totalDuration = 6000; // 6 seconds total
    const startTime = Date.now();
    
    return new Promise(resolve => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);
            
            // Custom easing curve for suspense:
            // - 0-30%: Fast acceleration and maintain speed
            // - 30-70%: Gradual slowdown (the suspenseful part)
            // - 70-95%: Really slow (almost stopping)
            // - 95-100%: Final creep to target
            
            let easedProgress;
            if (progress < 0.25) {
                // Fast phase - quick acceleration
                easedProgress = Math.pow(progress / 0.25, 0.5) * 0.35;
            } else if (progress < 0.6) {
                // Medium phase
                easedProgress = 0.35 + (progress - 0.25) * 1.0;
            } else if (progress < 0.85) {
                // Slow phase - building tension
                easedProgress = 0.7 + (progress - 0.6) * 0.8;
            } else {
                // Final creep
                easedProgress = 0.9 + (progress - 0.85) * 0.66;
            }
            
            const currentPos = finalOffset * easedProgress;
            slotReel.style.transform = `translateY(-${currentPos}px)`;
            
            // Calculate which item is currently centered
            const currentItemIndex = Math.floor(currentPos / itemHeight) % totalItems;
            
            // Apply visual effects based on phase
            if (progress < 0.25) {
                // Fast phase
                slotMachine.classList.add('intense-spin');
                slotMachine.classList.remove('almost-there', 'so-close');
            } else if (progress < 0.7) {
                slotMachine.classList.remove('intense-spin');
                slotMachine.classList.add('almost-there');
                slotMachine.classList.remove('so-close');
            } else {
                slotMachine.classList.remove('intense-spin', 'almost-there');
                slotMachine.classList.add('so-close');
                
                // Highlight near-winner items in final phase
                highlightNearMiss(currentItemIndex, winnerIndex, totalItems, progress);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                slotMachine.classList.remove('intense-spin', 'almost-there', 'so-close');
                // Set final position exactly
                slotReel.style.transform = `translateY(-${finalOffset}px)`;
                resolve();
            }
        }
        requestAnimationFrame(animate);
    });
}

function highlightNearMiss(currentIndex, winnerIndex, totalItems, progress) {
    const items = slotReel.querySelectorAll('.slot-item');
    
    items.forEach((item, i) => {
        const itemIndex = parseInt(item.dataset.index);
        item.classList.remove('near-winner', 'passing', 'current-visible');
        
        // Is this item currently visible/centered?
        const visualIndex = i % totalItems;
        if (visualIndex === currentIndex) {
            item.classList.add('current-visible');
            
            // Check if it's "close" to the winner
            const distanceFromWinner = Math.abs(itemIndex - winnerIndex);
            const wrappedDistance = Math.min(distanceFromWinner, totalItems - distanceFromWinner);
            
            if (wrappedDistance <= 2 && wrappedDistance > 0 && progress > 0.7) {
                item.classList.add('near-winner');
            }
        }
    });
}

async function landingBounce(finalOffset, itemHeight) {
    const slotMachine = document.querySelector('.slot-machine');
    
    // Slight overshoot then bounce back
    slotReel.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    slotReel.style.transform = `translateY(-${finalOffset - 5}px)`;
    
    await sleep(150);
    
    slotReel.style.transition = 'transform 0.2s ease-out';
    slotReel.style.transform = `translateY(-${finalOffset + 3}px)`;
    
    await sleep(100);
    
    slotReel.style.transform = `translateY(-${finalOffset}px)`;
    
    await sleep(100);
}

async function revealWinner(activity) {
    const slotMachine = document.querySelector('.slot-machine');
    const container = document.querySelector('.container');
    
    // Flash effect!
    container.classList.add('flash-reveal');
    slotMachine.classList.add('winner-glow');
    
    // Highlight winner in reel
    const items = slotReel.querySelectorAll('.slot-item');
    items.forEach(item => {
        item.classList.remove('current-visible', 'near-winner');
    });
    
    // Find and highlight the visible winner
    const winnerItems = slotReel.querySelectorAll(`[data-index="${filteredActivities.indexOf(activity)}"]`);
    winnerItems.forEach(item => {
        item.classList.add('winner-highlight');
    });
    
    // Epic confetti!
    createEpicConfetti();
    
    await sleep(500);
    
    // Show the activity card
    showSelectedActivity(activity);
    
    // Clean up
    setTimeout(() => {
        container.classList.remove('flash-reveal');
        slotMachine.classList.remove('winner-glow');
    }, 1500);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createSpinEffect() {
    // Legacy - replaced by new effects
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
    
    // Add spin stats display
    const pickCount = spinStats[activity.name] || 0;
    const statsHtml = `<span class="pick-count">Picked ${pickCount + 1} time${pickCount === 0 ? '' : 's'}</span>`;
    
    // Check if it was recently picked
    const wasRecentlyPicked = recentHistory.includes(activity.name);
    const recentHtml = wasRecentlyPicked ? '<span class="recent-alert">🔄 We just did this!</span>' : '';
    
    // Add stats info after tags
    categoryBadge.innerHTML += statsHtml + recentHtml;
    
    activityCard.classList.remove('hidden');
    activityCard.classList.add('revealed');
    
    // Track this spin in stats
    trackSpin(activity);
    
    // Confetti already triggered in epicReveal
}

// ========================================
// Favorites System
// ========================================
function toggleFavorite(activityName) {
    if (favorites.has(activityName)) {
        favorites.delete(activityName);
    } else {
        favorites.add(activityName);
    }
    saveFavoritesToFirebase();
    updateFilteredActivities();
}

function isFavorite(activityName) {
    return favorites.has(activityName);
}

function toggleFavoritesFilter() {
    showFavoritesOnly = !showFavoritesOnly;
    updateFilteredActivities();
    
    const favBtn = document.getElementById('favoritesToggle');
    if (favBtn) {
        favBtn.classList.toggle('active', showFavoritesOnly);
    }
}

// ========================================
// Spin Stats & History
// ========================================
async function trackSpin(activity) {
    // Update spin stats
    if (!spinStats[activity.name]) {
        spinStats[activity.name] = 0;
    }
    spinStats[activity.name]++;
    
    // Update recent history (keep last 10)
    recentHistory = recentHistory.filter(name => name !== activity.name); // Remove if already exists
    recentHistory.unshift(activity.name);
    if (recentHistory.length > 10) {
        recentHistory = recentHistory.slice(0, 10);
    }
    
    // Save to Firebase
    await saveStatsToFirebase();
    await saveHistoryToFirebase();
    
    // Update history panel if visible
    updateHistoryPanel();
}

function updateHistoryPanel() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    if (recentHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">No recent picks yet!</p>';
        return;
    }
    
    recentHistory.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span class="history-number">#${index + 1}</span>
            <span class="history-name">${name}</span>
            <span class="history-count">${spinStats[name] || 0}x</span>
        `;
        historyList.appendChild(item);
    });
}

function getMostPickedActivities(limit = 5) {
    const sorted = Object.entries(spinStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
    return sorted;
}

function getRarestPick() {
    const allActivities = currentActivities.map(a => a.name);
    const unpicked = allActivities.filter(name => !spinStats[name]);
    if (unpicked.length > 0) {
        return { name: unpicked[0], count: 0 };
    }
    
    const sorted = Object.entries(spinStats).sort((a, b) => a[1] - b[1]);
    return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : null;
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
    
    // Favorites toggle
    const favoritesToggle = document.getElementById('favoritesToggle');
    if (favoritesToggle) {
        favoritesToggle.addEventListener('click', () => {
            toggleFavoritesFilter();
            updateGridTitle();
        });
    }
    
    // Stats panel toggle
    const statsToggle = document.getElementById('statsToggle');
    const statsPanel = document.getElementById('statsPanel');
    const closeStats = document.getElementById('closeStats');
    
    if (statsToggle && statsPanel) {
        statsToggle.addEventListener('click', () => {
            statsPanel.classList.toggle('hidden');
            if (!statsPanel.classList.contains('hidden')) {
                updateStatsPanel();
            }
        });
    }
    
    if (closeStats && statsPanel) {
        closeStats.addEventListener('click', () => {
            statsPanel.classList.add('hidden');
        });
    }
    
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

function updateGridTitle() {
    const gridTitle = document.getElementById('gridTitle');
    if (gridTitle) {
        if (showFavoritesOnly) {
            gridTitle.textContent = '⭐ Favorite Activities';
        } else {
            gridTitle.textContent = 'All Activities';
        }
    }
}

function updateStatsPanel() {
    updateHistoryPanel();
    
    // Update top picks
    const topPicks = document.getElementById('topPicks');
    if (topPicks) {
        const mostPicked = getMostPickedActivities(5);
        if (mostPicked.length === 0) {
            topPicks.innerHTML = '<p class="no-stats">No data yet!</p>';
        } else {
            topPicks.innerHTML = mostPicked.map(([name, count], index) => `
                <div class="top-pick-item">
                    <span class="rank">${['🥇', '🥈', '🥉', '4.', '5.'][index]}</span>
                    <span class="name">${name}</span>
                    <span class="count">${count}x</span>
                </div>
            `).join('');
        }
    }
    
    // Update total spins
    const totalSpins = document.getElementById('totalSpins');
    if (totalSpins) {
        const total = Object.values(spinStats).reduce((sum, count) => sum + count, 0);
        totalSpins.textContent = total;
    }
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
