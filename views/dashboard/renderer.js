// renderer.js
let cart = [];
let selectedPrinter = null;
let currentCategory = 'All';
let products = [];



// // Render products grid
// function renderProducts() {
//     const grid = document.getElementById('product-grid');
//     grid.innerHTML = '';

//     const filteredProducts = currentCategory === 'All'
//         ? products
//         : products.filter(p => p.category === currentCategory);

//     filteredProducts.forEach(product => {
//         const card = document.createElement('div');
//         card.className = 'product-card';
//         card.innerHTML = `
//             <h3>${product.name}</h3>
//             <p>$${product.price.toFixed(2)}</p>
//         `;
//         card.onclick = () => addToCart(product);
//         grid.appendChild(card);
//     });
// }

// // Add item to cart
// function addToCart(product) {
//     const existingItem = cart.find(item => item.id === product.id);

//     if (existingItem) {
//         existingItem.quantity += 1;
//     } else {
//         cart.push({
//             id: product.id,
//             name: product.name,
//             price: product.price,
//             quantity: 1
//         });
//     }

//     updateCartDisplay();
// }

// // Update cart display
// function updateCartDisplay() {
//     const cartItems = document.getElementById('cart-items');
//     cartItems.innerHTML = '';

//     cart.forEach(item => {
//         const itemElement = document.createElement('div');
//         itemElement.className = 'cart-item';
//         itemElement.innerHTML = `
//             <div>
//                 <div>${item.name}</div>
//                 <div class="quantity-controls">
//                     <button onclick="updateQuantity(${item.id}, -1)">-</button>
//                     <span>${item.quantity}</span>
//                     <button onclick="updateQuantity(${item.id}, 1)">+</button>
//                 </div>
//             </div>
//             <div>$${(item.price * item.quantity).toFixed(2)}</div>
//         `;
//         cartItems.appendChild(itemElement);
//     });

//     updateTotals();
// }

// // Update item quantity
// function updateQuantity(productId, change) {
//     const item = cart.find(item => item.id === productId);
//     if (item) {
//         item.quantity += change;
//         if (item.quantity <= 0) {
//             cart = cart.filter(i => i.id !== productId);
//         }
//         updateCartDisplay();
//     }
// }

// // Update totals
// function updateTotals() {
//     const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     const tax = subtotal * 0.1;
//     const total = subtotal + tax;

//     document.getElementById('subtotal').textContent = subtotal.toFixed(2);
//     document.getElementById('tax').textContent = tax.toFixed(2);
//     document.getElementById('total').textContent = total.toFixed(2);
// }

// // Process sale and print receipt
// async function processSale(paymentMethod) {
//     if (cart.length === 0) {
//         alert('Cart is empty!');
//         return;
//     }

//     try {
//         // Calculate totals
//         const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//         const tax = subtotal * 0.1;
//         const total = subtotal + tax;

// // Create sale object
// const sale = {
//     orderId: Date.now(),
//     items: cart,
//     subtotal,
//     tax,
//     total,
//     paymentMethod,
//     timestamp: new Date().toISOString()
// };

// // Print receipt
// const printResult = await window.electronAPI.printReceipt(sale);

// if (printResult.success) {
//     // Clear cart after successful print
//     cart = [];
//     updateCartDisplay();
//     alert(`Sale completed! Payment method: ${paymentMethod.toUpperCase()}`);
// } else {
//     throw new Error(printResult.error || 'Failed to print receipt');
// }
//     } catch (error) {
//         console.error('Sale processing error:', error);
//         alert('Error processing sale: ' + error.message);
//     }
// }

// List available printers
async function listPrinters() {
    try {
        const result = await window.electronAPI.listPrinters();
        if (result.success) {
            selectedPrinter = result.printers[0];  // Select first available printer
            console.log('Selected printer:', selectedPrinter);
        } else {
            console.error('Failed to list printers:', result.error);
        }
    } catch (error) {
        console.error('Printer list error:', error);
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', listPrinters);


let bazarEng = '';

async function loadProducts() {
    try {
        // Show loading state
        document.getElementById('product-display').innerHTML = '<div>Loading...</div>';
        const headTitle = document.getElementById('head-title');
        // Fetch products through the exposed API
        const products = await window.electronAPI.fetchProducts();
        console.log(products)
        // Display the products
        displayProducts(products);
        headTitle.textContent = products.products[0].Bazar.name + ' (POS)';
        bazarEng = products.products[0].Bazar.engName;
    } catch (error) {
        console.error('Failed to load products:', error);
        document.getElementById('product-display').innerHTML =
            '<div class="alert alert-danger">Failed to load products</div>';
    }
}

function displayProducts(products) {
    const productDisplay = document.getElementById('product-display');
    // console.log(products)
    const productsHTML = products.products.map(product => `
                        <div class="col" style="cursor: pointer; position: relative;">
                            <div class="card" pid="${product.productId}" style="position: relative; height: 300px;">
                                <div style="position: relative;">
                                    <img src="${product.Product.Images[0].imagePath || 'default.jpg'}" class="card-img-top" height="150px;" alt="${product.Product.title}" style="object-fit: cover;">

                                    <!-- Increment/Decrement Buttons Overlay -->
                                    <div class="quantity-controls" style="
                                        position: absolute;
                                        bottom: 5px;
                                        right: 5px;
                                        display: flex;
                                        align-items: center;
                                        background: rgba(0, 0, 0, 0.6);
                                        padding: 4px 8px;
                                        border-radius: 5px;
                                        color: white;
                                    ">
                                        <button class="btn btn-sm btn-light decrement" style="padding: 2px 6px; color: white;">-</button>
                                        <span class="product-qty mx-2" style="font-size: 14px;">0</span>
                                        <button class="btn btn-sm btn-light increment" style="padding: 2px 6px; color: white;">+</button>
                                    </div>
                                </div>

                                <div class="card-body">
                                    <h5 class="card-title">${product.Product.title}</h5>
                                    <h5 class="sub-title" id="eng-title">${product.Product.titleEng}</h5>
                                    <p style="font-size: 12px;">আজকের মূল্য:&ensp; ৳ <span class="card-text" style="color:red">${product.sellingPrice}</span></p>
                                    <p style="font-size: 12px;">পণ্যের পরিমাণ:&ensp;<span class="card-text" style="color:red">${product.stock}</span> ${product.Product.unit}</p>

                                </div>
                            </div>
                        </div>
    `).join('');

    productDisplay.innerHTML = productsHTML;
}

// Call loadProducts when needed
document.addEventListener('DOMContentLoaded', loadProducts)

//customer bazar list check
// document.addEventListener("DOMContentLoaded", function () {
//     // Retrieve products from localStorage
//     const products = JSON.parse(localStorage.getItem("checkoutProducts")) || [];
//     const warning = document.getElementById("warning-text1");
//     // Check if there is a saved bazarId
//     if (products.length > 0 && products[0].bazarId) {
//         const bazarSelect = document.getElementById("bazarSelect");
//         warning.style.display = 'block';
//         bazarSelect.style.borderColor = 'red';
//         bazarSelect.value = products[0].bazarId; // Set the default value
//     }
// });


// cart added with localstorage
document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById('product-list');
    const subTotalElement = document.getElementById('sub-total');
    const totalPriceElement = document.getElementById('total-price');
    const payBtn = document.querySelector('#paymentBtn');
    const checkoutKey = "checkoutProducts";
    const productDisplay = document.getElementById("product-display");
    // const searchBton = document.getElementById("searchBttn");
    //  let customerNumber = document.getElementById("cus_num").value.trim();
    // let bazarId = document.getElementById("bazarSelect").value;
    // const phone = document.getElementById("cus_num").value.trim();

    payBtn.disabled = true;

    function updatePrices() {
        let subTotal = 0;

        document.querySelectorAll('.product-row').forEach(row => {
            const qtyElement = row.querySelector('.qty');
            const priceElement = row.querySelector('.price');
            const basePrice = parseFloat(priceElement.getAttribute('data-base-price'));
            const qty = parseInt(qtyElement.textContent);
            const updatedPrice = (basePrice * qty).toFixed(2);

            priceElement.textContent = `৳${updatedPrice}`;
            subTotal += parseFloat(updatedPrice);
        });

        const totalPrice = subTotal.toFixed(2);
        subTotalElement.textContent = `৳${subTotal.toFixed(2)}`;
        totalPriceElement.textContent = `৳${totalPrice}`;
        // payVal.textContent = `৳${totalPrice}`;

        saveProductsToLocalStorage();
    }

    function saveProductsToLocalStorage() {
        let products = [];
        // const bazaR = document.getElementById("bazarSelect").value;
        document.querySelectorAll('.product-row').forEach(row => {
            products.push({
                id: row.dataset.productId,
                // bazarId: bazaR,
                name: row.querySelector('td:nth-child(2)').textContent,
                eng: row.querySelector('td:nth-child(3)')?.textContent || '',
                qty: parseInt(row.querySelector('.qty').textContent),
                price: parseFloat(row.querySelector('.price').getAttribute('data-base-price'))
            });
        });
        localStorage.setItem(checkoutKey, JSON.stringify(products));

        // // Trigger a custom event for localStorage updates
        // const event = new CustomEvent('localStorageChange', { detail: { key: checkoutKey, value: products } });
        // window.dispatchEvent(event);
    }




    // // Mutation observer function to listen to the custom event
    // function observeLocalStorageChanges() {
    //     window.addEventListener('localStorageChange', (e) => {
    //         document.getElementById("paymentBtn").disabled = false;
    //     });
    // }

    // // Call this function to start observing changes
    // observeLocalStorageChanges();

    // function loadCheckoutProducts() {
    //     const products = JSON.parse(localStorage.getItem(checkoutKey)) || [];
    //     const display = document.getElementById("product-display");
    //     // console.log(products)
    //   //  const bazarUid = products[0].bazarId;
    //     // console.log(products);
    //     display.innerHTML = "";
    //     productList.innerHTML = "";
    //     products.forEach(product => {
    //         addProductToCheckout(product.id, product.name, product.price, product.qty);

    //     });


    //     updatePrices();
    // }


    productDisplay.addEventListener("click", (event) => {
        const productCard = event.target.closest(".card");
        if (!productCard) return;
        // const payButton = document.getElementById("paymentBtn");
        const productId = productCard.getAttribute("pid");
        const productName = productCard.querySelector(".card-title").textContent;
        const engName = productCard.querySelector('#eng-title').textContent;
        const productPrice = parseFloat(productCard.querySelector(".card-text").textContent.replace("৳", "").trim());
        const qtyElement = productCard.querySelector(".product-qty");
        let qty = parseInt(qtyElement.textContent);
        // let warningText = document.getElementById("warning-text1");

        if (event.target.classList.contains("increment") && qty <= 2) {
            qty++;

            addProductToCheckout(productId, productName, engName, productPrice, qty);
            // warningText.style.display = 'block';

        } else if (event.target.classList.contains("decrement")) {
            if (qty > 0) {
                qty--;
                addProductToCheckout(productId, productName, engName, productPrice, qty);
                removeProductFromLocalStorage(productId);
            }

        }

        qtyElement.textContent = qty; // Update the displayed quantity in the product card


        // bazarSelect.style.borderColor = 'red';
        //  bazarSelect.disabled = true; // Disable bazar selection when a product is added
        //payButton.disabled = false;  // Enable payment button when a product is added
    });





    function addProductToCheckout(productId, productName, engName, productPrice, qty = 1) {
        // const productList = document.getElementById('product-list');
        let existingRow = document.querySelector(`.product-row[data-product-id="${productId}"]`);
        const payButton = document.getElementById("paymentBtn");

        // const bazar = document.getElementById("bazarSelect");
        // console.log(payButton);
        if (existingRow) {
            const qtyElement = existingRow.querySelector('.qty');
            payButton.disabled = false;
            if (qty === 0) {
                existingRow.remove(); // Remove from checkout if qty is 0
                removeProductFromLocalStorage(productId);
            } else {
                qtyElement.textContent = qty;
            }
        } else {
            if (qty > 0) {
                // payButton.disabled = false;
                const newRow = document.createElement('tr');
                newRow.classList.add('product-row');
                newRow.dataset.productId = productId;
                newRow.innerHTML = `
                       
                        <td><button class="btn btn-danger btn-sm remove-item"><i class="bi bi-trash3-fill"></i></button></td>
                        <td id="productNam">${productName}</td>
                        <td id="engName" style="display:none;">${engName}</td>
                        <td class="text-center">
                            <button class="btn btn-outline-secondary btn-sm decrease-btn">-</button>
                            <span class="mx-2 qty">${qty}</span>
                            <button class="btn btn-outline-secondary btn-sm increase-btn">+</button>
                        </td>
                        <td class="text-end price" data-base-price="${productPrice}">৳${(productPrice * qty).toFixed(2)}</td>
                    `;
                productList.appendChild(newRow);
            }
        }


        payButton.disabled = false;
        updatePrices();
    }

    // searchBton.addEventListener("click", function(){
    //     let customerNumber = document.getElementById("cus_num").value.trim();
    //     let bazarId = document.getElementById("bazarSelect").value;

    //     // Check if the customer phone number is entered
    //     if (!customerNumber) {
    //         alert("Please enter a customer phone number.");
    //         return;
    //     }

    //     // Check if a bazar is selected
    //     if (!bazarId) {
    //         alert("Please select a bazar before searching for the customer.");
    //         return;
    //     }

    //     // Perform the API call with the customer phone number and bazarId
    //     fetch(`/admin/orders/customerOrder/${bazarId}?phone=${customerNumber}`, {
    //         method: "GET", // Adjust method if needed (e.g., GET)
    //         headers: {
    //             "Content-Type": "application/json"
    //         }
    //     })
    //         .then(response => {
    //             // Check if the response status is OK (status code 200-299)
    //             if (!response.ok) {
    //                 // Handle error based on the status code
    //             alert("You have no pending order at this bazar");
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             console.log(data.data);
    //             let productList = document.getElementById("product-list");
    //             productList.innerHTML = ""; // Clear previous entries

    //             data.data.map((product) => {
    //                 product.orderDetails.map((e)=>{
    //                     //console.log(e)
    //                     addProductToCheckout(e.productId, e.name, e.price, e.quantity)
    //                 });

    //             });
    //         })
    //         .catch(error => {
    //             console.error("Error fetching order data:", error);
    //         // alert("Failed to fetch order details. Please try again.");
    //         });

    //  });


    function updateProductDisplayQuantity(productId, qty) {
        const productCard = document.querySelector(`.card[pid="${productId}"]`);
        if (productCard) {
            const qtyElement = productCard.querySelector('.product-qty');
            qtyElement.textContent = qty; // Update the displayed quantity in the product card
        }
    }


    productList.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');  // Adjusted to 'tr' instead of '.product-row' since rows are dynamically created

        if (!row) return;

        const qtyElement = row.querySelector('.qty');
        let qty = parseInt(qtyElement.textContent);

        if (target.classList.contains('increase-btn') && qty <= 2) {
            qty += 1;

        } else if (target.classList.contains('decrease-btn')) {
            if (qty > 1) qty -= 1;
        }

        qtyElement.textContent = qty;
        updatePrices();

        // Update the product display quantity
        const productId = row.getAttribute("data-product-id");
        updateProductDisplayQuantity(productId, qty);

        if (target.classList.contains('remove-item')) {
            const productId = row.getAttribute("data-product-id");
            row.remove();
            removeProductFromLocalStorage(productId);
            updatePrices();
        }

    });


    function removeProductFromLocalStorage(productId) {
        let products = JSON.parse(localStorage.getItem(checkoutKey)) || [];
        //  const bazar = document.getElementById("bazarSelect");
        // let warning = document.getElementById("warning-text1");
        // Convert all IDs to strings for proper comparison
        products = products.filter(product => product.id.toString() !== productId.toString());

        // bazar.style.borderColor = 'black';
        // warning.style.display = 'none';
        // Save updated list back to localStorage
        localStorage.setItem(checkoutKey, JSON.stringify(products));
    }

    // loadCheckoutProducts();

});


//modal view with price
document.addEventListener("DOMContentLoaded", () => {
    const paymentBtn = document.getElementById("paymentBtn");
    const totalPriceElement = document.getElementById("total-price"); // Total price in checkout
    const payValueElement = document.getElementById("payValue"); // Pay button text
    const modalBody = document.querySelector("#staticBackdrop .modal-body");

    // Update the modal with the total price when "Pay" button is clicked
    paymentBtn.addEventListener("click", () => {
        const totalPrice = totalPriceElement.textContent || "৳0.00"; // Get the total price
        modalBody.innerHTML = `<h3 class="text-center text-success py-2">মূল্য গ্রহণ করুন : ${totalPrice} টাকা।</h3><img src="/assets/imgs/money.gif"/>`;
    });
});






//form submit with pay button
document.getElementById('paymentBtn').addEventListener('click', function () {
    // const bazarSelected = document.getElementById('bazarSelect');
    const customerPhone = document.getElementById('cus_num');
    customerPhone.classList.remove('shake');
    void customerPhone.offsetWidth;
    const modal = new bootstrap.Modal(document.getElementById("staticBackdrop"), {
        backdrop: 'static',  // Prevent closing when clicking outside
        keyboard: false      // Prevent closing using the ESC key
    });
    const pay = document.getElementById('paymentBtn');
    const defaultPayText = document.getElementById('paymentBtn').innerHTML;

    pay.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    pay.disabled = true;

    // const bazarId = document.getElementById('bazarSelect').value;
    // if (!bazarId) {
    //     pay.disabled = false;
    //     bazarSelected.classList.add('shake');
    //     pay.innerHTML = defaultPayText;
    //     return;
    // }

    const phoneNumber = document.getElementById('cus_num').value;
    if (!phoneNumber) {
        pay.disabled = false;
        customerPhone.style.borderColor = 'red';
        pay.innerHTML = defaultPayText;
        customerPhone.classList.add('shake');
        return;
    }

    const productRows = document.querySelectorAll('#product-list .product-row');
    if (!productRows) {
        pay.disabled = false;
        pay.innerHTML = defaultPayText;
        return;
    }

    const products = [];
    document.querySelectorAll('#product-list .product-row').forEach(row => {
        const name = row.querySelector('#productNam').textContent;
        const productId = row.dataset.productId;
        const quantity = row.querySelector('.qty').textContent;
        const price = row.querySelector('.price').dataset.basePrice;
        products.push({
            productId: productId,
            name: name,
            quantity: quantity,
            price: price
        });
    });

    const subTotal = document.getElementById('sub-total').textContent;
    const numericSubTotal = parseFloat(subTotal.replace(/[^\d.]/g, ''));

    async function getBazarId() {
        const id = await window.electronAPI.getStoreValue('bazarId');
        const bid = id.bazarId;
        return bid;
    }

    async function orderPlacement() {
        try {
            const bzId = await getBazarId();
            const formData = {
                bazarId: bzId,  // Changed from bazarId to bzId
                customerPhone: phoneNumber,
                orderDetails: products,
                totalPrice: numericSubTotal
            };



            console.log('Form data before sending:', formData); // Debug line
            const order = await window.electronAPI.placeOrder(formData);
            console.log('Order response:', order);

            if (!order.success) {
                const toastElement = document.getElementById('liveToast');
                // this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
                //  this.disabled = true;
                const toastHeader = toastElement.querySelector('.toast-header');
                const toastBody = toastElement.querySelector('.toast-body');
                const toast = new bootstrap.Toast(toastElement, { autohide: true });

                // Hide the toast initially
                toastElement.style.display = 'none';
                toastBody.textContent = "একই দিনে একটি বাজার থেকে সর্বোচ্চ একবারই বাজার করা যাবে।";
                toastHeader.textContent = "Notification";

                // Show the toast
                toastElement.style.display = 'block'; // Make it visible
                toast.show();
                setTimeout(() => {
                    toast.style.display = "none";
                }, 5000);

                setTimeout(() => {
                    location.reload();
                }, 5000);

            } else {
                const modalBody = document.querySelector("#staticBackdrop .modal-body");
                const bazarTitle = document.querySelector("#head-title").textContent;
                const orderDetailsHTML = `

                             <h3 class="text-center text-success my-3">মূল্য গ্রহণ করুন : ৳${numericSubTotal.toFixed(2)} টাকা।</h3>
                            <p><strong>বাজার: ${bazarTitle}</strong></p>
                            <p><strong>ফোন নম্বর: </strong>${phoneNumber}</p>
                            <h4>অর্ডার বিবরণ:</h4>
                            <span id="orderId" style="display:block;">${order.data.orderId}</span>
                            <ul class="my-3">

                                ${products.map(product => `
                                    <li>${product.name} (ID: ${product.productId}) - Qty: ${product.quantity} - ৳${product.price}</li>
                                `).join('')}
                            </ul>
                            <!-- Initially, show the payment image (money.gif) -->
                            <img src="../../assets/imgs/money.gif" id="paymentImage" alt="Payment processing" />

                            <!-- This div will be used to display the QR code after the button click -->
                            <div id="qrCodeContainer" class="d-flex justify-content-center align-items-center" ></div>


        `;
                modalBody.innerHTML = orderDetailsHTML;

                // Show the modal
                modal.show();

                // Reset payment button
                pay.innerHTML = defaultPayText;
                pay.disabled = true;
                // console.log("success:", data);
            }


            // Reset button state on success
            pay.disabled = false;
            pay.innerHTML = defaultPayText;

        } catch (error) {
            console.error('Error placing order:', error);
            // Reset button state on error
            pay.disabled = false;
            pay.innerHTML = defaultPayText;
        }
    }

    orderPlacement().catch(error => {
        console.error('Error in order placement:', error);
        // Reset button state on error
        pay.disabled = false;
        pay.innerHTML = defaultPayText;
    });



});

// Event listener to generate the QR code when the "পেমেন্ট গ্রহণ করুন" button is clicked
document.getElementById('acceptPaymentBtn').addEventListener('click', function () {

    // Check if the image exists before attempting to hide it
    const paymentImage = document.getElementById('paymentImage');
    const toastElement = document.getElementById('liveToast');
    const initialValue = this.textContent;
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    this.disabled = true;
    const toastHeader = toastElement.querySelector('.toast-header');
    const toastBody = toastElement.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastElement, { autohide: true });

    // Hide the toast initially
    toastElement.style.display = 'none';
    if (paymentImage) {
        paymentImage.style.display = 'none'; // Hide the payment image
    } else {
        console.error('Payment image not found.');
    }

    // Show the QR code container
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    if (qrCodeContainer) {
        qrCodeContainer.style.display = 'block';
        qrCodeContainer.innerHTML = ''; // Clear any previous QR code

        // Generate the QR code
        const qrCodeData = JSON.stringify({
            orderId: document.getElementById("orderId").textContent,
            // bazarId: document.getElementById('bazarSelect').value,
            // customerPhone: document.getElementById('cus_num').value,
            // orderDetails: Array.from(document.querySelectorAll('#product-list .product-row')).map(row => ({
            //     name: row.querySelector('#productNam').textContent,
            //     quantity: row.querySelector('.qty').textContent,
            //     price: row.querySelector('.price').dataset.basePrice
            // })),
            //totalPrice: parseFloat(document.getElementById('sub-total').textContent.replace(/[^\d.]/g, ''))
        });

        new QRCode(qrCodeContainer, {
            text: qrCodeData,
            width: 256,
            height: 256
        });
        // Center the QR code in the container (if not done with CSS)
        const qrCodeImage = qrCodeContainer.querySelector('img');
        if (qrCodeImage) {
            qrCodeImage.style.display = 'block';  // Make sure it's displayed as block
            qrCodeImage.style.margin = '0 auto';  // Center horizontally
        }



        async function listPrinters() {
            try {
                const result = await window.electronAPI.listPrinters();
                if (result.success) {
                    selectedPrinter = result.printers[0];  // Select first available printer
                    console.log('Selected printer:', selectedPrinter);
                } else {
                    console.error('Failed to list printers:', result.error);
                }
            } catch (error) {
                console.error('Printer list error:', error);
            }
        }

        listPrinters()
        // async function processSale(paymentMethod) {
        //     // if (cart.length === 0) {
        //     //     alert('Cart is empty!');
        //     //     return;
        //     // }

        //     try {
        //         // Calculate totals
        //         // const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        //         // const tax = subtotal * 0.1;
        //         // const total = subtotal + tax;

        //         // Create sale object
        //         const sale = {
        //             id: 101,
        //             items: {
        //                 "id": "39",
        //                 "name": "মটরশুঁটি",
        //                 "qty": 1,
        //                 "price": 58
        //             },
        //             count: 1
        //         }

        //         // Print receipt
        //         const printResult = await window.electronAPI.printReceipt(sale);

        //         if (printResult.success) {
        //             // Clear cart after successful print
        //             // cart = [];
        //             // updateCartDisplay();
        //             alert(`Sale completed! Payment method: `);
        //         } else {
        //             throw new Error(printResult.error || 'Failed to print receipt');
        //         }
        //     } catch (error) {
        //         console.error('Sale processing error:', error);
        //         alert('Error processing sale: ' + error.message);
        //     }
        // }






        async function takePay() {
            const orderId = document.getElementById("orderId").textContent;
            console.log("Order ID:", orderId);
            const total = document.getElementById('total-price');
            const subTotal = document.getElementById('sub-total');
            const orders = JSON.parse(localStorage.getItem('checkoutProducts')) || [];
            console.log(orders);
            if (orders.length === 0) {
                alert("No products to print.");
                return;
            }

            let totalAmount = 0;

            //     orders.forEach(item => {
            //         receiptContent += `
            //     <tr>
            //         <td style="border: 1px solid black; padding: 8px;">${item.name}</td>
            //         <td style="border: 1px solid black; padding: 8px;">${item.qty}</td>
            //         <td style="border: 1px solid black; padding: 8px;">৳${item.price}</td>
            //     </tr>
            // `;
            //         totalAmount += parseFloat(item.price) * parseInt(item.qty);
            //     });
            // Create sale object
            const sale = {
                orderId: orderId,
                bazarName: bazarEng,
                items: orders,
                subtotal: subTotal.textContent.replace(/[^\d.]/g, "").trim(),
                tax: 0,
                customerPhone: document.getElementById('cus_num').value,
                total: total.textContent.replace(/[^\d.]/g, "").trim(),
                paymentMethod: 'cash',
                timestamp: new Date().toISOString()
            };

            //  console.log('Sale object:', sale)

            // let receiptContent = sale;



            // // Send data to Electron main process for printing
            // window.electronAPI.send("print-receipt", receiptContent);

            // Proceed with payment update
            const payTake = await window.electronAPI.takePayment(orderId);
            if (payTake.success) {
                console.log(payTake.success)
                console.log(sale)
                const bazarResult = await window.electronAPI.printReceiptBazar(sale);

                if (bazarResult.success) {
                    alert("Payment Successful. \nPress OK to print customer copy");
                    await window.electronAPI.printReceiptCustomer(sale);

                    setTimeout(() => {
                        // alert("Payment Successful. \nPress OK to print customer copy");
                        location.reload();
                    }, 60);
                } else {
                    alert(printResult.error)
                }

            } else {
                alert("Payment failed.");
                // setTimeout(() => {
                //     location.reload();
                // }, 3000);
            }
        }

        takePay();

    } else {
        console.error('QR code container not found.');
    }
});



function checkAndDisablePayBtn() {
    const payBtn = document.querySelector('#paymentBtn');
    const checkoutKey = "checkoutProducts";
    const storedProducts = JSON.parse(localStorage.getItem(checkoutKey)) || [];
    const productList = document.getElementById("product-list");
    const hasProductsInCart = productList.querySelectorAll(".product-row");
    const hasProductsInStorage = storedProducts.length > 0;


    if (hasProductsInCart.length > 0) {
        // Display message to remove products from checkout
        // productDisplay.innerHTML = `
        //         <div class="text-center mx-auto mt-200 text-danger" style="font-size: 22px; display: inline-block;">
        //             দয়া করে চেকআউট থেকে পণ্য মুছুন
        //         </div>`;
        // bazarSelect.disabled = true;
        payBtn.disabled = false;
    } else {
        // Default message when no bazar is selected
        // productDisplay.innerHTML = `
        //         <div class="text-center mx-auto mt-200 text-muted" style="font-size: 22px; display: inline-block;">
        //             দয়া করে যেকোনো একটি বাজার নির্বাচন করুন
        //         </div>`;
        // bazarSelect.disabled = false;
        payBtn.disabled = true;
    }

    productList.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-item")) {
            setTimeout(() => {
                const remainingProducts = document.querySelectorAll(".product-row").length;

                if (remainingProducts === 0) {
                    // When last product is removed, update product display message
                    // productDisplay.innerHTML = `
                    //     <div class="text-center mx-auto mt-200 text-muted" style="font-size: 22px; display: inline-block;">
                    //         দয়া করে যেকোনো একটি বাজার নির্বাচন করুন
                    //     </div>`;
                    // bazarSelect.disabled = false;
                    payBtn.disabled = true;
                }
            }, 100);
        }
    });
}

document.addEventListener("DOMContentLoaded", checkAndDisablePayBtn);


// Prevent default drag behavior
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
});



function logout() {
    try {
        const logout = window.electronAPI.logout();
        if (logout) {
            console.log("user logged out")
        } else {
            console.log("Failed to logout")
        }
    } catch (error) {
        console.error("Error logging out user", error);
    }
}

