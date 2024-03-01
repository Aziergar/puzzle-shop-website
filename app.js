let http = require("http");
let fs = require("fs");
let dirName = "D:/code/vs code/Мои лабы/Lb15/";
let dirImg = "images/";
let employeeRole, administratorRole;
while(employeeRole == administratorRole)
{
    employeeRole = createCode(Math.floor(Math.random() * 100 + 100));
    administratorRole = createCode(Math.floor(Math.random() * 100 + 100));
}

const { getPackedSettings } = require("http2");

const mysql = require("mysql");
 
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "puzzleshop"
});

function ok_response(_, response)
{
    response.write("ok");
    response.end();
}

function result_response(result, response)
{
    response.write(JSON.stringify(result));
    response.end();
}

function query(options, response, func = ()=>{}, parameters)
{
    connection.query(options, (err, result) =>
    {
        if(err)
        {
            console.log(err);
            response.write("error");
            response.end();
        }
        else func(result, response, parameters);
    });
}

function manageRequest(request, response, func, checkRole)
{
    let data = "";
    request.on("data", chunk =>
    {
        data += chunk;
    });
    request.on("end", () =>
    {
        let valid = true;
        data = JSON.parse(data);
        response.statusCode = 200;
        if(checkRole && (data.access != administratorRole && data.access != employeeRole)) valid = false;
        if(checkRole == "administrator" && data.access != administratorRole) valid = false;
        if(!valid)
        {
            response.write("error");
            response.end();
            return;
        }
        func(response, data);
    });
}

http.createServer((request, response) =>
{
    if(request.url == "/favicon.ico") return;

    if(request.url.endsWith("getRole"))
    {
        manageRequest(request, response, (response, data) =>
        {
            query("select role from accounts where login = '" + data.login + "' and password = '" + data.password + "';",
                response, (result, response) =>
                {
                    let res = "guest";
                    if(result.length > 0 && result[0].role == "administrator") res = administratorRole;
                    else if(result.length > 0 && result[0].role == "employee") res = employeeRole;
                    response.write(res);
                    response.end();
                });
        });
    }

    else if(request.url.endsWith("checkRole"))
    {
        manageRequest(request, response, (response, data) =>
        {
            let res = "guest";
            if(data == administratorRole) res = "administrator";
            else if(data == employeeRole) res = "employee";
            response.write(res);
            response.end();
        });
    }

    else if(request.url.endsWith("getAccounts"))
    {
        manageRequest(request, response,
            (response) => query("select * from accounts;", response, result_response), 
            "administrator");
    }

    else if(request.url.endsWith("addAccount"))
    {
        manageRequest(request, response, (response, data) =>
        {
            let string = "'" + data.account.login + "', '" + data.account.password + "', '" + data.account.role + "'";
            query("insert into `puzzleshop`.`accounts` (`login`, `password`, `role`) VALUES (" + string + ");", 
            response, ok_response);
        }, "administrator");
    }
    else if(request.url.endsWith("editAccount"))
    {
        manageRequest(request, response, (response, data) =>
        {
            let string = data.account.login + "', `password` = '" + data.account.password + "', `role` = '" + data.account.role;
            query("update `puzzleshop`.`accounts` set `login` = '" + string + "' where (`login` = '" + data.account.oldLogin + "');", 
            response, ok_response);
        }, "administrator");
    }
    else if(request.url.endsWith("deleteAccount"))
    {
        manageRequest(request, response, (response, data) =>
        {
            query("delete from `puzzleshop`.`accounts` where (`login` = '"+ data.account.login + "');", 
            response, ok_response);
        }, "administrator");
    }
    else if(request.url.endsWith("getPuzzles"))
    {
        manageRequest(request, response, (response, data) =>
        {
            data = new Map(data);
            let string = "";
            if(data.size > 0)
            {
                string = "where ";
                for(let pair of data)
                {
                    if(pair[0].endsWith("like ")) string = string.concat(pair[0] + "'%" + pair[1] + "%' and ");
                    else string = string.concat(pair[0] + pair[1] + " and ");
                }
                string = string.substring(0, string.length - 5);
            }
            query("select * from puzzles " + string + ";", response, result_response);
        });
    }
    else if(request.url.endsWith("addPuzzle"))
    {
        manageRequest(request, response, (response, data) =>
        {
            let imageName = ((new Date).toString()).replace(/\(.+\)/g, "") + createCode(Math.floor(Math.random() * 10 + 10));
            imageName = imageName.replaceAll(":", ";");
            imageName = imageName.replaceAll(" ", "-");
            if(data.puzzle.image.search("/jpeg") != -1) imageName = imageName.concat(".jpg");
            else if(data.puzzle.image.search("/png") != -1) imageName = imageName.concat(".png");
            let string = "'" + imageName;
            for(let value of data.puzzle.values)
            {
                string = string.concat("', '" + value);
            }
            string = string.concat("'");
            query("insert into `puzzleshop`.`puzzles` VALUES (" + string + ");", response, ok_response);

            let imageData = data.puzzle.image.replace("data:image/png;base64,", "");
            imageData = imageData.replace("data:image/jpeg;base64,", "");

            require("fs").writeFile(dirName + dirImg + imageName, imageData, 'base64', function(err) {
                console.log(err);
            });
        }, "employee");
    }
    else if(request.url.endsWith("editPuzzles"))
    {
        manageRequest(request, response, (response, data) =>
        {
            let string = "";
            let imageName = "";
            data.data.values = new Map(data.data.values);
            if(data.data.values.has("image"))
            {
                imageName = ((new Date).toString()).replace(/\(.+\)/g, "") + createCode(Math.floor(Math.random() * 10 + 10));
                imageName = imageName.replaceAll(":", ";");
                imageName = imageName.replaceAll(" ", "-");
                if(data.data.values.get("image").search("/jpeg") != -1) imageName = imageName.concat(".jpg");
                else if(data.data.values.get("image").search("/png") != -1) imageName = imageName.concat(".png");
            }
            for(let pair of data.data.values)
            {
                if(pair[0] == "image") string = string.concat("`" + pair[0] + "`" + " = '" + imageName + "', ");
                else if(["number_of_pieces", "width", "height", "piece_width", "piece_height", "age", "amount", "price", "discount"].includes(pair[0]))
                    string = string.concat("`" + pair[0] + "`" + " = " + pair[1] + ", ");
                else string = string.concat("`" + pair[0] + "`" + " = '" + pair[1] + "', ");
            }
            if(imageName != "")
            {
                let imageData = data.data.values.get("Image").replace("data:image/png;base64,", "");
                imageData = imageData.replace("data:image/jpeg;base64,", "");
                require("fs").writeFile(dirName + dirImg + imageName, imageData, 'base64', function(err) {
                    console.log(err);
                });
            }
            for(let i = 0; i < data.data.articles.length; i++)
            {
                query("update `puzzleshop`.`puzzles` set " + string.substring(0, string.length - 2) + " where (`article` = '" + data.data.articles[i] + "');", 
                response, ok_response);
            }
        }, "employee");
    }
    else if(request.url.endsWith("deletePuzzles"))
    {
        manageRequest(request, response, (response, data) =>
        {
            data.data.forEach(article =>
            {
                query("delete from `puzzleshop`.`puzzles` where (`Article` = '" + article + "');", 
                response, ok_response);
            });
        }, "employee");
    }
    else if(request.url.endsWith("getPromos"))
    {
        manageRequest(request, response, (response) =>
        {
            query("select * from `puzzleshop`.`promos`;", 
                response, (result, response) =>
                {
                    let return_data = [];
                    let where_delete = "";
                    for(let i = 0; i < result.length; i++)
                    {
                        if((new Date() - Date.parse(result[i].creation_date)) / 3600000 >= result[i].action_time
                            || result[i].uses == 0)
                        {
                            if(where_delete.length != 0) where_delete += " or ";
                            where_delete += "`promocode` = '" + result[i].promocode + "'";
                            continue;
                        }
                        return_data.push(result[i]);
                    }
                    if(where_delete.length > 0)
                        query("delete from `puzzleshop`.`promos` where (" + where_delete + ");", response);

                    response.write(JSON.stringify(return_data));
                    response.end();
                });
        }, "administrator");
    }
    else if(request.url.endsWith("addPromo"))
    {
        manageRequest(request, response, (response, data) =>
        {
            let promocodes = "";
            data.data = new Map(data.data);
            let promocode_base = data.data.get("promocode");
            let number_of_promocodes = data.data.get("number_of_promocodes");
            if(number_of_promocodes > 10000)
            {
                response.write("error");
                response.end();
                return;
            }
            data.data.delete("number_of_promocodes");
            data.data.set("creation_date", "now()");
            
            let fields = Array.from(data.data.keys()).join(", ");
            let values = Array.from(data.data.values()).join(", ");

            let query_string = "insert into `puzzleshop`.`promos` (" + fields + ") VALUES";

            for(let i = 0; i < number_of_promocodes; i++)
            {
                query_string += i == 0 ? " (" : ", (";
                let code = number_of_promocodes > 1
                         ? promocode_base + createCode(5) + i.toString()
                         : promocode_base;
                promocodes += code + "\n";
                query_string += values.replace(promocode_base, `'${code}'`) + ")";
            }
            query_string += ";";

            query(query_string, response, (_, response) =>
            {
                response.write(promocodes);
                response.end();
            });
        }, "administrator");
    }
    else if(request.url.endsWith("editPromos"))
    {
        manageRequest(request, response, (response, data) =>
        {
            data.data.values = new Map(data.data.values);
            let set_string = "";
            for(let pair of data.data.values)
            {
                set_string += "`" + pair[0] + "`=";
                set_string += pair[0] == "promocode"
                    ? "'" + pair[1] + "',"
                    : pair[1] + ",";
            }
            set_string = set_string.substring(0, set_string.length - 1);

            let query_string = "update `puzzleshop`.`promos` set " + set_string + " where (";

            for(let i = 0; i < data.data.promos.length; i++)
            {
                query_string += i == 0 ? "" : "or";
                query_string += "`promocode`='" + data.data.promos[i] + "'";
            }
            query_string += ");";

            query(query_string, response, ok_response);
        }, "administrator");
    }
    else if(request.url.endsWith("deletePromos"))
    {
        manageRequest(request, response, (response, data) =>
        {
            let query_string = "delete from `puzzleshop`.`promos` where (";

            for(let i = 0; i < data.data.length; i++)
            {
                query_string += i == 0 ? "" : "or";
                query_string += "`promocode`='" + data.data[i] + "'";
            }
            query_string += ");";

            query(query_string, response, ok_response);
        }, "administrator");
    }
    else if(request.url.endsWith("checkPromo"))
    {
        manageRequest(request, response, (response, data) =>
        {
            query("select * from promos where (`promocode` = '" + data.promo + "');",
            response, result_response);
        }, "employee");
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