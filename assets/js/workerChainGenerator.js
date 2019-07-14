importScripts("chain.js");
importScripts("chainGenerator.js");

onmessage = function (e) {
    try {
        let bakedChain = chain.loadBakedChain(e.data.bakedChain);
        let output = chainGenerator.generateNewChain(bakedChain, e.data.sourceContent, e.data.options);
        this.postMessage({
            output: output
        });
    } catch (ex) {
        this.console.error(ex);
        this.postMessage(null);
    }
}