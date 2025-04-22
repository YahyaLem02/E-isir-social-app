import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

const firebaseConfig = {
  
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const storage = getStorage(firebaseApp);
const storageRef = ref(storage);

const importButton = document.getElementById("importButton");
const importModal = document.getElementById("importModal");
const closeButton = document.getElementById("closeButton");
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const fileList = document.getElementById("fileList");

importButton.addEventListener("click", () => {
  importModal.style.display = "block";
});

closeButton.addEventListener("click", () => {
  importModal.style.display = "none";
});

fileInput.addEventListener("change", handleFileSelect);

function handleFileSelect(event) {
  const files = event.target.files;
  for (const file of files) {
    const listItem = document.createElement("li");
    listItem.textContent = file.name;
    fileList.appendChild(listItem);
  }
}

uploadButton.addEventListener("click", () => {
  const user = auth.currentUser;
  if (user) {
    const userStorageRef = ref(storage, `isir-cloud/${user.uid}/`);
    const files = fileInput.files;
    const promises = [];

    for (const file of files) {
      const fileRef = ref(userStorageRef, file.name);
      promises.push(uploadBytes(fileRef, file));
    }

    Promise.all(promises)
      .then(() => {
        console.log("Fichiers téléchargés avec succès!");
        showAlert("Succès", "Fichiers téléchargés avec succès!", "success");
        location.reload(); 
      })
      .catch((error) => {
        console.error("Erreur lors du téléchargement des fichiers:", error);
        showAlert("Erreur", "Une erreur s'est produite lors du téléchargement des fichiers.", "error");
      });
  } else {
    console.error("Utilisateur non authentifié.");
    showAlert("Erreur", "Utilisateur non authentifié.", "error");
  }
});

function deleteFile(item) {
  const user = auth.currentUser;
  if (user) {
    const userStorageRef = ref(storage, `isir-cloud/${user.uid}/`);
    const fileRef = ref(userStorageRef, item.name);

    deleteObject(fileRef)
      .then(() => {
        console.log("Fichier supprimé avec succès!");
        showAlert("Succès", "Fichier supprimé avec succès!", "success");
        location.reload(); 
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression du fichier:", error);
        showAlert("Erreur", "Une erreur s'est produite lors de la suppression du fichier.", "error");
      });
  } else {
    console.error("Utilisateur non authentifié.");
    showAlert("Erreur", "Utilisateur non authentifié.", "error");
  }
}

function viewOrDownloadFile(item) {
  const user = auth.currentUser;
  if (user) {
    const userStorageRef = ref(storage, `isir-cloud/${user.uid}/`);
    const fileRef = ref(userStorageRef, item.name);

    getDownloadURL(fileRef)
      .then((downloadURL) => {
        // Ouvrez le fichier dans une nouvelle fenêtre
        window.open(downloadURL);
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération du lien de téléchargement:",
          error
        );
      });
  } else {
    console.error("Utilisateur non authentifié.");
  }
}

function showAlert(title, text, icon) {
  Swal.fire({
    title: title,
    text: text,
    icon: icon
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userStorageRef = ref(storage, `isir-cloud/${user.uid}/`);
    listAll(userStorageRef)
      .then((result) => {
        fileList.innerHTML = "";
        result.items.forEach((item) => {
          const cardContainer = document.createElement("div");
          cardContainer.className = "card-container";

          const card = document.createElement("div");
          card.className = "card";

          const cardContent = document.createElement("div");
          cardContent.className = "card-content";
          cardContent.textContent = item.name;

          // Ajouter un événement de clic à la carte
          card.addEventListener("click", () => viewOrDownloadFile(item));

          // Icône de suppression
          const deleteIcon = document.createElement("i");
          deleteIcon.className = "material-icons";
          deleteIcon.textContent = "delete";
          deleteIcon.addEventListener("click", () => deleteFile(item));

          card.appendChild(cardContent);
          card.appendChild(deleteIcon); // Ajouter l'icône de suppression à la card
          cardContainer.appendChild(card);
          fileList.appendChild(cardContainer);
        });

        // Référence à l'élément de recherche
        const searchInput = document.getElementById("searchInput");

        // Écouteur d'événement de saisie pour le champ de recherche
        searchInput.addEventListener("input", () => {
          const searchTerm = searchInput.value.toLowerCase();

          // Filtrer les fichiers en fonction du terme de recherche
          const filteredFiles = result.items.filter((item) => {
            return item.name.toLowerCase().includes(searchTerm);
          });

          // Mettre à jour la liste des fichiers affichés
          updateFileList(filteredFiles);
        });
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération de la liste des fichiers:",
          error
        );
      });
  } else {
    console.error("Utilisateur non authentifié.");
  }
});

function updateFileList(files) {
  fileList.innerHTML = "";

  files.forEach((item) => {
    const cardContainer = document.createElement("div");
    cardContainer.className = "card-container";

    const card = document.createElement("div");
    card.className = "card";

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    cardContent.textContent = item.name;

    card.addEventListener("click", () => viewOrDownloadFile(item));

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "material-icons";
    deleteIcon.textContent = "delete";
    deleteIcon.addEventListener("click", () => deleteFile(item));

    card.appendChild(cardContent);
    card.appendChild(deleteIcon); 
    cardContainer.appendChild(card);
    fileList.appendChild(cardContainer);
  });
}
