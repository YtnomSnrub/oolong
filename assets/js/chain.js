const SYMBOL_START = "(Start)";
const SYMBOL_END = "(End)";

const chain = {
    /**
     * Create a new, empty chain
     * @param {Number} order The order of the markov chain
     */
    createChainSet(order) {
        // Check order
        if (!Number.isSafeInteger(order) || order < 1) {
            throw new Error("order must be an integer greater than zero");
        }

        return {
            chains: [],

            /**
             * Adds symbols to the markov chain
             * @param {[]} symbols The symbols to add
             */
            addSymbols(symbols) {
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

            bakeChain() {
                let p = {};
                // Create probabilities
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
                });

                return {
                    p: p,

                    /**
                     * Generate the next symbol, given a key
                     * @param {[]} key 
                     */
                    generateNextSymbol(key) {
                        // Pad start with start symbols
                        while (key.length < order) {
                            key.splice(0, 0, SYMBOL_START);
                        }

                        // Trim key down to order length
                        while (key.length > order) {
                            key = key.slice(1);
                        }

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

                    getPossibilitiesForKey(key) {
                        // Pad start with start symbols
                        while (key.length < order) {
                            key.splice(0, 0, SYMBOL_START);
                        }

                        // Trim key down to order length
                        while (key.length > order) {
                            key = key.slice(1);
                        }

                        // Check p for key
                        if (p[key] === undefined) {
                            return SYMBOL_END;
                        }

                        return p[key];
                    },

                    generateNewChain() {
                        let chain = [];
                        // Init key
                        let key = [];

                        // Generate new symbols
                        while (true) {
                            let value = this.generateNextSymbol(key);
                            // Add the value to the key
                            key.push(value);
                            while (key.length > order) {
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
            }
        }
    },
};