// metadata variables
var metadata_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=928955547";
var changelog;

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

// info database
var elements_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=0";
var circuits_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=1377585849";
var objects_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=1554086270";
var elements_circuits_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=1130853870";

var info_database;

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
    } else {
        idleTime = 20;
    }
}

// elements backgrounds
var opacity_not_owned = "0.5";
var bg_driver_normal_v = "https://firebasestorage.googleapis.com/v0/b/coleccion-mkt-web.appspot.com/o/backgrounds%2Fdriver_normal_v.png?alt=media&token=f25a2785-b16f-4a9b-b001-1d31c53cb7fa";
var bg_driver_super_v = "https://firebasestorage.googleapis.com/v0/b/coleccion-mkt-web.appspot.com/o/backgrounds%2Fdriver_super_v.png?alt=media&token=aaa5f10d-3b60-4e28-a9da-b1bd1e8369af";
var bg_driver_highend_v = "https://firebasestorage.googleapis.com/v0/b/coleccion-mkt-web.appspot.com/o/backgrounds%2Fdriver_highend_v.png?alt=media&token=d454a4e4-4c6c-4e6d-be32-e67cc9bd0abc";
var bg_garage_normal_v = "https://firebasestorage.googleapis.com/v0/b/coleccion-mkt-web.appspot.com/o/backgrounds%2Fgarage_normal_v.png?alt=media&token=92713e8d-1cbd-4b33-9499-a0a7c9bf3278";
var bg_garage_super_v = "https://firebasestorage.googleapis.com/v0/b/coleccion-mkt-web.appspot.com/o/backgrounds%2Fgarage_super_v.png?alt=media&token=8f0c347a-def3-4543-8644-6510d2527fdf";
var bg_garage_highend_v = "https://firebasestorage.googleapis.com/v0/b/coleccion-mkt-web.appspot.com/o/backgrounds%2Fgarage_highend_v.png?alt=media&token=b0cbd390-0bf6-464e-8ff4-d3e2f5ccacae";
var backgrounds = [bg_driver_normal_v, bg_driver_super_v, bg_driver_highend_v,
    bg_garage_normal_v, bg_garage_super_v, bg_garage_highend_v];

function select_background(tier, type) {
    let i = type == 1 ? 0 : 3;
    i += tier - 1;
    return backgrounds[i];
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

var changelog_template = `
<div class="row">
    <div class="col px-0">
        <h4 style="color:var(--dark)">Versión {{version}}</h4>
    </div>
</div>
<div class="row">
    <div class="col px-0">
        <ul>{{changes}}</ul>
    </div>
</div>
`;

var element_details_template = `
<div class="container-fluid">
    <div class="row">
        <div class="col-6 px-0">
            <div class="card mb-1" style="position:relative">
                <img data-src="{{background}}" class="mkt-background-img card-img lazyload p-0" loading="lazy">
                <div class="mkt-element-div" style="display:flex">
                    <img data-src="{{element}}" class="mkt-element-img card-img lazyload p-0" loading="lazy">
                </div>
                <div class="mkt-object-div" style="display:flex">
                    <img data-src="{{object}}" class="mkt-object-img card-img lazyload p-0" loading="lazy">
                </div>
            </div>
        </div>
        <div class="col-6 px-0" style="display: flex;flex-direction: column;justify-content: space-evenly;">
            <div class="row mx-0 px-3" style="justify-content: center">
                <h4 class="d-sm-block d-none" style="text-align: center">Nivel actual: <b>{{level}}</b></h4>
                <h5 class="d-block d-sm-none" style="text-align: center">Nivel actual: <b>{{level}}</b></h5>
            </div>
            <div class="row mx-0 px-3" style="justify-content: center">
                <h4 class="d-sm-block d-none" style="text-align: center">Cantidad de circuitos: <b>{{circuits}}</b></h4>
                <h5 class="d-block d-sm-none" style="text-align: center">Cantidad de circuitos: <b>{{circuits}}</b></h5>
            </div>
            <div class="row mx-0 px-3" style="justify-content: center;display: {{display}}">
                <h4 class="d-sm-block d-none" style="text-align: center">Tiene el nivel más alto en <b>{{highest_level}}</b> circuitos</h4>
                <h5 class="d-block d-sm-none" style="text-align: center">Tiene el nivel más alto en <b>{{highest_level}}</b> circuitos</h5>
            </div>
            <div class="row mx-0 px-3" style="justify-content: center;display: {{display}}">
                <h4 class="d-sm-block d-none" style="text-align: center">Es tu mejor opción en <b>{{best_option}}</b> circuitos</h4>
                <h5 class="d-block d-sm-none" style="text-align: center">Es tu mejor opción en <b>{{best_option}}</b> circuitos</h5>
            </div>
        </div>
    </div>
</div>
`;

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

function set_read_changelog() {
    let changelog_element = $('.mkt-changelog');
    changelog_element.removeClass('mkt-changelog-new');
    changelog_element.addClass('text-reset');
    $('.mkt-changelog-icon').hide();
}

function set_unread_changelog() {
    let changelog_element = $('.mkt-changelog');
    changelog_element.removeClass('text-reset');
    changelog_element.addClass('mkt-changelog-new');
    $('.mkt-changelog-icon').show();
}

function show_changelog() {
    $('#popup-back-button').hide();
    $('#popup-modal-title').text('Changelog');
    $('#popup-modal-body').removeClass('bg-dark');
    $('#popup-modal-body').html(`<div class="container-fluid">${changelog.content.map(e =>
        changelog_template
            .replaceAll('{{version}}', e.version)
            .replaceAll('{{changes}}', e.changes.map(
                change_element => `<li style="color:var(--dark)">${change_element}</li>`).join(""))
    ).join("")}</div>`);
    $("#menuModal").modal("hide");
    $('#popupModal').modal('show');
}

// details functions

var details_stack = [];

function show_element_details(img_urls, data) {
    $('#popup-modal-body').addClass('bg-dark');
    $('#popup-back-button').show();
    if (details_stack.length == 0) {
        $('#popup-back-button').prop('disabled', true);
    } else {
        $('#popup-back-button').prop('disabled', false);
    }
    details_stack.push({
        type: 'element',
        img_urls: img_urls,
        data: data
    })
    
    //TODO details queries
    let e = info_database.getSchema().table('elements');
    let c = info_database.getSchema().table('circuits');
    let o = info_database.getSchema().table('objects');
    let ec = info_database.getSchema().table('elements_circuits');
    info_database.select(e.id, e.pos, e.tier, e.image_url,
            lf.fn.count(ec.circuit_id).as('favored_circuits'), o.image_url)
            .from(ec).leftOuterJoin(e, ec.element_id.eq(e.id)).leftOuterJoin(c, ec.circuit_id.eq(c.id))
            .innerJoin(o, o.id.eq(e.object_id))
            .where(e.type.eq(type))
            .groupBy(e.id)
            .orderBy(lf.fn.count(ec.circuit_id), lf.Order.DESC)
            .orderBy(e.pos, lf.Order.ASC)
            .exec();
    $('#popup-modal-title').text('undefined');
    $('#popup-modal-body').html(element_details_template
        .replaceAll("{{background}}", img_urls.background)
        .replaceAll("{{element}}", img_urls.element)
        .replaceAll("{{object}}", img_urls.object)
        .replaceAll("{{level}}", data.level)
        .replaceAll("{{circuits}}", undefined)
        .replaceAll("{{display}}", data.level > 0 ? 'flex' : 'none')
        .replaceAll("{{highest_level}}", undefined)
        .replaceAll("{{best_option}}", undefined));
    $("#menuModal").modal("hide");
    $('#popupModal').modal('show');
}

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
                default:
                    return "";
            }
            return metadata_template
                .replaceAll("{{content}}", result);
        },
        callback: (error, options, response) => {
            $(".mkt-metadata").html(response.html);
        }
    });
    $.get("/raw/changelog.json").done(data => {
        changelog = data;
        $('.mkt-version').text(`Versión: ${changelog.content[0].version}`);
    });

    // events init
    $(".mkt-logout-button").click(e => {
        firebase.auth().signOut().then(() => {
            location.replace("/login");
        });
    });
    $(".mkt-menu-item").each((i, e) => {
        let item = $(e);
        let item_href = item.attr("href");
        let url_reference = item_href.replace("#", "/");
        item.click((e) => {
            unset_active_menu_item($(".mkt-menu-item.active"));
            set_active_menu_item($(`.mkt-menu-item[href='${item_href}']`));
            $("#menuModal").modal("hide");
            $("#content-container").html(loading_spinner);
            $("#content-container").load(url_reference);
        });
    });
    add_visibility_change_event($("#menu-div-sm")[0], isVisible => {
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
                // load user data
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

                // show changelog read status
                execute_after_condition(() => {
                    if (!userContent.changelog_read_version
                        || userContent.changelog_read_version != changelog.content[0].version) {
                        set_unread_changelog();
                    }
                    $('.mkt-changelog').click(e => {
                        e.preventDefault();
                        if (userContent.changelog_read_version != changelog.content[0].version) {
                            set_read_changelog();
                            userContent.changelog_read_version = changelog.content[0].version;
                            set_data_unsyncd();
                        }
                        show_changelog();
                    })
                }, () => changelog);

                // load info database
                let elements_list;
                sheetrock({
                    url: elements_url,
                    query: 'select A, B, C, D, E, F, G',
                    reset: true,
                    callback: (error, options, response) => {
                        elements_list = response.rows.slice(1).map((v, i, a) => v.cells);
                    }
                });
                let circuits_list;
                sheetrock({
                    url: circuits_url,
                    query: 'select A, B, C, D, E, F',
                    reset: true,
                    callback: (error, options, response) => {
                        circuits_list = response.rows.slice(1).map((v, i, a) => v.cells);
                    }
                });
                let objects_list;
                sheetrock({
                    url: objects_url,
                    query: 'select A, B, C',
                    reset: true,
                    callback: (error, options, response) => {
                        objects_list = response.rows.slice(1).map((v, i, a) => v.cells);
                    }
                });
                let elements_circuits_list;
                sheetrock({
                    url: elements_circuits_url,
                    query: 'select A, B, C',
                    reset: true,
                    callback: (error, options, response) => {
                        elements_circuits_list = response.rows.slice(1).map((v, i, a) => v.cells);
                    }
                });

                let schemaBuilder = lf.schema.create("infodb", 1);
                schemaBuilder.createTable('elements').
                    addColumn('id', lf.Type.INTEGER).
                    addColumn('name', lf.Type.STRING).
                    addColumn('pos', lf.Type.INTEGER).
                    addColumn('tier', lf.Type.INTEGER).
                    addColumn('image_url', lf.Type.STRING).
                    addColumn('type', lf.Type.INTEGER).
                    addColumn('object_id', lf.Type.INTEGER).
                    addPrimaryKey(['id']);
                schemaBuilder.createTable('circuits').
                    addColumn('id', lf.Type.INTEGER).
                    addColumn('name', lf.Type.STRING).
                    addColumn('league', lf.Type.INTEGER).
                    addColumn('pos', lf.Type.INTEGER).
                    addColumn('mkt', lf.Type.BOOLEAN).
                    addColumn('source', lf.Type.STRING).
                    addPrimaryKey(['id']);
                schemaBuilder.createTable('objects').
                    addColumn('id', lf.Type.INTEGER).
                    addColumn('name', lf.Type.STRING).
                    addColumn('image_url', lf.Type.STRING).
                    addPrimaryKey(['id']);
                schemaBuilder.createTable('elements_circuits').
                    addColumn('element_id', lf.Type.INTEGER).
                    addColumn('circuit_id', lf.Type.INTEGER).
                    addColumn('level', lf.Type.INTEGER).
                    addPrimaryKey(['element_id', 'circuit_id']);

                schemaBuilder.connect({ storeType: lf.schema.DataStoreType.MEMORY }).then((db) => {
                    info_database = db;
                });

                let loaded_flags = [false, false, false, false];
                execute_after_condition(() => {
                    let table = info_database.getSchema().table('elements');
                    return info_database.insertOrReplace().into(table).values(
                        elements_list.map((v, i, a) => table.createRow({
                            'id': v.id,
                            'name': v.name,
                            'pos': parseInt(v.pos),
                            'tier': v.tier,
                            'image_url': v.image_url,
                            'type': v.type,
                            'object_id': v.object_id
                        }))
                    ).exec().then(() => loaded_flags[0] = true);
                }, () => elements_list);
                execute_after_condition(() => {
                    let table = info_database.getSchema().table('circuits');
                    return info_database.insertOrReplace().into(table).values(
                        circuits_list.map((v, i, a) => table.createRow({
                            'id': v.id,
                            'name': v.name,
                            'league': parseInt(v.league),
                            'pos': parseInt(v.pos),
                            'mkt': v.mkt,
                            'source': v.source
                        }))
                    ).exec().then(() => loaded_flags[1] = true);
                }, () => circuits_list);
                execute_after_condition(() => {
                    let table = info_database.getSchema().table('objects');
                    return info_database.insertOrReplace().into(table).values(
                        objects_list.map((v, i, a) => table.createRow(v))
                    ).exec().then(() => loaded_flags[2] = true);
                }, () => objects_list);
                execute_after_condition(() => {
                    let table = info_database.getSchema().table('elements_circuits');
                    return info_database.insertOrReplace().into(table).values(
                        elements_circuits_list.map((v, i, a) => table.createRow({
                            'element_id': parseInt(v.element_id),
                            'circuit_id': parseInt(v.circuit_id),
                            'level': Math.max(parseInt(v.level), 1)
                        }))
                    ).exec().then(() => loaded_flags[3] = true);
                }, () => elements_circuits_list);

                // load content
                execute_after_condition(() => {
                    switch (location.hash) {
                        case "#collection":
                        case "#ranking":
                            break;
                        default:
                            location.hash = "#collection";
                            break;
                    }
                    let url_reference = location.hash.replace("#", "/");
                    set_active_menu_item($(`.mkt-menu-item[href='${location.hash}']`));
                    $("#content-container").load(url_reference, () => {
                        $("#spinner-row").hide();
                        $("#menu-div-sm").show();
                        $("#main-div").show();
                    });
                }, () => loaded_flags.every(v => v));
            });
        }
        else {
            location.replace("/login");
        }
    });
});