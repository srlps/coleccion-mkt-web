var filters = {
    exclude_owned: false,
    only_non_covered_circuits: false,
    exclude_season_exclusive_circuits: false,
    only_league_circuits: false
};

var info_database = {
    drivers: [],
    gliders: [],
    karts: []
};

var ranking_card_template = `
<div class="mkt-card col mb-2 mb-md-4 px-2 px-md-3">
    <div class="card mb-0">
        <img data-src="{{background}}" class="mkt-element-img card-img lazyload" style="opacity:{{opacity}}" loading="lazy">
        <div class="card-img-overlay p-2" style="display:flex;align-items:center;justify-content:center;">
            <img data-src="{{object}}" class="mkt-element-img card-img lazyload"
                style="max-height:100%;object-fit:contain;opacity:{{opacity}}" loading="lazy">
        </div>
    </div>
    <div class="row m-0" style="height:40px;"">
        <div class="col p-0 text-center">
            <p class="h2 font-weight-bold text-white">{{num_circuits}} circuitos</p>
        </div>
    </div>
</div>
`;

function select_database_array(type) {
    switch (type) {
        case 1:
            return info_database.drivers;
        case 2:
            return info_database.karts;
        case 3:
            return info_database.gliders;
    }
}

function sort_by_total_favored_circuits(array) {
    array.sort((a, b) => {
        let rank = b.total_favored_circuits - a.total_favored_circuits;
        if (rank == 0) {
            return a.pos - b.pos;
        } else {
            return rank;
        }
    })
}

function load_ranking(type) {
    $("#card-grid").empty();
    select_database_array(type).forEach((v, i, a) => {
        $("#card-grid").append(ranking_card_template
            .replaceAll("{{background}}", select_background(v.tier))
            .replaceAll("{{object}}", v.image_url)
            .replaceAll("{{opacity}}", "1")
            .replaceAll("{{num_circuits}}", v.total_favored_circuits)
        );
    });
}

$(() => {
    // elemet type radio selector events
    $("#types-div").find("input").change((e) => {
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
                console.log(1);
                break;
            case "karts":
                console.log(2);
                break;
            case "gliders":
                console.log(3);
                break;
        }
    });

    // filters checkbox events
    $("#filters-div").find("input").change((e) => {
        let current_filter = $(e.target);
        let name = current_filter.attr("name");
        let value = current_filter.is(":checked");
        $("#filters-div").find(`input[name='${name}']`).prop("checked", value);
        switch (name) {
            case "exclude-owned":
                filters.exclude_owned = value;
                break;
            case "only-non-covered-circuits":
                filters.only_non_covered_circuits = value;
                break;
            case "exclude-season-exclusive-circuits":
                filters.exclude_season_exclusive_circuits = value;
                break;
            case "only-league-circuits":
                filters.only_league_circuits = value;
                break;
        }
    });

    // load info database
    let info_database_flags = [false, false, false];
    // drivers
    let drivers_flags = [false];
    sheetrock({
        url: elements_url,
        query: `select A, C, D, E where F = 1 order by A asc`,
        reset: true,
        callback: (error, options, response) => {
            info_database.drivers = response.rows.slice(1, -1).map((v, i, a) => v.cells);
            // calculate favored circuits
            sheetrock({
                url: elements_circuits_url,
                query: `select A, count(B) where A < 30000 group by A order by A asc`,
                labels: ["element_id", "total_favored_circuits"],
                reset: true,
                callback: (error, options, response) => {
                    ri = 1;
                    for (let di = 0; di < info_database.drivers.length; di++) {
                        if (info_database.drivers[di].id != response.rows[ri].cells.element_id) {
                            continue;
                        }
                        info_database.drivers[di].total_favored_circuits = response.rows[ri].cells.total_favored_circuits;
                        info_database.drivers[di].element_id = response.rows[ri].cells.element_id;
                        ri++;
                    }
                    drivers_flags[0] = true;
                }
            });
            execute_after_condition(() => {
                sort_by_total_favored_circuits(info_database.drivers);
                info_database_flags[0] = true;
            }, () => drivers_flags.every((v, i, a) => v));
        }
    });
    // karts
    let karts_flags = [false];
    sheetrock({
        url: elements_url,
        query: `select A, C, D, E where F = 2 order by A asc`,
        reset: true,
        callback: (error, options, response) => {
            info_database.karts = response.rows.slice(1, -1).map((v, i, a) => v.cells);
            // calculate favored circuits
            sheetrock({
                url: elements_circuits_url,
                query: `select A, count(B) where A >= 70000 group by A order by A asc`,
                labels: ["element_id", "total_favored_circuits"],
                reset: true,
                callback: (error, options, response) => {
                    ri = 1;
                    for (let di = 0; di < info_database.karts.length; di++) {
                        if (info_database.karts[di].id != response.rows[ri].cells.element_id) {
                            continue;
                        }
                        info_database.karts[di].total_favored_circuits = response.rows[ri].cells.total_favored_circuits;
                        info_database.karts[di].element_id = response.rows[ri].cells.element_id;
                        ri++;
                    }
                    karts_flags[0] = true;
                }
            });
            execute_after_condition(() => {
                sort_by_total_favored_circuits(info_database.karts);
                info_database_flags[1] = true;
            }, () => karts_flags.every((v, i, a) => v));
        }
    });
    // gliders
    let gliders_flags = [false];
    sheetrock({
        url: elements_url,
        query: `select A, C, D, E where F = 3 order by A asc`,
        reset: true,
        callback: (error, options, response) => {
            info_database.gliders = response.rows.slice(1, -1).map((v, i, a) => v.cells);
            // calculate favored circuits
            sheetrock({
                url: elements_circuits_url,
                query: `select A, count(B) where A >= 30000 and A < 70000 group by A order by A asc`,
                labels: ["element_id", "total_favored_circuits"],
                reset: true,
                callback: (error, options, response) => {
                    ri = 1;
                    for (let di = 0; di < info_database.gliders.length; di++) {
                        if (info_database.gliders[di].id != response.rows[ri].cells.element_id) {
                            continue;
                        }
                        info_database.gliders[di].total_favored_circuits = response.rows[ri].cells.total_favored_circuits;
                        info_database.gliders[di].element_id = response.rows[ri].cells.element_id;
                        ri++;
                    }
                    gliders_flags[0] = true;
                }
            });
            execute_after_condition(() => {
                sort_by_total_favored_circuits(info_database.gliders);
                info_database_flags[2] = true;
            }, () => gliders_flags.every((v, i, a) => v));
        }
    });

    // load content
    execute_after_condition(() => load_ranking(1), () => info_database_flags.every((v, i, a) => v));
});