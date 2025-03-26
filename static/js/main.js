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

// Error handling
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        const messageSpan = errorElement.querySelector('span') || errorElement;
        messageSpan.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

// Helper functions
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function updateTotals() {
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('price_per');
    const subtotalDisplay = document.getElementById('subtotal');
    const deliveryDisplay = document.getElementById('delivery');
    const totalDisplay = document.getElementById('total');
    
    if (subtotalDisplay && quantityInput && priceInput) {
        // Get values, defaulting to 0 if invalid or empty
        let qty = 0;
        let price = 0;
        
        if (quantityInput.value.trim() !== '') {
            qty = parseInt(quantityInput.value) || 0;
        }
        
        if (priceInput.value.trim() !== '') {
            price = parseFloat(priceInput.value) || 0;
        }
        
        const subtotal = qty * price;
        const delivery = subtotal * 0.1;
        const total = subtotal + delivery;
        
        subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
        deliveryDisplay.textContent = `$${delivery.toFixed(2)}`;
        totalDisplay.textContent = `$${total.toFixed(2)}`;
        
        // Animation for total
        if (totalDisplay) {
            totalDisplay.classList.add('text-green-600');
            setTimeout(() => {
                totalDisplay.classList.remove('text-green-600');
            }, 300);
        }
    }
}

function validateQuantity() {
    const quantityInput = document.getElementById('quantity');
    const errorDiv = document.getElementById('quantity-error');
    const errorMessageSpan = document.getElementById('quantity-error-message');
    const pizzaForm = document.getElementById('pizza-form');
    
    if (!quantityInput || !errorDiv) return true;
    
    let qty = 0;
    
    // Only try if there's a value
    if (quantityInput.value.trim() !== '') {
        qty = parseInt(quantityInput.value);
    }
    
    // Reset error
    errorDiv.classList.add('hidden');
    quantityInput.classList.remove('border-red-600');
    quantityInput.classList.add('border-neutral');
    
    // Remove any warning that exist before
    const existingWarning = document.getElementById('quantity-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    // Quantity limits validation
    if (qty > 10) {
        // Create a warning at the top of the form
        const warningDiv = document.createElement('div');
        warningDiv.id = 'quantity-warning';
        warningDiv.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mb-6 flex items-start';
        warningDiv.innerHTML = `
            <div class="flex-shrink-0 mr-3">
                <i class="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>
            </div>
            <div>
                <p>Order Quantity Limit: For ordering over 10 pizzas, call us at (250) 686-9782.</p>
            </div>
        `;
        
        if (pizzaForm) {
            pizzaForm.insertBefore(warningDiv, pizzaForm.firstChild);
        }
        
        // Show inline error
        errorMessageSpan.textContent = 'Maximum quantity allowed is 10 pizzas per order.';
        errorDiv.classList.remove('hidden');
        quantityInput.classList.remove('border-neutral');
        quantityInput.classList.add('border-red-600');
        quantityInput.value = 10;
        updateTotals();
        return false;
    } else if (qty < 1 && quantityInput.value.trim() !== '') {
        errorMessageSpan.textContent = 'Minimum quantity is 1 pizza.';
        errorDiv.classList.remove('hidden');
        quantityInput.classList.remove('border-neutral');
        quantityInput.classList.add('border-red-600');
        quantityInput.value = 1;
        updateTotals();
        return false;
    }
    
    updateTotals();
    return true;
}

// Event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set current date for date input if empty
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
    
    // Setup quantity and price inputs for order form
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('price_per');
    const pizzaForm = document.getElementById('pizza-form');
    
    if (quantityInput) {
        quantityInput.addEventListener('input', validateQuantity);
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', updateTotals);
    }
    
    if (pizzaForm) {
        pizzaForm.addEventListener('submit', function(e) {
            if (!validateQuantity()) {
                e.preventDefault();
            }
        });
        
        // Initial calculation in order form
        updateTotals();
    }
    
    // Setup update button for edit form
    const updateBtn = document.getElementById('update-button');
    if (updateBtn && pizzaForm) {
        updateBtn.addEventListener('click', function() {
            if (!validateQuantity()) return;
            
            const pizzaId = pizzaForm.dataset.pizzaId;
            
            // Show loading state
            updateBtn.disabled = true;
            const originalContent = updateBtn.innerHTML;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Updating...';
            
            // Create form data
            const formData = new FormData(pizzaForm);
            
            // Format date
            const dateObj = new Date(formData.get('order_date'));
            const formattedDate = formatDate(dateObj);
            
            // Create order data
            const orderData = {
                id: parseInt(pizzaId),
                type: formData.get('type'),
                crust: formData.get('crust'),
                size: formData.get('size'),
                quantity: parseInt(formData.get('quantity')),
                price_per: parseFloat(formData.get('price_per')),
                order_date: formattedDate
            };
            
            // Send request
            fetch(`/pizza/${pizzaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('input[name="csrf_token"]').value
                },
                body: JSON.stringify(orderData)
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/';
                } else {
                    updateBtn.disabled = false;
                    updateBtn.innerHTML = originalContent;
                    
                    // Show error message
                    const flashContainer = document.createElement('div');
                    flashContainer.className = 'bg-red-100 text-red-700 px-4 py-3 rounded mb-4 flex items-center';
                    flashContainer.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i> Failed to update order. Please try again.';
                    pizzaForm.insertBefore(flashContainer, pizzaForm.firstChild);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                updateBtn.disabled = false;
                updateBtn.innerHTML = originalContent;
                
                // Show error message
                const flashContainer = document.createElement('div');
                flashContainer.className = 'bg-red-100 text-red-700 px-4 py-3 rounded mb-4 flex items-center';
                flashContainer.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i> An error occurred. Please try again.';
                pizzaForm.insertBefore(flashContainer, pizzaForm.firstChild);
            });
        });
    }
    
    // Set up delete button event handling
    document.body.addEventListener('click', function(e) {
        // Find if a delete button was clicked
        const deleteButton = e.target.closest('button[hx-delete]');
        if (deleteButton) {
            // Listen for the htmx:afterOnLoad event
            document.addEventListener('htmx:afterOnLoad', function handleDeleteResponse(evt) {
                if (evt.detail.xhr && evt.detail.xhr.status === 200) {
                    if (evt.detail.elt === deleteButton) {
                        // Close the modal
                        closeModal();
                        
                        // Remove the event listener after handling
                        document.removeEventListener('htmx:afterOnLoad', handleDeleteResponse);
                    }
                }
            });
        }
    });
    
    // dismiss flash messages
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
    
    // Escape key listener for modals for better UX
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // Style submit buttons
    const loginForm = document.querySelector('form[action*="login"]');
    if (loginForm) {
        const submitBtn = loginForm.querySelector('input[type="submit"]');
        if (submitBtn) {
            const button = document.createElement('button');
            button.type = 'submit';
            button.className = submitBtn.className;
            button.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Sign In';
            submitBtn.parentNode.replaceChild(button, submitBtn);
        }
    }
    
    const createAccountForm = document.querySelector('form[action*="create_account"]');
    if (createAccountForm) {
        const submitBtn = createAccountForm.querySelector('input[type="submit"]');
        if (submitBtn) {
            const button = document.createElement('button');
            button.type = 'submit';
            button.className = submitBtn.className;
            button.innerHTML = '<i class="fas fa-user-plus mr-2"></i> Create Account';
            submitBtn.parentNode.replaceChild(button, submitBtn);
        }
        
        // Password validation
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirm_password');
        
        if (passwordInput && confirmInput) {
            // Create password match error container
            let matchErrorDiv = document.querySelector('.password-match-error');
            if (!matchErrorDiv) {
                matchErrorDiv = document.createElement('div');
                matchErrorDiv.className = 'text-red-600 text-xs mt-1 flex items-center hidden password-match-error';
                matchErrorDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i><span>Passwords do not match</span>';
                confirmInput.parentNode.appendChild(matchErrorDiv);
            }
            
            // Create password strength error container
            let strengthErrorDiv = document.querySelector('.password-strength-error');
            if (!strengthErrorDiv) {
                strengthErrorDiv = document.createElement('div');
                strengthErrorDiv.className = 'text-red-600 text-xs mt-1 flex items-center hidden password-strength-error';
                strengthErrorDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i><span>Password must be at least 8 characters with letters and numbers</span>';
                passwordInput.parentNode.appendChild(strengthErrorDiv);
            }
            
            // Password strength indicator
            const strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'mt-2';
            strengthIndicator.innerHTML = `
                <div class="text-xs text-gray-600 mb-1">Password strength:</div>
                <div class="h-1 bg-gray-200 rounded-full">
                    <div id="strength-bar" class="h-1 rounded-full bg-gray-400" style="width: 0%"></div>
                </div>
            `;
            passwordInput.parentNode.appendChild(strengthIndicator);
            
            const strengthBar = document.getElementById('strength-bar');
            
            // Calculate password strength
            function checkPasswordStrength(password) {
                if (!password) return 0;
                
                let strength = 0;
                
                // Length check
                if (password.length >= 8) strength += 25;
                
                // Character variety checks
                if (/[A-Z]/.test(password)) strength += 25; // Uppercase
                if (/[a-z]/.test(password)) strength += 25; // Lowercase
                if (/[0-9]/.test(password)) strength += 15; // Numbers
                if (/[^A-Za-z0-9]/.test(password)) strength += 10; // Special chars
                
                return Math.min(100, strength);
            }

            // Check if password meets minimum requirements
            function isPasswordValid(password) {
                if (!password) return false;
                if (password.length < 8) return false;
                if (!/[a-zA-Z]/.test(password)) return false; // Must have at least one letter
                if (!/[0-9]/.test(password)) return false; // Must have at least one number
                return true;
            }

            // Update strength indicator
            function updateStrengthIndicator() {
                const password = passwordInput.value;
                const strength = checkPasswordStrength(password);
                strengthBar.style.width = strength + '%';
                
                // Color based on strength
                if (strength < 30) {
                    strengthBar.className = 'h-1 rounded-full bg-red-500';
                } else if (strength < 60) {
                    strengthBar.className = 'h-1 rounded-full bg-yellow-500';
                } else {
                    strengthBar.className = 'h-1 rounded-full bg-green-500';
                }
                
                // Show/hide strength error
                if (password && !isPasswordValid(password)) {
                    passwordInput.classList.add('border-red-500');
                    strengthErrorDiv.classList.remove('hidden');
                    return false;
                } else {
                    passwordInput.classList.remove('border-red-500');
                    strengthErrorDiv.classList.add('hidden');
                    return true;
                }
            }

            // Validation function for matching passwords
            function validatePasswords() {
                const passwordsMatch = !confirmInput.value || passwordInput.value === confirmInput.value;
                
                if (!passwordsMatch) {
                    confirmInput.classList.add('border-red-500');
                    matchErrorDiv.classList.remove('hidden');
                    return false;
                } else {
                    confirmInput.classList.remove('border-red-500');
                    matchErrorDiv.classList.add('hidden');
                    return true;
                }
            }

            // Add event listeners
            passwordInput.addEventListener('input', updateStrengthIndicator);
            confirmInput.addEventListener('input', validatePasswords);

            // Validate on form submission
            const form = createAccountForm;
            form.addEventListener('submit', function(e) {
                const passwordValid = isPasswordValid(passwordInput.value);
                const passwordsMatch = passwordInput.value === confirmInput.value;
                
                if (!passwordValid) {
                    e.preventDefault();
                    passwordInput.classList.add('border-red-500');
                    strengthErrorDiv.classList.remove('hidden');
                    passwordInput.focus();
                    return false;
                }
                
                if (!passwordsMatch) {
                    e.preventDefault();
                    confirmInput.classList.add('border-red-500');
                    matchErrorDiv.classList.remove('hidden');
                    confirmInput.focus();
                    return false;
                }
            });

            // Initial update
            updateStrengthIndicator();
        }
    }
});

// HTMX after swap event handler
document.addEventListener('htmx:afterSwap', function(event) {
    // Initialize any components that need it after HTMX swaps content
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
    
    // initialize again any quantity or price inputs that might be swapped
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('price_per');
    
    if (quantityInput) {
        quantityInput.addEventListener('input', validateQuantity);
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', updateTotals);
    }
    
    // Initial calculation if needed
    if (quantityInput && priceInput) {
        updateTotals();
    }
});