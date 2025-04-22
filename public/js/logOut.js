import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, FacebookAuthProvider } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js';




const firebaseConfig = {
    
};




const firebaseApp = initializeApp(firebaseConfig);


const auth = getAuth(firebaseApp);
const db = getFirestore();

function signOut() {
    auth.signOut().then(() => {
        
        console.log('Déconnecté avec succès.');
        
        sessionStorage.removeItem('userFullName');
        sessionStorage.removeItem('uid');
        sessionStorage.removeItem('email');
        
        window.location.href = 'index.html';
    }).catch((error) => {
        
        console.error('Erreur lors de la déconnexion :', error);
        
        Swal.fire({
            icon: 'error',
            title: 'Déconnexion échouée',
            text: 'La déconnexion a échoué. Veuillez réessayer plus tard.',
        });
    });
}


const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', signOut);

document.addEventListener("DOMContentLoaded", function() {
    const currentUrl = window.location.href;

    const menuLinks = document.querySelectorAll('.menu-links a');

    menuLinks.forEach(link => {
        if (link.href === currentUrl) {
            link.parentElement.classList.add('active');
        }
    });
});
