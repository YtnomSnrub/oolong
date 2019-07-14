(function () {
    let bakedChain = null;
    let textCurrentData = document.getElementById("TextCurrentData");
    let textCurrentStatus = document.getElementById("TextCurrentStatus");
    function setTextContent(textElement, content, newClass) {
        if (textElement.innerHTML !== content) {
            textElement.classList.add("hidden");
        }

        // Wait for hidden animation
        setTimeout(function () {
            // Remove old classes
            textElement.classList.remove("text-placeholder");
            textElement.classList.remove("text-success");
            textElement.classList.remove("text-error");
            // Add new class
            if (newClass !== null && newClass !== undefined) {
                textElement.classList.add(newClass);
            }

            // Set content
            textElement.innerHTML = content;
            textElement.classList.remove("hidden");
        }, 150);
    }

    // Setup order options
    let inputOrder = document.getElementById("InputLoadOrder");
    inputOrder.addEventListener("change", function () {
        // Update status
        setTextContent(textCurrentStatus, "Source data out of date", "text-error");
    })

    // Setup chain options
    let optionSkipDuplicates = document.getElementById("OptionCheckboxSkipDuplicate");
    function getChainOptions() {
        return {
            order: parseInt(inputOrder.value),
            skipDuplicates: optionSkipDuplicates.checked,
            splitType: "lines"
        }
    }

    let sourceContent = {};
    function updateBakedChain(content, dataSource) {
        setTextContent(textCurrentData, "No source data loaded");
        setTextContent(textCurrentStatus, "Loading source data");
        bakedChain = null;
        setTimeout(function () {
            // Try to load the content asyncronously
            if (window.Worker) {
                let chainBakerWorker = new Worker("assets/js/workerChainBaker.js");
                chainBakerWorker.postMessage({
                    input: content,
                    options: getChainOptions()
                });

                // Updated data when the worker responds
                chainBakerWorker.onmessage = function (e) {
                    if (e.data) {
                        bakedChain = chain.loadBakedChain(e.data.bakedChain);
                        sourceContent = e.data.sourceContent;
                        // Set current data
                        setTextContent(textCurrentData, dataSource);
                        setTextContent(textCurrentStatus, "Source data up to date", "text-success");
                    } else {
                        // Set error data
                        setTextContent(textCurrentStatus, "Error updating source data", "text-error");
                    }

                    // No longer need worker
                    chainBakerWorker.terminate();
                };
            } else {
                let chainData = chainBaker.createBakedChain(content, getChainOptions());
                sourceContent = chainData.sourceContent;
                bakedChain = chainData.bakedChain;
                // Set current data
                setTextContent(textCurrentData, dataSource);
                setTextContent(textCurrentStatus, "Source data up to date", "text-success");
            }
        }, 250);
    }

    // Setup file handler
    let textUploadFile = document.getElementById("InputUploadFileText");
    let buttonUploadFile = document.getElementById("InputUploadFile");
    buttonUploadFile.addEventListener("change", fileUpdated);

    function fileUpdated(event) {
        let target = event.target;
        // Check event files
        if ("files" in target && target.files.length > 0) {
            // Read content from first file
            let file = target.files[0];
            textUploadFile.value = file.name;
            // Load the chain from the file
            loadChainFromUploadedFile();
        } else {
            bakedChain = null;
            // Update status
            textUploadFile.value = "";
            setTextContent(textCurrentData, "No source data loaded");
            setTextContent(textCurrentStatus, "No files selected", "text-error");
        }
    }

    // Setup file loading
    let buttonLoadFromFile = document.getElementById("ButtonLoadFile");
    buttonLoadFromFile.addEventListener("click", loadChainFromUploadedFile);
    function loadChainFromUploadedFile() {
        // Clear text
        inputUploadText.value = "";
        // Check event files
        if ("files" in buttonUploadFile && buttonUploadFile.files.length > 0) {
            // Read content from first file
            let file = buttonUploadFile.files[0];
            const reader = new FileReader();
            // Setup read events
            reader.onload = function (event) {
                updateBakedChain(event.target.result, file.name);
            };

            // Setup error handling
            reader.onerror = function (error) {
                console.error(error);
                // Update status
                textUploadFile.value = "";
                setTextContent(textCurrentStatus, "Could not load file", "text-error");
            };

            // Read file as text
            reader.readAsText(file);
        } else {
            // Update status
            textUploadFile.value = "";
            setTextContent(textCurrentStatus, "No files selected", "text-error");
        }
    }

    // Setup text loading
    let inputUploadText = document.getElementById("InputUploadText");
    inputUploadText.addEventListener("change", function () {
        // Update status
        setTextContent(textCurrentStatus, "Source data out of date", "text-error");
    })

    let buttonLoadFromText = document.getElementById("ButtonLoadText");
    buttonLoadFromText.addEventListener("click", loadChainFromText);
    function loadChainFromText() {
        updateBakedChain(inputUploadText.value, "Custom Text");
    }

    let isFinished = false;
    let textGeneratedWord = document.getElementById("TextGeneratedWord");
    let buttonGenerateWord = document.getElementById("ButtonGenerateWord");
    buttonGenerateWord.addEventListener("click", generateWord);
    function generateWord() {
        generateSetFinished(true);
        textGeneratedWord.classList.add("hidden");

        // Clear table
        pageKeyValues.classList.add("hidden");
        setTimeout(function () {
            tableKeyValues.innerHTML = "";
        }, 150);

        // Check baked chain
        if (bakedChain === null || bakedChain === undefined) {
            setTextContent(textGeneratedWord, "No loaded data", "text-error");
        } else {
            let options = getChainOptions();
            // Generate a new chain
            if (window.Worker) {
                let chainGeneratorWorker = new Worker("assets/js/workerChainGenerator.js");
                chainGeneratorWorker.postMessage({
                    bakedChain: { p: bakedChain.p, order: bakedChain.order },
                    sourceContent: sourceContent,
                    options: getChainOptions()
                });

                // Updated data when the worker responds
                chainGeneratorWorker.onmessage = function (e) {
                    if (e.data !== null) {
                        let newContent = e.data.output;
                        if (newContent !== null) {
                            setTextContent(textGeneratedWord, newContent);
                        } else {
                            setTextContent(textGeneratedWord, "No unique generations", "text-error");
                        }
                    } else {
                        // Set error data
                        setTextContent(textGeneratedWord, "Error", "text-error");
                    }

                    // No longer need worker
                    chainGeneratorWorker.terminate();
                };
            } else {
                let newContent = chainGenerator.generateNewChain(bakedChain, sourceContent, options);
                if (newContent !== null) {
                    setTextContent(textGeneratedWord, newContent);
                } else {
                    setTextContent(textGeneratedWord, "No unique generations", "text-error");
                }
            }
        }
    }

    // Setup finished and not finished states
    function generateSetFinished(finished) {
        isFinished = finished;
        // Set button state
        buttonGenerateStep.disabled = isFinished;
    }

    // Setup reset
    let buttonGenerateReset = document.getElementById("ButtonGenerateReset");
    buttonGenerateReset.addEventListener("click", generateReset);
    function generateReset() {
        generateSetFinished(false);
        setTextContent(textGeneratedWord, "Oolong", "text-placeholder");
        // Clear table
        pageKeyValues.classList.add("hidden");
        setTimeout(function () {
            tableKeyValues.innerHTML = "";
        }, 150);
    }

    // Setup step
    let pageKeyValues = document.getElementById("PageContentTableValues");
    let textKey = document.getElementById("TextKey");
    let tableKeyValues = document.getElementById("TableKeyValues");
    let buttonGenerateStep = document.getElementById("ButtonGenerateStep");
    buttonGenerateStep.addEventListener("click", generateStep);
    function generateStep() {
        if (isFinished) {
            throw new Error("Cannot step when chain is finished");
        }

        // Check baked chain
        if (bakedChain === null || bakedChain === undefined) {
            generateSetFinished(true);
            setTextContent(textGeneratedWord, "No loaded data", "text-error");
        } else {
            // Get content
            let content = textGeneratedWord.innerHTML;
            if (textGeneratedWord.classList.contains("text-error") ||
                textGeneratedWord.classList.contains("text-placeholder")) {
                content = "";
            }

            let key = bakedChain.getKeyForSymbols(content.split(""), false);
            textKey.innerHTML = key.join("");
            // Handle next possibilities
            let keyValues = bakedChain.getPossibilitiesForSymbols(key);
            let values = [];
            // Find total value
            let totalValue = 0;
            Object.keys(keyValues).forEach(function (value) {
                values.push({ symbol: value, amount: keyValues[value] });
                totalValue += keyValues[value];
            });

            // Sort values
            values = values.sort(function (v1, v2) {
                return v2.amount - v1.amount;
            });

            // Generate next symbol
            let nextSymbol = bakedChain.generateNextSymbol(key);
            if (nextSymbol !== SYMBOL_END) {
                setTextContent(textGeneratedWord, content + nextSymbol);
            } else {
                generateSetFinished(true);
            }

            // Add headings to table
            pageKeyValues.classList.remove("hidden");
            tableKeyValues.innerHTML = "";
            let headingRow = document.createElement("tr");
            tableKeyValues.appendChild(headingRow);
            let headingSymbol = document.createElement("th");
            headingSymbol.appendChild(document.createTextNode("Symbol"));
            headingRow.appendChild(headingSymbol);
            let headingAmount = document.createElement("th");
            headingAmount.appendChild(document.createTextNode("Chance"));
            headingRow.appendChild(headingAmount);
            // Add values to table
            values.forEach(function (value) {
                // Create new row
                let valueRow = document.createElement("tr");
                tableKeyValues.appendChild(valueRow);
                if (value.symbol === nextSymbol) {
                    valueRow.classList.add("row-highlight");
                }
                // Add symbol cell
                let cellSymbol = document.createElement("td");
                cellSymbol.appendChild(document.createTextNode(value.symbol));
                valueRow.appendChild(cellSymbol);
                // Add amount cell
                let cellAmount = document.createElement("td");
                let percentage = (value.amount / totalValue) * 100;
                cellAmount.appendChild(document.createTextNode(percentage.toFixed(2) + "%"));
                valueRow.appendChild(cellAmount);
            });
        }
    }
})();