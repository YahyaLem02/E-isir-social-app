import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  query,
  orderBy,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-storage.js";
import { GoogleGenerativeAI } from "@google/generative-ai";


const firebaseConfig = {

};

const firebaseApp = initializeApp(firebaseConfig);


const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);


let postRef;


function formatElapsedTime(elapsedTime) {
  const minutes = Math.floor(elapsedTime / (1000 * 60));
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  const days = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(elapsedTime / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(elapsedTime / (1000 * 60 * 60 * 24 * 365));

  if (minutes < 60) {
    return `il y a ${minutes} minutes`;
  } else if (hours < 24) {
    return `il y a ${hours} heures`;
  } else if (days < 30) {
    return `il y a ${days} jours`;
  } else if (months < 12) {
    return `il y a ${months} mois`;
  } else {
    return `il y a ${years} ans`;
  }
}


async function updateLikeCount(postId, likes) {
  try {
    postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { likes });
    console.log('Nombre de "j\'aime" mis à jour avec succès.');
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour du nombre de "j\'aime":',
      error
    );
  }
}


async function displayComments(postElement, comments) {
  const commentsContainer = postElement.querySelector(".post__comments");
  commentsContainer.innerHTML = "";

  
  const initialComments = [...comments];

  const firstCommentData = initialComments[0]; 
  const commentElement = document.createElement("div");
  commentElement.classList.add("comment");
  commentElement.innerHTML = `
    <img class="user__avatar comment__avatar" src="" height="30" />
    <p><strong>${firstCommentData.username}</strong>: ${firstCommentData.comment}</p>
  `;
  commentsContainer.appendChild(commentElement);

  
  const profilePictureRef = ref(storage, `photoProfil/${firstCommentData.uid}`);
  const url = await getDownloadURL(profilePictureRef);
  const avatarElement = commentElement.querySelector(".comment__avatar");
  avatarElement.src = url;

  
  if (initialComments.length > 1) {
    const viewMoreButton = document.createElement("button");
    viewMoreButton.textContent = "Voir plus";
    viewMoreButton.classList.add("view-more-comments");
    commentsContainer.appendChild(viewMoreButton);

    viewMoreButton.addEventListener("click", function () {
      
      displayAllComments(
        initialComments,
        commentsContainer,
        initialComments,
        postElement
      );
    });
  }
}

async function deletePost(postId) {
  try {
    await deleteDoc(doc(db, "posts", postId));
    console.log("Publication supprimée avec succès.");
  } catch (error) {
    console.error("Erreur lors de la suppression de la publication:", error);
  }
}



async function displayAllComments(
  comments,
  commentsContainer,
  initialComments,
  postElement
) {
  commentsContainer.innerHTML = "";
  for (const commentData of comments) {
    const commentElement = document.createElement("div");
    commentElement.classList.add("comment");
    commentElement.innerHTML = `
      <img class="user__avatar comment__avatar" src="" height="30" />
      <p><strong>${commentData.username}</strong>: ${commentData.comment}</p>
    `;
    commentsContainer.appendChild(commentElement);

    
    const profilePictureRef = ref(storage, `photoProfil/${commentData.uid}`);
    const url = await getDownloadURL(profilePictureRef);
    const avatarElement = commentElement.querySelector(".comment__avatar");
    avatarElement.src = url;
  }

  const viewLessButton = document.createElement("button");
  viewLessButton.textContent = "Voir moins";
  viewLessButton.classList.add("view-less-comments");
  commentsContainer.appendChild(viewLessButton);

  viewLessButton.addEventListener("click", function () {
    
    displayComments(postElement, initialComments);
  });
}


async function addComment(postId, username, commentText, uid) {
  try {
    if (!postRef) {
      postRef = doc(db, "posts", postId);
    }
    await updateDoc(postRef, {
      comments: arrayUnion({
        username: username,
        comment: commentText,
        uid: uid, 
      }),
    });
    console.log("Commentaire ajouté avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
  }
}

const likesMap = {};


document.addEventListener("DOMContentLoaded", async function () {
  try {
    const postsContainer = document.getElementById("postsContainer");

    
    onSnapshot(
      query(collection(db, "posts"), orderBy("timestamp", "desc")),
      (querySnapshot) => {
        const uid = sessionStorage.getItem("uid"); 
        querySnapshot.docChanges().forEach(async (change) => {
          const postData = change.doc.data();
          const postId = change.doc.id;
          if (postData.uid === uid) {
            
            if (change.type === "added") {
              const description = postData.description;
              const username = postData.username;
              const timestamp = postData.timestamp;
              const postImagesUrls = [];
              const uid = postData.uid;
              let likes = postData.likes || [];
              const likeCount = likes.length;
              const comments = postData.comments || [];

              
              likesMap[postId] = likes;

              const profilePictureRef = ref(storage, `photoProfil/${uid}`);
              const url = await getDownloadURL(profilePictureRef);
              const imageUrlProfil = url;

              const time = formatElapsedTime(Date.now() - timestamp.toMillis());

              for (let i = 1; ; i++) {
                const photoRef = ref(storage, `posts/${postId}/photo${i}`);
                try {
                  const url = await getDownloadURL(photoRef);
                  postImagesUrls.push(url);
                } catch (error) {
                  break;
                }
              }

              const postElement = document.createElement("div");
              postElement.classList.add("post");

              postElement.innerHTML = `
              <div class="post__top">
              <div class="post__options">
                  <span class="material-icons more-icon" data-post-id="${postId}">more_vert</span>
                  <div class="options-menu hidden">
                      <p class="delete-post" data-post-id="${postId}">Supprimer la publication</p>
                  </div>
              </div>
              <img class="user__avatar post__avatar" src="${imageUrlProfil}" height="50" />
              <div class="post__topInfo">
                  <h3>${username}</h3>
                  <p>${time}</p>
              </div>
          </div>
            </div>
            <div class="post__bottom">
                <p>${description}</p>
            </div>
            <div class="post__images">`;

              postImagesUrls.forEach((imageUrl) => {
                postElement.innerHTML += `
                <div class="post__image-container">
                    <img class="post__image" src="${imageUrl}" alt="" />
                </div>
            `;
              });

              postElement.innerHTML += `
            </div>
            <div class="post__options">
                <div class="post__option">
                    <span class="material-icons"> thumb_up </span>
                    <p id="likeCount-${postId}">${likeCount}</p> 
                    <p>J'aime</p>
                </div>
                <div class="post__option">
                    <span class="material-icons"> chat_bubble_outline </span>
                    <p id="commentToggle">Commenter</p>
                </div>
                <div class="post__comment hidden">
                    <input type="text" class="comment-input" placeholder="Commentaire">
                    <button class="comment-button">Envoyer</button>
                </div>
            </div>
            <div class="post__comments"></div>
            </br>
            <div class="comment-generation-section">
            <button class="generate-comment-button">Générer un commentaire</button> <div class="generated-comment-section"></div>
            </br>
            </div>
        `;
              postsContainer.appendChild(postElement);
              const likeButton = postElement.querySelector(".post__option");
              const likeCountElement = postElement.querySelector(
                `#likeCount-${postId}`
              );
              const commentToggle = postElement.querySelector("#commentToggle");
              const commentSection =
                postElement.querySelector(".post__comment");
              const commentInput = postElement.querySelector(".comment-input");
              const commentButton =
                postElement.querySelector(".comment-button");
              const generateCommentButton = postElement.querySelector(
                ".generate-comment-button"
              );
              const moreIcon = postElement.querySelector(".more-icon");
              const optionsMenu = postElement.querySelector(".options-menu");
              const deletePostButton =
                postElement.querySelector(".delete-post");

              likeButton.addEventListener("click", function () {
                const userId = sessionStorage.getItem("uid");
                const updatedLikes = likesMap[postId].includes(userId)
                  ? likesMap[postId].filter((id) => id !== userId)
                  : [...likesMap[postId], userId];
                updateLikeCount(postId, updatedLikes);
                likeCountElement.textContent = updatedLikes.length;
                likeButton.classList.toggle(
                  "liked",
                  updatedLikes.includes(userId)
                );
                likesMap[postId] = updatedLikes;
              });

              commentToggle.addEventListener("click", function () {
                commentSection.classList.toggle("hidden");
              });

              commentButton.addEventListener("click", async function () {
                const commentText = commentInput.value.trim();
                const username = sessionStorage.getItem("userFullName"); 
                const userId = sessionStorage.getItem("uid"); 
                if (commentText !== "" && username && userId) {
                  
                  await addComment(postId, username, commentText, userId); 
                  commentInput.value = "";
                  const postDoc = await getDoc(postRef);
                  const postData = postDoc.data();
                  if (postData && postData.comments) {
                    displayComments(postElement, postData.comments);
                  }
                } else {
                  console.error(
                    "Nom d'utilisateur manquant ou UID de l'utilisateur non défini ou commentaire vide."
                  );
                }
              });

              generateCommentButton.addEventListener(
                "click",
                async function () {
                  const userInput = prompt(
                    "Veuillez entrer votre demande pour générer un commentaire pour un post:"
                  );
                  if (userInput) {
                    const API_KEY = "----------";
                    const genAI = new GoogleGenerativeAI(API_KEY);
                    const model = genAI.getGenerativeModel({
                      model: "gemini-pro",
                    });
                    const result = await model.generateContent(
                      "Générer un commentaire pour un post d'un réseau social professionnel où je  veux dire :" +
                        userInput +
                        ". La description du post est : " +
                        description
                    );
                    const response = await result.response;
                    const generatedComment = response.text();

                    
                    const generatedCommentSection = postElement.querySelector(
                      ".comment-generation-section"
                    );
                    generatedCommentSection.innerHTML = ""; 

                    const commentInput = document.createElement("textarea");
                    commentInput.setAttribute(
                      "placeholder",
                      "Commentaire généré"
                    );
                    commentInput.classList.add("generated-comment-textarea");
                    commentInput.value = generatedComment;

                    
                    const regenerateButton = document.createElement("button");
                    regenerateButton.textContent = "Regénérer";
                    regenerateButton.classList.add("regenerate-button");

                    
                    const cancelButton = document.createElement("button");
                    cancelButton.textContent = "Annuler";
                    cancelButton.classList.add("cancel-button");

                    
                    const saveButton = document.createElement("button");
                    saveButton.textContent = "Enregistrer";
                    saveButton.classList.add("save-button");

                    
                    generatedCommentSection.appendChild(commentInput);
                    generatedCommentSection.appendChild(regenerateButton);
                    generatedCommentSection.appendChild(cancelButton);
                    generatedCommentSection.appendChild(saveButton);

                    
                    regenerateButton.addEventListener(
                      "click",
                      async function () {
                        const result = await model.generateContent(
                          "Générer un commentaire pour un post d'un réseau social professionnel où je  veux dire :" +
                            userInput +
                            ". La description du post est : " +
                            description
                        );
                        const response = await result.response;
                        const regeneratedComment = response.text();
                        commentInput.value = regeneratedComment; 
                      }
                    );

                    
                    cancelButton.addEventListener("click", function () {
                      generatedCommentSection.innerHTML = ""; 
                    });

                    
                    saveButton.addEventListener("click", async function () {
                      const generatedCommentText = commentInput.value.trim();
                      if (generatedCommentText !== "") {
                        
                        const userIdForPost = sessionStorage.getItem("uid");
                        const usernameGenerateComment = sessionStorage.getItem("userFullName");

                        await addComment(
                          postId,
                          usernameGenerateComment,
                          generatedCommentText,
                          userIdForPost
                        );
                        commentInput.value = ""; 
                        generatedCommentSection.innerHTML = ""; 
                        
                        const postDoc = await getDoc(postRef);
                        const postData = postDoc.data();
                        if (postData && postData.comments) {
                          displayComments(postElement, postData.comments);
                        }
                      } else {
                        alert(
                          "Veuillez entrer un commentaire généré avant de l'enregistrer."
                        );
                      }
                    });
                  }
                }
              );
              moreIcon.addEventListener("click", function () {
                optionsMenu.classList.toggle("hidden");
              });

              

              
              deletePostButton.addEventListener("click", function () {
                
                Swal.fire({
                  title:
                    "Êtes-vous sûr(e) de vouloir supprimer cette publication ?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Oui, supprimer",
                  cancelButtonText: "Annuler",
                }).then((result) => {
                  if (result.isConfirmed) {
                    deletePost(postId)
                      .then(() => {
                        Swal.fire(
                          "Supprimé !",
                          "La publication a été supprimée avec succès.",
                          "success"
                        ).then(() => {
                          
                          location.reload();
                        });
                      })
                      .catch((error) => {
                        console.error(
                          "Erreur lors de la suppression du post:",
                          error
                        );
                        Swal.fire(
                          "Erreur",
                          "Une erreur s'est produite lors de la suppression de la publication.",
                          "error"
                        );
                      });
                  }
                });
              });

              displayComments(postElement, comments);
            }
          }
        });
      }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des posts:", error);
  }
});
