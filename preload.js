const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    listPrinters: () => ipcRenderer.invoke('list-printers'),
    printReceiptBazar: (data) => ipcRenderer.invoke('print-receipt-bazar', data),
    printReceiptCustomer: (data) => ipcRenderer.invoke('print-receipt-customer', data),
    getProducts: () => ipcRenderer.invoke('get-products'),
    logout: () => ipcRenderer.send('logout'),


    // IPC methods
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    receive: (channel, callback) => ipcRenderer.on(channel, (event, data) => callback(data)),
    navigate: (folder, page) => ipcRenderer.send('navigate', folder, page),

    // Store methods (optional: only expose what's needed)
    getStoreValue: (key) => ipcRenderer.invoke('store:get', key),
    setStoreValue: (key, value) => ipcRenderer.invoke('store:set', key, value),
    fetchProducts: () => ipcRenderer.invoke('fetch-products'),
    placeOrder: (data) => ipcRenderer.invoke('placeOrder', data),
    takePayment: (data) => ipcRenderer.invoke('takePayment', data),

});