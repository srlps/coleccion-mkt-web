var filters = {
    exclude_owned: false,
    only_non_covered_circuits: false,
    exclude_season_exclusive_circuits: false,
    only_league_circuits: false
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

function load_ranking(type) {
    $("#card-grid").empty();
    let e = info_database.getSchema().table('elements');
    let ec = info_database.getSchema().table('elements_circuits');
    info_database.select(e.id, e.pos, e.tier, e.image_url, lf.fn.count(ec.circuit_id).as('total_favored_circuits'))
        .from(e).innerJoin(ec, e.id.eq(ec.element_id))
        .where(e.type.eq(type))
        .groupBy(e.id)
        .orderBy(lf.fn.count(ec.circuit_id), lf.Order.DESC)
        .orderBy(e.pos, lf.Order.ASC)
        .exec().then(rows => {
            rows.forEach((rv, ri, ra) => {
                let element = select_array(type).find((uv, ui, ua) => uv.id == rv.elements.id);
                let level = element ? element.level : 0;
                $("#card-grid").append(ranking_card_template
                    .replaceAll("{{background}}", select_background(rv.elements.tier))
                    .replaceAll("{{object}}", rv.elements.image_url)
                    .replaceAll("{{opacity}}", level > 0 ? "1" : opacity_not_owned)
                    .replaceAll("{{num_circuits}}", rv.total_favored_circuits)
                );
            });
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
                load_ranking(1);
                break;
            case "karts":
                load_ranking(2);
                break;
            case "gliders":
                load_ranking(3);
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

    // load content
    load_ranking(1);
});