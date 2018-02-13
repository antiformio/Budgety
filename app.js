/*
--------                        --------
--------    Budget Controller   --------
--------                        -------- */

var budgetController = (function () {
    // FUNCTION CONSTRUCTURE - because we need to instanciate LOTS of expenses and LOTS of incomes objects...
    
    // Custom data type for EXPENSES
    // expenses will have an id, an description and a value
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    // Custom data type for INCOMES
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    
    // Object to store all data: an array of expenses and an array of incomes,
    // and a total expenses and total incomes
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    };
    
})();


/*
--------                        --------
--------    UI Controller       --------
--------                        -------- */

var UIController = (function () {

    // Object for the querySelectors. Easier to refractor if we change the class name on the HTML document
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn'
    }


    // Returns an object (composed by functions) to access the private variables of the UIController
    return {
        // Returns an object with the input inserted on HTML document, by the user
        getInput: function () {
            return {
                // type is either inc or exp. Check the .add__type class on html document 
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            };
        },
        // Returns the DOMstrings variable so other controllers can use it too.
        getDOMstrings: function () {
            return DOMstrings;
        }

    };


})();


/*
--------                        --------
--------    Global APP Controller   ---
--------                        -------- */

var controller = (function (budgetCntr, UIcntr) {

    // Setup eventListeners
    var setupEventListeners = function () {
        var DOM = UIcntr.getDOMstrings();

        // Event handler for btn__add click
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Event handler for keypress ("listening" the enter keypress on ALL webpage)
        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13) {
                ctrlAddItem();
            }
        });

    };


    var ctrlAddItem = function () {
        // TODO : 
        // 1. get the field input Data

        var input = UIcntr.getInput();
        console.log(input);

        // 2. add item to the budget controller
        // 3. add the item to the UI
        // 4. calculate the budget
        // 5. display the budget on UI



    }

    // Initializates the script. 
    return {
        init: function () {
            setupEventListeners();
        }
    };


})(budgetController, UIController);


// Call the return of Global app controller.
controller.init();