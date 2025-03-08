const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Printer = require('./views/printer');

// Import products
const products = [
    { id: 1, name: 'Burger', price: 5.99, category: 'Food' },
    { id: 2, name: 'Pizza', price: 8.99, category: 'Food' },
    { id: 3, name: 'Fries', price: 2.99, category: 'Sides' },
    { id: 4, name: 'Coke', price: 1.99, category: 'Drinks' },
    { id: 5, name: 'Coffee', price: 2.49, category: 'Drinks' },
    { id: 6, name: 'Sandwich', price: 4.99, category: 'Food' },
    { id: 7, name: 'Salad', price: 6.99, category: 'Food' },
    { id: 8, name: 'Ice Cream', price: 3.99, category: 'Desserts' },
    { id: 9, name: 'Water', price: 0.99, category: 'Drinks' },
    { id: 10, name: 'Cake', price: 4.99, category: 'Desserts' }
];

let store;
let mainWindow;
let printer;

async function initializeStore() {
    const Store = (await import('electron-store')).default; // Dynamic import
    store = new Store(); // Initialize the store
}

async function createWindow() {
    await initializeStore(); // Ensure store is initialized before use

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'assets', 'imgs', 'jbd.icns'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),

        }
    });

    // Add context menu for right-click
    mainWindow.webContents.on('context-menu', (e, props) => {
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Toggle DevTools', click: () => mainWindow.webContents.toggleDevTools() }
        ]);
        contextMenu.popup();
    });



    // Check if user is logged in
    const isLoggedIn = store.get('isLoggedIn');

    // console.log(isLoggedIn)

    //console.log(isLoggedIn)

    // Load appropriate page based on auth status
    if (isLoggedIn === true) {
        mainWindow.loadFile(path.join(__dirname, 'views', 'dashboard', 'index.html'));
    } else {
        mainWindow.loadFile(path.join(__dirname, 'views', 'login', 'login.html'));
    }
}

function setupIPCHandlers() {
    // Initialize printer
    printer = new Printer();

    // Products handler
    ipcMain.handle('get-products', () => {
        console.log('Sending products:', products);
        return products;
    });


    //fetching products to pos
    ipcMain.handle('fetch-products', async () => {
        // Retrieve stored OTP
        let storedPhone = store.get('phone');
        // console.log("Stored OTP:", storedOTP);
        const response = await fetch('https://admin.jonotarbazar.today/admin/pos/getPosProducts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: storedPhone }),
        });
        const data = await response.json();
        store.set('bazarId', data.products[0].bazarId);
        // console.log(data)
        return data;
    });


    ipcMain.handle('store:set', async (event, key, value) => {
        // Your store setting logic here
        await store.set(key, value);
        return true;
    });

    ipcMain.handle('store:get', async (key) => {
        await store.get(key);
        // console.log(store.get(key))
        return store.get(key);
    });

    // // Handle route changes from renderer
    // ipcMain.on('navigate', (event, route) => {
    //     switch (route) {
    //         case 'home':
    //             mainWindow.loadFile('index.html');
    //             break;
    //         case 'login':
    //             mainWindow.loadFile('login.html');
    //             break;
    //         case 'settings':
    //             mainWindow.loadFile('settings.html');
    //             break;
    //         default:
    //             mainWindow.loadFile('404.html');
    //     }
    // });

    // Handle dynamic folder & page navigation
    ipcMain.on('navigate', (event, folder, page) => {
        const win = BrowserWindow.fromWebContents(event.sender);

        // Ensure safe navigation
        if (!folder || !page) {
            console.error("Invalid navigation parameters:", folder, page);
            return;
        }

        const targetPath = path.join(__dirname, 'views', folder, `${page}.html`); // Dynamic path

        win.loadFile(targetPath).catch(err => console.error("Navigation error:", err));
    });

    // // Handle login
    // ipcMain.on('login', (event, credentials) => {
    //     // This is where you'd typically validate against a backend
    //     // For demo, we'll just check if both fields are filled
    //     if (credentials.username && credentials.password) {
    //         store.set('isLoggedIn', true);
    //         store.set('user', { username: credentials.username });
    //         mainWindow.loadFile('index.html');
    //     } else {
    //         event.reply('login-failed', 'Invalid credentials');
    //     }
    // });

    // Handle logout
    ipcMain.on('logout', () => {
        store.set('isLoggedIn', false);
        store.delete('user');
        // console.log(store);
        mainWindow.loadFile(path.join(__dirname, 'views', 'login', 'login.html'));
    });

    // List printers handler
    ipcMain.handle('list-printers', async () => {
        try {

            const printers = await printer.getPrinters();

            return { success: true, printers };
        } catch (error) {
            console.error('List printers error:', error);
            return { success: false, error: error.message };
        }
    });



    // place a order
    ipcMain.handle('placeOrder', async (event, data) => {
        // console.log(data);
        let storedPhone = store.get('phone');
        data.posPhone = storedPhone;
        const response = await fetch('https://admin.jonotarbazar.today/admin/orders/placeOrder', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        // console.log(result)
        return result;
    });


    //take payment and print
    ipcMain.handle('takePayment', async (event, data) => {
        // console.log(data)
        const response = await fetch('https://admin.jonotarbazar.today/admin/orders/takeOrderPayment', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ orderId: data })
        });
        const result = await response.json();
        // console.log(result)
        return result;
    });


    // Print receipt handler
    ipcMain.handle('print-receipt-bazar', async (event, data) => {
        try {

            // console.log(data)
            await printer.printReceiptBazar(data);
            return { success: true };
        } catch (error) {
            console.error('Receipt printing error:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('print-receipt-customer', async (event, data) => {
        try {

            // console.log(data)
            await printer.printReceiptCustomer(data);
            return { success: true };
        } catch (error) {
            console.error('Receipt printing error:', error);
            return { success: false, error: error.message };
        }
    });




}


app.whenReady().then(async () => {

    await initializeStore(); // Ensure store is initialized before setting up IPC handlers
    setupIPCHandlers();
    createWindow();

    app.dock.setIcon(path.join(__dirname, 'assets', 'imgs', 'jbd.icns'));


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});