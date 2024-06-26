
// ==UserScript==
// @name         dropdown-select-sa-logwork-jira
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Inject a single-select dropdown list to update a work description in Jira on selection
// @author       Moayad Ismail
// @match        https://hashicorp.atlassian.net/*
// @match        https://hashicorp-sandbox-778.atlassian.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to add the single-select dropdown
    function addElements() {
        var classTag = document.getElementsByClassName("_14nx1u4f _s1t41u4f _13pa1440 _nopz1440 _1fr61440 _uqy11440 _1e0c1txw _4cvr1h6o _1n261q9c _1bah1yb4 _19pk1y44");
        if (classTag.length > 0) {
            var p = classTag[0];

            // Check if the toggle button already exists to prevent adding it multiple times
            if (!document.getElementById('toggle-dropdown')) {
                var toggleBtn = document.createElement("button");
                toggleBtn.id = "toggle-dropdown";
                toggleBtn.innerHTML = "Show/Hide Dropdown";
                toggleBtn.style.marginRight = "10px";
                p.insertAdjacentElement("afterend", toggleBtn);

                var select = document.createElement("select");
                select.id = "activity-dropdown";
                select.size = 17; // Set the size to the number of options to show all without scrolling
                select.style.display = "none"; // Initially hide the dropdown

                var options = [
                    "Account Planning",
                    "Content Creation",
                    "Event or Conference",
                    "External Meeting - Customer Sync",
                    "External Meeting - Demo",
                    "External Meeting - Partner",
                    "External Meeting - Tech Presentation",
                    "External Meeting - Workshop",
                    "Internal Meeting - Customer Sync",
                    "Internal Meeting - Sales Interlock",
                    "Internal Meeting - SE Mentoring",
                    "Internal Meeting - TFO Meeting",
                    "Preparation",
                    "Preparation - Demo",
                    "Preparation - Workshop",
                    "Research",
                    "Self-Development"
                ];

                options.forEach(function(text) {
                    var option = document.createElement('option');
                    option.value = text;
                    option.textContent = text;
                    select.appendChild(option);
                });

                // Add event listener to append the selected option automatically on selection
                select.addEventListener('change', function() {
                    var workDescription = document.getElementsByClassName("ua-chrome ProseMirror pm-table-resizing-plugin");
                    if (workDescription.length > 0) {
                        var selectedOption = select.options[select.selectedIndex].text;
                        var today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
                        var newEntry = `${today} : ${selectedOption} : 1h`;

                        // Get the existing text and split it into lines
                        var currentText = workDescription[0].innerText.trim();
                        var lines = currentText.split('\n');

                        // Filter out any trailing commas from previous entries
                        lines = lines.map(line => line.replace(/,$/, ''));

                        // Add the new entry
                        if (currentText.includes("Activity Entry:")) {
                            lines.push(newEntry);
                        } else {
                            lines = ["Activity Entry:", newEntry];
                        }

                        // Join the lines and add a comma to all but the last entry
                        var updatedText = lines[0]; // Start with the header line
                        for (var i = 1; i < lines.length; i++) {
                            updatedText += (i === lines.length - 1) ? `\n${lines[i]}` : `\n${lines[i]},`;
                        }

                        workDescription[0].innerText = updatedText;

                        // Reset the dropdown to ensure the same selection can be made again
                        select.selectedIndex = -1;
                    }
                });

                p.insertAdjacentElement("afterend", select);

                // Add event listener to the toggle button to show/hide the dropdown
                toggleBtn.onclick = function() {
                    if (select.style.display === "none") {
                        select.style.display = "block";
                    } else {
                        select.style.display = "none";
                    }
                };
            }
        }
    }

    // Create a MutationObserver to watch for changes in the body
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches('.css-1xdxiey')) {
                        addElements(); // Call addElements when the target element is added to the DOM
                    }
                });
            }
        });
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
})();