// Auto redirect to login if not logged in (faqat birinchi marta)

function checkFirstVisit() {
    const isLoggedIn = localStorage.getItem('zenovaLoggedIn') === 'true';
    const hasVisited = localStorage.getItem('zenovaVisited') === 'true';
    
    // Agar login qilmagan va birinchi marta kelgan bo'lsa
    if (!isLoggedIn && !hasVisited) {
        // Visited flag qo'yamiz (endi yana redirect qilmaydi)
        localStorage.setItem('zenovaVisited', 'true');
        
        // Login sahifasiga yo'naltirish
        window.location.href = 'auth.html';
    }
}

// Sahifa yuklanganda darhol tekshirish
checkFirstVisit();
