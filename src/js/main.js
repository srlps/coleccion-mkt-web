var idleTime = 15;
var dataSyncd = true;
var currentUser;
var userContentRef;
var userContent = {
    drivers: [],
    gliders: [],
    karts: []
};

function set_data_unsyncd() {
    idleTime = 0;
    dataSyncd = false;
    $("#sync-icon").show();
}

function sync_user_data() {
    if (!dataSyncd) {
        dataSyncd = true;
        userContentRef.set(userContent).then(() => $("#sync-icon").hide());
    }
}

$(function () {
    // ajax init
    $.ajaxSetup({
        async: true,
        cache: false
    });

    // firebase init
    let firebaseConfigBase64 = "eyJhcGlLZXkiOiJBSXphU3lEQkdKR29WdzJtM1ZJZ2tXUERJelh1Y2ZHajkzQ0ZNY2MiLCJhdXRoRG9tYWluIjoiY29sZWNjaW9uLW1rdC13ZWIuZmlyZWJhc2VhcHAuY29tIiwicHJvamVjdElkIjoiY29sZWNjaW9uLW1rdC13ZWIiLCJzdG9yYWdlQnVja2V0IjoiY29sZWNjaW9uLW1rdC13ZWIuYXBwc3BvdC5jb20iLCJtZXNzYWdpbmdTZW5kZXJJZCI6IjExNzQ1NDgwNjQxNiIsImFwcElkIjoiMToxMTc0NTQ4MDY0MTY6d2ViOmQ1Mjk5MDQwNmIwM2M4ODUyZDY3MTUiLCJtZWFzdXJlbWVudElkIjoiRy00ODZIOVRROE1HIn0=";
    let firebaseConfig = JSON.parse(atob(firebaseConfigBase64));
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    // auth init
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // firestore read user data
            currentUser = user;
            let db = firebase.firestore();
            userContentRef = db.collection("elementos").doc(currentUser.uid);
            userContentRef.get().then((doc) => {
                if (doc.exists) {
                    userContent = doc.data();
                } else {
                    userContentRef.set(userContent);
                }
            });
            // idle sync config
            idleInterval = setInterval(() => {
                idleTime += 1;
                if (idleTime > 14) { // 1.5 seconds
                    sync_user_data();
                }
            }, 100); // 0.1 seconds
            // load content
            $("#content-container").load("/collection.html", () => {
                $("#spinner-row").hide();
                $("#main-div").show();
            });
        }
        else {
            location.replace("/");
        }
    });
});