// TODO
//  2. Local storage does not display initial percentages correctly,


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

    var deleteEl = function(type, index) {
        if(index !== -1)
        {
            // splice - index at which we want to remove. Number of elements to be removed.
            data.allItems[type].splice(index, 1);
        }
    };

    // Returns index of the element with ID.
    var getIndex = function(type, ID) {
        // map returns a new brand array of the size of allItems
        var ids = data.allItems[type].map(function(current) {
            return current.id;
        });
        return ids.indexOf(ID);
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
            // Get index of the element to be deleted
            index = getIndex(type, ID);

            // Delete at index
            deleteEl(type, index);
        },

        clearItems: function(){
            data.allItems.inc.length = 0;
            data.allItems.exp.length = 0;
        },

        switchItem: function(type, ID) {
            // Get Item description/value
            var index, item, inversedType, inversedItem;

            // Get index of item to be switched
            index = getIndex(type, ID);

            // 1. Get item info (description and value)
            item = data.allItems[type][index];

            // 2. Create new item with inversed type
            inversedType = (type === 'inc' ? 'exp' : 'inc');
            inversedItem = this.addItem(inversedType, item.description, item.value);

            // 3. Delete item at index from the data structure type
            deleteEl(type, index);

            return inversedItem;
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
                console.log(current);
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

        getData: function() {
            return data;
        },

        // JSON data does not store Expense nor Income objects, create them when
        //  importing data from the localStorage
        setData: function(obj) {
            type = ['exp','inc'];
            for(var i=0; i < type.length; i++)
            {
                obj.allItems[type[i]].forEach(function(current, index) {
                    var item = (
                        type[i] === 'exp' ? 
                            new Expense(current.id, current.description, current.value) :
                            new Income(current.id, current.description, current.value)                   
                    );
                    data.allItems[type[i]][index] = item;
                });
                data.totals[type[i]] = obj.totals[type[i]];
            }
            data.budget = obj.budget;
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
        resetBtn: '.add__reset__btn',
        incomeListContainer: '.income__list',
        expensesListContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        itemPercentageLabel: '.item__percentage',
        container: '.container',
        monthLabel: '.budget__title--month',
        incomeContainer: '.income',
        expenseContainer: '.expenses',
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
                element = DOMstrings.incomeListContainer;
                html = '<div class="item clearfix" id="inc-%id%" draggable="true"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else
            {
                element = DOMstrings.expensesListContainer;
                html = '<div class="item clearfix" id="exp-%id%" draggable="true"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
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

        deleteLists: function() {
            type=[DOMstrings.incomeListContainer, DOMstrings.expensesListContainer];
            for(var i=0; i < type.length; i++)
            {
                var node = document.querySelector(type[i]);
                while(node.firstChild)
                {
                    node.removeChild(node.firstChild);
                }
            }
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

        // Returns the dimensions of the opposite container of column type.
        getContainerDimensions: function(type) {
            var label;
            // label = (type === 'inc' ? DOMstrings.incomeContainer : DOMstrings.expenseContainer);
            label = (type === 'inc' ? DOMstrings.expenseContainer : DOMstrings.incomeContainer);
            return document.querySelector(label).getBoundingClientRect();
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }
})();




var storageController = (function() {

    var storage = {
        key: 'data'
    };

    return {
        store: function(data) {
            // 1. Stored in the local storage.
            localStorage.setItem(storage.key, JSON.stringify(data));
            this.retrieveItem();
        },

        retrieveItem: function() {
            return JSON.parse(localStorage.getItem(storage.key));
        },

        removeItem: function() {
            localStorage.removeItem(storage.key);
        },

        clearData: function() {
            localStorage.clear();
        },

        isEmpty: function() {
            return (localStorage.getItem(storage.key) === null ? true : false);
        },
    }

})();




var controller = (function(budgetCtrl, UICtrl, storageCtrl) {

    var draggedItem;

    var setupStorage = function() {
        if(!storageCtrl.isEmpty())
        {
            var data = storageCtrl.retrieveItem();
            budgetCtrl.setData(data);
            // console.log(data);
            UICtrl.displayBudget(budgetCtrl.getBudget());

            var addAllItems = function(type) {
                for(var i=0; i < data.allItems[type].length; i++)
                {
                    UICtrl.addListItem(data.allItems[type][i], type);
                }
            };

            addAllItems('inc');
            addAllItems('exp');

            updatePercentages();
        }
        else
        {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };

    

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.querySelector(DOM.resetBtn).addEventListener('click', ctrlClearAll)

        // Detects any key press.
        document.addEventListener('keypress', function(event) {
            // 'Enter' pressed
            if(event.keyCode === 13 || event.which === 13)
            {
                console.log('ENTER pressed.');
                ctrlAddItem();
            }
            else if (event.keyCode === 109 || event.which === 109)
            {
                storageCtrl.deleteData();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // DRAGOVER
        document.querySelector(DOM.container).addEventListener('dragstart', ctrlDragItem);
        // document.querySelector(DOM.container).addEventListener('drop', drop);
        document.querySelector(DOM.container).addEventListener('dragend', ctrlToggleItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calcBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calcPercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages.
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

            // 7. Store data in localstorage
            storageCtrl.store(budgetCtrl.getData());
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

            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type,ID);

            // 2. Delete the item from the UI dragged column
            UIController.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Update and show percentages.
            updatePercentages();

            // 5. Store data in localstorage
            storageCtrl.store(budgetCtrl.getData());
        }
    };

    var ctrlClearAll = function(event) {
        // 1. Remove/Empty the datastructure in the budget controller
        budgetController.clearItems();

        // 2. Update UI items
        UICtrl.deleteLists();

        // 3. Update and show budget
        updateBudget();

        // 4. Update and show percentages - MIGHT NOT NEED THIS
        // updatePercentages();

        // 5. Clear local storage
        storageCtrl.clearData();
    };

    // Event when dragged over an element. Check coordinates. - dragStart
    var ctrlDragItem = function(event) {
        var itemID, splitID;

        itemID = event.target.id;

        // Repeated code in method above...
        splitID = itemID.split('-');
        draggedItem = {
            type: splitID[0],
            ID: parseInt(splitID[1]),
        }
        
    };

    // Event when it drops check square window
    var ctrlToggleItem = function(event) {
        var rect, inversedType;

        // 1. Get type of the container where item is dropped (inc/exp)
        inversedType = (draggedItem.type === 'inc' ? 'exp' : 'inc');

        // 2. Get dimensions of the opposing column.
        rect = UICtrl.getContainerDimensions(draggedItem.type);

        // Check Square dropped within the container
        if(event.x >= rect.left && event.x <= rect.right  &&
           event.y >= rect.top  && event.y <= rect.bottom
          )
        {
            // 1. Switch item in the data structure. Returns the item in the opposite column
            var newItem = budgetCtrl.switchItem(draggedItem.type, draggedItem.ID);

            // 2. Delete the item from the UI
            UIController.deleteListItem(draggedItem.type + '-' + draggedItem.ID);

            // 3. Add the item to the UI dropped column
            UICtrl.addListItem(newItem, inversedType);

            // 4. Update and show the new budget
            updateBudget();

            // 5. Update and show percentages.
            updatePercentages();

            // 6. Store data in localstorage
            storageCtrl.store(budgetCtrl.getData());
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();

            // Displays last budget stored in the localStorage if any
            setupStorage();
            
            // Prepares event listeners.
            setupEventListeners();
        }
    }

})(budgetController, UIController, storageController);

controller.init();