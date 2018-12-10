window.onload = function(){
    localStorage.clear();

    ///////////////////////////////////////////////////////////////
    //Popup window
    // Get the modal
    var modalPassword = document.getElementById('modalPassword');
    //var modalSpinner = document.getElementById('modalSpinner');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modalPassword.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target === modalPassword) {
            modalPassword.style.display = "none";
        }
    };
};


function openConfig() {
    modalPassword.style.display = "block";
}