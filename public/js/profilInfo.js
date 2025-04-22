

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-storage.js';

const firebaseConfig = {
  
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

document.addEventListener('DOMContentLoaded', async function () {
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const inputs = document.querySelectorAll('input');

    function enableFields() {
        inputs.forEach(input => {
            input.removeAttribute('disabled');
        });
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
    }

    function disableFields() {
        inputs.forEach(input => {
            input.setAttribute('disabled', 'disabled');
        });
        saveBtn.style.display = 'none';
        editBtn.style.display = 'block';
    }

    editBtn.addEventListener('click', function () {
        enableFields();
    });

    saveBtn.addEventListener('click', async function () {
        try {
            const fullName = document.getElementById('fullNameInput').value;
            const email = document.getElementById('emailInput').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const address = document.getElementById('address').value;

            const uid = sessionStorage.getItem('uid');
            const userCollectionRef = collection(db, 'infosUser');
            const querySnapshot = await getDocs(query(userCollectionRef, where('uid', '==', uid)));

            if (!querySnapshot.empty) {
                const userDocRef = querySnapshot.docs[0].ref;
                await updateDoc(userDocRef, {
                    fullName: fullName,
                    email: email,
                    phoneNumber: phoneNumber,
                    address: address
                });
                console.log('Informations mises à jour avec succès');

                Swal.fire({
                    icon: 'success',
                    title: 'Succès!',
                    text: 'Vos informations ont été mises à jour avec succès.'
                });
            } else {
                await addDoc(collection(db, 'infosUser'), {
                    uid: uid,
                    fullName: fullName,
                    email: email,
                    phoneNumber: phoneNumber,
                    address: address
                });
                console.log('Nouvel utilisateur ajouté avec succès');

                Swal.fire({
                    icon: 'success',
                    title: 'Succès!',
                    text: 'Vos informations ont été ajoutées avec succès.'
                });
            }
        } catch (error) {
            console.error('Erreur lors de la manipulation des informations utilisateur :', error);
        } finally {
            disableFields();
        }
    });
});
