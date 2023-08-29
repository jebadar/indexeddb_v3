# indexeddb_v3
Indexed DB wrapper, promise based for Manifest version 3 of chrome extensions

Initialize 
```Javascript
var Params = {
    dbName: "example",
    storeList: [{
        name:"store1",
        autoIncrement: true
    }, {
        name:"store2",
         keyPath: "key"
    }],
    updateVersion: false
}
// version is initialized from 1, and then set into chrome.storage
// due to auto update of extension the verison is incremented, by updateVersion flag
// if the error is thrown for version update
idb.initializeDB(Params)

// now use idb handle to get, set, update or delete from indexedDB stores
// set
 idb.put(["store1"], 0, {});
// get
idb.get("store1", 0)
// delete
idb.delete("store1", 0)

```