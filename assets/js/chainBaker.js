const chainBaker = {
    createBakedChain: function (content, options) {
        // Create chain
        let chainSet = chain.createChainSet(options.order);
        // Add words to chain
        let symbols = [];
        if (options.splitType === "sentences") {
            // Split on lines
            content.split(/[\\.!?]/).forEach(function (sentence) {
                let sentenceWords = sentence.match(/\b(\w+)\b/g);
                if (sentenceWords !== null) {
                    symbols.push(sentenceWords);
                    console.log(sentenceWords);
                }
            });
        } else if (options.splitType === "lines") {
            // Split on lines
            symbols = content.split(/\r?\n/);
        } else {
            // Split on words
            symbols = content.match(/\b(\w+)\b/g);
        }

        let sourceContent = {};
        // Iterate through content words
        symbols.forEach(function (word) {
            // Add word to chain
            chainSet.addSymbols(word);
            // Add word to source
            sourceContent[word] = true;
        });

        // Bake the chain
        return {
            sourceContent: sourceContent,
            bakedChain: chainSet.bakeChain()
        };
    }
};
