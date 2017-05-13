var inquirer = require("inquirer");
var mysql    = require("mysql");
var con = require("./config.js").connection;

try {
    con.connect();
}
catch(err) {
    throw err;
}

var inStock = 0;
var price = 0;

promptUser({type:"input",
            name:"whatProduct",
            message:"Please provide an ID for the product you want to buy? "
        },function(product) {

            promptUser({type:"input",
                        name:"numberOf",
                        message:"How many of that product would you like to buy? "
                    },function(numOf) {

                        con.query({
                            sql: "SELECT * FROM products where item_id = ?",
                            values:[product.whatProduct]
                        }, function(error, result) {

                            if(error) throw error;
                            con.end();
                            if(result.length > 0 && numOf.numberOf) {
                                inStock = result[0].stock_quantity;
                                price = result[0].price;
                            if(inStock >= numOf.numberOf) {
                                var newTotal = inStock - numOf.numberOf;
                                con.query({
                                    sql: "UPDATE products SET stock_quantity = ? WHERE item_id = ?",
                                    values:[newTotal, product.whatProduct]
                                }, function(error, result) {
                                    if(error) throw error;
                                    con.end()
                                    console.log("The order was placed, your total is $"+ numOf.numberOf * price);
                                });
                            }
                            else {
                                if(inStock > 0) {
                                    promptUser({type:"list",
                                                name:"stillPlace",
                                                message:"Insufficient quantity! the max number available is " + inStock + " Would you like to place the order?",
                                                choices:["Yes", "No"]
                                            },function(stillPlace) {
                                                if(stillPlace.stillPlace === "Yes") {
                                                    con.query({
                                                        sql: "UPDATE products SET stock_quantity = ? where item_id = ?",
                                                        values:[0, product.whatProduct]
                                                    }, function(error, results) {
                                                        if(error) throw error;
                                                        con.end();
                                                        console.log("The order was placed, your total is $"+ numOf.numberOf * price);

                                                    });
                                            }
                                                else {
                                                    console.log("Your order has been cancled!!");
                                                }
                                            });
                                }
                                else {
                                    console.log("This item is not currently in stock");
                                }
                            }
                        }
                    });
                });
            });


function promptUser(promptType, callback) {
    inquirer.prompt(promptType).then(function (answers) {
        callback(answers);
    });

}
