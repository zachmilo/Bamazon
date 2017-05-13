var inquirer = require("inquirer");
var mysql    = require("mysql");
var con = require("./config.js").connection;

try {
    con.connect();
}
catch(err) {
    throw err;
}

promptUser({type:"list",
            name:"managerOp",
            message:"Please select from the following options:",
            choices:["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
}, function(answer) {
    switch (answer.managerOp) {
        case "View Products for Sale":
            listProducts();
            break;
        case "View Low Inventory":
            lowProducts();
            break;
        case "Add New Product":
            addNewProduct();
            break;
        case "Add to Inventory":
            addProductInventory();
            break;
        default:
            console.log("Lets leave this here fow now");

    }
});

function promptUser(promptType, callback) {

    inquirer.prompt(promptType).then(function (answers) {
        callback(answers);
    });

}

function listProducts() {

    con.query({
        sql: "SELECT * FROM products where stock_quantity > 0",
    }, function(error, result) {
        if(error) throw error;
        printResults(result);
        con.end();
    });
}
function printResults(results) {
        var askMore = 1;
        if(results.length < 1){
            console.log("No search results were returned");
            return;
        }

        for(var item in results) {
            console.log("id: "+results[item].item_id+"\n" +
                        "name: "+results[item].product_name+"\n"+
                        "price: "+results[item].price+"\n" +
                        "stock: "+results[item].stock_quantity+"\n");
        }
}

function lowProducts() {
    con.query({
        sql: "SELECT * FROM products where stock_quantity < 5",
    }, function(error, result) {
        if(error) throw error;
        printResults(result);
        con.end();

    });
}

function addNewProduct() {
    promptUser({type:"input",
                name:"name",
                message:"Please provide a product name "
            },function(prodName) {
                promptUser({type:"input",
                            name:"price",
                            message:"Please provide a price "
                        },function(prodPrice) {
                            promptUser({type:"input",
                                        name:"quantity",
                                        message:"Please enter the number in stock "
                                    },function(prodQuantity) {
                                        promptUser({type:"input",
                                                    name:"department",
                                                    message:"Please enter the department "
                                                },function(depart) {
                                                    console.log(depart.department);
                                                    con.query({
                                                        sql: "INSERT INTO products SET ?",
                                                        values:{product_name:prodName.name ,department_name:depart.department , price:prodPrice.price, stock_quantity:prodQuantity.quantity},
                                                    }, function(error, results) {
                                                        if(error) throw error;
                                                        con.end();
                                                        console.log("Your new product has been added");
                                                    });
                                        });
                            });
                });
    });
}

function addProductInventory() {

    promptUser({type:"input",
                name:"itemId",
                message:"Please enter the itemid",
            },function(item) {
                promptUser({type:"input",
                            name:"update",
                            message:"How many should we add to the stock? "
                        },function(numOf) {
                            con.query({
                                sql: "SELECT * FROM products where item_id = ?",
                                values:[item.itemId]
                            }, function(error, results) {
                                if(error) throw error;
                                if(results.length > 0) {
                                    var newStock = parseInt(numOf.update) + parseInt(results[0].stock_quantity);
                                    con.query({
                                            sql: "UPDATE products SET stock_quantity = ? where item_id = ?",
                                            values:[newStock, item.itemId]
                                        }, function(error, results) {
                                            if(error) throw error;
                                            con.end();
                                            console.log("Update complete");
                                        });
                                }
                                else {
                                    console.log("no results found for id");
                                    con.end();
                                }
                            });
                });
    });
}
