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

function load_ranking(type) {
    $("#card-grid").empty();
    $("#card-grid").sheetrock({
        url: elements_url,
        query: `select A, D, E where F = ${type} order by C asc`,
        reset: true,
        rowTemplate: (row) => {
            let element = select_array(type).find((val, i, arr) => val.id == row.cells.id);
            let level = element ? element.level : 0;
            return collection_card_template
                .replaceAll("{{id}}", row.cells.id)
                .replaceAll("{{background}}", select_background(row.cells.tier))
                .replaceAll("{{object}}", row.cells.image_url)
                .replaceAll("{{opacity}}", level > 0 ? "1" : opacity_not_owned)
                .replaceAll("{{level}}", level)
                .replaceAll("{{minus-style}}", level > 0 ? plus_minus_enabled_style : plus_minus_disabled_style)
                .replaceAll("{{minus-disabled}}", level > 0 ? "" : "disabled")
                .replaceAll("{{plus-style}}", level < 7 ? plus_minus_enabled_style : plus_minus_disabled_style)
                .replaceAll("{{plus-disabled}}", level < 7 ? "" : "disabled");
        },
        callback: (error, options, response) => {
            $(".mkt-minus-button").click((e) => {
                set_data_unsyncd();
                let minus_button = $(e.currentTarget);
                let card = minus_button.parents(".mkt-card");
                let id = parseInt(card.attr("id"));
                let element = select_array(type).find((val, i, arr) => val.id == id);
                element.level -= 1;
                card.find(".mkt-level").text(element.level);
                if (element.level == 0) {
                    disable_plus_minus_button(minus_button);
                    card.find(".mkt-element-img").css("opacity", opacity_not_owned);
                }
                if (element.level == 6) {
                    let plus_button = card.find(".mkt-plus-button");
                    enable_plus_minus_button(plus_button);
                }
            });
            $(".mkt-plus-button").click((e) => {
                set_data_unsyncd();
                let plus_button = $(e.currentTarget);
                let card = plus_button.parents(".mkt-card");
                let id = parseInt(card.attr("id"));
                let element = select_array(type).find((val, i, arr) => val.id == id);
                if (!element) {
                    element = {
                        id: id,
                        level: 1
                    };
                    select_array(type).push(element);
                } else {
                    element.level += 1;
                }
                card.find(".mkt-level").text(element.level);
                if (element.level == 7) {
                    disable_plus_minus_button(plus_button);
                }
                if (element.level == 1) {
                    let minus_button = card.find(".mkt-minus-button");
                    enable_plus_minus_button(minus_button);
                    card.find(".mkt-element-img").css("opacity", "1");
                }
            });
        }
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
    sheetrock({
        url: elements_url,
        query: `select A, D, E where F = 1`,
        reset: true,
        callback: (error, options, response) => {
            info_database.drivers = response.rows.slice(1, -1).map((v, i, a) => v.cells);
        }
    });
});