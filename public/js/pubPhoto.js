document.addEventListener("DOMContentLoaded", function() {
    var photoPicker = document.getElementById("photos"); // Correction de l'ID
    photoPicker.addEventListener("click", function() {
        document.getElementById("photos").click();
    });

    var selectedFiles = [];

    document.getElementById('photos').addEventListener('change', function() {
        var container = document.getElementById('selectedPhotosContainer');
        container.innerHTML = "";

        if (this.files && this.files.length > 0) {
            selectedFiles = Array.from(this.files);

            selectedFiles.forEach(function(file, index) {
                var preview = document.createElement('div');
                preview.className = 'selected-photo';

                var fileName = document.createElement('div');
                fileName.className = 'file-name';
                fileName.textContent = file.name;

                var cancelContainer = document.createElement('div');
                cancelContainer.className = 'cancel-container';

                var cancelIcon = document.createElement('div');
                cancelIcon.className = 'cancel-icon';
                cancelIcon.title = 'Annuler';
                cancelIcon.innerHTML = '&#10006;';
                cancelIcon.addEventListener('click', function() {
                    cancelSelection(file, preview);
                });

                cancelContainer.appendChild(cancelIcon);

                preview.appendChild(fileName);
                preview.appendChild(cancelContainer);

                container.appendChild(preview);
            });
        }
    });

    function cancelSelection(file, previewElement) {
        var container = document.getElementById('selectedPhotosContainer');
        container.removeChild(previewElement);

        var fileIndex = selectedFiles.indexOf(file);
        if (fileIndex !== -1) {
            selectedFiles.splice(fileIndex, 1);
        }
    }
});