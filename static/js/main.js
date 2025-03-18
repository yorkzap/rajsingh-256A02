// Modal handling functions
function openModal(modalId) {
    const modal = document.getElementById(modalId || 'modal-container');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (modal && backdrop) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
        backdrop.classList.remove('hidden');
        backdrop.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId || 'modal-container');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (modal && backdrop) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        backdrop.classList.add('hidden');
        backdrop.classList.remove('show');
    }
}

// event listeners for modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Date inputs for the display
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            input.value = `${year}-${month}-${day}`;
        }
    });

    // Subtotal when quantity or price changes
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('price_per');
    const subtotalDisplay = document.getElementById('subtotal');
    const deliveryDisplay = document.getElementById('delivery');
    const totalDisplay = document.getElementById('total');

    function updateTotals() {
        if (subtotalDisplay && quantityInput && priceInput) {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const subtotal = quantity * price;
            const delivery = subtotal * 0.1;
            const total = subtotal + delivery;
            
            subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
            deliveryDisplay.textContent = `$${delivery.toFixed(2)}`;
            totalDisplay.textContent = `$${total.toFixed(2)}`;
        }
    }

    if (quantityInput && priceInput) {
        quantityInput.addEventListener('input', updateTotals);
        priceInput.addEventListener('input', updateTotals);
        
        // Initial calculation
        updateTotals();
    }

    // Flash message auto close
    const flashMessages = document.querySelectorAll('[role="alert"]');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.transition = 'opacity 1s ease';
            message.style.opacity = 0;
            setTimeout(() => {
                message.remove();
            }, 1000);
        }, 5000);
    });
});

// HTMX after swap event
document.addEventListener('htmx:afterSwap', function(event) {
    // Initialize again any components that need it after HTMX swaps content
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            input.value = `${year}-${month}-${day}`;
        }
    });
});

// Helper functions
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function handleFormSubmit(form, url, method, redirectUrl) {
    const formData = new FormData(form);
    
    // Convert form data to JSON
    const data = {};
    formData.forEach((value, key) => {
        if (key === 'order_date') {
            data[key] = formatDate(value);
        } else if (key === 'quantity') {
            data[key] = parseInt(value);
        } else if (key === 'price_per') {
            data[key] = parseFloat(value);
        } else if (key === 'id') {
            data[key] = parseInt(value);
        } else {
            data[key] = value;
        }
    });
    
    // Send request
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            window.location.href = redirectUrl;
        } else {
            console.error('Error:', response.statusText);
            alert('Error processing your request. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}