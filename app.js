// TODO:
//      1. Drag & drop change object order display over same list (+ dragover cursor)
//          b. It would be more efficient to get the position by looking at the UI 
//              childnodes, and based on that swap the positions. Would be less 
//              computing intense.

//      2. Use slideshow to create new budgets and alter between them. Store them
//          in the localstorate

var budgetController = (function() {

    var Budget = function(id, data) {
        this.id = id;
        this.data = {
            allItems: {
                exp: data.allItems.exp,
                inc: data.allItems.inc
            },
            totals: {
                exp: data.totals.exp,
                inc: data.totals.inc
            },
            budget: data.budget,
            percentage: data.percentage,
        };
    };

    Budget.prototype.updateData = function(type, newItem) {
        this.data.allItems[type].push(newItem);
    };

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
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        budgetManager.budgets[budgetManager.current].data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        budgetManager.budgets[budgetManager.current].data.totals[type] = sum;
    };

    var deleteEl = function(type, index) {
        if(index !== -1)
        {
            // splice - index at which we want to remove. Number of elements to be removed.
            budgetManager.budgets[budgetManager.current].data.allItems[type].splice(index, 1);
        }
    };

    // Returns index of the element with ID.
    var getIndex = function(type, ID) {
        // map returns a new brand array of the size of allItems
        var ids = budgetManager.budgets[budgetManager.current].data.allItems[type].map(function(current) {
            return current.id;
        });
        return ids.indexOf(ID);
    };

    var getBiggestInArr = function(arr) {
        var highest = 0;

        arr.forEach(function(current, index) {
            if(current.id > highest)
            {
                highest = current.id;
            }
        });

        return (highest+1);
    };

    var budgetManager = {
        budgets: [],
        current: -1
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

        addBudget: function() {
            var newBudget, ID;

            // 1. Generate new ID
            if(budgetManager.budgets.length > 0)
            {
                ID = budgetManager.budgets[budgetManager.budgets.length - 1].id + 1;
                budgetManager.current++;
            }
            else
            {
                ID = 0;
                budgetManager.current = 0;
            }

            // 2. Clear current datastructure
            data.allItems.exp = [];
            data.allItems.inc = [];
            data.totals.exp = 0;
            data.totals.inc = 0;
            data.budget = 0;
            data.percentage = -1;

            // 3. Generate new budget item
            newBudget = new Budget(ID, data);

            // 4. Push budget item into the budget manager array
            budgetManager.budgets.push(newBudget);
        },


        addItem: function(type, des, val) {
            var newItem, ID;

            var myData = budgetManager.budgets[budgetManager.current].data;

            // Create new ID, allows for disordered elements
            if(myData.allItems[type].length > 0)
            {
                // Get highest ID in the array, it can be unordered so you have 
                // no guarantee that it will be the last item
                // ID = data.allItems[type][data.allItems[type].length-1].id + 1;
                ID = getBiggestInArr(myData.allItems[type]);
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
            budgetManager.budgets[budgetManager.current].updateData(type, newItem);

            return newItem;
        },

        deleteItem: function(type, ID) {
            // Get index of the element to be deleted
            index = getIndex(type, ID);

            // Delete at index
            deleteEl(type, index);
        },

        deleteBudget: function() {
            budgetManager.budgets.splice(budgetManager.current, 1);
            budgetManager.current--;
        },

        clearItems: function(){
            budgetManager.budgets[budgetManager.current].data.allItems.inc.length = 0;
            budgetManager.budgets[budgetManager.current].data.allItems.exp.length = 0;
        },

        switchItem: function(type, ID) {
            // Get Item description/value
            var index, item, inversedType, inversedItem;

            // Get index of item to be switched
            index = getIndex(type, ID);

            // 1. Get item info (description and value)
            item = budgetManager.budgets[budgetManager.current].data.allItems[type][index];

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

            var myData = budgetManager.budgets[budgetManager.current].data;

            // Calculate the budget
            myData.budget = myData.totals.inc - myData.totals.exp;

            if(myData.totals.inc > 0)
            {
                // Calculate the percentage of income spent
                myData.percentage = Math.round(myData.totals.exp / myData.totals.inc * 100);
            }
            else
            {
                myData.percentage = -1;
            }
        },

        calcPercentages: function() {
            var myData = budgetManager.budgets[budgetManager.current].data;
            myData.allItems.exp.forEach(function(current) {
                current.calculatePercentage(myData.totals.inc);
            });
        }, 

        getBudget: function() {
            var dataStructure = budgetManager.budgets[budgetManager.current].data;
            return {
                budget: dataStructure.budget,
                totalInc: dataStructure.totals.inc,
                totalExp: dataStructure.totals.exp,
                percentage: dataStructure.percentage
            };
        },

        getCurrentBudgetID: function() {
            return budgetManager.current;
        },

        getPercentages: function() {
            // map - returns something to be stored in a variable.
            var allPerc = budgetManager.budgets[budgetManager.current].data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },

        getData: function() {
            // return data;
            return budgetManager.budgets[budgetManager.current].data;
        },

        getBudgets: function() {
            return budgetManager;
        },

        // JSON data does not store Expense nor Income objects, create them when
        //  importing data from the localStorage
        setData: function(obj) {
            type = ['exp','inc'];

            console.log(obj);


            obj.budgets.forEach(function(budget, i) {
                var myData = budget.data;
                for(var j=0; j < type.length; j++)
                {
                    myData.allItems[type[j]].forEach(function(current, k) {
                        var item = (
                            type[j] === 'exp' ? 
                                new Expense(current.id, current.description, current.value) :
                                new Income(current.id, current.description, current.value)                   
                        );
                        data.allItems[type[j]][k] = item;
                    });
                    data.totals[type[j]] = myData.totals[type[j]];
                }

                data.budget = myData.budget;

                // 3. Generate new budget item
                newBudget = new Budget(i, data);

                // TODO: Percentages could be missing

                // 4. Push budget item into the budget manager array
                budgetManager.budgets.push(newBudget);

                // 5. Clear current data structure // DO I REALLY NEED THIS? TRY IT OUT
                data.allItems.exp = [];
                data.allItems.inc = [];
            });

            budgetManager.current = obj.budgets.length - 1;
        },

        updateIndex: function(operation) {
            var res = budgetManager.current + operation;
            if(res < 0)
            {
                budgetManager.current = budgetManager.budgets.length-1;
            }
            else if ( res == budgetManager.budgets.length )
            {
                budgetManager.current = 0;
            }
            else
            {
                budgetManager.current = res;
            }
        },

        rearrangeOrder: function(type, sourcePos, destinationPos) {
            var element;

            var myData = budgetManager.budgets[budgetManager.current].data;
            
            // 1. Store the element in a temp variable
            element = myData.allItems[type][sourcePos];

            // 2. Delete element in temp variable
            deleteEl(type, sourcePos);

            // 3. Add item at pos
            myData.allItems[type].splice(destinationPos, 0, element);
        },

        testing: function() {
            console.log(data);
        },

        test: function() {
            console.log(budgetManager);
        }
    };
    
})();


// https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescripiton: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        resetBtn: '.add__reset__btn',
        arrowBtn: '.arrow__btn',
        incomeListContainer: '.income__list',
        expensesListContainer: '.expenses__list',
        budgetAddBtn: 'budget__add',
        budgetDelBtn: 'budget__del',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        itemPercentageLabel: '.item__percentage',
        dotContainer: '.dot__container',
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

        deleteList: function(type) {
            var label, node;

            label = (type === 'inc' ? DOMstrings.incomeListContainer : DOMstrings.expensesListContainer);
            node = document.querySelector(label);

            while(node.firstChild)
            {
                node.removeChild(node.firstChild);
            }
        },


        clearFields: function() {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescripiton + ', ' + DOMstrings.inputValue);
            
            // trick to convert fields into array
            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current) {
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

        displayDot: function(oldIndex, newIndex) {
            var html, parent;

            parent = document.querySelector(DOMstrings.dotContainer);

            html = '<span class="dot active" id="dot-%id%"></span>';

            // Remove highlight of previously selected dot
            // console.log(oldIndex, newIndex);
            if(oldIndex !== -1)
            {
                parent.children[oldIndex].classList.remove('active');
            }

            // Highlights first dot
            html = html.replace('%id%', newIndex);

            // Inserts dot at the bottom
            parent.insertAdjacentHTML('beforeend', html);
        },

        deleteDot: function(oldIndex) {
            var dotContainer;

            dotContainer = document.querySelector(DOMstrings.dotContainer);

            // 1. Highlight dot at previous index
            dotContainer.children[oldIndex-1].classList.toggle('active');

            // 2. Delete dot at index
            dotContainer.removeChild(dotContainer.children[oldIndex]);
        },

        switchBudget: function(oldIndex, newIndex) {
            var dotContainer = document.querySelector(DOMstrings.dotContainer).children;
            dotContainer[oldIndex].classList.toggle('active');
            dotContainer[newIndex].classList.toggle('active');
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

        // Returns index of in node hierarchy of element with label 'elementLabel'
        getHTMLElement: function(elementLabel) {
            return document.getElementById(elementLabel);
        },

        // Returns the dimensions of the opposite container of column type.
        getContainerDimensions: function(itemType, refType) {
            var label, element;

            switch(itemType)
            {
                case 'inc': label = DOMstrings.incomeContainer;  break;
                case 'exp': label = DOMstrings.expenseContainer; break;
                default:    label = itemType;
            }

            element = (refType === 'class' ? document.querySelector(label) : document.getElementById(label));

            // label = (type === 'inc' ? DOMstrings.incomeContainer : DOMstrings.expenseContainer);
            // label = (type === 'inc' ? DOMstrings.expenseContainer : DOMstrings.incomeContainer);
            return element.getBoundingClientRect();
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }
})();




var storageController = (function() {

    var storage = {
        string:'data',
        currentIndex: 'current',
        key: 0
    };

    return {
        store: function(data) {
            // 1. Stored in the local storage.
            localStorage.setItem(storage.string, JSON.stringify(data));
        },

        retrieveItems: function() {
            return JSON.parse(localStorage.getItem(storage.string));
        },

        retrieveItem: function(key) {
            return JSON.parse(localStorage.getItem(storage.string + key));
        },

        removeItem: function() {
            localStorage.removeItem(storage.key);
        },

        clearData: function() {
            localStorage.clear();
        },

        isEmpty: function() {
            // return (localStorage.getItem(storage.key) === null ? true : false);
            // console.log(localStorage.length);
            return (localStorage.length > 0 ? false : true);
            
        },
    }

})();




var controller = (function(budgetCtrl, UICtrl, storageCtrl) {

    var draggedItem;

    var setupStorage = function() {
        
        if(!storageCtrl.isEmpty())
        {  
            // 1. Retrieve budget items from localStorage
            var data = storageCtrl.retrieveItems();
            budgetCtrl.setData(data);

            // 2. Draw dots
            data.budgets.forEach(function(budget, index) {
                UICtrl.displayDot(index-1, index);
            });
            
            // 3. Display budget
            UICtrl.displayBudget(budgetCtrl.getBudget());

            // 4. Display all exp/inc items
            addAllItems('inc', data.budgets[data.current].data);
            addAllItems('exp', data.budgets[data.current].data);

            updatePercentages();
        }
        else
        {
            ctrlAddBudget();
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
            // else if (event.keyCode === 109 || event.which === 109)
            // {
            //     storageCtrl.clearData();
            // }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.getElementById(DOM.budgetAddBtn).addEventListener('click', ctrlAddBudget);
        document.getElementById(DOM.budgetDelBtn).addEventListener('click', ctrlDelBudget);

        // a) Arrows (left, right) selected.
        document.querySelectorAll(DOM.arrowBtn).forEach(function(element) {
            element.addEventListener('click', ctrlSlide);
        });

        // DRAGOVER
        document.querySelector(DOM.container).addEventListener('dragstart', ctrlDragItem);
        // document.querySelector(DOM.container).addEventListener('drop', drop);
        document.querySelector(DOM.container).addEventListener('dragend', ctrlToggleItem);
        document.querySelector(DOM.container).addEventListener('dragend', ctrlRearrangeItem);

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

    var getIndex = function(min, max, elements, category) {
        var action = function(a, b) {
            return (a < b ? true : false);
        };

        var res, index, itemRect;

        res = -1;
        index = min;
        // console.log(res, index, max);

        // Loops until position is found or all possible positions have been considered.
        while( index < max && res === -1)
        {
            // 2. Get element's coordinates
            itemRect = elements[index].getBoundingClientRect();

            // 3. a) Check if potential positions are below or above, b) then determine whether position is found
            if( category === 0 ? action( event.y, itemRect.bottom ) : (action( itemRect.top, event.y ) && action( event.y, itemRect.bottom) ) )
            {
                res = index;
            }

            index++;
        }

        return res;
    };


    var addAllItems = function(type, data) {
        for(var i=0; i < data.allItems[type].length; i++)
        {
            UICtrl.addListItem(data.allItems[type][i], type);
        }
    };


    var ctrlAddItem = function() {
        // 1. Get the filed input data.
        var input = UICtrl.getInput();

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
            storageCtrl.store(budgetCtrl.getBudgets());
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
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Update and show percentages.
            updatePercentages();

            // 5. Store data in localstorage
            storageCtrl.store(budgetCtrl.getBudgets());
        }
    };

    var ctrlAddBudget = function() {
        var oldIndex, newIndex;

        // 1. Get currently selected budget index
        oldIndex = budgetCtrl.getCurrentBudgetID();

        // TODO: if there is an existing budget, I need to store it in the datastructure and remove the incoming lines

        // 2. Create budget in data structure
        budgetCtrl.addBudget();

        // 3. Display budget in UI
        UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        });

        // 4. Get new index from newly generated budget
        newIndex = budgetCtrl.getCurrentBudgetID();

        // 5. Display dots & arrows in UI
        UICtrl.displayDot(oldIndex, newIndex);

        // 6. Clear data items from previous UI budget
        UICtrl.deleteList('inc');
        UICtrl.deleteList('exp');

        // 7. Store it in localStorage
        storageCtrl.store(budgetCtrl.getBudgets())
    };

    var ctrlDelBudget = function() {
        var oldIndex = budgetCtrl.getCurrentBudgetID();

        // 1. Update datastructure
        budgetCtrl.deleteBudget();

        // 2. Update Budget
        updateBudget();

        // 3. Update UI
        UICtrl.deleteList('inc');
        UICtrl.deleteList('exp');

        // 4. Draw new items
        data = budgetCtrl.getData();
        addAllItems('inc', data);
        addAllItems('exp', data);

        // 5. Delete Dots
        UICtrl.deleteDot(oldIndex);

        // 3. Update localStorage
        storageCtrl.store(budgetCtrl.getBudgets());


    };

    // TODO: delete all budgets with all its elements;
    var ctrlClearAll = function(event) {
        // 1. Remove/Empty the datastructure in the budget controller
        budgetController.clearItems();

        // 2. Update UI items
        UICtrl.deleteList('inc');
        UICtrl.deleteList('exp');

        // 3. Update and show budget
        updateBudget();

        // 4. Clear local storage
        storageCtrl.clearData();
    };

    var ctrlSlide = function(event) {
        var elementID, operation, oldIndex, newIndex;
        // 1. Get element that was clicked
        elementID = event.target.id;
        operation = (elementID === 'next' ? 1 : -1);

        // 2. Update and get indices from datastructure
        oldIndex = budgetCtrl.getCurrentBudgetID();
        budgetCtrl.updateIndex(operation);
        newIndex = budgetCtrl.getCurrentBudgetID();

        // 3. Display on screen
        UICtrl.switchBudget(oldIndex, newIndex);

        // 4. Display updated budget
        updateBudget();

        // 5. Remove items
        UICtrl.deleteList('inc');
        UICtrl.deleteList('exp');

        // 6. Draw new items
        data = budgetCtrl.getData();
        addAllItems('inc', data);
        addAllItems('exp', data);

        // 7. Update percentages
        updatePercentages();

        // TODO: STORE IN LOCALSTORAGE, ENSURE IT IS THE SAME SCREEN WHEN RETRIEVED
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
            rect: {
                x: event.x,
                y: event.y,
            }
        }
    };

    // Event when it drops check square window
    var ctrlToggleItem = function(event) {
        // console.log(event);
        var rect, inversedType;

        // 1. Get type of the container where item is dropped (inc/exp)
        inversedType = (draggedItem.type === 'inc' ? 'exp' : 'inc');

        // 2. Get dimensions of the container where item is dropped.
        rect = UICtrl.getContainerDimensions(inversedType, 'class');

        // Check Square dropped within the opposite container
        if(event.x >= rect.left && event.x <= rect.right  &&
           event.y >= rect.top  && event.y <= rect.bottom
          )
        {
            // 1. Switch item in the data structure. Returns the item in the opposite column
            var newItem = budgetCtrl.switchItem(draggedItem.type, draggedItem.ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(draggedItem.type + '-' + draggedItem.ID);

            // 3. Add the item to the UI dropped column
            UICtrl.addListItem(newItem, inversedType);

            // 4. Update and show the new budget
            updateBudget();

            // 5. Update and show percentages.
            updatePercentages();

            // 6. Store data in localstorage
            storageCtrl.store(budgetCtrl.getBudgets());
        }
    };

    // Event when dropped on same container but above or below its original position in the item list.
    var ctrlRearrangeItem = function(event) {
        var typeRect;

        // 1. Get dimensions of the container where item is dropped
        typeRect = UICtrl.getContainerDimensions(draggedItem.type, 'class');

        // 2. Check if item is dropped within the its same container
        if(event.x >= typeRect.left && event.x <= typeRect.right  &&
            event.y >= typeRect.top  && event.y <= typeRect.bottom
           )
         {
            var element, source, max, min, res;

            // 3. Check if the element's dropping y-coordinate is smaller than its original y-coordinate position
            if( event.y < draggedItem.rect.y )
            {
                // 4. Get index of element who's position is to be swapped with.
                console.log('Below');
                element = UICtrl.getHTMLElement(draggedItem.type + '-' + draggedItem.ID);
                max = [].indexOf.call(element.parentNode.children, element);
                min = 0;
                res = getIndex(min, max, element.parentNode.children, 0);
                source = max;
            }
            else
            {
                console.log('Above');
                element = UICtrl.getHTMLElement(draggedItem.type + '-' + draggedItem.ID);
                max = budgetCtrl.getData().allItems[draggedItem.type].length;
                min = [].indexOf.call(element.parentNode.children, element);
                res = getIndex(min, max, element.parentNode.children, 1);
                source = min;
            }

            // 5. Update data structure
            budgetCtrl.rearrangeOrder(draggedItem.type, source, res);
            myBudgets = budgetCtrl.getBudgets();

            // 6. Delete current lists
            UICtrl.deleteList(draggedItem.type);

            // 7. Display newly-ordered budget
            addAllItems(draggedItem.type, myBudgets.budgets[myBudgets.current].data);

            // 8. Update percentages
            updatePercentages();

            // 8. Store data in localstorage
            storageCtrl.store(myBudgets);
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