const SYMBOL_START = "(Start)";
const SYMBOL_END = "(End)";

const chain = {
    /**
     * Create a new, empty chain
     * @param {Number} order The order of the markov chain
     */
    createChainSet: function (order) {
        // Check order
        if (typeof order !== "number" || isNaN(order) || order < 1) {
            throw new Error("order must be an integer greater than zero");
        }

        return {
            chains: [],

            /**
             * Adds symbols to the markov chain
             * @param {[]} symbols The symbols to add
             */
            addSymbols: function (symbols) {
                for (let i = 0; i <= symbols.length; ++i) {
                    let newChain = [];
                    // Add symbols
                    for (let j = i; j >= i - order; --j) {
                        if (j >= symbols.length) {
                            newChain.push(SYMBOL_END);
                        } else if (j >= 0) {
                            newChain.push(symbols[j]);
                        } else {
                            newChain.push(SYMBOL_START);
                        }
                    }

                    // Add the chain
                    this.chains.push(newChain.reverse());
                }
            },

            bakeChain: function (progressCallback) {
                // Set initial progress
                if (progressCallback) {
                    progressCallback(0);
                }

                let p = {};
                // Create probabilities
                let progressValue = 0;
                let progressTotal = this.chains.length;
                this.chains.forEach(function (chain) {
                    let key = chain.slice(0, -1);
                    let value = chain.slice(-1);
                    // Create key if not in p
                    if (p[key] === undefined) {
                        p[key] = {};
                    }

                    // Create value if not yet created
                    if (p[key][value] === undefined) {
                        p[key][value] = 0;
                    }

                    // Increment value
                    p[key][value] += 1;

                    // Call progress callback
                    progressValue += 1;
                    if (progressCallback) {
                        progressCallback(progressValue / progressTotal);
                    }
                });

                return chain.loadBakedChain({ p: p, order: order });
            }
        }
    },

    loadBakedChain: function (bakedChain) {
        if (bakedChain === null || bakedChain === undefined) {
            throw Error("bakedChain cannot be null or undefined");
        }

        return {
            data: {
                p: bakedChain.p,
                order: bakedChain.order,
            },

            /**
             * Get a key of length order, given an array of symbols
             * @param {[]} symbols 
             */
            getKeyForSymbols: function (symbols, padStart) {
                let orderKey = symbols.slice();
                // Pad start with start symbols
                if (padStart) {
                    while (orderKey.length < this.data.order) {
                        orderKey.splice(0, 0, SYMBOL_START);
                    }
                } else if (orderKey.length === 0) {
                    orderKey.push(SYMBOL_START);
                }

                // Trim key down to order length
                while (orderKey.length > this.data.order) {
                    orderKey = orderKey.slice(1);
                }

                return orderKey;
            },

            /**
             * Generate the next symbol, given a key
             * @param {[]} symbols
             */
            generateNextSymbol: function (symbols) {
                let p = this.data.p;
                let key = this.getKeyForSymbols(symbols, true);
                // Check p for key
                if (p[key] === undefined) {
                    return SYMBOL_END;
                }

                let pKeys = Object.keys(p[key]);
                // Find total of values for key
                let valueTotal = 0;
                pKeys.forEach(function (value) {
                    valueTotal += p[key][value];
                });

                // Generate a random value
                let randomValue = Math.random() * valueTotal;
                // Find the random value
                let runningTotal = 0;
                for (let i = 0; i < pKeys.length; ++i) {
                    let value = pKeys[i];
                    runningTotal += p[key][value];
                    if (runningTotal >= randomValue) {
                        return value;
                    }
                }

                // Return end if no key was found
                return SYMBOL_END;
            },

            /**
             * Get the possibilities for an array of symbols
             * @param {[]} symbols 
             */
            getPossibilitiesForSymbols: function (symbols) {
                let orderKey = this.getKeyForSymbols(symbols, true);
                return this.data.p[orderKey];
            },

            generateNewChain: function () {
                let chain = [];
                // Init key
                let key = [];

                // Generate new symbols
                while (true) {
                    let value = this.generateNextSymbol(key);
                    // Add the value to the key
                    key.push(value);
                    // Trim the key if it is longer than the order
                    while (key.length > this.data.order) {
                        key = key.slice(1);
                    }

                    // Add the value to the chain
                    if (value === SYMBOL_END) {
                        break;
                    } else {
                        chain.push(value);
                    }
                }

                return chain;
            }
        }
    },
};