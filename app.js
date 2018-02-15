/*
--------                        --------
--------    Budget Controller   --------
--------                        -------- */
var budgetController = (function () {
    // FUNCTION CONSTRUCTOR - because we need to instanciate LOTS of expenses and LOTS of incomes objects...

    // Custom data type for EXPENSES
    // expenses will have an id, an description and a value
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Custom data type for INCOMES
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function (type) {
        var total = 0;

        data.allItems[type].forEach(function (current) {
            total += current.value;
        });

        data.totals[type] = total;

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
        },
        budget: 0,
        percentage: -1
    };

    // Public method to allow other modules to add a new item to the data structure
    return {
        addItem: function (type, desc, val) {
            var newItem, ID;

            // ID will be last ID + 1. So check the length of the exp / inc array and subtract 1 , then we have the last id.
            // now just add 1 to the last ID . When the data structure is empty then the new ID should be zero.
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            // Create the new Item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            // Push to data structure
            data.allItems[type].push(newItem);
            // Return the new created element.
            return newItem;
        },

        calculateBudget: function () {

            // Calculate total income and total expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate a budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that was spent alredy
            // Only does the calculation when the total Income is > 0
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }


        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
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
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
    }


    // Returns an object (composed by functions) to access the private variables of the UIController
    return {
        // Returns an object with the input inserted on HTML document, by the user
        getInput: function () {
            return {
                // type is either inc or exp. Check the .add__type class on html document 
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        // Adds items to the list of incomes or expenses
        addListItem: function (obj, type) {
            var html, newHTML, element;

            // Create HTML string with placeholder text (%SOMETHING%)
            // Replace what we want to exchange with "%SOMETHING%" so its easier to find later
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-&id&"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value% €</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value% €</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


            // Replace the placeHolder text with some actual data (data received with the obj)
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);


            // Insert the HTML into the DOM - insertAdjacentHTML (ver website para referencias sobre o uso)
            // beforeend para inserir antes do fim do container (de expenses ou de incomes...)
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        // Clear the input fields after inserting the item on the specific list
        clearFields: function () {
            var fields, fieldsArr;
            // We need to select the description input field and the value input field, we want to clear them
            // after insertion.
            // querySelectorAll returns a list instead of an array. 
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // We need to use the slice method, but slice only acepts arrays and not lists, but we can
            // acess the Array methods by the prototype, and then use the call and pass the fields list and then
            // it will return an array!
            fieldsArr = Array.prototype.slice.call(fields);

            // Iterate the array and clear every item (description and value in this case)
            // Current value - value of the array that its currently being processed (in this case, the first
            //                  will be the input description, and then inputa value)
            // Index - from ero to array.length -1
            // Array - entire array
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            // Sets the focus on the first element of the array (volta a por o focus na descrição do item)
            fieldsArr[0].focus();

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

    var updateBudget = function () {
        // 1. calculate the budget
        budgetCntr.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCntr.getBudget();
        
        // 3. Display the budget on the UI
        console.log(budget);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // TODO : 
        // 1. get the field input Data
        input = UIcntr.getInput();

        // Checks if the input description is not empty 
        // AND if the input value is not NaN (not a number)
        // AND if the input value is greater than zero
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add item to the budget controller
            newItem = budgetCntr.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UIcntr.addListItem(newItem, input.type);

            // 4. clear the fields
            UIcntr.clearFields();

            // 5. Calculate and update Budget
            updateBudget();
        }


    };



    // Initializates the script. 
    return {
        init: function () {
            setupEventListeners();
        }
    };


})(budgetController, UIController);


// Call the return of Global app controller.
controller.init();