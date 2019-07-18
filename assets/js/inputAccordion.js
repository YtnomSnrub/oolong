"use strict";
let accordions = document.getElementsByClassName("accordion-heading");
for (let i = 0; i < accordions.length; i++) {
    let accordion = accordions[i];
    accordions[i].addEventListener("click", function () {
        accordion.classList.toggle("accordion-expanded");
        let accordionPanel = accordion.nextElementSibling;
        // Set the transition-duration
        // accordionPanel.style["transition-duration"] = (accordionPanel.scrollHeight * 0.001 * 0.3) + "s";
        // Expand the accordion panel by setting the max-height
        if (accordion.classList.contains("accordion-expanded")) {
            accordionPanel.style["max-height"] = accordionPanel.scrollHeight + "px";
        } else {
            accordionPanel.style["max-height"] = null;
        }
    });
}