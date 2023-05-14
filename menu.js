let form = document.start_form;
let pb = form.products_button;
let ab = form.accounts_button;
let lb = form.login_button;
let lob = form.logout_button;
let sb = form.sale_button;
let promob = form.promo_button;
let role;

form.style.width = 198;

function checkRole(roleCode)
{
    let options = {
        method: "POST",
        body: roleCode
    };
    fetch("http://localhost:3000/checkRole", options )
        .then( response => response.text() )
        .then( response => {
            role = response;
            if(response != "guest")
            {
                sb.style.display = "block";
                lob.style.display = "block";
                lb.classList.add("moveRight");
                lob.style.transform = "translate(0, -110%)";
            }
            else 
            {
                lob.style.display = "none";
                sb.style.display = "none";
            }
            if(response != "administrator")
            {
                ab.style.display = "none";
                promob.style.display = "none";
            }
            else
            {
                ab.style.display = "block";
                promob.style.display = "block";
            }
        });
}

function moveLeft(button)
{
    y = button.style.transform.slice(button.style.transform.search(",") + 1);
    if(y == "") y = "0";
    button.style.transform = "translate(-300%," + y;
    button.style.opacity = "0";
    button.style.cursor = "not-allowed";
    button.style.pointerEvents = "none";
    button.style.transition = "0.7s cubic-bezier(0.68, -0.6, 0.32, 1.6) 0s";
}

checkRole(localStorage.role);

pb.addEventListener("click", function ()
{
    form.classList.add("fade");
    form.onanimationend = () =>
    {
        window.location = "products";
    }
});

promob.addEventListener("click", function ()
{
    form.classList.add("fade");
    form.onanimationend = () =>
    {
        window.location = "promos";
    }
});

ab.addEventListener("click", function ()
{
    form.classList.add("fade");
    form.onanimationend = () =>
    {
        window.location = "accounts";
    }
});

sb.addEventListener("click", function ()
{
    form.classList.add("fade");
    form.onanimationend = () =>
    {
        window.location = "sales";
    }
});

lb.addEventListener("click", function ()
{
    form.classList.add("fade");
    form.onanimationend = () =>
    {
        window.location = "login";
    }
});

lob.addEventListener("click", function ()
{
    localStorage.role = "guest";
    lb.classList.toggle("moveCentre");
    moveLeft(lob);
    moveLeft(ab);
    moveLeft(sb);
    moveLeft(promob);
    if(role != "employee") pb.classList.add("moveDown3x");
    else pb.classList.add("moveDown1x");
});