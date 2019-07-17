(function () {
    "use strict";
    // Setup buttons
    let numberButtons = [];
    let numberAddButtons = document.getElementsByClassName("input-number-add");
    for (let i = 0; i < numberAddButtons.length; ++i) {
        numberButtons.push(numberAddButtons[i]);
    }

    let numberSubtractButtons = document.getElementsByClassName("input-number-subtract");
    for (let i = 0; i < numberSubtractButtons.length; ++i) {
        numberButtons.push(numberSubtractButtons[i]);
    }

    for (let i = 0; i < numberButtons.length; ++i) {
        let numberButton = numberButtons[i];
        // Setup click listener
        numberButton.addEventListener("click", function () {
            // Find target input
            if (numberButton.hasAttribute("for")) {
                let target = document.getElementById(numberButton.getAttribute("for"));
                if (target) {
                    // Change value
                    let targetValue = parseInt(target.value) || 0;
                    let step = numberButton.getAttribute("step") || 1;
                    if (numberButton.classList.contains("input-number-subtract")) {
                        target.value = targetValue - step;
                    } else {
                        target.value = targetValue + step;
                    }

                    // Fire change event
                    if ("createEvent" in document) {
                        var targetEvent = document.createEvent("HTMLEvents");
                        targetEvent.initEvent("change", false, true);
                        target.dispatchEvent(targetEvent);
                    } else {
                        target.fireEvent("onchange");
                    }
                }
            }
        });
    }
})();