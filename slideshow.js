// TODO:
//      Make the images switch automatically.


var slideController = (function() {
    var galery = {
        image: [0,1,2,3],
        index: 0,
    };

    var set = function(i) {
        if(i < 0)
        {
            galery.index = galery.image.length-1;
        }
        else if ( i == galery.image.length )
        {
            galery.index = 0;
        }
        else
        {
            galery.index = i;
        }
    };

    return {
        addToIndex: function(operation) {
            var res = galery.index + operation;
            set(res);
            
        },

        setIndex: function(pos) {
            set(pos);
        },

        getImageIndex: function() {
            return galery.image[galery.index];
        },
    };


})();

var UIController = (function() {

    var DOMstrings = {
        topContainer: '.top',
        leftArrowLabel: '.left',
        rightArrowLabel: '.right',
        arrowBtn: '.arrow__btn',
        slideBtn: '.dot',
        dotContainer: '.dot__container',
    };

    var ImageStrings = ['back.png', 'pond.jpeg', 'wood.jpeg', 'road.jpeg'];

    var assetsPath = 'assets/'

    return {
        setup: function() {
            var html, myState;

            myState = "active";

            document.querySelector(DOMstrings.topContainer).style.backgroundImage = "url("+assetsPath+ImageStrings[0]+")";

            for(var i=0; i < ImageStrings.length; i++)
            {
                html = '<span class="dot %active%" id="dot-%id%"></span>';

                html = html.replace('%id%', i);
                // Highlights first dot
                html = html.replace('%active%', (i === 0 ? 'active' : ''));
                // Inserts dot at the bottom
                document.querySelector(DOMstrings.dotContainer).insertAdjacentHTML('beforeend', html);
            }
        },

        switch: function(oldIndex, newIndex) {
            // 1. Switch Image
            document.querySelector(DOMstrings.topContainer).style.backgroundImage = "url("+assetsPath+ImageStrings[newIndex]+")";

            // 2. Update dot
            document.getElementById('dot-'+oldIndex).classList.toggle('active');
            document.getElementById('dot-'+newIndex).classList.toggle('active');
        },

        getDOMstrings: function() {
            return DOMstrings;
        },
    }
})();


var appController = (function(slideCtrl, UIctrl) {

    var setEventListeners = function() {
        var DOM = UIctrl.getDOMstrings();

        // a) Arrows (left, right) selected.
        document.querySelectorAll(DOM.arrowBtn).forEach(function(element) {
            element.addEventListener('click', slide);
        });

        // b) Dots selected
        document.querySelectorAll(DOM.slideBtn).forEach(function(element) {
            element.addEventListener('click', slideTo);
        });

        // c) Drag?
    };

    // Slide left/right by one unit
    var slide = function(event) {
        var elementID, operation, newIndex;
        // 1. Get element that was clicked
        elementID = event.target.id;
        operation = (elementID === 'next' ? 1 : -1);

        // 2. Update and get indices from the datastructure
        oldIndex = slideCtrl.getImageIndex();
        slideCtrl.addToIndex(operation);
        newIndex = slideCtrl.getImageIndex();

        // 3. Display on screen
        UIctrl.switch(oldIndex, newIndex);
    };

    // Slide to image in unit
    var slideTo = function(event) {
        var elementID;
        // 1. Get element clicked
        elementID = event.target.id;
        splitID = elementID.split('-');
        id = parseInt(splitID[1]);

        // 2. Get current element index
        currentIndex = slideCtrl.getImageIndex();

        // 3. Check if element is not active
        if(currentIndex !== id)
        {
            // 4. Update and get indices from the datastructure
            slideCtrl.setIndex(id);

            // 5. Display on screen
            UIctrl.switch(currentIndex, id);
        }
    };

    var autoSlide = function() {
        var currentIndex, newIndex;

        // 1. Get current index
        currentIndex = slideCtrl.getImageIndex();

        // 2. Update current index/datastructure
        slideCtrl.addToIndex(1);

        // 3. Get new index
        newIndex = slideCtrl.getImageIndex();

        // 3. Switch in UI
        UIctrl.switch(currentIndex, newIndex);

        setTimeout(autoSlide, 3000);
    };

    return {
        init: function() {
            // Display initial Image
            UIctrl.setup();
            setEventListeners();;
            autoSlide();
        },
    }

})(slideController, UIController);


appController.init()