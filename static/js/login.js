function login() {
    let email = $("#email").val();
    let psw = $("#psw").val();
    console.log('hola mundo')
}

$(document).ready(function () {
    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    var firebaseConfig = {
        apiKey: "AIzaSyDBGJGoVw2m3VIgkWPDIzXucfGj93CFMcc",
        authDomain: "coleccion-mkt-web.firebaseapp.com",
        projectId: "coleccion-mkt-web",
        storageBucket: "coleccion-mkt-web.appspot.com",
        messagingSenderId: "117454806416",
        appId: "1:117454806416:web:d52990406b03c8852d6715",
        measurementId: "G-486H9TQ8MG"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    $("#login_form").submit(function (e) {
        e.preventDefault();
        login();
    });
});