let form = document.sales_form;
let puzzles = form.select;
let articles = document.getElementById("articles");

form.style.width = 602;

let options = {
    method: "POST",
    body: JSON.stringify(localStorage.role)
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
        body: JSON.stringify(Array.from(data.entries()))
    };
    await fetch("http://localhost:3000/getPuzzles", options)
        .then( response => response.json() )
        .then( response => {
            let string = "";
            for(let i = 0; i < response.length; i++)
            {
                string += "<option value = '" + response[i].article + "||" + response[i].name + "||" + 
                    response[i].price * (1 - response[i].discount / 100) + "' />";
            }
            articles.innerHTML = string;
        });
}

async function checkPromo(promo)
{
    let result;
    let options = {
        method: "POST",
        body: JSON.stringify({ access: localStorage.role, promo: promo })
    };
    await fetch("http://localhost:3000/checkPromo", options)
        .then( response => response.text() )
        .then( response => {
            result = response;
        });
    return result;
}

async function setTotal()
{
    let promo = document.sales_form.promocode.value;
    promo = await checkPromo(promo);
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

    if(await promo != "error" && JSON.parse(promo).length > 0)
    {
        promo = JSON.parse(promo);
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

update(new Map());
puzzles.innerHTML = localStorage.salePuzzles;
setTotal();

form.add_button.addEventListener("click", async function ()
{
    await update(new Map());
    let string = document.sales_form.search.value;
    if(articles.innerHTML.search("value = '" + string + "' />") != -1)
    {
        let amount = parseInt(prompt("Введите количество для добавления в корзину"));
        let options = {
            method: "POST",
            body: JSON.stringify([["`article` = ", string.split("||")[0]]])
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
                    if(res.article == document.sales_form.search.value.split("||")[0])
                    {
                        min = res.article.length;
                        j = i;
                    }
                });
                if(amount > response[j].amount || amount < 1 || amount == undefined || amount == null || isNaN(amount))
                {
                    shake("sales_form");
                    return;
                }
                Array.from(puzzles.options).forEach((option, i) =>
                {
                    if(option.value.split("||")[0] == response[j].article)
                    {
                        if(parseInt(option.value.split("||")[3]) + amount > response[j].amount)
                        {
                            shake("sales_form");
                            return;
                        }
                        amount += parseInt(option.value.split("||")[3]);
                        puzzles.options.remove(i);
                    }
                });
                let spaces1 = "";
                let article = response[j].article + " " + amount + "шт";
                let name = response[j].name;
                let price = (response[j].price * (1 - response[j].discount / 100)).toString();
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
                puzzles.options[puzzles.options.length] = new Option(string, response[j].article + "||" + name + "||" + price + "||" + amount);
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
        let data = {
            articles: [option.value.split("||")[0]],
            values: [["amount", "`amount` - " + option.value.split("||")[3]]]
        };
        let options = {
            method: "POST",
            body: JSON.stringify({access: localStorage.role, data: data})
        };
        fetch("http://localhost:3000/editPuzzles", options );
    });

    let options = {
        method: "POST",
        body: JSON.stringify({ access: localStorage.role, 
            data: {
                promos: [form.promocode.value],
                values: [["uses", "`uses` - 1"]]
            }})
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

form.promocode.addEventListener("input", setTotal);