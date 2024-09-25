//Photo submission
document.getElementById('cameraInput').addEventListener('change', function () {
    // Check if a file was selected
    if (this.files.length > 0) {
        // Find the form and submit it
        document.getElementById('uploadForm').submit();
    }
});