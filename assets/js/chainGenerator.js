const chainGenerator = {
    generateNewChain: function (bakedChain, sourceContent, options) {
        let newContent = null;
        // Generate a new chain
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
            if (generationAttempts >= 10000) {
                break;
            }
        }

        return newContent;
    }
};
