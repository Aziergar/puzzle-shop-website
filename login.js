var form = document.login_form;
var role;
form.style.width = 400;
form.login_button.addEventListener("click", function ()
{
    var user = {
        login: form.login.value,
        password: form.password.value
    };
    var options = {
        method: "POST",
        body: JSON.stringify(user)  
    };
    fetch("http://localhost:3000/getRole", options )
        .then( response => response.text() )
        .then( response => {
            localStorage.role = response;
            if(response != "guest")
            {
                form.classList.add("fade");
                form.onanimationend = () =>
                {
                    window.location = "menu";
                }
            }
            else
            {
                form.login.classList.add("shake");
                form.password.classList.add("shake");
                form.login_button.classList.add("shake");
                form.back_button.classList.add("shake");
            }
        });
});

form.back_button.addEventListener("click", function ()
{
    form.classList.add("fade");
    form.onanimationend = () =>
    {
        window.location = "menu";
    }
});

form.login.onanimationend = function ()
{
    form.login.classList.remove("shake");
    form.password.classList.remove("shake");
    form.login_button.classList.remove("shake");
    form.back_button.classList.remove("shake");
};