from flask import Flask, render_template, redirect, url_for, request, session, flash
from flask_wtf.csrf import CSRFProtect
from forms import LoginForm
import json
import os
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
    # Simple welcome page after login
    return render_template('index.html')

if __name__ == '__main__':
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    # Create users.json if it doesn't exist
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
    
    app.run(host='0.0.0.0', port=8888, debug=True)