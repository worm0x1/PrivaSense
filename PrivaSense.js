//v3.0
class PrivaSense {
    constructor(options = {}) {
        // Configure which features to enable
        this.features = {
            incognito: options.incognito !== undefined ? options.incognito : true,
            activity: options.activity !== undefined ? options.activity : true,
            storage: options.storage !== undefined ? options.storage : true
        };
        
        // Incognito detection customization
        this.incognitoLabels = {
            normal: options.normalLabel || '✅',
            incognito: options.incognitoLabel || '❌'
        };
        
        // Activity tracking configuration
        this.currentActivity = "Unknown";
        this.accHistory = [];
        this.historyLength = options.historyLength || 100;
        this.walkingThreshold = options.walkingThreshold || 2.0;
        this.activityInitialized = false;
        
        // Auto-initialize if activity is enabled
        if (this.features.activity) {
            this.initActivity();
        }
    }

    /**
     * Activity tracking ইনিশিয়ালাইজ করুন
     */
    async initActivity() {
        if (this.activityInitialized || !this.features.activity) return;
        
        this.startMotionTracking();
        await this.sleep(500);
        this.activityInitialized = true;
    }

    /**
     * সব enabled তথ্য একসাথে পান
     * @returns {Promise<Object>}
     */
    async getInfo() {
        const result = {};
        
        if (this.features.incognito) {
            result.incognito = await this.detectIncognito();
        }
        
        if (this.features.activity) {
            result.activity = await this.getActivity();
        }
        
        if (this.features.storage) {
            result.storage = await this.getStorage();
        }
        
        return result;
    }

    /**
     * Incognito Mode শনাক্ত করুন
     * @returns {Promise<string>} Custom labels based on mode
     */
    async detectIncognito() {
        if (!this.features.incognito) {
            throw new Error('Incognito detection is not enabled. Initialize with { incognito: true }');
        }
        
        const normalLabel = this.incognitoLabels.normal;
        const incognitoLabel = this.incognitoLabels.incognito;
        
        return new Promise((resolve) => {
            let isResolved = false;

            function resolvePrivacy(isPrivate) {
                if (!isResolved) {
                    isResolved = true;
                    resolve(isPrivate ? incognitoLabel : normalLabel);
                }
            }

            function getErrorMessageLength() {
                let errorLength = 0;
                const testNumber = parseInt("-1");
                try {
                    testNumber.toFixed(testNumber);
                } catch (error) {
                    errorLength = error.message.length;
                }
                return errorLength;
            }

            async function checkSafariStorageAPI() {
                try {
                    await navigator.storage.getDirectory();
                    resolvePrivacy(false);
                } catch (error) {
                    const errorMessage = error instanceof Error && typeof error.message === "string" 
                        ? error.message 
                        : String(error);
                    resolvePrivacy(errorMessage.includes("unknown transient reason"));
                }
            }

            async function detectSafari() {
                if (typeof navigator.storage?.getDirectory === "function") {
                    await checkSafariStorageAPI();
                } else {
                    if (navigator.maxTouchPoints !== undefined) {
                        const dbName = String(Math.random());
                        try {
                            const request = indexedDB.open(dbName, 1);
                            
                            request.onupgradeneeded = function(event) {
                                const db = event.target.result;
                                
                                try {
                                    db.createObjectStore("t", { autoIncrement: true }).put(new Blob());
                                    resolvePrivacy(false);
                                } catch (error) {
                                    const errorMessage = error instanceof Error && typeof error.message === "string"
                                        ? error.message
                                        : String(error);
                                    
                                    resolvePrivacy(errorMessage.includes("are not yet supported"));
                                } finally {
                                    db.close();
                                    indexedDB.deleteDatabase(dbName);
                                }
                            };
                            
                            request.onerror = function() {
                                resolvePrivacy(false);
                            };
                        } catch (error) {
                            resolvePrivacy(false);
                        }
                    } else {
                        const openDatabase = window.openDatabase;
                        
                        try {
                            openDatabase(null, null, null, null);
                        } catch (error) {
                            resolvePrivacy(true);
                            return;
                        }
                        
                        resolvePrivacy(false);
                    }
                }
            }

            function detectChrome() {
                function checkStorageQuota() {
                    navigator.webkitTemporaryStorage.queryUsageAndQuota(
                        function(usage, quota) {
                            const quotaMB = Math.round(quota / 1048576);
                            const heapLimit = Math.round(getJSHeapSizeLimit() / 1048576);
                            const expectedQuota = 2 * heapLimit;
                            resolvePrivacy(quotaMB < expectedQuota);
                        },
                        function(error) {
                            resolvePrivacy(false);
                        }
                    );
                }

                function getJSHeapSizeLimit() {
                    return window.performance?.memory?.jsHeapSizeLimit ?? 1073741824;
                }

                if (self.Promise !== undefined && self.Promise.allSettled !== undefined) {
                    checkStorageQuota();
                } else {
                    window.webkitRequestFileSystem(
                        0,
                        1,
                        function() {
                            resolvePrivacy(false);
                        },
                        function() {
                            resolvePrivacy(true);
                        }
                    );
                }
            }

            async function detectFirefox() {
                if (typeof navigator.storage?.getDirectory === "function") {
                    try {
                        await navigator.storage.getDirectory();
                        resolvePrivacy(false);
                    } catch (error) {
                        const errorMessage = error instanceof Error && typeof error.message === "string"
                            ? error.message
                            : String(error);
                        resolvePrivacy(errorMessage.includes("Security error"));
                        return;
                    }
                } else {
                    const request = indexedDB.open("inPrivate");
                    
                    request.onerror = function(event) {
                        if (request.error && request.error.name === "InvalidStateError") {
                            event.preventDefault();
                        }
                        resolvePrivacy(true);
                    };
                    
                    request.onsuccess = function() {
                        indexedDB.deleteDatabase("inPrivate");
                        resolvePrivacy(false);
                    };
                }
            }

            async function detectBrowser() {
                const errorLength = getErrorMessageLength();
                
                if (errorLength === 44 || errorLength === 43) {
                    await detectSafari();
                }
                else if (errorLength === 51) {
                    detectChrome();
                }
                else if (errorLength === 25) {
                    await detectFirefox();
                }
                else {
                    if (navigator.msSaveBlob !== undefined) {
                        resolvePrivacy(window.indexedDB === undefined);
                    } else {
                        resolvePrivacy(false);
                    }
                }
            }

            detectBrowser().catch(() => {
                resolvePrivacy(false);
            });

            setTimeout(() => {
                if (!isResolved) {
                    resolvePrivacy(false);
                }
            }, 1000);
        });
    }

    /**
     * Motion tracking শুরু করুন
     */
    startMotionTracking() {
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (event) => {
                this.handleMotion(event);
            });
        }
    }

    /**
     * Motion event হ্যান্ডেল করুন
     */
    handleMotion(event) {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        this.accHistory.push(magnitude);
        if (this.accHistory.length > this.historyLength) {
            this.accHistory.shift();
        }

        const variance = this.calculateVariance(this.accHistory);
        const isWalking = variance > this.walkingThreshold;

        if (isWalking) {
            this.currentActivity = "Walking or riding";
        } else {
            const pitch = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
            const roll = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);

            if (Math.abs(pitch) > 60 || Math.abs(roll) > 60) {
                this.currentActivity = "Lying down";
            } else {
                this.currentActivity = "Standing or Sitting";
            }
        }
    }

    /**
     * Variance হিসাব করুন
     */
    calculateVariance(arr) {
        if (arr.length === 0) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    }

    /**
     * বর্তমান Activity পান
     * @returns {Promise<string>}
     */
    async getActivity() {
        if (!this.features.activity) {
            throw new Error('Activity detection is not enabled. Initialize with { activity: true }');
        }
        
        if (!window.DeviceMotionEvent) {
            return "Sensor not supported";
        }
        
        return this.currentActivity;
    }

    /**
     * Storage তথ্য পান
     * @returns {Promise<string>}
     */
    async getStorage() {
        if (!this.features.storage) {
            throw new Error('Storage detection is not enabled. Initialize with { storage: true }');
        }
        
        if (navigator.storage && typeof navigator.storage.estimate === 'function') {
            try {
                const storageInfo = await navigator.storage.estimate();
                let totalStorage = (storageInfo.quota / (1024 * 1024 * 1024)).toFixed(2);
                let usedStorage = (storageInfo.usage / (1024 * 1024 * 1024)).toFixed(2);
                
                // Adjust করুন
                usedStorage = this.adjustStorage(parseFloat(usedStorage) * 2);
                totalStorage = this.adjustStorage(parseFloat(totalStorage) * 2);
                
                return usedStorage > 0 
                    ? `${usedStorage} GB / ${totalStorage} GB` 
                    : `${totalStorage} GB`;
            } catch (e) {
                console.error('Error getting storage info:', e);
                return 'Unknown';
            }
        }
        return 'Unknown';
    }

    /**
     * Storage value adjust করুন
     */
    adjustStorage(value) {
        if (value >= 20 && value < 30) return 32;
        if (value >= 50 && value < 70) return 64;
        if (value >= 100 && value < 130) return 128;
        if (value >= 250 && value < 280) return 256;
        return Math.round(value);
    }

    /**
     * Helper function - sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export করুন (যদি module system ব্যবহার করেন)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrivaSense;
}

// Global scope এ available করুন
if (typeof window !== 'undefined') {
    window.PrivaSense = PrivaSense;
}