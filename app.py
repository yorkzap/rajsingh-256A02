from flask import Flask, render_template, redirect, url_for, request, session, flash, jsonify
from flask_wtf.csrf import CSRFProtect
from forms import LoginForm, CreateAccountForm, PizzaOrderForm
import json
import os
from datetime import datetime
from functools import wraps
import secrets

app = Flask(__name__)
# Generate a secure random key to prevent tampering with cookies
app.config['SECRET_KEY'] = secrets.token_hex(16) #todo: put this in an environment variable
csrf = CSRFProtect(app)

# Helper functions
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
        user = next((u for u in users if u['email'] == form.email.data and u['password'] == form.password.data), None)
        if user:
            session['login'] = user['email']
            session['role'] = user['role']
            return redirect(url_for('index'))
        flash('Invalid email or password', 'error')
    return render_template('login.html', form=form)

@app.route('/create', methods=['GET', 'POST'])
def create_account():
    form = CreateAccountForm()
    if form.validate_on_submit():
        # Check if passwords match
        if form.password.data != form.confirm_password.data:
            flash('Passwords do not match', 'error')
            return render_template('create_account.html', form=form)
            
        # Password strength validation
        password = form.password.data
        if len(password) < 8:
            flash('Password must be at least 8 characters long', 'error')
            return render_template('create_account.html', form=form)
            
        # Check for letters and numbers
        if not any(c.isalpha() for c in password) or not any(c.isdigit() for c in password):
            flash('Password must contain both letters and numbers', 'error')
            return render_template('create_account.html', form=form)
        
        # If we get here, the password is valid
        users = load_json_file('users.json')
        users.append({
            'email': form.email.data,
            'password': form.password.data,
            'role': form.role.data
        })
        save_json_file(users, 'users.json')
        flash('Account created successfully! Please log in.', 'success')
        return redirect(url_for('login'))
        
    return render_template('create_account.html', form=form)

@app.route('/logout')
def logout():
    session.pop('login', None)
    session.pop('role', None)
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    orders = load_json_file('pizzaorders.json')
    orders.sort(key=lambda x: x['order_date'], reverse=True)
    return render_template('index.html', orders=orders)

@app.route('/pizza', methods=['GET', 'POST'])
@login_required
def pizza():
    form = PizzaOrderForm()
    
    # Set choices from init.json
    init_data = load_json_file('init.json')
    form.type.choices = [(t, t) for t in init_data['type']]
    form.crust.choices = [(c, c) for c in init_data['crust']]
    form.size.choices = [(s, s) for s in init_data['size']]
    
    # GET request
    if request.method == 'GET':
        pizza_id = request.args.get('id')
        if pizza_id:
            orders = load_json_file('pizzaorders.json')
            pizza_order = next((order for order in orders if order['id'] == int(pizza_id)), None)
            if pizza_order:
                # Fill existing order data
                form.type.data = pizza_order['type']
                form.crust.data = pizza_order['crust']
                form.size.data = pizza_order['size']
                form.quantity.data = pizza_order['quantity']
                form.price_per.data = pizza_order['price_per']
                form.order_date.data = datetime.strptime(pizza_order['order_date'], '%Y/%m/%d')
                return render_template('pizza_form.html', form=form, pizza_id=pizza_id, is_edit=True)
        # For new orders set today's date
        form.order_date.data = datetime.now()
        return render_template('pizza_form.html', form=form, is_edit=False)
    
    # POST request
    if form.validate_on_submit():
        orders = load_json_file('pizzaorders.json')
        next_id = 1 if not orders else max(order.get('id', 0) for order in orders) + 1
        
        # Create a new order dictionary without the CSRF token
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
    
    return render_template('pizza_form.html', form=form, is_edit=False)

@app.route('/pizza/<int:pizza_id>', methods=['PUT', 'DELETE'])
@login_required
def pizza_operations(pizza_id):
    orders = load_json_file('pizzaorders.json')
    
    if request.method == 'PUT':
        data = request.get_json()
        # Filter out any CSRF token that might be in the data
        if 'csrf_token' in data:
            data.pop('csrf_token')
            
        for i, order in enumerate(orders):
            if order.get('id') == pizza_id:
                orders[i] = data
                break
        save_json_file(orders, 'pizzaorders.json')
        return jsonify({'status': 'success'})
    
    elif request.method == 'DELETE':
        orders = [order for order in orders if order.get('id') != pizza_id]
        save_json_file(orders, 'pizzaorders.json')
        
        if request.headers.get('HX-Request'):
            flash('Pizza order removed successfully!', 'success')
            orders.sort(key=lambda x: x.get('order_date', ''), reverse=True)
            return render_template('orders_table.html', orders=orders)
        
        return jsonify({'status': 'success'})

@app.route('/confirm/<int:pizza_id>')
@login_required
def confirm_delete(pizza_id):
    orders = load_json_file('pizzaorders.json')
    pizza_order = next((order for order in orders if order.get('id') == pizza_id), None)
    
    if not pizza_order:
        flash('Order not found', 'error')
        return redirect(url_for('index'))
    
    template = 'confirm_delete_modal.html' if request.headers.get('HX-Request') else 'confirm_delete.html'
    return render_template(template, pizza=pizza_order)

@app.route('/fix-orders')
@login_required
def fix_orders():
    """Helper route to fix any existing orders with CSRF tokens"""
    orders = load_json_file('pizzaorders.json')
    fixed = False
    
    for order in orders:
        if 'csrf_token' in order:
            order.pop('csrf_token')
            fixed = True
            
    if fixed:
        save_json_file(orders, 'pizzaorders.json')
        flash('Fixed orders with CSRF tokens', 'success')
    else:
        flash('No orders needed fixing', 'info')
        
    return redirect(url_for('index'))

if __name__ == '__main__':
    # Does the directory exist?
    os.makedirs('data', exist_ok=True)
    
    # If it doesn't exist then create a pizzaorders.json 
    if not os.path.exists('data/pizzaorders.json'):
        save_json_file([], 'pizzaorders.json')
    
    app.run(host='0.0.0.0', port=8888, debug=True)