importScripts("chain.js");
importScripts("chainBaker.js");

onmessage = function (e) {
    try {
        let chainData = chainBaker.createBakedChain(e.data.input, e.data.options);
        this.postMessage({
            bakedChain: {
                p: chainData.bakedChain.p,
                order: chainData.bakedChain.order
            },
            sourceContent: chainData.sourceContent
        });
    } catch (ex) {
        this.console.error(ex);
        this.postMessage(null);
    }
}