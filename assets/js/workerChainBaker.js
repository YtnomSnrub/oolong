importScripts("chain.js");
importScripts("chainBaker.js");

onmessage = function (e) {
    try {
        let chainData = chainBaker.createBakedChain(e.data.input, e.data.options);
        this.postMessage({
            bakedChainData: chainData.bakedChain.data,
            sourceContent: chainData.sourceContent
        });
    } catch (ex) {
        this.console.error(ex);
        this.postMessage(null);
    }
}