function goToForm(formsFrom, formsTo)
{
    formsFrom.forEach((form, i) =>
    {
        let formFrom = document.forms[form];
        formFrom.classList.add("fade");
        formFrom.onanimationend = () =>
        {
            if(Array.from(formFrom.classList).includes("fade"))
            {
                Array.from(document.forms).forEach(element => 
                {
                    element.style.display = "none";
                });
                if (i == formsFrom.length - 1) formsTo.forEach(formTo => {document.forms[formTo].style.display = "block"});
                formFrom.classList.remove("fade");
            }
        }  
    });
}

function shake(form)
{
    Array.from(document.forms[form].elements).forEach(element =>
    {
        element.classList.add("shake");
    });
    Array.from(document.forms[form].getElementsByTagName("table")).forEach(element =>
    {
        element.classList.add("shake");
    });
    document.forms[form].elements[0].onanimationend = function()
    {
        Array.from(document.forms[form].elements).forEach(element =>
        {
            element.classList.remove("shake");
        });
        Array.from(document.forms[form].getElementsByTagName("table")).forEach(element =>
        {
            element.classList.remove("shake");
        });
    }
}

function isSameValue(array, index)
{
    let result = true;
    array.forEach((element, i) =>
    {
        if(i < array.length - 1 && element[index] != array[i + 1][index]) result = false;
    });
    return result;
}

function download(filename, textInput) {

    var element = document.createElement('a');
    element.setAttribute('href','data:text/plain;charset=utf-8,' + encodeURIComponent(textInput));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function clear(form)
{
    for(var i = 0; i < document.forms[form].elements.length; i++)
    {
        if(!["button", "select-one"].includes(document.forms[form].elements[i].type))
        document.forms[form].elements[i].value = "";
        document.forms[form].elements[i].src = "";
    }
    Array.from(document.forms[form].getElementsByTagName("img")).forEach(image => image.src = null);
}