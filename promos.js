let form = document.promos_form;
let add_form = document.add_promo_form;
let edit_form = document.edit_promos_form;
let promos = document.promos_form.select;

form.style.width = 602;
add_form.style.width = 400;
edit_form.style.width = 400;
add_form.style.display = "none";
edit_form.style.display = "none";

let promos_data = [];

let options = {
    method: "POST",
    body: JSON.stringify(localStorage.role)
};
fetch("http://localhost:3000/checkRole", options )
    .then( response => response.text() )
    .then( response => {
        if(response != "administrator")
        {
            window.location = "menu";
        }
    });

async function update()
{
    options = {
        method: "POST",
        body: JSON.stringify({ access: localStorage.role })
    };
    await fetch("http://localhost:3000/getPromos", options)
        .then( response => response.json() )
        .then( response => {
            promos.options.length = 0;
            
            let interval = setInterval(() =>
            {
                for(let i = 0; i < 100 && i < response.length; i++)
                {
                    let spaces1 = "";
                    let promocode = response[i].promocode;
                    let discount = (-response[i].discount).toString() + "%";
                    let time = "осталось " + parseInt(response[i].action_time - (new Date() - Date.parse(response[i].creation_date)) / 3600000).toString() + "ч";
                    for(let j = 0; j < 21 - promocode.length; j++)
                    {
                        if(j != 0 && j != 20 - promocode.length) spaces1 += "-";
                        else spaces1 += " ";
                    }
                    let spaces2 = "";
                    for(let j = 0; j < 34 - discount.length - time.length; j++)
                    {
                        if(j != 0 && j != 33 - discount.length - time.length) spaces2 += "-";
                        else spaces2 += " ";
                    }
                    let string = promocode + spaces1 + discount + spaces2 + time;
                    promos.options[promos.options.length] = new Option(string, response[i].promocode + "||" + response[i].discount + "||" + 
                        response[i].number_of_discounts + "||" + response[i].action_time + "||" + response[i].uses);
                }
                response = response.slice(100);
                if(response.length == 0) clearInterval(interval);
                }, 10);
        });
}

async function addPromo(data)
{
    let result;
    options = {
        method: "POST",
        body: JSON.stringify({ access: localStorage.role, data: data })
    };
    await fetch("http://localhost:3000/addPromo", options )
        .then( response => response.text() )
        .then( response => {
            result = response;
        });
    return result;
}

async function deletePromos(data)
{
    let result;
    options = {
        method: "POST",
        body: JSON.stringify({ access: localStorage.role, data: data })
    };
    await fetch("http://localhost:3000/deletePromos", options )
        .then( response => response.text() )
        .then( response => {
            result = response;
        });
    return result;
}

async function editPromos(data)
{
    let result;
    options = {
        method: "POST",
        body: JSON.stringify({ access: localStorage.role, data: data })
    };
    await fetch("http://localhost:3000/editPromos", options )
        .then( response => response.text() )
        .then( response => {
            result = response;
        });
    return result;
}

function getSelected()
{
    let result = [];
    Array.from(promos.options).forEach(option =>
    {
        if(option.selected) result.push(option);
    });
    return result;
}

update();

form.add_button.addEventListener("click", function ()
{
    goToForm(["promos_form"], ["add_promo_form"]);
});

form.edit_button.addEventListener("click", function ()
{
    if(promos.value != "")
    {
        clear("edit_promos_form");
        let selected = getSelected();
        goToForm(["promos_form"], ["edit_promos_form"]);
        let data = [];
        selected.forEach(option =>
        {
            data.push(option.value.split("||"));
        });
        data[0].forEach((element, i) =>
        {
            if(isSameValue(data, i))
            {
                edit_form.elements[i + 3].value = element;
                edit_form.elements[i + 3].placeholder = element;
            }
            else edit_form.elements[i + 3].placeholder = "...";
        });
    }
    else shake("promos_form");
});

form.back_button.addEventListener("click", function ()
{
    form.classList.add("fade");
    form.onanimationend = () =>
    {
        window.location = "menu";
    }
});

add_form.back_button.addEventListener("click", function ()
{
    clear("add_promo_form");
    goToForm(["add_promo_form"], ["promos_form"]);
});

add_form.add_button.addEventListener("click", async function ()
{
    let data = new Map();
    Array.from(add_form.elements).filter(el => el.type != "button")
        .forEach(promo => data.set(promo.name, promo.value));
    result = await addPromo(Array.from(data.entries()));
    if(await result != "error")
    {
        update();
        clear("add_promo_form");
        goToForm(["add_promo_form"], ["promos_form"]);
        if(data.get("number_of_promocodes") > 1)
            download("promocodes" + (new Date()).toDateString().replaceAll(" ", "-").replaceAll(":", "-") + ".txt", result);
    }
    else shake("add_promo_form");
});

edit_form.back_button.addEventListener("click", function ()
{
    promos.value = "";
    update();
    goToForm(["edit_promos_form"], ["promos_form"]);
});

edit_form.delete_button.addEventListener("click", async function ()
{
    let data = [];
    getSelected().forEach(promo =>
    {
        data.push(promo.value.split("||")[0]);
    });
    if(await deletePromos(data) == "ok")
    {
        update();
        goToForm(["edit_promos_form"], ["promos_form"]);
    }
    else shake("edit_promos_form");
});

edit_form.edit_button.addEventListener("click", async function ()
{
    let data = {
        promos: [],
        values: new Map()
    };
    getSelected().forEach(promo => data.promos.push(promo.value.split("||")[0]));
    for(let i = 3; i < edit_form.elements.length; i++)
    {
        if(edit_form.elements[i].value != "")
        {
            data.values.set(edit_form.elements[i].name, edit_form.elements[i].value)
        }
    }
    data.values = Array.from(data.values.entries());
    if(await editPromos(data) == "ok")
    {
        update();
        goToForm(["edit_promos_form"], ["promos_form"]);
    }
    else shake("edit_promos_form");
});