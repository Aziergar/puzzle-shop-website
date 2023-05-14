let form = document.products_form;
let add_form = document.add_product_form;
let edit_form = document.edit_products_form;
let filters = document.filters_form;
let properties = document.properties_form;

add_form.style.display = "none";
edit_form.style.display = "none";
filters.style.display = "none";
properties.classList.add("moveLeft");

let filters_data = JSON.parse(localStorage.filters);

async function update(table, filters)
{
    checkRole(localStorage.role);
    let puzzles = [];
    options = {
        method: "POST",
        body: JSON.stringify(filters)
    };
    await fetch("http://localhost:3000/getPuzzles", options)
        .then( response => response.json() )
        .then( response => {
            puzzles = [];
            for(let i = 0; i < response.length; i++)
            {
                puzzles.push(response[i]);
            }
            table.innerHTML = "";
            puzzles.forEach(elem => addRow(table, elem));
            Array.from(document.getElementsByTagName("input")).forEach( element =>
            {
                if(element.type == "checkbox")
                {
                    checboxCheck(element);
                }
            });
            setSelect(form);
        });
}

async function addPuzzle(puzzle)
{
    options = {
        method: "POST",
        body: JSON.stringify(puzzle)
    };
    await fetch("http://localhost:3000/addPuzzle", options )
        .then( response => response.text() )
        .then( response => {
            result = response;
        });
    return result;
}

async function editPuzzles(data)
{
    options = {
        method: "POST",
        body: JSON.stringify(data)
    };
    await fetch("http://localhost:3000/editPuzzles", options )
        .then( response => response.text() )
        .then( response => {
            result = response;
        });
    return result;
}

async function deletePuzzles(data)
{
    options = {
        method: "POST",
        body: JSON.stringify(data)
    };
    await fetch("http://localhost:3000/deletePuzzles", options )
        .then( response => response.text() )
        .then( response => {
            result = response;
        });
    return result;
}

function checkRole(roleCode)
{
    var options = {
        method: "POST",
        body: roleCode
    };
    fetch("http://localhost:3000/checkRole", options )
        .then( response => response.text() )
        .then( response => {
            role = response;
            if(response != "guest")
            {
                form.classList.remove("guest");
                form.classList.add("employee");
            }
            else
            {
                form.classList.add("guest");
                form.classList.remove("employee");
            }
        });
}

function getCell(value, col)
{
    let htmlString = "<td name = 'col" + col + "'><div style = 'height: 70px'>" + value + "</div></td>";
    return htmlString;
}

let countSize = (width, height) => width + " x " + height;
let countPrice = (price, discount) => (price * (1 - discount / 100)).toFixed(2) + " (" + -discount + "%)";

function addRow(table, data)
{
    let row = "<tr>";
    let index = 0;
    let imgBlob = "";
    Object.keys(data).forEach(cell =>
        {
            if(data[cell] == null) data[cell] = "Нет данных";
            let value = data[cell].toString();
            if (cell == "Age") value += "+";
            else if(cell == "Image") value = "<img src = '" + value + "'>";
            else if(cell == "Width") value = countSize(data["Width"], data["Height"]);
            else if(cell == "Piece width") value = countSize(data["Piece width"], data["Piece height"]);
            else if(cell == "Price") value = countPrice(data["Price"], data["Discount"]);
            if(!["Height", "Piece height", "Discount"].includes(cell))
            {
                row = row.concat(getCell(value, index));
                index++;
            }
        })
    row = row.concat("</tr>");
    table.innerHTML += row;
}

function setSelect(form)
{
    Array.from(form.getElementsByTagName("tr")).forEach(element =>
    {
        element.onclick = function()
        {
            if(!Array.from(element.classList).includes("noSelect"))
            {
                element.classList.toggle("select");
                if(Array.from(document.getElementsByClassName("select")).length == 0) form.select_button.value = "Выбрать всё";
                else form.select_button.value = "Отменить выбор";
            }
        }
    });
}

function cellDisplay(element, display)
{
    Array.from(document.getElementsByName(element.value)).forEach( cell =>
    {
        cell.style.display = display;
    });
}

function checboxCheck(element)
{
    if(element.checked)
    {
        cellDisplay(element, "table-cell");
    }
    else
    {
        cellDisplay(element, "none");
    }
}

function addProductChangePage(className, newPage)
{
    Array.from(document.getElementsByClassName(className)).forEach(page => page.style.display = "none");
    document.getElementsByClassName(className)[newPage].style.display = "flex";
}

function changeAddProductBoxButton(className, index)
{
    Array.from(document.getElementsByClassName(className)).forEach(button => button.classList.remove("chosen"));
    document.getElementsByClassName(className)[index].classList.add("chosen");
}

function getSelectedPuzzles()
{
    let puzzles = [];
    Array.from(document.getElementsByClassName("select")).forEach((row, i) => 
    {
        Array.from(row.getElementsByTagName("td")).forEach((cell, j) =>
        {
            if(j == 0) puzzles.push([cell.getElementsByTagName("img")[0].src.replaceAll(/.+\//g, "")]);
            else if(j == 5 || j == 7)
            {
                puzzles[i].push(cell.innerText.replace(/\s.+/g, ""));
                puzzles[i].push(cell.innerText.replace(/.+\s/g, ""));
            }
            else if(j == 8) puzzles[i].push(cell.innerText.replace("+", ""));
            else if(j == 13)
            {
                puzzles[i].push(parseFloat(cell.innerText.replace(/\s.+/g, "")) / (1 + parseFloat(cell.innerText.replace(/.+\s/g, "").replaceAll(/\(||\)/g, ""))/100));
                puzzles[i].push(-parseFloat(cell.innerText.replace(/.+\s/g, "").replaceAll(/\(||\)/g, "")));
            }
            else puzzles[i].push(cell.innerText);
        })
    });
    return puzzles;
}

Array.from(document.getElementsByTagName("input")).forEach( element =>
{
    if(element.type == "checkbox")
    {
        checboxCheck(element);
        element.onchange = function()
        {
            if(element.checked)
            {
                cellDisplay(element, "table-cell");
            }
            else
            {
                cellDisplay(element, "none");
            }
        }
    }
});

update(document.getElementsByName("products")[0], filters_data);

form.properties_button.addEventListener("click", function()
{
    properties.classList.toggle("moveLeft");
    properties.style.transition = "0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6) 0s";
});

form.back_button.addEventListener("click", function()
{
    form.classList.add("fade");
    properties.classList.add("fade");
    form.onanimationend = () =>
    {
        form.style.visibility = "hidden";
        window.location = "menu";
    }
});

form.add_button.addEventListener("click", function()
{
    goToForm(["products_form", "properties_form"], ["add_product_form"]);
    properties.classList.add("moveLeft");
    properties.style.transition = "0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6) 0s";
    changeAddProductBoxButton("addPuzzleButtonChangePage", 0);
    addProductChangePage("addPuzzleBox", 0);
});

form.edit_button.addEventListener("click", function()
{
    let selectedPuzzles = getSelectedPuzzles();
    if(selectedPuzzles.length == 0)
    {
        shake("products_form"); 
        return false;
    }
    goToForm(["products_form", "properties_form"], ["edit_products_form"]);
    properties.classList.add("moveLeft");
    properties.style.transition = "0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6) 0s";
    changeAddProductBoxButton("editPuzzleButtonChangePage", 0);
    addProductChangePage("editPuzzleBox", 0);
    if(isSameValue(selectedPuzzles, 0)) edit_form.getElementsByTagName("img")[0].src = selectedPuzzles[0][0];
    selectedPuzzles[0].forEach((element, i) =>
    {
        if(i == 0) return false;
        let value = "...";
        if(isSameValue(selectedPuzzles, i)) 
        {
            value = selectedPuzzles[0][i];
            edit_form.elements[i + 3].value = value;
        }
        edit_form.elements[i + 3].placeholder = value;
    });
});

form.select_button.addEventListener("click", function()
{
    if(form.select_button.value == "Отменить выбор")
    {
        Array.from(document.getElementsByClassName("select")).forEach(element => element.classList.remove("select"));
        form.select_button.value = "Выбрать всё";
    }
    else
    {
        Array.from(form.getElementsByTagName("tr")).forEach(element =>
        {
            if(!Array.from(element.classList).includes("noSelect"))
            {
                element.classList.add("select");
                form.select_button.value = "Отменить выбор";
            }
        });
    }
});

form.filters_button.addEventListener("click", function()
{
    goToForm(["products_form", "properties_form"], ["filters_form"]);
    properties.classList.add("moveLeft");
    properties.style.transition = "0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6) 0s";
    changeAddProductBoxButton("filtersButtonChangePage", 0);
    addProductChangePage("filtersBox", 0);
    filters_data[0].forEach((element, i) =>
    {
        document.getElementsByName(element)[0].value = filters_data[1][i];
    });
});

add_form.add_button.addEventListener("click", async function()
{
    let puzzle = [localStorage.role, document.getElementsByName("uploadedImage")[0].src];
    Array.from(add_form.elements).forEach((element, i) =>
    {
        if(element.type != "button" && i > 0)
        {
            puzzle.push(element.value);
        }
    });
    if(await addPuzzle(puzzle) == "ok")
    {
        update(document.getElementsByName("products")[0], filters_data);
        goToForm(["add_product_form"], ["products_form", "properties_form"]);
        clear("add_product_form");
    }
    else shake("add_product_form");
});

add_form.back_button.addEventListener("click", function()
{
    goToForm(["add_product_form"], ["products_form", "properties_form"]);
    clear("add_product_form");
});

edit_form.edit_button.addEventListener("click", async function()
{
    let data = [localStorage.role, [], [], []];
    Array.from(document.getElementsByClassName("select")).forEach(element => data[1].push(element.getElementsByTagName("td")[1].innerText));
    if(edit_form.imageFile.value != "")
    {
        data[2].push("Image");
        data[3].push(document.getElementsByName("uploadedImageEdit")[0].src);
    }
    for(let i = 4; i < edit_form.elements.length - 4; i++)
    {
        if(edit_form.elements[i].value != "")
        {
            data[2].push(edit_form.elements[i].name);
            data[3].push(edit_form.elements[i].value);
        }
    }
    if(await editPuzzles(data) == "ok")
    {
        update(document.getElementsByName("products")[0], filters_data);
        goToForm(["edit_products_form"], ["products_form", "properties_form"]);
        clear("edit_products_form");
    }
    else shake("edit_products_form");
});

edit_form.delete_button.addEventListener("click", async function()
{
    let data = [localStorage.role, []];
    Array.from(document.getElementsByClassName("select")).forEach(element => data[1].push(element.getElementsByTagName("td")[1].innerText));
    if(prompt('Введите "DELETE", если хотите удалить выбранные продукты') != "DELETE") shake("edit_products_form");
    else if(await deletePuzzles(data) == "ok")
    {
        update(document.getElementsByName("products")[0], filters_data);
        goToForm(["edit_products_form"], ["products_form", "properties_form"]);
        clear("edit_products_form");
    }
    else shake("edit_products_form");
});

edit_form.back_button.addEventListener("click", function()
{
    goToForm(["edit_products_form"], ["products_form", "properties_form"]);
    clear("edit_products_form");
});

filters.reset_button.addEventListener("click", function()
{
    clear("filters_form");
    changeAddProductBoxButton("filtersButtonChangePage", 0);
    addProductChangePage("filtersBox", 0);
});

filters.apply_button.addEventListener("click", function()
{
    filters_data = [[],[]];
    for(let i = 3; i < filters.elements.length - 4; i++)
    {
        if(!filters.elements[i].value == "") 
        {
            filters_data[0].push(filters.elements[i].name);
            filters_data[1].push(filters.elements[i].value);
        }
    }
    localStorage.filters = JSON.stringify(filters_data);
    update(document.getElementsByName("products")[0], filters_data);
    goToForm(["filters_form"], ["products_form", "properties_form"]);
});

filters.back_button.addEventListener("click", function()
{
    goToForm(["filters_form"], ["products_form", "properties_form"]);
});

Array.from(document.getElementsByClassName("addPuzzleButtonChangePage")).forEach(button =>
{
    button.addEventListener("click", function()
    {
        changeAddProductBoxButton("addPuzzleButtonChangePage", button.id);
        addProductChangePage("addPuzzleBox", button.id);
    });
});

Array.from(document.getElementsByClassName("editPuzzleButtonChangePage")).forEach(button =>
{
    button.addEventListener("click", function()
    {
        changeAddProductBoxButton("editPuzzleButtonChangePage", button.id);
        addProductChangePage("editPuzzleBox", button.id);
    });
});

Array.from(document.getElementsByClassName("filtersButtonChangePage")).forEach(button =>
{
    button.addEventListener("click", function()
    {
        changeAddProductBoxButton("filtersButtonChangePage", button.id);
        addProductChangePage("filtersBox", button.id);
    });
});

add_form.imageFile.onchange = () =>
{
    reader = new FileReader();
    reader.onload = function()
    {
        document.getElementsByName("uploadedImage")[0].src = reader.result;
    };
    reader.readAsDataURL(add_form.imageFile.files[0]);
}

edit_form.imageFile.onchange = () =>
{
    reader = new FileReader();
    reader.onload = function()
    {
        document.getElementsByName("uploadedImageEdit")[0].src = reader.result;
    };
    reader.readAsDataURL(edit_form.imageFile.files[0]);
}