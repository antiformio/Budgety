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
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;  
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

        deleteItem: function (type, id) {
            var index, ids;
            // Create an array with all the id numbers that we have. (there might not be all of the 
            //          id's in the array anymore...Some were deleted for example)

            // Solution: use MAP. it returns a new array. In this case returns a new array with all the ids
            //                  in that array of expenses/incomes object.
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            // Returns the index number of the 'id' in the array 'ids'
            index = ids.indexOf(id);

            // Now we just need to delete this index from our data array
            if (index !== -1) {
                data.allItems[type].splice(index, 1); // Will start removing objects starting from index, remove one time.
            }

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
        
        calculatePercentages: function() {
              
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function() {
            
            var perc = data.allItems.exp.map(function(cur){
               return cur.getPercentage(); 
            });
            return perc;
        },

        testing: function () {
            console.log(data);
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
        incomeTotal: '.budget__income--value',
        budgetTotal: '.budget__value',
        expensesTotal: '.budget__expenses--value',
        expensesPercentage: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage'
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
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value% €</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value% €</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


            // Replace the placeHolder text with some actual data (data received with the obj)
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);


            // Insert the HTML into the DOM - insertAdjacentHTML (ver website para referencias sobre o uso)
            // beforeend para inserir antes do fim do container (de expenses ou de incomes...)
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        deleteListItem: function (selectorID) {
            // In javascript we cannot simply delete an element, we can only remove a child. So in this case
            //              we have to go up until the father of the element and then remove childs..
            // (it's weird, but thats how DOM manipulation works..)

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);



        },

        // Clear the input fields after inserting the item on the specific list
        clearFields: function () {
            var fields, fieldsArr;
            // We need to select the description input field AND the value input field, we want to clear them
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
        displayBudget: function (budget) {
            document.querySelector(DOMstrings.budgetTotal).textContent = budget.budget;
            document.querySelector(DOMstrings.incomeTotal).textContent = budget.totalIncome;
            document.querySelector(DOMstrings.expensesTotal).textContent = budget.totalExpenses;

            if (budget.percentage > 0) {
                document.querySelector(DOMstrings.expensesPercentage).textContent = budget.percentage + '%';
            } else {
                document.querySelector(DOMstrings.expensesPercentage).textContent = '--'
            }
        },
        
        displayPercentages: function(percentages){
            
            // Returns a nodesList. See clearFIelds method on this controller.
            var fields = document.querySelectorAll(DOMstrings.itemPercentage);
            
            // We cannot use a forEach on an nodeslist, so we are going to create our OWN forEach function but for 
            //      nodesLists instead of arrays
            
            var nodeListForEach = function(list, callback){
              // Para cada campo de percentagem que veio do html, chama a callback com o elemento e o indice
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
                
            };
            
            // A callback pega no elemento e atribui-lhe um textContent do array das percentagens
            nodeListForEach(fields, function(current, index) {
               
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else {
                    current.textContent = '---';
                }
                
                
            });
            
            
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

        // EVENT DELEGATION-> the eventListener is attached, not to the actual item, but to the class before. 
        // This will be the element that ALL of the incomes and ALL of the expenses will have in common,
        //          in this case this element is the "container" line 53 of index.html (Section 6, 81)
        document.querySelector(DOM.container).addEventListener('click', cntrDeleteItem);


    };

    // Updates the percentages of each expense object, after an income is added
    //          OR after an income is deleted OR after added / deleted expense object.
    var updatePercentages = function () {

        //1. Calculate percentages
        budgetCntr.calculatePercentages();

        //2. Read percentages from the budget controller
        var percentages = budgetCntr.getPercentages();

        //3. Update the UI with the new percentages
        console.log(percentages);
        UIcntr.displayPercentages(percentages);
    };

    var updateBudget = function () {
        // 1. calculate the budget
        budgetCntr.calculateBudget();

        // 2. Return the budget
        var budget = budgetCntr.getBudget();

        // 3. Display the budget on the UI
        UIcntr.displayBudget(budget);
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

            //6. Calculate and update percentages
            updatePercentages();
        }


    };

    var cntrDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        // DOM traversing, we need to acess the parent node of this target, 
        // so we need to move up (see the index.html)
        // this is what we have before the parentNodes bellow : <i class="ion-ios-close-outline"></i>
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // Do something only if the ID exists...
        if (itemID) {
            // FORMATO DO itemID :
            // inc-0 inc-1 exp-0 exp-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);


            // 1. Delete the item from the data structure
            budgetCntr.deleteItem(type, ID);


            // 2. Delete the item from the UI
            UIcntr.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }

    };



    // Initializates the script. 
    return {
        init: function () {
            UIcntr.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };


})(budgetController, UIController);


// Call the return of Global app controller.
controller.init();