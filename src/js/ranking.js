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
});