var current_type = 1;

var filters = {
    exclude_owned: false,
    only_non_covered_circuits: false,
    exclude_mkt_circuits: false,
    only_league_circuits: false
};

var ranking_card_template = `
<div class="mkt-card col mb-2 mb-md-4 px-2 px-md-3">
    <div class="card mb-1" style="position:relative">
        <img data-src="{{background}}" class="mkt-card-img mkt-background-img card-img lazyload" style="opacity:{{opacity}}"
            loading="lazy">
        <div class="mkt-element-div" style="display:flex">
            <img data-src="{{element}}" class="mkt-card-img mkt-element-img card-img lazyload" style="opacity:{{opacity}}"
                loading="lazy">
        </div>
        <div class="mkt-object-div" style="display:flex">
            <img data-src="{{object}}" class="mkt-card-img mkt-object-img card-img lazyload" style="opacity:{{opacity}}"
                loading="lazy">
        </div>
    </div>
    <div class="row m-0" style="height:40px;"">
        <div class="col p-0 text-center">
            <p class="d-none d-md-block h2 font-weight-bold text-white">{{num_circuits}} circuitos</p>
            <p class="d-block d-md-none h5 font-weight-bold text-white">{{num_circuits}} circuitos</p>
        </div>
    </div>
</div>
`;

function load_ranking(type) {
    $("#card-grid").empty();
    let e = info_database.getSchema().table('elements');
    let c = info_database.getSchema().table('circuits');
    let o = info_database.getSchema().table('objects');
    let ec = info_database.getSchema().table('elements_circuits');
    new Promise((resolve, reject) => {
        if (filters.only_non_covered_circuits) {
            let condition;
            switch (type) {
                case 1:
                    condition = ec.element_id.lt(30000);
                    break;
                case 2:
                    condition = ec.element_id.gt(70000);
                    break;
                case 3:
                    condition = ec.element_id.between(30000, 70000);
                    break;
            }
            info_database.select().from(ec).where(condition).orderBy(ec.element_id).exec()
                .then(ec_rows => {
                    let curr_id, curr_level;
                    let circuit_ids_covered = [];
                    for (let i = 0; i < ec_rows.length; i++) {
                        if (curr_id != ec_rows[i].element_id) {
                            curr_id = ec_rows[i].element_id;
                            let curr_element = select_array(type).find((uv, ui, ua) => uv.id == curr_id);
                            curr_level = curr_element ? curr_element.level : 0;
                        }
                        if (!circuit_ids_covered.includes(ec_rows[i].circuit_id)
                            && curr_level >= ec_rows[i].level) {
                            circuit_ids_covered.push(ec_rows[i].circuit_id);
                        }
                    }
                    resolve(circuit_ids_covered);
                });
        } else {
            resolve([]);
        }
    }).then(circuit_ids_covered => {
        let condition = e.type.eq(type);
        if (filters.only_non_covered_circuits) {
            condition = lf.op.and(condition, lf.op.not(ec.circuit_id.in(circuit_ids_covered)));
        }
        if (filters.exclude_mkt_circuits) {
            condition = lf.op.and(condition, c.mkt.eq(0));
        }
        if (filters.only_league_circuits) {
            condition = lf.op.and(condition, c.league.gt(0));
        }
        return info_database.select(e.id, e.pos, e.tier, e.image_url,
            lf.fn.count(ec.circuit_id).as('favored_circuits'), o.image_url)
            .from(ec).leftOuterJoin(e, ec.element_id.eq(e.id)).leftOuterJoin(c, ec.circuit_id.eq(c.id))
            .innerJoin(o, o.id.eq(e.object_id))
            .where(condition)
            .groupBy(e.id)
            .orderBy(lf.fn.count(ec.circuit_id), lf.Order.DESC)
            .orderBy(e.pos, lf.Order.ASC)
            .exec();
    }).then(elements_rows => {
        elements_rows.forEach((rv, ri, ra) => {
            let element = select_array(type).find((uv, ui, ua) => uv.id == rv.elements.id);
            let level = element ? element.level : 0;
            let should_show = !filters.exclude_owned || level == 0;
            if (should_show) {
                $("#card-grid").append(ranking_card_template
                    .replaceAll("{{background}}", select_background(rv.elements.tier, type))
                    .replaceAll("{{element}}", rv.elements.image_url)
                    .replaceAll("{{object}}", rv.objects.image_url)
                    .replaceAll("{{opacity}}", level > 0 ? "1" : opacity_not_owned)
                    .replaceAll("{{num_circuits}}", rv.favored_circuits)
                );
            }
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
                current_type = 1;
                break;
            case "karts":
                current_type = 2;
                break;
            case "gliders":
                current_type = 3;
                break;
        }
        load_ranking(current_type);
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
            case "exclude-mkt-circuits":
                filters.exclude_mkt_circuits = value;
                break;
            case "only-league-circuits":
                filters.only_league_circuits = value;
                break;
        }
        load_ranking(current_type);
    });

    // load content
    load_ranking(current_type);
});