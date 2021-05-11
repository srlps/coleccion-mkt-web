var season = "Temporada de Sidney";
var update_date = "30/04/2021";
var version = "1.1.1";
var autor = "Sergio Robles";

var elements_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=0";
var circuits_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=1377585849";
var objects_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=1554086270";
var elements_circuits_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=1130853870";

var idleTime = 15;
var dataSyncd = true;
var currentUser;
var userContentRef;
var userContent = {
    drivers: [],
    gliders: [],
    karts: []
};

var loading_spinner = `
<div class="row mt-5">
    <div class="col text-center">
        <i class="fas fa-spinner fa-5x fa-spin"></i>
    </div>
</div>
`;

function set_data_unsyncd() {
    idleTime = 0;
    dataSyncd = false;
    $(".mkt-sync-icon").show();
}

function sync_user_data() {
    if (!dataSyncd) {
        dataSyncd = true;
        userContentRef.set(userContent).then(() => $(".mkt-sync-icon").hide());
    }
}

function addVisibilityChangeEvent(element, handler) {
    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            handler(entry.intersectionRatio > 0);
        });
    }, {
        root: document.documentElement
    });
    observer.observe(element);
};

function set_active_menu_item(item) {
    item.addClass("active");
    item.addClass("disabled");
    item.attr("aria-current", "true");
    item.attr("tabindex", "-1");
    item.attr("aria-disabled", "true");
}

function unset_active_menu_item(item) {
    item.removeClass("active");
    item.removeClass("disabled");
    item.removeAttr("aria-current");
    item.removeAttr("tabindex");
    item.removeAttr("aria-disabled");
}

$(() => {
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
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    // web info init
    $(".mkt-season").text(season);
    $(".mkt-update-date").text(`Actualizado al ${update_date}`);
    $(".mkt-version").text(`Versión: ${version}`);
    $(".mkt-autor").text(`Autor: ${autor}`);

    // events init
    $(".mkt-logout-button").click((e) => {
        firebase.auth().signOut().then(() => {
            location.replace("/login.html");
        });
    });
    $(".mkt-menu-item").click((e) => {
        let item_href = $(e.currentTarget).attr("href");
        unset_active_menu_item($(".mkt-menu-item.active"));
        set_active_menu_item($(`.mkt-menu-item[href='${item_href}']`));
        switch (item_href) {
            case "#collection":
                $("#menuModal").modal("hide");
                $("#content-container").html(loading_spinner);
                $("#content-container").load("/collection.html");
                break;
            case "#ranking":
                $("#menuModal").modal("hide");
                $("#content-container").html(loading_spinner);
                $("#content-container").load("/ranking.html");
                break;
        }
    });
    addVisibilityChangeEvent($("#menu-div-sm")[0], (isVisible) => {
        if (!isVisible) {
            $("#menuModal").modal("hide");
        }
    });

    // auth init
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // firestore read user data
            currentUser = user;
            $(".mkt-user-display-name").text(currentUser.displayName);
            $(".mkt-user-profile-picture").attr("src", currentUser.photoURL);
            let db = firebase.firestore();
            userContentRef = db.collection("elementos").doc(currentUser.uid);
            userContentRef.get().then((doc) => {
                if (doc.exists) {
                    userContent = doc.data();
                } else {
                    userContentRef.set(userContent);
                }
                // idle sync config
                setInterval(() => {
                    idleTime += 1;
                    if (idleTime > 14) { // 1.5 seconds
                        sync_user_data();
                    }
                }, 100); // 0.1 seconds
                // load content
                $("#content-container").load("/collection.html", () => {
                    $("#spinner-row").hide();
                    $("#menu-div-sm").show();
                    $("#main-div").show();
                });
            });
        }
        else {
            location.replace("/login.html");
        }
    });
});