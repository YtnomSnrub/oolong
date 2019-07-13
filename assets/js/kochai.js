(function () {
    let bakedChain = null;
    let textCurrentData = document.getElementById("TextCurrentData");
    // Setup chain options
    let inputOrder = document.getElementById("InputLoadOrder");
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
        // Load the contents asyncronously
        // Get options
        let chainOptions = getChainOptions();
        // Create chain
        let chainSet = chain.createChainSet(chainOptions.order);
        // Add words to chain
        let symbols = [];
        if (chainOptions.splitType === "sentences") {
            // Split on lines
            content.split(/[\\.!?]/).forEach(function (sentence) {
                let sentenceWords = sentence.match(/\b(\w+)\b/g);
                if (sentenceWords !== null) {
                    symbols.push(sentenceWords);
                    console.log(sentenceWords);
                }
            });
        } else if (chainOptions.splitType === "lines") {
            // Split on lines
            symbols = content.split(/\r?\n/);
        } else {
            // Split on words
            symbols = content.match(/\b(\w+)\b/g);
        }

        sourceContent = {};
        // Iterate through content words
        symbols.forEach(function (word) {
            // Add word to chain
            chainSet.addSymbols(word);
            // Add word to source
            sourceContent[word] = true;
        });

        // Bake the chain
        bakedChain = chainSet.bakeChain();
        // Set current data
        textCurrentData.innerHTML = dataSource;
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
        }

        // Load the chain from the file
        loadChainFromUploadedFile();
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
            readFileContent(file).then(content => {
                updateBakedChain(content, file.name);
            }).catch(error => console.log(error));
        }
    }

    function readFileContent(file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsText(file);
        });
    }

    // Setup text loading
    let inputUploadText = document.getElementById("InputUploadText");
    let buttonLoadFromText = document.getElementById("ButtonLoadText");
    buttonLoadFromText.addEventListener("click", loadChainFromText);
    function loadChainFromText() {
        updateBakedChain(inputUploadText.value, "Custom Text");
    }

    // Setup generation
    function setGenerateContent(content, newClass) {
        textGeneratedWord.classList.add("hidden");
        // Wait for hidden animation
        setTimeout(function () {
            // Remove old classes
            textGeneratedWord.classList.remove("text-generated-placeholder");
            textGeneratedWord.classList.remove("text-generated-error");
            // Add new class
            if (newClass !== null && newClass !== undefined) {
                textGeneratedWord.classList.add(newClass);
            }

            // Set content
            textGeneratedWord.innerHTML = content;
            textGeneratedWord.classList.remove("hidden");
        }, 150);
    }

    let isFinished = false;
    let textGeneratedWord = document.getElementById("TextGeneratedWord");
    let buttonGenerateWord = document.getElementById("ButtonGenerateWord");
    buttonGenerateWord.addEventListener("click", generateWord);
    function generateWord() {
        isFinished = true;
        // Check baked chain
        if (bakedChain === null || bakedChain === undefined) {
            setGenerateContent("No loaded data", "text-generated-error");
        } else {
            let options = getChainOptions();
            // Generate a new chain
            let newContent = null;
            let generationAttempts = 0;
            while (newContent === null) {
                newContent = bakedChain.generateNewChain().join("");
                // Check source content
                if (options.skipDuplicates) {
                    if (newContent in sourceContent) {
                        newContent = null;
                    }
                }

                // Check attempts
                generationAttempts += 1;
                if (generationAttempts >= 100000) {
                    break;
                }
            }

            setGenerateContent(newContent);
        }

        // Clear table
        tableKeyValues.innerHTML = "";
    }

    // Setup reset
    let buttonGenerateReset = document.getElementById("ButtonGenerateReset");
    buttonGenerateReset.addEventListener("click", generateReset);
    function generateReset() {
        isFinished = false;
        setGenerateContent("Kochai", "text-generated-placeholder");
        // Clear table
        tableKeyValues.innerHTML = "";
    }

    // Setup step
    let tableKeyValues = document.getElementById("TableKeyValues");
    let buttonGenerateStep = document.getElementById("ButtonGenerateStep");
    buttonGenerateStep.addEventListener("click", generateStep);
    function generateStep() {
        if (isFinished) {
            throw new Error("Cannot step when chain is finished");
        }

        // Check baked chain
        if (bakedChain === null || bakedChain === undefined) {
            isFinished = true;
            setGenerateContent("No loaded data", "text-generated-error");
        } else {
            // Get content
            let content = textGeneratedWord.innerHTML;
            if (textGeneratedWord.classList.contains("text-generated-error") ||
                textGeneratedWord.classList.contains("text-generated-placeholder")) {
                content = "";
            }

            let key = content.split("");
            // Handle next possibilities
            let keyValues = bakedChain.getPossibilitiesForKey(key);
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
                setGenerateContent(content + nextSymbol);
            } else {
                isFinished = true;
            }

            // Add headings to table
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