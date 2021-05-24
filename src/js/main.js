// metadata variables
var metadata_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=928955547";
var version = "1.1.1";
var autor = "srlps";
var autor_url = "https://github.com/srlps";

// persistence
var currentUser;
var userContentRef;
var userContent = {
    drivers: [],
    gliders: [],
    karts: []
};

function select_array(type) {
    switch (type) {
        case 1:
            return userContent.drivers;
        case 2:
            return userContent.karts;
        case 3:
            return userContent.gliders;
    }
}

// info database urls
var elements_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=0";
var circuits_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=1377585849";
var objects_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=1554086270";
var elements_circuits_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=1130853870";

// non aggresive sync
var idleTime = 15;
var dataSyncd = true;

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

// elements backgrounds
var background_normal = "https://mario.wiki.gallery/images/2/29/MKT_Icon_Normal.png";
var background_super = "https://mario.wiki.gallery/images/a/a6/MKT_Icon_Rare.png";
var background_highend = "https://mario.wiki.gallery/images/8/8f/MKT_Icon_HighEnd.png";
var backgrounds = [background_normal, background_super, background_highend];

function select_background(tier) {
    return backgrounds[tier - 1];
}

// utility functions
function add_visibility_change_event(element, handler) {
    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            handler(entry.intersectionRatio > 0);
        });
    }, {
        root: document.documentElement
    });
    observer.observe(element);
};

function execute_after_condition(func, condition) {
    setTimeout(() => {
        if (condition()) {
            func();
        } else {
            execute_after_condition(func, condition);
        }
    }, 100);
}

// main page functions
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

// main page templates
var loading_spinner = `
<div class="row mt-5">
    <div class="col text-center">
        <i class="fas fa-spinner fa-5x fa-spin"></i>
    </div>
</div>
`;

var metadata_template = `
<p style="color:rgba(34,42,66,0.75) !important;">{{content}}</p>
`;

// main page init
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
    sheetrock({
        url: metadata_url,
        query: "select B, C order by A asc",
        reset: true,
        rowTemplate: (row) => {
            let result;
            switch (row.cells.name) {
                case "season":
                    result = row.cells.value;
                    break;
                case "update_date":
                    result = `Actualizado al ${row.cells.value}`;
                    break;
            }
            return metadata_template
                .replaceAll("{{content}}", result);
        },
        callback: (error, options, response) => {
            $(".mkt-metadata").html(response.html);
        }
    });
    $(".mkt-version").text(`Versión: ${version}`);
    $(".mkt-autor").html(`Autor: <a class="text-reset" href="${autor_url}">${autor}</a>`);

    // events init
    $(".mkt-logout-button").click((e) => {
        firebase.auth().signOut().then(() => {
            location.replace("/login.html");
        });
    });
    $(".mkt-menu-item").each((i, e) => {
        let item = $(e);
        let item_href = item.attr("href");
        let url_reference;
        switch (item_href) {
            case "#collection":
                url_reference = "/collection.html";
                break;
            case "#ranking":
                url_reference = "/ranking.html";
                break;
        }
        item.click((e) => {
            unset_active_menu_item($(".mkt-menu-item.active"));
            set_active_menu_item($(`.mkt-menu-item[href='${item_href}']`));
            $("#menuModal").modal("hide");
            $("#content-container").html(loading_spinner);
            $("#content-container").load(url_reference);
        });
    });
    add_visibility_change_event($("#menu-div-sm")[0], (isVisible) => {
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
                switch (location.hash) {
                    case "#collection":
                    case "#ranking":
                        break;
                    default:
                        location.hash = "#collection";
                        break;
                }
                let url_reference = `/${location.hash.substr(1)}.html`;
                set_active_menu_item($(`.mkt-menu-item[href='${location.hash}']`));
                $("#content-container").load(url_reference, () => {
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