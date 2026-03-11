// Leaderboard Update - Login qilgan user #1 ga chiqadi

function updateLeaderboard() {
    const userData = JSON.parse(localStorage.getItem('zenovaUser') || '{}');
    const isLoggedIn = localStorage.getItem('zenovaLoggedIn') === 'true';
    
    if (!isLoggedIn || !userData.username) return;
    
    // Leaderboard elementlarini topamiz
    const leaderboardItems = document.querySelectorAll('.leaderboard-item');
    
    if (leaderboardItems.length === 0) return;
    
    // User'ning ballini olish (yoki default 100,000)
    const userScore = userData.score || 100000;
    
    // Birinchi elementni yangilaymiz (#1)
    const firstItem = leaderboardItems[0];
    const nameElement = firstItem.querySelector('.leaderboard-name');
    const scoreElement = firstItem.querySelector('.leaderboard-score');
    
    if (nameElement && scoreElement) {
        nameElement.textContent = userData.username;
        nameElement.style.color = '#FFD700'; // Oltin rang
        nameElement.style.fontWeight = '900';
        scoreElement.textContent = userScore.toLocaleString();
        
        // Crown emoji qo'shamiz
        if (!nameElement.textContent.includes('👑')) {
            nameElement.textContent = '👑 ' + nameElement.textContent + ' (Siz)';
        }
    }
}

// Sahifa yuklanganda va login qilganda ishlaydi
document.addEventListener('DOMContentLoaded', updateLeaderboard);

// Har 2 sekundda tekshirish (agar login qilsa darhol yangilanadi)
setInterval(updateLeaderboard, 2000);