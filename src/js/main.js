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
var league_best_option_rules_url = "https://docs.google.com/spreadsheets/d/13GDb4-uFg8hq5is6F_QhJcz4sMKNskatMcgkB0INwD8/edit#gid=526535366";

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
    {{circuit_elements}}
</div>
`;

var circuit_elements_template = `
<div class="row mt-2">
    <div class="col-12 px-0">
        <label class="btn btn-info container my-0 px-3 active">{{name}}</label>
    </div>
</div>
<div class="row mt-1">{{elements}}</div>
`;

var single_circuit_element_template = `
<div class="mkt-card col-3 col-lg-2 mb-2 px-2">
    <div class="card mb-1" style="position:relative" data-id="{{id}}" data-name="{{name}}" data-level="{{level}}">
        <img data-src="{{background}}" class="mkt-card-img mkt-background-img card-img lazyload p-0" style="opacity:{{opacity}}"
            loading="lazy">
        <div class="mkt-element-div" style="display:flex">
            <img data-src="{{element}}" class="mkt-card-img mkt-element-img card-img lazyload p-0" style="opacity:{{opacity}}"
                loading="lazy">
        </div>
        <div class="mkt-object-div" style="display:flex">
            <img data-src="{{object}}" class="mkt-card-img mkt-object-img card-img lazyload p-0" style="opacity:{{opacity}}"
                loading="lazy">
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
    $('#changelog-content').html(changelog.content.map(e =>
        changelog_template
            .replaceAll('{{version}}', e.version)
            .replaceAll('{{changes}}', e.changes.map(
                change_element => `<li style="color:var(--dark)">${change_element}</li>`).join(""))
    ).join(""));
    $("#menuModal").modal("hide");
    $('#changelogModal').modal('show');
}

// details functions

var details_stack = [];

function show_details(type, object) {
    switch (type) {
        case 'element':
            details_stack.push({
                type: 'element',
                img_urls: object.img_urls,
                data: object.data
            });
            show_element_details(object.img_urls, object.data);
            break;
    }
}

function show_element_details(img_urls, data) {
    if (details_stack.length == 1) {
        $('#details-back-button').prop('disabled', true);
    } else {
        $('#details-back-button').prop('disabled', false);
    }
    $('#details-modal-title').text(data.name);
    let element_details = element_details_template
        .replaceAll("{{background}}", img_urls.background)
        .replaceAll("{{element}}", img_urls.element)
        .replaceAll("{{object}}", img_urls.object)
        .replaceAll("{{level}}", data.level)
        .replaceAll("{{display}}", data.level > 0 ? 'flex' : 'none');

    let e = info_database.getSchema().table('elements');
    let c = info_database.getSchema().table('circuits');
    let o = info_database.getSchema().table('objects');
    let ec = info_database.getSchema().table('elements_circuits');
    let ordered_circuit_ids;
    info_database.select(ec.circuit_id)
        .from(ec).leftOuterJoin(c, ec.circuit_id.eq(c.id))
        .where(ec.element_id.eq(data.id))
        .orderBy(ec.level, lf.Order.ASC).orderBy(c.pos, lf.Order.ASC)
        .exec()
        .then(circuit_ids => {
            ordered_circuit_ids = circuit_ids.map(e => e.elements_circuits.circuit_id);
            element_details = element_details
                .replaceAll("{{circuits}}", ordered_circuit_ids.length);
            return info_database.select(c.id, c.name, ec.level, e.id, e.name, e.tier, e.pos, e.image_url, o.id, o.image_url)
                .from(ec).leftOuterJoin(c, ec.circuit_id.eq(c.id)).leftOuterJoin(e, ec.element_id.eq(e.id))
                .leftOuterJoin(o, e.object_id.eq(o.id))
                .where(lf.op.and(ec.circuit_id.in(ordered_circuit_ids), e.type.eq(data.type)))
                .exec();
        }).then(element_circuits => {
            let circuits_map = new Map();
            element_circuits.forEach((e) => {
                let key = e.circuits.id;
                let element = select_array(data.type).find((uv, ui, ua) => uv.id == e.elements.id);
                let level = element ? element.level : 0;
                let map_element = {
                    id: e.elements.id,
                    name: e.elements.name,
                    tier: e.elements.tier,
                    pos: e.elements.pos,
                    object_id: e.objects.id,
                    element_img_url: e.elements.image_url,
                    object_img_url: e.objects.image_url,
                    min_level: e.elements_circuits.level,
                    level: level
                };
                let collection = circuits_map.get(key);
                if (!collection) {
                    circuits_map.set(key, {
                        id: key,
                        name: e.circuits.name,
                        elements: [map_element]
                    });
                } else {
                    collection.elements.push(map_element);
                }
            });

            let highest_level = 0;
            let best_option = 0;
            let circuit_elements = ordered_circuit_ids.map(e => {
                let circuit = circuits_map.get(e);
                circuit.elements.sort((a, b) => compare_elements_in_circuit(a, b));
                let prev_element = circuit.elements[0];
                let highest_array = [];
                if (prev_element.level >= prev_element.min_level) {
                    highest_array.push(prev_element);
                    if (prev_element.id == data.id) {
                        highest_level++;
                    }
                    for (let i = 1; i < circuit.elements.length; i++) {
                        let this_element = circuit.elements[i];
                        if (this_element.level >= this_element.min_level && this_element.level == prev_element.level) {
                            highest_array.push(this_element);
                            if (this_element.id == data.id) {
                                highest_level++;
                            }
                            prev_element = this_element;
                        } else {
                            break;
                        }
                    }
                }
                if (highest_array.length > 0) {
                    if (highest_array.length == 1) {
                        highest_array[0].best_option = true;
                        if (highest_array[0].id == data.id) {
                            best_option++;
                        }
                    } else {
                        let prev_high = highest_array[0];
                        prev_high.best_option = true;
                        if (prev_high.id == data.id) {
                            best_option++;
                        }
                        for (let i = 1; i < highest_array.length; i++) {
                            let this_high = highest_array[i];
                            if (this_high.league_score == prev_high.league_score) {
                                this_high.best_option = true;
                                if (this_high.id == data.id) {
                                    best_option++;
                                }
                                prev_high = this_high;
                            } else {
                                break;
                            }
                        }
                    }
                }
                return circuit_elements_template
                    .replaceAll("{{name}}", circuit.name)
                    .replaceAll("{{elements}}", circuit.elements.map(e => single_circuit_element_template
                        .replaceAll("{{background}}", select_background(e.tier, data.type))
                        .replaceAll("{{element}}", e.element_img_url)
                        .replaceAll("{{object}}", e.object_img_url)
                        .replaceAll("{{opacity}}", e.level >= e.min_level ? "1" : opacity_not_owned)
                        .replaceAll("{{id}}", e.id)
                        .replaceAll("{{name}}", e.name)
                        .replaceAll("{{level}}", e.level)
                    ).join(""));
            }).join("");
            element_details = element_details
                .replaceAll("{{highest_level}}", highest_level)
                .replaceAll("{{best_option}}", best_option)
                .replaceAll("{{circuit_elements}}", circuit_elements);
            $('#details-modal-body').html(element_details);
            $('#detailsModal').modal('show');
        });
}

function compare_elements_in_circuit(a, b) {
    let cover_a = a.level >= a.min_level ? 1 : 0;
    let cover_b = b.level >= b.min_level ? 1 : 0;
    if (cover_a != cover_b) {
        return cover_b - cover_a;
    }
    if (cover_a == 1) {
        if (a.level != b.level) {
            return b.level - a.level;
        }
        a.league_score = get_element_score_in_league(a);
        b.league_score = get_element_score_in_league(b);
        if (a.league_score != b.league_score) {
            return b.league_score - a.league_score;
        }
    } else {
        if (a.level > 0 && b.level > 0) {
            return (a._min_level - a.level) - (b.min_level - b.level);
        }
        if (a.level + b.level > 0) {
            return b.level - a.level;
        }
        if (a.min_level != b.min_level) {
            return a.min_level - b.min_level;
        }
    }
    return b.pos - a.pos;
}

function get_element_score_in_league(element) {
    return 0;
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
    $('#details-back-button').click(e => {
        details_stack.pop();
        if (details_stack.length > 0) {
            let last_details_query = details_stack[details_stack.length - 1];
            switch (last_details_query.type) {
                case 'element':
                    show_element_details(last_details_query.img_urls, last_details_query.data);
                    break;
            }
        }
    });
    $('#detailsModal').on('hidden.bs.modal', e => {
        details_stack = [];
    })

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
                    $('.mkt-changelog').on("click", e => {
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
                let league_best_option_rules_list;
                sheetrock({
                    url: league_best_option_rules_url,
                    query: 'select A, B, C',
                    reset: true,
                    callback: (error, options, response) => {
                        league_best_option_rules_list = response.rows.slice(1).map((v, i, a) => v.cells);
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
                schemaBuilder.createTable('league_best_option_rules').
                    addColumn('rule', lf.Type.STRING).
                    addColumn('key', lf.Type.INTEGER).
                    addColumn('value', lf.Type.INTEGER).
                    addPrimaryKey(['rule', 'key']);

                schemaBuilder.connect({ storeType: lf.schema.DataStoreType.MEMORY }).then((db) => {
                    info_database = db;
                });

                let loaded_flags = [false, false, false, false, false];
                execute_after_condition(() => {
                    let table = info_database.getSchema().table('elements');
                    return info_database.insertOrReplace().into(table).values(
                        elements_list.map((v, i, a) => table.createRow({
                            'id': parseInt(v.id),
                            'name': v.name,
                            'pos': parseInt(v.pos),
                            'tier': parseInt(v.tier),
                            'image_url': v.image_url,
                            'type': parseInt(v.type),
                            'object_id': parseInt(v.object_id)
                        }))
                    ).exec().then(() => loaded_flags[0] = true);
                }, () => elements_list);
                execute_after_condition(() => {
                    let table = info_database.getSchema().table('circuits');
                    return info_database.insertOrReplace().into(table).values(
                        circuits_list.map((v, i, a) => table.createRow({
                            'id': parseInt(v.id),
                            'name': v.name,
                            'league': parseInt(v.league),
                            'pos': parseInt(v.pos),
                            'source': v.source
                        }))
                    ).exec().then(() => loaded_flags[1] = true);
                }, () => circuits_list);
                execute_after_condition(() => {
                    let table = info_database.getSchema().table('objects');
                    return info_database.insertOrReplace().into(table).values(
                        objects_list.map((v, i, a) => table.createRow({
                            'id': parseInt(v.id),
                            'name': v.name,
                            'image_url': v.image_url
                        }))
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
                execute_after_condition(() => {
                    let table = info_database.getSchema().table('league_best_option_rules');
                    return info_database.insertOrReplace().into(table).values(
                        league_best_option_rules_list.map((v, i, a) => table.createRow({
                            'rule': v.rule,
                            'key': parseInt(v.key),
                            'value': parseInt(v.value)
                        }))
                    ).exec().then(() => loaded_flags[4] = true);
                }, () => league_best_option_rules_list);

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