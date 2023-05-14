var form = document.accounts_form;
var add_form = document.add_account_form;
var edit_form = document.edit_account_form;
var accounts = document.accounts_form.select;

form.style.width = 602;
add_form.style.width = 400;
edit_form.style.width = 400;
add_form.style.display = "none";
edit_form.style.display = "none";

var logins, account;

var options = {
    method: "POST",
    body: localStorage.role
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
        body: localStorage.role
    };
    await fetch("http://localhost:3000/getAccounts", options)
        .then( response => response.json() )
        .then( response => {
            accounts.options.length = 0;
            logins = [];
            
            for(var i = 0; i < response.length; i++)
            {
                logins.push(response[i].login);
                var spaces1 = "";
                for(var j = 0; j < 21 - response[i].login.length; j++)
                {
                    if(j != 0 && j != 20 - response[i].login.length) spaces1 += "-";
                    else spaces1 += " ";
                }
                var spaces2 = "";
                for(var j = 0; j < 34 - response[i].password.length - response[i].role.length; j++)
                {
                    if(j != 0 && j != 33 - response[i].password.length - response[i].role.length) spaces2 += "-";
                    else spaces2 += " ";
                }
                var string = response[i].login + spaces1 + response[i].password + spaces2 + response[i].role;
                accounts.options[accounts.options.length] = new Option(string, response[i].login + "||" + response[i].password + "||" + response[i].role);
            }
        });
}

async function addAccount(account)
{
    var result = "error";
    if(account.login.length > 0 && account.password.length > 0 && account.login.search(/\|\|/) == -1 && account.password.search(/\|\|/) == -1)
    {
        options = {
            method: "POST",
            body: JSON.stringify(account)
        };
        await fetch("http://localhost:3000/addAccount", options )
            .then( response => response.text() )
            .then( response => {
                result = response;
            });
    }
    return result;
}

async function deleteAccount(account)
{
    options = {
        method: "POST",
        body: JSON.stringify(account)
    };
    await fetch("http://localhost:3000/deleteAccount", options )
        .then( response => response.text() )
        .then( response => {
            return response;
        });
}

async function editAccount(oldAccount, account)
{
    var result = "error";
    if(account.login.length > 0 && account.password.length > 0 && account.login.search(/\|\|/) == -1 && account.password.search(/\|\|/) == -1)
    {
        account = {
            access: account.access,
            oldLogin: oldAccount.login,
            login: account.login,
            password: account.password,
            role: account.role
        };
        options = {
            method: "POST",
            body: JSON.stringify(account)
        };
        await fetch("http://localhost:3000/editAccount", options )
            .then( response => response.text() )
            .then( response => {
                result = response;
            });
    }
    return result;
}

update();

form.add_button.addEventListener("click", function ()
{
    goToForm(["accounts_form"], ["add_account_form"]);
});

form.edit_button.addEventListener("click", function ()
{
    if(accounts.value != "")
    {
        goToForm(["accounts_form"], ["edit_account_form"]);
        var accountData = accounts.value.split("||");
        edit_form.login.value = accountData[0];
        edit_form.password.value = accountData[1];
        edit_form.role.value = accountData[2];
    }
    else shake("accounts_form");
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
    clear("add_account_form");
    goToForm(["add_account_form"], ["accounts_form"]);
});

add_form.add_button.addEventListener("click", async function ()
{
    account = {
        access: localStorage.role,
        login: add_form.login.value,
        password: add_form.password.value,
        role: add_form.role.value
    };
    if(await addAccount(account) == "ok")
    {
        update();
        clear("add_account_form");
        goToForm(["add_account_form"], ["accounts_form"]);
    }
    else shake("add_account_form");
});

edit_form.back_button.addEventListener("click", function ()
{
    accounts.value = "";
    update();
    goToForm(["edit_account_form"], ["accounts_form"]);
});

edit_form.delete_button.addEventListener("click", function ()
{
    var accountData = accounts.value.split("||");
    account = {
        access: localStorage.role,
        login: accountData[0],
        password: accountData[1],
        role: accountData[2]
    };
    deleteAccount(account);
    update();
    goToForm(["edit_account_form"], ["accounts_form"]);
});

edit_form.edit_button.addEventListener("click", async function ()
{
    var accountData = accounts.value.split("||");
    var oldAccount = {
        access: localStorage.role,
        login: accountData[0],
        password: accountData[1],
        role: accountData[2]
    };
    account = {
        access: localStorage.role,
        login: edit_form.login.value,
        password: edit_form.password.value,
        role: edit_form.role.value
    };
    if(await editAccount(oldAccount, account) == "ok")
    {
        update();
        goToForm(["edit_account_form"], ["accounts_form"]);
    }
    else shake("edit_account_form");
});