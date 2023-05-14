let form = document.sales_form;
let puzzles = form.select;
let articles = document.getElementById("articles");

form.style.width = 602;

let options = {
    method: "POST",
    body: localStorage.role
};
fetch("http://localhost:3000/checkRole", options )
    .then( response => response.text() )
    .then( response => {
        if(response != "administrator" && response != "employee")
        {
            window.location = "menu";
        }
    });

async function update(data)
{
    let options = {
        method: "POST",
        body: JSON.stringify(data)
    };
    await fetch("http://localhost:3000/getPuzzles", options)
        .then( response => response.json() )
        .then( response => {
            let string = "";
            for(let i = 0; i < response.length; i++)
            {
                string += "<option value = '" + response[i].Article + "||" + response[i].Name + "||" + 
                    response[i].Price * (1 - response[i].Discount / 100) + "' />";
            }
            articles.innerHTML = string;
        });
}

async function checkPromo(data)
{
    let result;
    let options = {
        method: "POST",
        body: JSON.stringify(data)
    };
    await fetch("http://localhost:3000/checkPromo", options)
        .then( response => response.json() )
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
        body: JSON.stringify(data)
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
    Array.from(puzzles.options).forEach(option =>
    {
        if(option.selected) result.push(option);
    });
    return result;
}

async function setTotal()
{
    let promo = document.sales_form.promocode.value;
    promo = await checkPromo([localStorage.role, promo]);
    let sum = 0;
    let prices = [];
    Array.from(puzzles.options).forEach(option =>
    {
        for(let i = 0; i < parseInt(option.value.split("||")[3]); i++)
        {
            prices.push(parseFloat(option.value.split("||")[2]));
        }
    });
    prices.sort((a, b) => b - a);
    if(await promo != "error" && await promo.length > 0)
    {
        for(let i = 0; i < Math.min(await promo[0].number_of_discounts, prices.length); i++)
        {
            prices[i] *= (1 - await promo[0].discount / 100);
        }
        prices.forEach(price => sum += price);
        form.total.value = Math.round(sum) + "р";
    }
    else
    {
        prices.forEach(price => sum += price);
        form.total.value = Math.round(sum) + "р";
    }
}

update([[],[]]);
puzzles.innerHTML = localStorage.salePuzzles;
setTotal();

form.add_button.addEventListener("click", async function ()
{
    await update([[],[]]);
    let string = document.sales_form.search.value;
    if(articles.innerHTML.search("value = '" + string + "' />") != -1)
    {
        let amount = parseInt(prompt("Введите количество для добавления в корзину"));
        let options = {
            method: "POST",
            body: JSON.stringify([["`Article` = "], [string.split("||")[0]]])
        };
        await fetch("http://localhost:3000/getPuzzles", options)
            .then( response => response.json() )
            .then( response => {
                if(response == "error")
                {
                    shake("sales_form");
                    return;
                }
                let j;
                response.forEach((res, i) =>
                {
                    if(res.Article == document.sales_form.search.value.split("||")[0])
                    {
                        min = res.Article.length;
                        j = i;
                    }
                });
                if(amount > response[j].Amount || amount < 1 || amount == undefined || amount == null || isNaN(amount))
                {
                    shake("sales_form");
                    return;
                }
                Array.from(puzzles.options).forEach((option, i) =>
                {
                    if(option.value.split("||")[0] == response[j].Article)
                    {
                        if(parseInt(option.value.split("||")[3]) + amount > response[j].Amount)
                        {
                            shake("sales_form");
                            return;
                        }
                        amount += parseInt(option.value.split("||")[3]);
                        puzzles.options.remove(i);
                    }
                });
                let spaces1 = "";
                let article = response[j].Article + " " + amount + "шт";
                let name = response[j].Name;
                let price = (response[j].Price * (1 - response[j].Discount / 100)).toString();
                for(let j = 0; j < 21 - article.length; j++)
                {
                    if(j != 0 && j != 20 - article.length) spaces1 += "-";
                    else spaces1 += " ";
                }
                let spaces2 = "";
                for(let j = 0; j < 34 - name.substr(0, 25).length - price.length; j++)
                {
                    if(j != 0 && j != 33 - name.substr(0, 25).length - price.length) spaces2 += "-";
                    else spaces2 += " ";
                }
                let string = article + spaces1 + name.substr(0, 25) + spaces2 + price;
                puzzles.options[puzzles.options.length] = new Option(string, response[j].Article + "||" + name + "||" + price + "||" + amount);
                document.sales_form.search.value = "";
                localStorage.salePuzzles = puzzles.innerHTML;
                setTotal();
            });
    }
    else shake("sales_form");

});

form.delete_button.addEventListener("click", function ()
{
    if(puzzles.value == "")
    {
        shake("sales_form");
        return;
    }
    while(puzzles.value != "") puzzles.options.remove(puzzles.selectedIndex);
    localStorage.salePuzzles = puzzles.innerHTML;
    setTotal();
});

form.back_button.addEventListener("click", function ()
{
    form.classList.add("fade");
    form.onanimationend = () =>
    {
        window.location = "menu";
    }
});

form.sale_button.addEventListener("click", function()
{
    Array.from(puzzles.options).forEach(option =>
    {
        let data = [localStorage.role, [], [], []];
        data[1].push(option.value.split("||")[0]);
        data[2].push("Amount");
        data[3].push("`Amount` - " + option.value.split("||")[3]);
        let options = {
            method: "POST",
            body: JSON.stringify(data)
        };
        fetch("http://localhost:3000/editPuzzles", options );
    });

    let options = {
        method: "POST",
        body: JSON.stringify([localStorage.role, [form.promocode.value], ["uses"], ["`uses` - 1"]])
    };
    fetch("http://localhost:3000/editPromos", options );

    localStorage.salePuzzles = "";
    clear("sales_form");
    form.classList.add("fade");
    form.onanimationend = () =>
    {
        window.location = "menu";
    }
});

form.promocode.addEventListener("input", function(){setTotal()});