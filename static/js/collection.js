var currentUser;
var userContentRef;
var userContent = {
    drivers: [],
    gliders: [],
    karts: []
};

var elements_spreadsheet_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=0";

var background_normal = "https://mario.wiki.gallery/images/2/29/MKT_Icon_Normal.png";
var background_super = "https://mario.wiki.gallery/images/a/a6/MKT_Icon_Rare.png";
var background_highend = "https://mario.wiki.gallery/images/8/8f/MKT_Icon_HighEnd.png";

var opacity_not_owned = "0.4";

var card_template = `
<div class="col mb-2 mb-md-4 px-2 px-md-3">
    <div class="card mb-0">
        <img data-src="{{background}}" class="card-img lazyload">
        <div class="card-img-overlay p-2" style="display:flex;align-items:center;justify-content:center;">
            <img data-src="{{object}}" class="card-img lazyload" style="max-height:100%;object-fit:contain;opacity:{{opacity}}"
                loading="lazy">
        </div>
    </div>
    <div class="row m-0" style="height:40px;"">
      <div class="col-3 p-0 text-center">
        <button class="btn btn-info btn-sm mw-100 m-0 py-1 py-md-2 px-1 px-md-2" type="button">
          <i class="fas fa-minus"></i>
        </button>
      </div>
      <div class="col-6 p-0 text-center">
        <p class="h2 font-weight-bold text-white">{{level}}</p>
      </div>
      <div class="col-3 p-0 text-center">
        <button class="btn btn-info btn-sm mw-100 m-0 py-1 py-md-2 px-1 px-md-2" type="button">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>
</div>
`;

function select_background(tier) {
    return tier == 1 ? background_normal : (tier == 2 ? background_super : background_highend);
}

function is_owned(type, id) {
    switch (type) {
        case 1:
            return userContent.drivers.some((val, i, arr) => val.id == id);
        case 2:
            return userContent.karts.some((val, i, arr) => val.id == id);
        case 3:
            return userContent.gliders.some((val, i, arr) => val.id == id);
    }
}

function select_element(type, id) {
    switch (type) {
        case 1:
            return userContent.drivers.find((val, i, arr) => val.id == id);
        case 2:
            return userContent.karts.find((val, i, arr) => val.id == id);
        case 3:
            return userContent.gliders.find((val, i, arr) => val.id == id);
    }
}

function load_content(type) {
    $("#card-grid").empty();
    $("#card-grid").sheetrock({
        url: elements_spreadsheet_url,
        query: `select A, D, E where F = ${type} order by C asc`,
        reset: true,
        rowTemplate: (row) => {
            let element = select_element(type, row.cells.id);
            let level = element ? element.level : 0;
            let owned = level != 0;
            return card_template
                .replace("{{background}}", select_background(row.cells.tier))
                .replace("{{object}}", row.cells.image_url)
                .replace("{{opacity}}", owned ? "1" : opacity_not_owned)
                .replace("{{level}}", level);
        }
    });
}

function load_page() {
    $("input[name='element-type']").change(function (e) {
        // style control
        let active = $(e.target).parent();
        active.addClass("btn-primary");
        active.removeClass("btn-secondary");
        let non_active = $(".mkt-radio").not(active);
        non_active.addClass("btn-secondary");
        non_active.removeClass("btn-primary");
        // content control
        switch (e.target.value) {
            case "drivers":
                load_content(1);
                break;
            case "karts":
                load_content(2);
                break;
            case "gliders":
                load_content(3);
                break;
        }
    });
    let db = firebase.firestore();
    userContentRef = db.collection("elementos").doc(currentUser.uid);
    userContentRef.get().then((doc) => {
        if (doc.exists) {
            userContent = doc.data();
        } else {
            userContentRef.set(userContent);
        }
        load_content(1);
    });
}

$(document).ready(function () {
    $("#main-container").hide();

    // firebase init
    let firebaseConfigBase64 = "eyJhcGlLZXkiOiJBSXphU3lEQkdKR29WdzJtM1ZJZ2tXUERJelh1Y2ZHajkzQ0ZNY2MiLCJhdXRoRG9tYWluIjoiY29sZWNjaW9uLW1rdC13ZWIuZmlyZWJhc2VhcHAuY29tIiwicHJvamVjdElkIjoiY29sZWNjaW9uLW1rdC13ZWIiLCJzdG9yYWdlQnVja2V0IjoiY29sZWNjaW9uLW1rdC13ZWIuYXBwc3BvdC5jb20iLCJtZXNzYWdpbmdTZW5kZXJJZCI6IjExNzQ1NDgwNjQxNiIsImFwcElkIjoiMToxMTc0NTQ4MDY0MTY6d2ViOmQ1Mjk5MDQwNmIwM2M4ODUyZDY3MTUiLCJtZWFzdXJlbWVudElkIjoiRy00ODZIOVRROE1HIn0=";
    let firebaseConfig = JSON.parse(atob(firebaseConfigBase64));
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    // auth init
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            $("#loader-container").hide();
            $("#main-container").show();
            load_page();
        }
        else {
            location.replace("/");
        }
    });

});