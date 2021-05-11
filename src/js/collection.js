var background_normal = "https://mario.wiki.gallery/images/2/29/MKT_Icon_Normal.png";
var background_super = "https://mario.wiki.gallery/images/a/a6/MKT_Icon_Rare.png";
var background_highend = "https://mario.wiki.gallery/images/8/8f/MKT_Icon_HighEnd.png";

var opacity_not_owned = "0.4";
var plus_minus_enabled_style = "btn-info";
var plus_minus_disabled_style = "btn-secondary";

var card_template = `
<div class="mkt-card col mb-2 mb-md-4 px-2 px-md-3" id="{{id}}">
    <div class="card mb-0">
        <img data-src="{{background}}" class="mkt-element-img card-img lazyload" style="opacity:{{opacity}}" loading="lazy">
        <div class="card-img-overlay p-2" style="display:flex;align-items:center;justify-content:center;">
            <img data-src="{{object}}" class="mkt-element-img card-img lazyload"
                style="max-height:100%;object-fit:contain;opacity:{{opacity}}" loading="lazy">
        </div>
    </div>
    <div class="row m-0" style="height:40px;"">
        <div class="col-3 p-0 text-center">
            <button class="mkt-minus-button btn {{minus-style}} btn-sm mw-100 m-0 py-1 py-md-2 px-1 px-md-2"
                type="button" {{minus-disabled}}>
            <i class="fas fa-minus"></i>
            </button>
        </div>
        <div class="col-6 p-0 text-center">
            <p class="mkt-level h2 font-weight-bold text-white">{{level}}</p>
        </div>
        <div class="col-3 p-0 text-center">
            <button class="mkt-plus-button btn {{plus-style}} btn-sm mw-100 m-0 py-1 py-md-2 px-1 px-md-2"
                type="button" {{plus-disabled}}>
            <i class="fas fa-plus"></i>
            </button>
        </div>
    </div>
</div>
`;

function select_background(tier) {
    return tier == 1 ? background_normal : (tier == 2 ? background_super : background_highend);
}

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

function disable_plus_minus_button(button) {
    button.addClass(plus_minus_disabled_style);
    button.removeClass(plus_minus_enabled_style);
    button.prop('disabled', true);
}

function enable_plus_minus_button(button) {
    button.addClass(plus_minus_enabled_style);
    button.removeClass(plus_minus_disabled_style);
    button.prop('disabled', false);
}

function load_content(type) {
    $("#card-grid").empty();
    $("#card-grid").sheetrock({
        url: elements_url,
        query: `select A, D, E where F = ${type} order by C asc`,
        reset: true,
        rowTemplate: (row) => {
            let element = select_array(type).find((val, i, arr) => val.id == row.cells.id);
            let level = element ? element.level : 0;
            return card_template
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
    $("input[name='element-type']").change((e) => {
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
    load_content(1);
});