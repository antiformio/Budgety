// Budget Controller
var budgetController = (function () {



})();

// UI Controller
var UIController = (function () {



})();


// Global App Controller
var controller = (function (budgetCntr, UIcntr) {

    var ctrlAddItem = function () {
        /*TODO : 
        1. get the field input Data
        2. add item to the budget controller
        3. add the item to the UI
        4. calculate the budget
        5. display the budget on UI*/

        console.log('It works');

    }

    // Event handler for btn__add click
    document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);

    // Event handler for keypress
    document.addEventListener('keypress', function (e) {

        if (e.keyCode === 13) {
            ctrlAddItem();
        }

    });

})(budgetController, UIController);