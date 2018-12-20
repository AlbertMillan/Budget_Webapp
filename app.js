var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome) {
        if(totalIncome > 0)
        {
            this.percentage = Math.round(this.value / totalIncome * 100)
        }
        else
        {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };


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
        percentage: -1,
    };

    // Returns all the functions that we want to be public.
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // Create new ID
            if(data.allItems[type].length > 0)
            {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }
            else
            {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp')
            {
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'inc')
            {
                newItem = new Income(ID, des, val);
            }

            // where type is 'inc' or 'exp'
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, ID) {
            // map returns a new brand array of the size of allItems
            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            // Get index of the element to be deleted
            index = ids.indexOf(ID);

            if(index !== -1)
            {
                // splice - index at which we want to remove. Number of elements to be removed.
                data.allItems[type].splice(index, 1);
            }
        },

        calcBudget: function() {
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0)
            {
                // Calculate the percentage of income spent
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            }
            else
            {
                data.percentage = -1;
            }
        },

        calcPercentages: function() {

            data.allItems.exp.forEach(function(current) {
                current.calculatePercentage(data.totals.inc);
            });
        }, 

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        getPercentages: function() {
            // map - returns something to be stored in a variable.
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },

        testing: function() {
            console.log(data);
        }
    };
    
})();


https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescripiton: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        itemPercentageLabel: '.item__percentage',
        container: '.container',
        monthLabel: '.budget__title--month',
    }

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        // Rounds to two decimals.
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if(int.length > 3)
        {
            int = int.substring(0, int.length-3) + ',' + int.substring(int.length-3, int.length);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,      // will be inc or exp
                description: document.querySelector(DOMstrings.inputDescripiton).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml;

            // Create HTML string with placeholder text
            if(type === 'inc')
            {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else
            {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML. 'beforeend' - https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            // In JS, we can only delete a child.
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescripiton + ', ' + DOMstrings.inputValue);
            
            // trick to conver fields into array
            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            obj.budget >= 0 ? type='inc':type='exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0)
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else 
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';                
            }
        },

        displayPercentages: function(percentages) {
            var allExpElements = document.querySelectorAll(DOMstrings.itemPercentageLabel);
            allExpElements.forEach(function(current, index) {
                if(percentages[index] !== -1)
                {   
                    current.textContent = percentages[index] + '%';
                }
                else
                {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, year, month, months;

            months = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ', ' + year;
        },

        // When changing style, best way to do it is to add/remove classes.
        // Changes color of input boxes and enter button.
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescripiton + ',' +
                DOMstrings.inputValue
            );

            fields.forEach(function(current, index) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }
})();




var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Detects any key press.
        document.addEventListener('keypress', function(event) {
            // 'Enter' pressed
            if(event.keyCode === 13 || event.which === 13)
            {
                console.log('ENTER pressed.');
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calcBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // console.log(budget);

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calcPercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages.
        // console.log(percentages);
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        // 1. Get the filed input data.
        var input = UICtrl.getInput();
        // console.log(info)

        if(input.description !== ""   &&   !isNaN(input.value)   &&   input.value > 0 )
        {
            // 2. Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
        

        console.log('It works!');
    }

    var ctrlDeleteItem = function(event) {
        var itemID, splitID;

        // Element where event is fired (container: h2,)
        // parentNode - moves up to the parent element
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID)
        {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        // 1. Delete item from the data structure
        budgetCtrl.deleteItem(type,ID);

        // 2. Delete the item from the UI
        UIController.deleteListItem(itemID);

        // 3. Update and show the new budget
        updateBudget();

        // 4. Update and show percentages.
        updatePercentages();
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();