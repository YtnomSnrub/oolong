"use strict";
let accordions = document.getElementsByClassName("accordion-heading");
for (let i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener("click", function () {
        this.classList.toggle("accordion-expanded");
        let accordionPanel = this.nextElementSibling;
        if (this.classList.contains("accordion-expanded")) {
            accordionPanel.style.maxHeight = accordionPanel.scrollHeight + "px";
        } else {
            accordionPanel.style.maxHeight = null;
        }
    });
}