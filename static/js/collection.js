var currentUser;

var elements_spreadsheet_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=0";

var driver_background_normal = "https://mario.wiki.gallery/images/2/29/MKT_Icon_Normal.png";
var driver_background_super = "https://mario.wiki.gallery/images/a/a6/MKT_Icon_Rare.png";
var driver_background_highend = "https://mario.wiki.gallery/images/8/8f/MKT_Icon_HighEnd.png";
var kg_background_normal = "https://mario.wiki.gallery/images/a/a1/MKT_Normal_Garage.png";
var kg_background_super = "https://mario.wiki.gallery/images/6/64/MKT_Rare_Garage.png";
var kg_background_highend = "https://mario.wiki.gallery/images/f/fe/MKT_HighEnd_Garage.png";

var card_template = `
<div class="col mb-1 mb-md-4 px-2 px-md-3">
    <div class="card">
    <img src="{{background}}" class="card-img">
    <div class="card-img-overlay p-2" style="display:flex;align-items:center;justify-content:center;">
        <img src="{{object}}"
        class="card-img" style="max-height:100%;object-fit:contain;">
    </div>
    </div>
</div>
`;

function select_background(tier) {
    return tier == 1 ? driver_background_normal : (tier == 2 ? driver_background_super : driver_background_highend);
}

function load_page() {
    $("input[name='element-type']").change(function (e) {
        let active = $(e.target).parent();
        active.addClass("btn-primary");
        active.removeClass("btn-secondary");
        let non_active = $(".mkt-radio").not(active);
        non_active.addClass("btn-secondary");
        non_active.removeClass("btn-primary");
    });

    $("#card-grid").sheetrock({
        url: elements_spreadsheet_url,
        query: "select D, E where F = 1 order by C asc",
        rowTemplate: (row) => card_template.replace("{{background}}", select_background(row.cells.tier))
            .replace("{{object}}", row.cells.image_url)
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