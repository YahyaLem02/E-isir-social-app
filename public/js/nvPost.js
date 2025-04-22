 import {
    initializeApp
} from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc
} from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js';
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-storage.js';

import { GoogleGenerativeAI } from "@google/generative-ai";


const firebaseConfig = {
 
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const CurrentUid = sessionStorage.getItem('uid');
var currentUsername = sessionStorage.getItem('userFullName');

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('form').addEventListener('submit', async function(e) {
        e.preventDefault();

        // Retrieve form values
        const description = document.getElementById('description').value;
        const photosInput = document.getElementById('photos');
        const photos = photosInput.files;

        if (description.trim() === '' && photos.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'La description ou la photo doit être remplie',
                confirmButtonText: 'OK'
            });
            return; 
        }
        const uidUser = CurrentUid;
        const nameUser = currentUsername; 

        const currentTime = new Date();
        try {
            const docRef = await addDoc(collection(db, 'posts'), {
                description: description,
                username: nameUser,
                uid: uidUser,
                timestamp: currentTime,
            });
        
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Le post a été ajouté avec succès',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = 'filActualites.html';
            });
            console.log("Document written with ID: ", docRef.id);
            const photosInput = document.getElementById('photos');
            const photos = photosInput.files;
        
            for (let i = 0; i < photos.length; i++) {
                const photoRef = ref(storage, `posts/${docRef.id}/photo${i + 1}`);
                await uploadBytes(photoRef, photos[i]);
            }
            document.querySelector('form').reset();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    });

    document.getElementById('correctButton').addEventListener('click', async function() {
        const descriptionInput = document.getElementById('description');
        const description = descriptionInput.value;

        const correctedDescription = await correctDescription(description);

        descriptionInput.value = correctedDescription;
    });

    document.getElementById('improveButton').addEventListener('click', async function() {
        const descriptionInput = document.getElementById('description');
        const description = descriptionInput.value;

        const improvedDescription = await improveDescription(description);

        descriptionInput.value = improvedDescription;
    });
});

async function correctDescription(description) {

    const API_KEY = "AIzaSyA3pn29FRIQgafsjykTc7sC7d16R4qG8ko";
    const genIA = new GoogleGenerativeAI(API_KEY);
    const model = genIA.getGenerativeModel({ model: "gemini-pro" }); 
    const result = await model.generateContent("Correct the description: " + description);
    const correctedDescription = await result.response.text();

    return correctedDescription;
}

async function improveDescription(description) {

    const API_KEY = "---------";
    const genIA = new GoogleGenerativeAI(API_KEY);
    const model = genIA.getGenerativeModel({ model: "gemini-pro" }); 
    const result = await model.generateContent("Improve the description: " + description);
    const improvedDescription = await result.response.text();

    return improvedDescription;
}

const storageRef = ref(storage, `photoProfil/${CurrentUid}`);
getDownloadURL(storageRef)
    .then((url) => {
        const profilePictures = document.querySelectorAll('#profilePicturePost');
        profilePictures.forEach((profilePicture) => {
            profilePicture.src = url;
        });
    })
    .catch((error) => {
        console.error('Erreur lors du téléchargement de l\'image :', error);
    });
