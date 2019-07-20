importScripts("chain.js");
importScripts("chainBaker.js");

onmessage = function (e) {
    try {
        let pastProgress = null;
        let chainData = chainBaker.createBakedChain(e.data.input, e.data.options, function (progress) {
            let sendProgress = progress.toFixed(3);
            // Check progress
            if (sendProgress !== pastProgress) {
                pastProgress = sendProgress;
                // Send message
                this.postMessage({
                    messageType: "progress",
                    progress: sendProgress
                });
            }
        });

        // Post finished message
        this.postMessage({
            messageType: "finished",
            bakedChainData: chainData.bakedChain.data,
            sourceContent: chainData.sourceContent
        });
    } catch (ex) {
        this.console.error(ex);
        this.postMessage(null);
    }
}