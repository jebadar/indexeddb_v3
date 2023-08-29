const idb = {
    _v: 1,
    db: {},
    get: async function (store_name, id) {
        // store_name -> "local-stores"
        const tr = await this.getDbTr(store_name, "readonly");
        const os = tr.objectStore(store_name);
        return new Promise((resolve, reject) => {
            tr.oncomplete = function () {
                // console.log("ALL GET TRANSACTIONS COMPLETE.");
            };
            tr.onerror = function () {
                console.log("PROBLEM GETTING RECORDS.");
            };
            let request = null;
            // id -> myLocalStores
            if (id) request = os.get(id);
            else request = os.getAll();
            request.onsuccess = function (event) {
                resolve(event.target.result);
            };
        });
    },
    put: async function (store_name, id, data, cb) {
        var self = this;
        if (self.db) {
            const tr = await self.getDbTr(store_name, "readwrite");
            const os = tr.objectStore(store_name);
            return new Promise((resolve, reject) => {
                tr.oncomplete = function () {
                    // console.log("ALL PUT TRANSACTIONS COMPLETE.");
                    resolve(true);
                };
                tr.onerror = function () {
                    console.log("PROBLEM UPDATING RECORDS.");
                    reject(false);
                };

                let request = null;
                if (id != null) request = os.put(data, id);
                else request = os.put(data);
                request.onsuccess = function () {
                    if (typeof cb == "function") cb();
                };
            });
        }
    },
    post: async function (store_name, id, data, cb) {
        var self = this;
        if (self.db) {
            const tr = await self.getDbTr(store_name, "readwrite");
            const os = tr.objectStore(store_name);
            return new Promise((resolve, reject) => {
                tr.oncomplete = function () {
                    // console.log("ALL INSERT TRANSACTIONS COMPLETE.");
                    resolve(true);
                };
                tr.onerror = function () {
                    console.log("PROBLEM INSERTING RECORDS.");
                    resolve(false);
                };
                let request = os.add(data, id);
                request.onsuccess = function () {
                    if (typeof cb == "function") cb();
                };
            });
        }
    },
    getDbTr: async function (store_name, op_type) {
        return new Promise((resolve, reject) => {
            var tr = null;
            var self = this;
            // open a read/write db transaction, ready for adding the data
            try {
                tr = self.db.transaction(store_name, op_type);
                resolve(tr);
            } catch (exception) {
                self.initDb(false).then((db) => {
                    var tr = db.transaction(store_name, op_type);
                    resolve(tr);
                });
            }
        });
    },
    delete: async function (store_name, id) {
        const tr = await this.getDbTr(store_name, "readwrite");
        const os = tr.objectStore(store_name);
        return new Promise((resolve, reject) => {
            tr.oncomplete = function () {
                // console.log("ALL GET TRANSACTIONS COMPLETE.");
            };
            tr.onerror = function () {
                console.log("PROBLEM GETTING RECORDS.");
            };
            let request = null;
            // id -> myLocalStores
            if(id)
            request = os.delete(id); 
            
            request.onsuccess = function (event) {
                resolve(event.target.result);
            };
        });
    },
    dbName: null,
    storesList: [
        /**
         * name: String,
         * args: Object {autoIncrement, Key}
        */
    ],

    /**
     * 
     * @params dbName, storeList, updateVersion
    */
    initializeDB: async function(params) {
        "use strict";
        var self = this;
        if(params.storesList)
        self.storesList = params.storesList;
        return new Promise(async (resolve, reject) => {
            //  check for support
            // - handle version of the database for in case of new installation
            // - update the extenison stores in case of new stores from spotncenter

            if (typeof indexedDB == "undefined") {
                console.log("This browser doesn't support IndexedDB");
                return;
            }
            let __v = null;
            var versionFromStorage = await self.getStorage("idb_v")
            if (versionFromStorage) {
                __v = Number(versionFromStorage);
                if (params.updateVersion) {
                    __v = __v + 1;
                    self.setStorage({"idb_v": __v});
                }
            } else {
                __v = this._v;
                self.setStorage({"idb_v": this._v});
            }
            try {
                var openRequest = indexedDB.open(params.dbName, __v);
            } catch (e) {
                console.log("Error opening db: ", e);
                if(openRequest.error)
                resolve("error");
            }
            openRequest.onupgradeneeded = function (e) {
                var db = e.target.result;
                self.storesList.forEach(s => {
                    if (!db.objectStoreNames.contains(s.name)) {
                        db.createObjectStore(s.name, s.args);
                    }
                })
            };
            openRequest.onsuccess = function (e) {
                self.db = openRequest.result;
                self.storesList.forEach(s => {
                    if (!self.db.objectStoreNames.contains(s.name))
                        self.initDb(params.updateVersion = true);
                })
                resolve(self.db);
            };
            openRequest.onerror = function (e) {
                if(e.target && e.target.error && e.target.error.name && e.target.error.name == "VersionError") {
                    self.initDb(params.updateVersion = true);
                } else {
                    resolve("error");
                }
            };
        });
    },
    clearData: async function (store_name) {
        var self = this;
        if (self.db) {
            const tr = await self.getDbTr(store_name, "readwrite");
            const os = tr.objectStore(store_name);
            return new Promise((resolve, reject) => {
                tr.oncomplete = function () {
                    // console.log("ALL PUT TRANSACTIONS COMPLETE.");
                    resolve(true);
                };
                tr.onerror = function () {
                    console.log("PROBLEM UPDATING RECORDS.");
                    reject(false);
                };

                let request = os.clear();
                request.onsuccess = function () {
                    if (typeof cb == "function") cb();
                };
            });
        }
    },
    getStorage: function (key) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(key, function (data) {
                resolve(data[key]);
            });
        });
    },
    setStorage: function (obj) {
        return new Promise((resolve) => {
            chrome.storage.sync.set(obj, function (data) {
                resolve(data[key]);
            });
        });
    }
};
