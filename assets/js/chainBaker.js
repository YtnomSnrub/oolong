const chainBaker = {
    createBakedChain: function (content, options) {
        // Create chain
        let chainSet = chain.createChainSet(options.order);
        // Add words to chain
        let symbols = [];
        if (options.splitType === "sentences") {
            // Split on sentences
            content.split(/[\\.!?]/).forEach(function (sentence) {
                let sentenceWords = sentence.match(/\b(\w+)\b/g);
                if (sentenceWords !== null) {
                    symbols.push(sentenceWords);
                }
            });
        } else if (options.splitType === "lines") {
            // Split on lines
            symbols = content.split(/\r?\n/);
        } else if (options.splitType === "words") {
            // Split on words
            symbols = content.match(/\b(\w+)\b/g);
        } else {
            // Give an error
            throw new Error("splitType must be 'sentences', 'lines', or 'words'.");
        }

        let sourceContent = {};
        // Iterate through content words
        symbols.forEach(function (word) {
            // Add word to chain
            chainSet.addSymbols(word);
            // Add word to source
            if (Array.isArray(word)) {
                sourceContent[word.join(options.joinString)] = true;
            } else {
                sourceContent[word] = true;
            }
        });

        // Bake the chain
        return {
            sourceContent: sourceContent,
            bakedChain: chainSet.bakeChain()
        };
    }
};
