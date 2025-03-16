from flask import Flask, render_template, redirect, url_for, request, session, flash
from flask_wtf.csrf import CSRFProtect
from forms import LoginForm, PizzaOrderForm
import json
import os
from datetime import datetime
from functools import wraps
import secrets

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
csrf = CSRFProtect(app)

# Helper functions for working with JSON data
def load_json_file(filename):
    filepath = os.path.join('data', filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r') as file:
        return json.load(file)

def save_json_file(data, filename):
    filepath = os.path.join('data', filename)
    with open(filepath, 'w') as file:
        json.dump(data, file, indent=2)

# Decorator to check if user is logged in
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'login' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    
    if form.validate_on_submit():
        users = load_json_file('users.json')
        email = form.email.data
        password = form.password.data
        
        for user in users:
            if user['email'] == email and user['password'] == password:
                # Set session variables
                session['login'] = email
                session['role'] = user['role']
                return redirect(url_for('index'))
        
        flash('Invalid email or password', 'error')
    
    return render_template('login.html', form=form)

@app.route('/logout')
def logout():
    # Remove session variables
    session.pop('login', None)
    session.pop('role', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    # Load and sort pizza orders by date (descending)
    orders = load_json_file('pizzaorders.json')
    orders.sort(key=lambda x: x['order_date'], reverse=True)
    
    return render_template('index.html', orders=orders)

@app.route('/pizza', methods=['GET', 'POST'])
@login_required
def pizza():
    # Get pizza parameters from init.json
    init_data = load_json_file('init.json')
    
    form = PizzaOrderForm()
    form.type.choices = [(t, t) for t in init_data['type']]
    form.crust.choices = [(c, c) for c in init_data['crust']]
    form.size.choices = [(s, s) for s in init_data['size']]
    
    if request.method == 'POST' and form.validate_on_submit():
        orders = load_json_file('pizzaorders.json')
        
        # Find the next available ID
        next_id = 1
        if orders:
            next_id = max(order['id'] for order in orders) + 1
        
        # Create new order
        new_order = {
            'id': next_id,
            'type': form.type.data,
            'crust': form.crust.data,
            'size': form.size.data,
            'quantity': form.quantity.data,
            'price_per': form.price_per.data,
            'order_date': form.order_date.data.strftime('%Y/%m/%d')
        }
        
        orders.append(new_order)
        save_json_file(orders, 'pizzaorders.json')
        
        flash('Pizza order added successfully!', 'success')
        return redirect(url_for('index'))
    
    # Set default date to today
    if not form.order_date.data:
        form.order_date.data = datetime.now()
        
    return render_template('pizza_form.html', form=form, is_edit=False)

if __name__ == '__main__':
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    # Create initial data files if they don't exist
    if not os.path.exists('data/init.json'):
        init_data = {
            'type': ['Canadian', 'Cheese', 'Hawaiian', 'Meat Lovers', 'Pepperoni', 'Vegetarian'],
            'crust': ['cauliflower', 'deep dish', 'regular', 'thin crust'],
            'size': ['individual', 'small', 'medium', 'large']
        }
        save_json_file(init_data, 'init.json')
    
    if not os.path.exists('data/users.json'):
        users = [
            {
                'email': 'staff@pizza.com',
                'password': 'staff123',
                'role': 's'
            },
            {
                'email': 'customer@example.com',
                'password': 'customer123',
                'role': 'c'
            }
        ]
        save_json_file(users, 'users.json')
    
    if not os.path.exists('data/pizzaorders.json'):
        # Add some sample orders
        orders = [
            {
                'id': 1,
                'type': 'Pepperoni',
                'crust': 'regular',
                'size': 'large',
                'quantity': 2,
                'price_per': 12.99,
                'order_date': '2025/03/14'
            },
            {
                'id': 2,
                'type': 'Hawaiian',
                'crust': 'thin crust',
                'size': 'medium',
                'quantity': 1,
                'price_per': 10.99,
                'order_date': '2025/03/13'
            }
        ]
        save_json_file(orders, 'pizzaorders.json')
    
    app.run(host='0.0.0.0', port=8888, debug=True)