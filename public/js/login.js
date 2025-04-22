import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, FacebookAuthProvider } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js';



const firebaseConfig = {
    
};




const firebaseApp = initializeApp(firebaseConfig);


const auth = getAuth(firebaseApp);
const db = getFirestore();
const colRef = collection(db , 'infosUser')



function signInWithEmailAndPasswordFunction(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            
            const user = userCredential.user;
            const uid = user.uid;
            console.log('Connecté en tant que :', user.email);
            console.log('UID de l\'utilisateur :', uid);
            sessionStorage.setItem('uid', uid);

            
            const userQuery  = query(collection(db, "infosUser"), where("uid", "==", uid));
            getDocs(userQuery )
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        
                        const userData = doc.data();
                        const userFullName = userData.fullName; 
                        sessionStorage.setItem('userFullName', userFullName);
                        console.log('Nom complet de l\'utilisateur :', userFullName);

                        
                        window.location.href = 'monProfil.html';
                    });
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération des données utilisateur:", error);
                    
                });
        })
        .catch((error) => {
            
            const errorMessage = error.message;
            console.error('Erreur de connexion :', errorMessage);
            
            Swal.fire({
                icon: 'error',
                title: 'Connexion échouée',
                text: 'La connexion a échoué. Veuillez vérifier votre email et votre mot de passe.',
            });
        });
}



function createUserWithEmailAndPasswordFunction(fullName, email, password, confirmPassword) {
    if (password !== confirmPassword) {
        console.error("Les mots de passe ne correspondent pas");
        return;
    }
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            
            const user = userCredential.user;
            const uid = user.uid; 
            console.log('Inscrit en tant que :', user.email);
            console.log('UID de l\'utilisateur :', uid); 
            
            
            addDoc(colRef, {
                fullName: fullName,
                email: email,
                uid: uid 
            })
            .then((docRef) => {
                console.log('Nom complet ajouté avec succès à Firestore');
                
                const userFullName = fullName;
                
                sessionStorage.setItem('userFullName', userFullName);
                sessionStorage.setItem('uid', uid); 
                sessionStorage.setItem('email', email);
                
                window.location.href = 'monProfil.html';
            })
            .catch((error) => {
                
                console.error('Erreur lors de l\'ajout du nom complet à Firestore :', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur Firestore',
                    text: 'Une erreur est survenue lors de l\'ajout du nom complet à Firestore. Veuillez réessayer plus tard.',
                });
            });
        })
        .catch((error) => {
            
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Erreur d\'inscription :', errorMessage);
            
            Swal.fire({
                icon: 'error',
                title: 'Inscription échouée',
                text: 'L\'inscription a échoué. Veuillez réessayer plus tard.',
            });
        });
}





document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.querySelector('.loginForm .input').value;
        const password = document.querySelector('.loginForm .password').value;
        signInWithEmailAndPasswordFunction(email, password);
    });

    
    document.querySelector('.signupForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.querySelector('.signupForm .username').value;
        const email = document.querySelector('.signupForm .input').value;
        const password = document.querySelector('.signupForm .password').value;
        const confirmPassword = document.querySelector('.signupForm .confirmPassword').value;

        createUserWithEmailAndPasswordFunction(username, email, password, confirmPassword);
    });
});

function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            
            const user = result.user;
            const uid = user.uid; 
            console.log('Connecté avec Google:', user.displayName);
            console.log('UID de l\'utilisateur :', uid); 
            
            
            sessionStorage.setItem('userFullName', user.displayName);
            sessionStorage.setItem('uid', uid); 
            sessionStorage.setItem('email',user.email)

            
            window.location.href = 'monProfil.html';
        })
        .catch((error) => {
            
            console.error('Erreur d\'authentification Google:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'Connexion avec Google échouée',
                text: 'La connexion avec Google a échoué. Veuillez réessayer plus tard.',
            });
        });
}

function signUpWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            
            const user = result.user;
            const uid = user.uid; 
            console.log('Inscrit avec Google:', user.displayName);
            console.log('UID de l\'utilisateur :', uid); 
            
            sessionStorage.setItem('email',user.email)
            const fullName = user.displayName;
            const email = user.email;
            sessionStorage.setItem('userFullName', user.displayName);
            sessionStorage.setItem('uid', uid); 
            sessionStorage.setItem('email',user.email)
            addDoc(colRef, {
                fullName: fullName,
                email: email,
                uid: uid 
            })
            .then(() => {
                console.log('Nom complet ajouté avec succès à Firestore');
            })
            .catch(error => {
                console.error('Erreur lors de l\'ajout du nom complet à Firestore :', error);
            });
            
            window.location.href = 'monProfil.html';
        })
        .catch((error) => {
            
            console.error('Erreur d\'inscription avec Google:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'Inscription avec Google échouée',
                text: 'L\'inscription avec Google a échoué. Veuillez réessayer plus tard.',
            });
        });
}

const googleSignInBtn = document.getElementById('googleSignInBtn');
googleSignInBtn.addEventListener('click', signInWithGoogle);

const googleSignUpBtn = document.getElementById('googleSignUpBtn');
googleSignUpBtn.addEventListener('click', signUpWithGoogle);




