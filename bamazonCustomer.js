var inquirer = require("inquirer");
var mysql    = require("mysql");
var con = require("./config.js").connection;

try {
    con.connect();
}
catch(err) {
    throw err;
}


promptUser({type:"input",
            name:"whatProduct",
            message:"Please provide an ID for the product you want to buy"
        },function(answer) {

        })



























function promptUser(promptType, callback) {
    inquirer.prompt(promptType).then(function (answers) {
        callback(answers);
    });

}
