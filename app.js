// Controller Module
var budgetController = (function () {

    var x = 23;

    var add = function (a) {
        return x + a;
    }
    // Closures !!
    return {
        publicTest: function (b) {
            return add(b);
        }
    }

})();

// UI Module
var UIController = (function() {
    
    
    
})();

 
// App Module (joins the 2 modules defined before)
var controller = (function(budgetCntr, UIcntr) {
    
    var z = budgetCntr.publicTest(5);
    
    // Closures !!
    return {
        anotherPublic: function(){
            console.log(z);
        }
    }
    
})(budgetController, UIController);