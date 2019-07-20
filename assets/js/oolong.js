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
        // Check validity
        orderValue = parseInt(inputOrder.value);
        if (!orderValue || orderValue < 1) {
            orderValue = 1;
        }

        inputOrder.value = orderValue;
        // Update status
        setTextContent(textCurrentStatus, "Source data out of date", "text-error");
    });

    // Setup input type options
    let inputSplitTypeRadios = document.getElementsByName("inputloadsplittype");
    for (let inputTypeIndex = 0; inputTypeIndex < inputSplitTypeRadios.length; ++inputTypeIndex) {
        let inputSplitTypeRadio = inputSplitTypeRadios[inputTypeIndex];
        inputSplitTypeRadio.addEventListener("change", function () {
            // Update status
            setTextContent(textCurrentStatus, "Source data out of date", "text-error");
        });
    }

    // Setup chain options
    let optionSkipDuplicates = document.getElementById("OptionCheckboxSkipDuplicate");
    function getChainOptions() {
        // Find the input split type
        let inputSplitType = null;
        for (let i = 0, length = inputSplitTypeRadios.length; i < length; i++) {
            // Check the radio
            if (inputSplitTypeRadios[i].checked) {
                inputSplitType = inputSplitTypeRadios[i].value;
                break;
            }
        }

        return {
            order: parseInt(inputOrder.value),
            skipDuplicates: optionSkipDuplicates.checked,
            joinString: inputSplitType === "sentences" ? " " : "",
            splitType: inputSplitType
        }
    }

    // Setup loading dialog
    let dialogLoadChain = document.getElementById("DialogLoadChain");
    let dialogLoadChainFilename = document.getElementById("DialogLoadChainFilename");
    // Setup chain baking
    let sourceContent = {};
    function updateBakedChain(content, dataSource, dataValue) {
        setTextContent(textCurrentData, "No source data loaded");
        setTextContent(textCurrentStatus, "Loading source data");
        bakedChain = null;
        setTimeout(function () {
            // Try to load the content asyncronously
            if (window.Worker) {
                // Open dialog
                dialogLoadChain.openDialog();
                dialogLoadChainFilename.innerHTML = dataValue;

                // Setup worker
                let chainBakerWorker = new Worker("assets/js/workerChainBaker.js");
                // Update data when the worker responds
                chainBakerWorker.onmessage = function (e) {
                    if (e.data) {
                        bakedChain = chain.loadBakedChain(e.data.bakedChainData);
                        sourceContent = e.data.sourceContent;
                        // Set current data
                        setTextContent(textCurrentData, dataSource + ": " + dataValue);
                        setTextContent(textCurrentStatus, "Source data up to date", "text-success");
                    } else {
                        // Set error data
                        setTextContent(textCurrentStatus, "Error updating source data", "text-error");
                    }

                    // No longer need worker
                    chainBakerWorker.terminate();
                    // Close dialog
                    setTimeout(dialogLoadChain.closeDialog, 200);
                };

                // Send message to worker
                setTimeout(function () {
                    let messageObject = { input: content, options: getChainOptions() };
                    chainBakerWorker.postMessage(messageObject);
                }, 200);
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

    // Setup preset handler
    let dialogPreset = document.getElementById("DialogPresetSelect");
    let buttonLoadPreset = document.getElementById("ButtonLoadPreset");
    buttonLoadPreset.addEventListener("click", function () {
        dialogPreset.openDialog();
    });

    // Setup preset click
    let presetSelectItems = document.getElementsByClassName("preset-select-item");
    for (let presetSelectIndex = 0; presetSelectIndex < presetSelectItems.length; presetSelectIndex++) {
        let presetSelectItem = presetSelectItems[presetSelectIndex];
        presetSelectItem.addEventListener("click", function () {
            // Close the dialog
            dialogPreset.closeDialog();

            // Clear text
            inputUploadText.value = "";
            // Get the file name for the item  
            let filePath = presetSelectItem.getAttribute("data-preset-file-path");
            let fileName = presetSelectItem.getAttribute("data-preset-file-name");
            let presetType = presetSelectItem.getAttribute("data-preset-type");
            let dataValue = presetType + " - " + fileName;
            let fileRequest = new XMLHttpRequest();
            fileRequest.open('GET', filePath, true);
            fileRequest.onreadystatechange = function () {
                if (fileRequest.readyState === 4 && fileRequest.status === 200) {
                    updateBakedChain(fileRequest.responseText, "Preset", dataValue);
                } else if (fileRequest.status !== 200) {
                    console.error("Error loading preset");
                    bakedChain = null;
                    // Close the dialog
                    dialogLoadChain.closeDialog();
                    // Update status
                    setTextContent(textCurrentData, "No source data loaded");
                    setTextContent(textCurrentStatus, "Could not load preset", "text-error");
                }
            };

            // Open dialog
            dialogLoadChain.openDialog();
            dialogLoadChainFilename.innerHTML = dataValue;

            fileRequest.send();
        });
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
            let reader = new FileReader();
            // Setup read events
            reader.onload = function (event) {
                updateBakedChain(event.target.result, "File", file.name);
            };

            // Setup error handling
            reader.onerror = function (error) {
                console.error(error);
                bakedChain = null;
                // Update status
                textUploadFile.value = "";
                setTextContent(textCurrentStatus, "Could not load file", "text-error");
                // Close dialog
                dialogLoadChain.closeDialog();
                // Update status
                setTextContent(textCurrentData, "No source data loaded");
                setTextContent(textCurrentStatus, "No files selected", "text-error");
            };

            // Open dialog
            dialogLoadChain.openDialog();
            dialogLoadChainFilename.innerHTML = file.name;

            // Read file as text
            reader.readAsText(file);
        } else {
            bakedChain = null;
            // Update status
            textUploadFile.value = "";
            setTextContent(textCurrentData, "No source data loaded");
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
        updateBakedChain(inputUploadText.value, "Text", inputUploadText.value.slice(0, 20));
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

                // Send message to worker
                setTimeout(function () {
                    let messageObject = {
                        bakedChain: bakedChain.data,
                        sourceContent: sourceContent,
                        options: getChainOptions()
                    };

                    chainGeneratorWorker.postMessage(messageObject);
                }, 200);
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
            let options = getChainOptions();
            // Get content
            let content = textGeneratedWord.innerHTML;
            if (textGeneratedWord.classList.contains("text-error") ||
                textGeneratedWord.classList.contains("text-placeholder")) {
                content = "";
            }

            let contentSplit = content.length > 0 ? content.split(options.joinString) : [];
            let key = bakedChain.getKeyForSymbols(contentSplit, false);
            textKey.innerHTML = key.join(options.joinString);
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
                if (content.length > 0) {
                    setTextContent(textGeneratedWord, content + options.joinString + nextSymbol);
                } else {
                    setTextContent(textGeneratedWord, nextSymbol);
                }
            } else {
                generateSetFinished(true);
            }

            // Add headings to table
            pageKeyValues.classList.remove("hidden");
            tableKeyValues.innerHTML = "";
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