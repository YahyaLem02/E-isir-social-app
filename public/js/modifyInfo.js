// Importer Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js';
import { getFirestore, collection, query, where, onSnapshot, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-storage.js';


const firebaseConfig = {
    
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const uid = sessionStorage.getItem('uid');
        if (!uid) {
            console.error("Aucun UID d'utilisateur trouvé dans sessionStorage.");
            return;
        }

        const photoInput = document.getElementById('photoInput');
        const changePhotoBtn = document.getElementById('changePhotoBtn');

        const userCollectionRef = collection(db, 'infosUser');
        const q = query(userCollectionRef, where('uid', '==', uid));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (!snapshot.empty) {
                const userData = snapshot.docs[0].data();
                document.getElementById('userFullName').innerText = userData.fullName;
                document.getElementById('fullNameInput').value = userData.fullName;
                document.getElementById('emailInput').value = userData.email;
                document.getElementById('phoneNumber').value = userData.phoneNumber;
                document.getElementById('address').value = userData.address;

                const storageRef = ref(storage, `photoProfil/${uid}`);
                const downloadURL = await getDownloadURL(storageRef);
                document.getElementById('userPhoto').src = downloadURL;
            } else {
                console.error('Utilisateur non trouvé dans la base de données Firestore.');
            }
        });

        photoInput.addEventListener('change', async function (event) {
            const file = event.target.files[0];
            const storageRef = ref(storage, `photoProfil/${uid}`);

            try {
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);
                const userPhoto = document.getElementById('userPhoto');
                userPhoto.src = downloadURL;

                // Afficher une notification de succès
                Swal.fire({
                    icon: 'success',
                    title: 'Succès!',
                    text: 'Votre photo de profil a été modifiée avec succès.'
                });

            } catch (error) {
                console.error('Erreur lors du téléchargement du fichier :', error);
            }
        });

        changePhotoBtn.addEventListener('click', function () {
            photoInput.click();
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur depuis Firestore:', error);
    }
});
