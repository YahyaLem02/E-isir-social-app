import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-storage.js';
import {
    initializeApp
} from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js';



const firebaseConfig = {

};


const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const CurrentUid = sessionStorage.getItem('uid');
const storageRef = ref(storage, `photoProfil/${CurrentUid}`);
getDownloadURL(storageRef)
    .then((url) => {
        const profilePicture = document.getElementById('profilePicture');
        profilePicture.src = url;
    })
    .catch((error) => {
        console.error('Erreur lors du téléchargement de l\'image :', error);
    });

    var userFullName = sessionStorage.getItem('userFullName');
    console.log(userFullName)

    if (userFullName) {
        document.getElementById('userFullName').innerText = userFullName;
    }

    document.addEventListener("DOMContentLoaded", function() {
        const body = document.querySelector("body"),
            sidebar = body.querySelector("nav"),
            toggle = body.querySelector(".toggle"),
            searchBtn = body.querySelector(".search-box"),
            modeSwitch = body.querySelector(".toggle-switch"),
            modeText = body.querySelector(".mode-text"),
            mainContent = document.querySelector(".main-content");
    
        function isSmallScreen() {
            return window.innerWidth <= 858; 
        }
    
        function adjustMainContentMargin() {
            const sidebarWidth = sidebar.offsetWidth;
            if (sidebar.classList.contains("close")) {
                if (isSmallScreen()) {
                    mainContent.style.marginLeft = "60px"; 
                } else {
                    mainContent.style.marginLeft = "250px"; 
                }
            } else {
                mainContent.style.marginLeft = sidebarWidth + "px";
            }
        }
    
        if (!isSmallScreen()) {
            sidebar.classList.remove("close");
            adjustMainContentMargin(); 
        }
    
        toggle.addEventListener("click", () => {
            if (isSmallScreen()) {
                sidebar.classList.toggle("open");
                adjustMainContentMargin();
            }
        });
    
        searchBtn.addEventListener("click", () => {
            sidebar.classList.remove("close");
            adjustMainContentMargin();
        });
    
        window.addEventListener("resize", () => {
            if (!isSmallScreen()) {
                sidebar.classList.remove("close");
                adjustMainContentMargin();
            }
        });
    });
    