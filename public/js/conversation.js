import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.6.4/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.4/firebase-auth.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.4/firebase-storage.js";

// Configuration Firebase
  const firebaseConfig = {
   
  };
  import { GoogleGenerativeAI } from "@google/generative-ai";
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Firebase services
const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

// Event listener for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user.uid);

    // Storing user UID in session storage
    sessionStorage.setItem("userUid", user.uid);
  } else {
    // User is signed out
    console.log("User is signed out");

    // Clear user UID from session storage
    sessionStorage.removeItem("userUid");
  }
});

// Get the button element by ID
const sendButton = document.getElementById("sendButton");

// Attach the click event listener to the button
sendButton.addEventListener("click", () => {
  sendMessage();
});

function sendMessage() {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value;
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];

  const uid = sessionStorage.getItem("userUid");
  const username = sessionStorage.getItem("userFullName");

  if ((message.trim() !== "" || file) && uid && username) {
    if (file) {
      const messageId = generateMessageId();
      const fileRef = storageRef(
        storage,
        `messageFiles/${messageId}/${file.name}`
      );

      uploadBytes(fileRef, file)
        .then(() => {
          return getDownloadURL(fileRef);
        })
        .then((fileUrl) => {
          push(ref(db, "messages"), {
            uid: uid,
            username: username,
            message: message,
            fileUrl: fileUrl,
            fileType: getFileType(file.type),
            timestamp: { ".sv": "timestamp" },
          });
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    } else {
      push(ref(db, "messages"), {
        uid: uid,
        username: username,
        message: message,
        timestamp: { ".sv": "timestamp" },
      });
    }

    // Reset input fields after sending message
    messageInput.value = "";
    fileInput.value = "";
  } else {
    console.error("User UID not available, message is empty, or user information is missing.");
  }
}

function getFileType(mimeType) {
  if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType.startsWith("video/")) {
    return "video";
  } else if (mimeType === "application/pdf") {
    return "pdf";
  } else if (mimeType.startsWith("application/vnd.openxmlformats-officedocument")) {
    return "docx";
  } else if (mimeType.startsWith("application/msword")) {
    return "doc";
  } else if (mimeType.startsWith("application/vnd.ms-excel")) {
    return "xls";
  } else if (mimeType.startsWith("application/vnd.ms-powerpoint")) {
    return "ppt";
  } else {
    return "other";
  }
}

function displayMessages(messages) {
  const messagesContainer = document.getElementById("messages-container");
  messagesContainer.innerHTML = "";

  for (const key in messages) {
    if (Object.hasOwnProperty.call(messages, key)) {
      const message = messages[key];
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${
        message.uid === auth.currentUser.uid ? "sent" : "received"
      }`;

      const timeAgo = moment(message.timestamp).fromNow();
      let contentHtml = `
        <div class="user-info">
          <p style="margin-bottom: 10px;"><strong>${message.username}</strong></p>
        </div>
        <br>
        <div class="message-content">
          <p class="message-text" style="margin-bottom: 10px;">${message.message}</p>
      `;

      if (message.fileUrl) {
        if (message.fileType === "image") {
          contentHtml += `<img src="${message.fileUrl}" alt="">`;
        } else if (message.fileType === "video") {
          contentHtml += `<video src="${message.fileUrl}" controls></video>`;
        } else {
          contentHtml += `<a href="${message.fileUrl}" target="_blank">${message.fileType.toUpperCase()} File</a>`;
        }
      }

      contentHtml += `
        </div>
        <br>
        <div class="timestamp-container">
          <span class="timestamp">${timeAgo}</span>
        </div>
      `;

      messageDiv.innerHTML = contentHtml;
      messagesContainer.appendChild(messageDiv);
    }
  }
}

onValue(ref(db, "messages"), (snapshot) => {
  const messages = snapshot.val();
  if (messages) {
    displayMessages(messages);
  }
});

function generateMessageId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let messageId = "";
  for (let i = 0; i < 10; i++) {
    messageId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return messageId;
}

const correctButton = document.getElementById("correctButton");

correctButton.addEventListener("click", () => {
    correctMessage();
});

// Fonction pour corriger le message
async function correctMessage() {
    const messageInput = document.getElementById("message-input");
    const originalMessage = messageInput.value;

    try {
        const correctedMessage = await generateCorrectedMessage(originalMessage);

        messageInput.value = correctedMessage;

        Swal.fire({
            icon: 'success',
            title: 'Message Corrected',
            text: 'Your message has been corrected.'
        });
    } catch (error) {
        console.error('Error correcting message:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while correcting the message. Please try again later.'
        });
    }
}




async function generateCorrectedMessage(messageText) {

  const API_KEY = "AIzaSyA3pn29FRIQgafsjykTc7sC7d16R4qG8ko"; 
  const genIA = new GoogleGenerativeAI(API_KEY);
  const model = genIA.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent("Corriger le message : " + messageText);
  const correctedMessage = await result.response.text();

  return correctedMessage;
}

