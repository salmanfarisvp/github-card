let userData = null;

// Allow Enter key to trigger fetch
document.getElementById('usernameInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchUserData();
    }
});

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showView(view) {
    const cardContainer = document.getElementById('cardViewContainer');
    const jsonContainer = document.getElementById('jsonViewContainer');
    const cardBtn = document.getElementById('cardViewBtn');
    const jsonBtn = document.getElementById('jsonViewBtn');

    if (view === 'card') {
        cardContainer.style.display = 'block';
        jsonContainer.style.display = 'none';
        cardBtn.classList.add('active');
        jsonBtn.classList.remove('active');
    } else {
        cardContainer.style.display = 'none';
        jsonContainer.style.display = 'block';
        cardBtn.classList.remove('active');
        jsonBtn.classList.add('active');
    }
}

async function copyField(value, element) {
    if (!value || value === 'N/A') return;

    try {
        await navigator.clipboard.writeText(value.toString());
        
        // Show feedback
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback show';
        feedback.textContent = '✓ Copied!';
        element.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    } catch (err) {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = value.toString();
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback show';
        feedback.textContent = '✓ Copied!';
        element.appendChild(feedback);
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }
}

function createInfoItem(icon, label, value, copyable = false) {
    const item = document.createElement('div');
    item.className = 'info-item';
    if (copyable && value && value !== 'N/A') {
        item.onclick = () => copyField(value, item);
        item.style.cursor = 'pointer';
    }

    item.innerHTML = `
        <div class="info-icon">${icon}</div>
        <div class="info-content">
            <div class="info-label">${label}</div>
            <div class="info-value ${copyable ? 'copyable' : ''}">
                ${value || 'N/A'}
                ${copyable && value && value !== 'N/A' ? '<span class="copy-icon">📋</span>' : ''}
            </div>
        </div>
    `;

    return item;
}

function displayProfileCard(data) {
    const profileCard = document.getElementById('profileCard');
    
    const html = `
        <div class="profile-header">
            <img src="${data.avatar_url}" alt="${data.login}" class="avatar" onerror="this.src='https://via.placeholder.com/120?text=No+Image'">
            <div class="profile-info">
                <div class="profile-name">${data.name || data.login}</div>
                <div class="profile-username">@${data.login}</div>
                ${data.bio ? `<div class="profile-bio">${data.bio}</div>` : ''}
            </div>
        </div>

        <div class="stats-section">
            <div class="stat-item">
                <div class="stat-value">${data.public_repos || 0}</div>
                <div class="stat-label">Repositories</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${data.followers || 0}</div>
                <div class="stat-label">Followers</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${data.following || 0}</div>
                <div class="stat-label">Following</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${data.public_gists || 0}</div>
                <div class="stat-label">Gists</div>
            </div>
        </div>

        <div class="info-grid">
        </div>

        ${(data.blog || data.html_url || data.twitter_username) ? `
        <div class="links-section">
            ${data.html_url ? `<a href="${data.html_url}" target="_blank" class="link-btn">🔗 GitHub Profile</a>` : ''}
            ${data.blog ? `<a href="${data.blog}" target="_blank" class="link-btn">🌐 Website</a>` : ''}
            ${data.twitter_username ? `<a href="https://twitter.com/${data.twitter_username}" target="_blank" class="link-btn">🐦 Twitter</a>` : ''}
        </div>
        ` : ''}
    `;

    profileCard.innerHTML = html;

    // Add info items
    const infoGrid = profileCard.querySelector('.info-grid');
    
    if (data.id) {
        infoGrid.appendChild(createInfoItem('🆔', 'User ID', data.id, true));
    }
    
    if (data.node_id) {
        infoGrid.appendChild(createInfoItem('🔑', 'Node ID', data.node_id, true));
    }
    
    if (data.location) {
        infoGrid.appendChild(createInfoItem('📍', 'Location', data.location));
    }
    
    if (data.company) {
        infoGrid.appendChild(createInfoItem('🏢', 'Company', data.company));
    }
    
    if (data.email) {
        infoGrid.appendChild(createInfoItem('📧', 'Email', data.email, true));
    }
    
    if (data.hireable !== null) {
        infoGrid.appendChild(createInfoItem('💼', 'Hireable', data.hireable ? 'Yes' : 'No'));
    }
    
    if (data.created_at) {
        infoGrid.appendChild(createInfoItem('📅', 'Account Created', formatDate(data.created_at)));
    }
    
    if (data.updated_at) {
        infoGrid.appendChild(createInfoItem('🔄', 'Last Updated', formatDate(data.updated_at)));
    }

    if (data.type) {
        infoGrid.appendChild(createInfoItem('👤', 'Type', data.type));
    }

    if (data.site_admin !== undefined) {
        infoGrid.appendChild(createInfoItem('👨‍💼', 'Site Admin', data.site_admin ? 'Yes' : 'No'));
    }

    // Add URL fields that are copyable
    if (data.avatar_url) {
        infoGrid.appendChild(createInfoItem('🖼️', 'Avatar URL', data.avatar_url, true));
    }
    
    if (data.html_url) {
        infoGrid.appendChild(createInfoItem('🔗', 'Profile URL', data.html_url, true));
    }
}

async function fetchUserData() {
    const username = document.getElementById('usernameInput').value.trim();
    const fetchBtn = document.getElementById('fetchBtn');
    const resultSection = document.getElementById('resultSection');
    const loadingSection = document.getElementById('loadingSection');
    const errorSection = document.getElementById('errorSection');
    const dataDisplay = document.getElementById('dataDisplay');

    // Reset UI
    errorSection.innerHTML = '';
    resultSection.style.display = 'none';
    loadingSection.style.display = 'block';
    fetchBtn.disabled = true;

    if (!username) {
        errorSection.innerHTML = '<div class="error-message">Please enter a GitHub username</div>';
        loadingSection.style.display = 'none';
        fetchBtn.disabled = false;
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`User "${username}" not found. Please check the username and try again.`);
            } else if (response.status === 403) {
                throw new Error('API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
        }

        userData = await response.json();
        
        // Display visual card
        displayProfileCard(userData);
        
        // Display formatted JSON
        dataDisplay.textContent = JSON.stringify(userData, null, 2);
        
        resultSection.style.display = 'block';
        showView('card'); // Show card view by default
        
        // Show success message
        const successMsg = document.getElementById('successMessage');
        successMsg.textContent = `✅ Successfully fetched data for "${username}"`;
        successMsg.classList.add('show');
        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 3000);

    } catch (error) {
        errorSection.innerHTML = `<div class="error-message">${error.message}</div>`;
    } finally {
        loadingSection.style.display = 'none';
        fetchBtn.disabled = false;
    }
}

async function copyToClipboard() {
    const dataText = document.getElementById('dataDisplay').textContent;
    const copyBtn = document.getElementById('copyBtn');

    try {
        await navigator.clipboard.writeText(dataText);
        
        // Visual feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅ Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = dataText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            copyBtn.innerHTML = '✅ Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = '📋 Copy JSON to Clipboard';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            alert('Failed to copy. Please select and copy manually.');
        }
        
        document.body.removeChild(textArea);
    }
}
