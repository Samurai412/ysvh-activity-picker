// ========================================
// DOM Elements
// ========================================
const pickButton = document.getElementById('pickButton');
const selectedActivitiesContainer = document.getElementById('selectedActivitiesContainer');
const activityGrid = document.getElementById('activityGrid');
const filterToggle = document.getElementById('filterToggle');
const filterDropdown = document.getElementById('filterDropdown');

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
let currentPickedActivities = [null, null];
let rollCount = 2; // Default is rolling 2 activities

// ========================================
// Firebase Functions
// ========================================
async function loadActivitiesFromFirebase() {
    try {
        showLoadingState();
        const response = await fetch(`${FIREBASE_URL}/activities.json`);
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            // Merge Firebase data with default activities (avoiding duplicates by URL)
            const firebaseUrls = new Set(data.map(a => a.url));
            const merged = [...data];
            activities.forEach(defaultAct => {
                if (!firebaseUrls.has(defaultAct.url)) {
                    merged.push(defaultAct);
                }
            });
            currentActivities = merged;
        } else {
            // First time - initialize with default activities
            currentActivities = [...activities];
            try {
                await saveActivitiesToFirebase();
            } catch (err) {
                console.warn('Firebase write restricted, running in local mode.');
            }
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
            Roll 2 Activities
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

// Get tags for an activity
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
    await loadActivitiesFromFirebase();
    populateActivityGrid();
    populateFilters();
    populateTagSelect();
    setupEventListeners();
    setupAdminListeners();
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
    populateActivityGrid();
}

// ========================================
// Tumbling Dice & Roll Logic
// ========================================
function spawnDiceExplosion() {
    const diceContainer = document.getElementById('diceContainer');
    if (!diceContainer) return;
    
    diceContainer.innerHTML = '';
    
    const diceFaces = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const totalDice = 100;
    
    for (let i = 0; i < totalDice; i++) {
        const die = document.createElement('div');
        die.className = 'die-particle';
        die.textContent = diceFaces[Math.floor(Math.random() * diceFaces.length)];
        
        // Random circular physics trajectories using CSS variables
        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 220; // Launch force
        
        const startX = '0px';
        const startY = '0px';
        
        // Explode outward
        const midX = `${Math.cos(angle) * velocity}px`;
        const midY = `${Math.sin(angle) * velocity - 120}px`; // Launch upwards slightly
        
        // Bounce down to floor
        const bounceX = `${Math.cos(angle) * (velocity + 30)}px`;
        const bounceY = `${120 + Math.random() * 60}px`; // Virtual floor
        
        // Roll away
        const endX = `${Math.cos(angle) * (velocity + 160) + (Math.random() - 0.5) * 80}px`;
        const endY = `${160 + Math.random() * 100}px`;
        
        // Rotations
        const rot1 = `${Math.random() * 360}deg`;
        const rot2 = `${Math.random() * 720}deg`;
        const rot3 = `${Math.random() * 1440}deg`;
        
        // Delay spawning slightly to create a stream effect
        const delay = Math.random() * 300; // up to 300ms delay
        
        die.style.setProperty('--start-x', startX);
        die.style.setProperty('--start-y', startY);
        die.style.setProperty('--mid-x', midX);
        die.style.setProperty('--mid-y', midY);
        die.style.setProperty('--bounce-x', bounceX);
        die.style.setProperty('--bounce-y', bounceY);
        die.style.setProperty('--end-x', endX);
        die.style.setProperty('--end-y', endY);
        die.style.setProperty('--rot-1', rot1);
        die.style.setProperty('--rot-2', rot2);
        die.style.setProperty('--rot-3', rot3);
        
        die.style.animationDelay = `${delay}ms`;
        
        diceContainer.appendChild(die);
    }
}

async function spin() {
    if (isSpinning || filteredActivities.length === 0) return;
    
    isSpinning = true;
    pickButton.disabled = true;
    selectedActivitiesContainer.classList.add('hidden');
    
    // Launch dice roll visual effect!
    spawnDiceExplosion();
    
    // Anticipation delay (duration of dice tumbling & settling is 1.2s + delay offset = ~1.5s total)
    setTimeout(() => {
        // Clear dice elements
        const diceContainer = document.getElementById('diceContainer');
        if (diceContainer) diceContainer.innerHTML = '';
        
        // Perform the roll calculations
        const rollCountToPick = Math.min(rollCount, filteredActivities.length);
        
        if (rollCountToPick === 1) {
            const finalIdx1 = Math.floor(Math.random() * filteredActivities.length);
            const act1 = filteredActivities[finalIdx1];
            currentPickedActivities = [act1, null];
            showSelectedActivity(act1, null);
        } else {
            const finalIdx1 = Math.floor(Math.random() * filteredActivities.length);
            let finalIdx2 = Math.floor(Math.random() * filteredActivities.length);
            if (filteredActivities.length > 1 && finalIdx1 === finalIdx2) {
                finalIdx2 = (finalIdx2 + 1) % filteredActivities.length;
            }
            const act1 = filteredActivities[finalIdx1];
            const act2 = filteredActivities.length > 1 ? filteredActivities[finalIdx2] : null;
            currentPickedActivities = [act1, act2];
            showSelectedActivity(act1, act2);
        }
        
        isSpinning = false;
        pickButton.disabled = false;
    }, 1500); // 1.5 second wait for full anticipation
}

function showSelectedActivityDetails(slotNum, activity) {
    const cardEl = document.getElementById(`activityCard${slotNum}`);
    if (!activity) {
        if (cardEl) cardEl.style.display = 'none';
        return;
    }
    if (cardEl) cardEl.style.display = 'flex';
    
    const nameEl = document.getElementById(`activityName${slotNum}`);
    const descEl = document.getElementById(`activityDescription${slotNum}`);
    const linkEl = document.getElementById(`activityLink${slotNum}`);
    const badgeEl = document.getElementById(`categoryBadge${slotNum}`);
    
    if (nameEl) nameEl.textContent = activity.name;
    if (descEl) descEl.textContent = activity.description;
    if (linkEl) linkEl.href = activity.url;
    
    if (badgeEl) {
        const tags = getActivityTags(activity);
        badgeEl.innerHTML = tags.map(tag => `<span class="selected-tag">${tag}</span>`).join('');
        
        const pickCount = spinStats[activity.name] || 0;
        const statsHtml = `<span class="pick-count">Picked ${pickCount}x</span>`;
        
        const wasRecentlyPicked = recentHistory.includes(activity.name);
        const recentHtml = wasRecentlyPicked ? '<span class="recent-alert">🔄 Recent</span>' : '';
        
        badgeEl.innerHTML += statsHtml + recentHtml;
    }
    
    const actionsEl = document.getElementById(`activityActions${slotNum}`);
    if (actionsEl) {
        actionsEl.innerHTML = `
            <button class="action-btn log-it-btn" onclick="logSingleActivity(${slotNum})">
                <span>✅</span> Log
            </button>
        `;
    }
}

function showSelectedActivity(act1, act2) {
    showSelectedActivityDetails(1, act1);
    showSelectedActivityDetails(2, act2);
    selectedActivitiesContainer.classList.remove('hidden');
}

async function logSingleActivity(slotNum) {
    const activity = currentPickedActivities[slotNum - 1];
    if (!activity) return;
    
    await trackSpin(activity);
    
    // Visual feedback for button
    const actionsEl = document.getElementById(`activityActions${slotNum}`);
    const logBtn = actionsEl ? actionsEl.querySelector('.log-it-btn') : null;
    if (logBtn) {
        logBtn.innerHTML = '<span>Logged!</span>';
        logBtn.disabled = true;
        logBtn.classList.add('logged');
    }
    
    // Update count display
    const badgeEl = document.getElementById(`categoryBadge${slotNum}`);
    const pickCount = spinStats[activity.name] || 0;
    const pickCountEl = badgeEl ? badgeEl.querySelector('.pick-count') : null;
    if (pickCountEl) {
        pickCountEl.textContent = `Picked ${pickCount}x`;
    }
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

// Check if favorite
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
    if (!spinStats[activity.name]) {
        spinStats[activity.name] = 0;
    }
    spinStats[activity.name]++;
    
    recentHistory = recentHistory.filter(name => name !== activity.name);
    recentHistory.unshift(activity.name);
    if (recentHistory.length > 10) {
        recentHistory = recentHistory.slice(0, 10);
    }
    
    await saveStatsToFirebase();
    await saveHistoryToFirebase();
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
    return Object.entries(spinStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
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
// Event Listeners
// ========================================
function setupEventListeners() {
    pickButton.addEventListener('click', spin);
    
    const choiceRoll1 = document.getElementById('choiceRoll1');
    const choiceRoll2 = document.getElementById('choiceRoll2');
    if (choiceRoll1 && choiceRoll2) {
        choiceRoll1.addEventListener('click', () => {
            if (isSpinning) return;
            rollCount = 1;
            choiceRoll1.classList.add('active');
            choiceRoll2.classList.remove('active');
        });
        choiceRoll2.addEventListener('click', () => {
            if (isSpinning) return;
            rollCount = 2;
            choiceRoll2.classList.add('active');
            choiceRoll1.classList.remove('active');
        });
    }
    
    filterToggle.addEventListener('click', (e) => {
        e.preventDefault();
        filterDropdown.classList.toggle('hidden');
        filterToggle.classList.toggle('active');
    });
    
    const favoritesToggle = document.getElementById('favoritesToggle');
    if (favoritesToggle) {
        favoritesToggle.addEventListener('click', () => {
            toggleFavoritesFilter();
            updateGridTitle();
        });
    }
    
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
    
    document.addEventListener('click', (e) => {
        if (!filterToggle.contains(e.target) && !filterDropdown.contains(e.target)) {
            filterDropdown.classList.add('hidden');
            filterToggle.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isSpinning && adminModal.classList.contains('hidden')) {
            e.preventDefault();
            spin();
        }
    });
}

function updateGridTitle() {
    const gridTitle = document.getElementById('gridTitle');
    if (gridTitle) {
        gridTitle.textContent = showFavoritesOnly ? '⭐ Favorite Activities' : 'All Activities';
    }
}

function updateStatsPanel() {
    updateHistoryPanel();
    
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
    adminToggle.addEventListener('click', () => {
        adminModal.classList.remove('hidden');
        passcodeInput.focus();
    });
    
    adminClose.addEventListener('click', closeAdminModal);
    adminOverlay.addEventListener('click', closeAdminModal);
    
    passcodeSubmit.addEventListener('click', checkPasscode);
    passcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPasscode();
    });
    
    addActivityForm.addEventListener('submit', handleAddActivity);
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
    if (!container) return;
    
    container.innerHTML = '';
    
    allTags.forEach(tag => {
        const label = document.createElement('label');
        label.className = 'tag-checkbox';
        label.innerHTML = `
            <span class="checkmark"></span>
            <span class="tag-text">${tag}</span>
            <input type="checkbox" value="${tag}" name="activityTag" style="display:none;">
        `;
        label.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const checkbox = label.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            label.classList.toggle('selected', checkbox.checked);
        });
        container.appendChild(label);
    });
    
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
    
    adminActivityList.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            openEditTagsModal(index);
        });
    });
    
    adminActivityList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            deleteActivity(index);
        });
    });
}

let editingActivityIndex = null;

function openEditTagsModal(index) {
    const activity = currentActivities[index];
    if (!activity) return;
    
    editingActivityIndex = index;
    const activityTags = getActivityTags(activity);
    const allTags = getTags();
    
    const modalContent = `
        <div class="edit-tags-modal" id="editTagsModal">
            <div class="edit-tags-overlay" id="editTagsOverlay"></div>
            <div class="edit-tags-panel">
                <button class="edit-tags-close" id="editTagsClose">&times;</button>
                <h3>Edit Tags for "${activity.name}"</h3>
                <div class="edit-tags-container" id="editTagsContainer"></div>
                <div class="edit-tags-actions">
                    <button class="admin-btn" id="cancelEditTags">Cancel</button>
                    <button class="admin-btn add-btn" id="saveEditTags">Save Tags</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    const editTagsModal = document.getElementById('editTagsModal');
    const editTagsContainer = document.getElementById('editTagsContainer');
    const editTagsClose = document.getElementById('editTagsClose');
    const editTagsOverlay = document.getElementById('editTagsOverlay');
    const cancelEditTags = document.getElementById('cancelEditTags');
    const saveEditTags = document.getElementById('saveEditTags');
    
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
    
    const closeEditModal = () => {
        editTagsModal.remove();
        editingActivityIndex = null;
    };
    
    editTagsClose.addEventListener('click', closeEditModal);
    editTagsOverlay.addEventListener('click', closeEditModal);
    cancelEditTags.addEventListener('click', closeEditModal);
    
    saveEditTags.addEventListener('click', async () => {
        const selectedTagCheckboxes = editTagsContainer.querySelectorAll('input[name="editTag"]:checked');
        const newTags = Array.from(selectedTagCheckboxes).map(cb => cb.value);
        
        if (newTags.length === 0) {
            alert('Please select at least one tag');
            return;
        }
        
        currentActivities[editingActivityIndex].tags = newTags;
        delete currentActivities[editingActivityIndex].category;
        
        const saved = await saveActivitiesToFirebase();
        closeEditModal();
        refreshUI();
        populateAdminActivityList();
        if (!saved) {
            alert('Saved locally (Firebase permission restricted).');
        }
    });
}

async function handleAddActivity(e) {
    e.preventDefault();
    
    const name = document.getElementById('newActivityName').value.trim();
    const url = document.getElementById('newActivityUrl').value.trim();
    const description = document.getElementById('newActivityDescription').value.trim();
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
    
    refreshUI();
    addActivityForm.reset();
    populateAdminActivityList();
    if (saved) {
        alert(`Added "${name}" successfully!`);
    } else {
        alert(`Added "${name}" locally (Firebase permission restricted).`);
    }
}

async function deleteActivity(index) {
    const activity = currentActivities[index];
    if (confirm(`Delete "${activity.name}"?`)) {
        currentActivities.splice(index, 1);
        const saved = await saveActivitiesToFirebase();
        refreshUI();
        populateAdminActivityList();
        if (!saved) {
            alert('Deleted locally (Firebase permission restricted).');
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
                if (confirm(`Import ${imported.length} activities? This will replace current activities.`)) {
                    currentActivities = imported;
                    const saved = await saveActivitiesToFirebase();
                    refreshUI();
                    populateAdminActivityList();
                    if (saved) {
                        alert('Activities imported successfully!');
                    } else {
                        alert('Imported locally (Firebase permission restricted).');
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
    if (confirm('Reset to default activities?')) {
        currentActivities = [...activities];
        const saved = await saveActivitiesToFirebase();
        refreshUI();
        populateAdminActivityList();
        if (saved) {
            alert('Reset to default activities successfully!');
        } else {
            alert('Reset locally (Firebase permission restricted).');
        }
    }
}

function refreshUI() {
    updateFilteredActivities();
    populateActivityGrid();
    populateFilters();
}

// ========================================
// Initialize on DOM Load
// ========================================
document.addEventListener('DOMContentLoaded', init);
