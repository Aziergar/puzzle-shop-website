let http = require("http");
let fs = require("fs");
let dirName = "D:/code/vs code html/Мои лабы/Lb15/";
let dirImg = "images/";
let employeeRole = createCode(Math.floor(Math.random() * 100 + 100));
let administratorRole = createCode(Math.floor(Math.random() * 100 + 100));

const { getPackedSettings } = require("http2");

const mysql = require("mysql");
 
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "04022003",
  database: "lb15DB"
});


http.createServer(function(request, response)
{
    if(request.url != "/favicon.ico")
    {
        if(request.url.endsWith("getRole"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                data = JSON.parse(data);
                response.statusCode = 200;
                connection.query("select role from accounts where login = '" + data.login + "' and password = '" + data.password + "';",
                function(err, results) {
                    if(err)
                    {
                        console.log(err);
                        response.end();
                    }
                    else
                    {
                        if(results.length > 0 && results[0].role == "administrator")
                        {
                            response.write(administratorRole);
                        }
                        else if(results.length > 0 && results[0].role == "employee")
                        {
                            response.write(employeeRole);
                        }
                        else
                        {
                            response.write("guest");
                        }
                        response.end();
                    }
                });
            });
        }
        else if(request.url.endsWith("checkRole"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                if(data == administratorRole)
                {
                    response.write("administrator");
                }
                else if(data == employeeRole)
                {
                    response.write("employee");
                }
                else
                {
                    response.write("guest");
                }
                response.end();
            });
        }
        else if(request.url.endsWith("getAccounts"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                if(data == administratorRole)
                {
                    connection.query("select * from accounts;",
                    function(err, results) {
                        if(err)
                        {
                            console.log(err);
                            response.write("error");
                            response.end();
                        }
                        else
                        {
                            response.write(JSON.stringify(results));
                            response.end();
                        }
                    });
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("addAccount"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if(data.access == administratorRole)
                {
                    let string = "'" + data.login + "', '" + data.password + "', '" + data.role + "'";
                    connection.query("insert into `lb15db`.`accounts` (`login`, `password`, `role`) VALUES (" + string + ");",
                    function(err, results) {
                        if(err)
                        {
                            console.log(err);
                            response.write("error");
                            response.end();
                        }
                        else
                        {
                            response.write("ok");
                            response.end();
                        }
                    });
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("editAccount"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if(data.access == administratorRole)
                {
                    let string = data.login + "', `password` = '" + data.password + "', `role` = '" + data.role;
                    connection.query("update `lb15db`.`accounts` set `login` = '" + string + "' where (`login` = '" + data.oldLogin + "');",
                    function(err, results) {
                        if(err)
                        {
                            console.log(err);
                            response.write("error");
                            response.end();
                        }
                        else
                        {
                            response.write("ok");
                            response.end();
                        }
                    });
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("deleteAccount"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if(data.access == administratorRole)
                {
                    connection.query("delete from `lb15db`.`accounts` where (`login` = '"+ data.login + "');",
                    function(err, results) {
                        if(err)
                        {
                            console.log(err);
                            response.write("error");
                            response.end();
                        }
                        else
                        {
                            response.write("ok");
                            response.end();
                        }
                    });
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("getPuzzles"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                let string = "";
                if(data[0].length > 0)
                {
                    string = "where ";
                    for(let i = 0; i < data[0].length; i++)
                    {
                        if(data[0][i].endsWith("like ")) string = string.concat(data[0][i] + "'%" + data[1][i] + "%' and ");
                        else string = string.concat(data[0][i] + data[1][i] + " and ");
                    }
                    string = string.substring(0, string.length - 5);
                }
                connection.query("select * from puzzles " + string + ";",
                function(err, results) {
                    if(err)
                    {
                        console.log(err);
                        response.write("error");
                        response.end();
                    }
                    else
                    {
                        response.write(JSON.stringify(results));
                        response.end();
                    }
                });
            });
        }
        else if(request.url.endsWith("addPuzzle"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if([administratorRole, employeeRole].includes(data[0]))
                {
                    let imageName = ((new Date).toString()).replace(/\(.+\)/g, "") + createCode(Math.floor(Math.random() * 10 + 10));
                    imageName = imageName.replaceAll(":", ";");
                    imageName = imageName.replaceAll(" ", "-");
                    if(data[1].search("/jpeg") != -1) imageName = imageName.concat(".jpg");
                    else if(data[1].search("/png") != -1) imageName = imageName.concat(".png");
                    let string = "'" + imageName;
                    for(let i = 3; i < data.length; i++)
                    {
                        string = string.concat("', '" + data[i]);
                    }
                    string = string.concat("'");
                    connection.query("insert into `lb15db`.`puzzles` VALUES (" + string + ");",
                    function(err, results) {
                        if(err)
                        {
                            console.log(err);
                            response.write("error");
                            response.end();
                        }
                        else
                        {
                            response.write("ok");
                            response.end();
                        }
                    });
                    let imageData = data[1].replace("data:image/png;base64,", "");
                    imageData = imageData.replace("data:image/jpeg;base64,", "");

                    require("fs").writeFile(dirName + dirImg + imageName, imageData, 'base64', function(err) {
                        console.log(err);
                    });
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("editPuzzles"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if(data[0] == administratorRole || data[0] == employeeRole)
                {
                    let string = "";
                    let imageName = "";
                    if(data[2][0] == "Image")
                    {
                        imageName = ((new Date).toString()).replace(/\(.+\)/g, "") + createCode(Math.floor(Math.random() * 10 + 10));
                        imageName = imageName.replaceAll(":", ";");
                        imageName = imageName.replaceAll(" ", "-");
                        if(data[3][0].search("/jpeg") != -1) imageName = imageName.concat(".jpg");
                        else if(data[3][0].search("/png") != -1) imageName = imageName.concat(".png");
                    }
                    data[2].forEach((column, i) =>
                    {
                        if(column == "Image") string = string.concat("`" + column + "`" + " = '" + imageName + "', ");
                        else if(["Number of pieces", "Width", "Height", "Piece width", "Piece height", "Age", "Amount", "Price", "Discount"].includes(column)) string = string.concat("`" + column + "`" + " = " + data[3][i] + ", ");
                        else string = string.concat("`" + column + "`" + " = '" + data[3][i] + "', ");
                    });
                    if(imageName != "")
                    {
                        let imageData = data[3][0].replace("data:image/png;base64,", "");
                        imageData = imageData.replace("data:image/jpeg;base64,", "");
                        require("fs").writeFile(dirName + dirImg + imageName, imageData, 'base64', function(err) {
                            console.log(err);
                        });
                    }
                    for(let i = 0; i < data[1].length; i++)
                    {
                        connection.query("update `lb15db`.`puzzles` set " + string.substring(0, string.length - 2) + " where (`Article` = '" + data[1][i] + "');",
                        function(err, results) {
                            if(err)
                            {
                                console.log(err);
                                response.write("error");
                                response.end();
                            }
                        });
                    }
                    response.write("ok");
                    response.end();
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("deletePuzzles"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if(data[0] == administratorRole || data[0] == employeeRole)
                {
                    data[1].forEach(article =>
                    {
                        connection.query("delete from `lb15db`.`puzzles` where (`Article` = '" + article + "');",
                        function(err, results) {
                            if(err)
                            {
                                console.log(err);
                                response.write("error");
                                response.end();
                            }
                            else
                            {
                                response.write("ok");
                                response.end();
                            }
                        });
                    });
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("getPromos"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                if(data == administratorRole)
                {
                    connection.query("select * from promos;",
                    function(err, results) {
                        if(err)
                        {
                            console.log(err);
                            response.write("error");
                            response.end();
                        }
                        else
                        {
                            let return_data = [];
                            results.forEach(result =>
                            {
                                if(result.action_time - (new Date() - Date.parse(result.creation_date)) / 3600000 >= 0)
                                {
                                    return_data.push(result);
                                }
                                else
                                {
                                    connection.query("delete from `lb15db`.`promos` where (`promocode` = '"+ result.promocode + "');",
                                    function(err, results) {
                                        if(err)
                                        {
                                            console.log(err);
                                            response.write("error");
                                            response.end();
                                        }  
                                    });
                                }
                            });
                            response.write(JSON.stringify(return_data));
                            response.end();
                        }
                    });
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("addPromo"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if(data[0] == administratorRole)
                {
                    let promocodes = "";
                    for(let i = 0; i < data[6]; i++)
                    {
                        let string = "'" + data[1];
                        let promocode = "";
                        if(data[6] > 1)
                        {
                            promocode = createCode(5) + i.toString();
                            string += promocode;
                        }
                        promocodes += data[1] + promocode + "\n";
                        string +=  "', " + data[2] + ", " + data[3] + ", " + data[4] + ", now(), " + data[5];
                        connection.query("insert into `lb15db`.`promos` (`promocode`, `discount`, `number_of_discounts`, `action_time`, `creation_date`, `uses`) VALUES (" + string + ");",
                        function(err, results) {
                            if(err)
                            {
                                console.log(err);
                                response.write("error");
                                response.end();
                            }
                            else
                            {
                                response.write(promocodes);
                                response.end();
                            }
                        });
                    }
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("editPromos"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if(data[0] == administratorRole)
                {
                    let string = "";
                    data[2].forEach((column, i) =>
                    {
                        if(column != "promocode") string = string.concat("`" + column + "`" + " = " + data[3][i] + ", ");
                        else string = string.concat("`" + column + "`" + " = '" + data[3][i] + "', ");
                    });
                    for(let i = 0; i < data[1].length; i++)
                    {
                        connection.query("update `lb15db`.`promos` set " + string.substring(0, string.length - 2) + " where (`promocode` = '" + data[1][i] + "');",
                        function(err, results) {
                            if(err)
                            {
                                console.log(err);
                                response.write("error");
                                response.end();
                            }
                        });
                    }
                    connection.query("select * from promos;",
                        function(err, results) {
                            if(err)
                            {
                                console.log(err);
                                response.write("error");
                                response.end();
                            }
                            else
                            {
                                results.forEach(result =>
                                {
                                    if(result.uses == 0)
                                    {
                                        connection.query("delete from `lb15db`.`promos` where (`promocode` = '"+ result.promocode + "');",
                                        function(err, results) {
                                            if(err)
                                            {
                                                console.log(err);
                                                response.write("error");
                                                response.end();
                                            }  
                                        });
                                    }
                                });
                            }
                        });
                    response.write("ok");
                    response.end();
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("deletePromos"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if(data[0] == administratorRole)
                {
                    for(let i = 1; i < data.length; i++)
                    {
                        connection.query("delete from `lb15db`.`promos` where (`promocode` = '" + data[i] + "');",
                        function(err, results) {
                            if(err)
                            {
                                console.log(err);
                                response.write("error");
                                response.end();
                            }
                            else
                            {
                                response.write("ok");
                                response.end();
                            }
                        });
                    }
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith("checkPromo"))
        {
            let data = "";
            request.on("data", chunk =>
            {
                data += chunk;
            });
            request.on("end", () =>
            {
                response.statusCode = 200;
                data = JSON.parse(data);
                if(data[0] == administratorRole || data[0] == employeeRole)
                {
                    connection.query("select * from promos where (`promocode` = '" + data[1] + "');",
                    function(err, results) {
                        if(err)
                        {
                            console.log(err);
                            response.write("error");
                            response.end();
                        }
                        else
                        {
                            response.write(JSON.stringify(results));
                            response.end();
                        }
                    });
                }
                else
                {
                    response.write("error");
                    response.end()
                }
            });
        }
        else if(request.url.endsWith(".css"))
        {
            fs.readFile(dirName + request.url, (err, data) =>
            {
                if(err) console.log(err);
                else
                {
                    response.setHeader("Content-Type", "text/css");
                    response.statusCode = 200;
                    response.write(data);
                    response.end();
                }
            });
        }
        else if(request.url.endsWith(".js"))
        {
            fs.readFile(dirName + request.url, (err, data) =>
            {
                if(err) console.log(err);
                else
                {
                    response.setHeader("Content-Type", "text/javascript");
                    response.statusCode = 200;
                    response.write(data);
                    response.end();
                }
            });
        }
        else if(request.url.endsWith(".jpg"))
        {
            fs.readFile(dirName + dirImg + request.url, (err, data) =>
            {
                if(err) console.log(err);
                else
                {
                    response.setHeader("Content-Type", "image/jpeg");
                    response.statusCode = 200;
                    response.write(data);
                    response.end();
                }
            });
        }
        else if(request.url.endsWith(".png"))
        {
            fs.readFile(dirName + dirImg + request.url, (err, data) =>
            {
                if(err) console.log(err);
                else
                {
                    response.setHeader("Content-Type", "image/png");
                    response.statusCode = 200;
                    response.write(data);
                    response.end();
                }
            });
        }
        else
        {
            if(request.url.search(".html") != -1)
            {
                request.url = request.url.slice(0, request.url.search(".html"));
            }
            getPage(request.url, response);
        }
    }
}).listen(3000);

function getPage(name, response, statusCode = 200)
{
    fs.readFile(dirName + name + ".html", "utf8", (err, data) =>
    {
        if(!err)
        {
            response.setHeader("Content-Type", "text/html");
            response.statusCode = statusCode;
            response.write(data);
            response.end();
        }
    });
}

function createCode(length)
{
    let chars = "+-!&$#=@abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let result = "";
    for(let i = 0; i < length; i++)
    {
        result = result.concat(chars[Math.floor(Math.random() * chars.length)]);
    }
    return result;
}