from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, RadioField, SelectField, IntegerField, FloatField, DateField, SubmitField
from wtforms.validators import DataRequired, EqualTo, NumberRange, InputRequired

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired()], render_kw={"placeholder": "Your email", "class": "w-full px-4 py-2 border rounded-md"})
    password = PasswordField('Password', validators=[DataRequired()], render_kw={"placeholder": "Your password", "class": "w-full px-4 py-2 border rounded-md"})
    submit = SubmitField('Login', render_kw={"class": "w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"})

class CreateAccountForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired()], render_kw={"placeholder": "Your email", "class": "w-full px-4 py-2 border rounded-md"})
    password = PasswordField('Password', validators=[DataRequired()], render_kw={"placeholder": "Create a password", "class": "w-full px-4 py-2 border rounded-md"})
    confirm_password = PasswordField('Confirm Password', 
                                     validators=[DataRequired()], 
                                     render_kw={"placeholder": "Confirm your password", "class": "w-full px-4 py-2 border rounded-md"})
    role = RadioField('Account Type', 
                     choices=[('c', 'Customer'), ('s', 'Staff')],
                     validators=[DataRequired()],
                     render_kw={"class": "mr-2"})
    submit = SubmitField('Create Account', render_kw={"class": "w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"})

class PizzaOrderForm(FlaskForm):
    type = SelectField('Pizza Type', validators=[DataRequired()], render_kw={"class": "w-full px-4 py-2 border rounded-md"})
    crust = SelectField('Crust Type', validators=[DataRequired()], render_kw={"class": "w-full px-4 py-2 border rounded-md"})
    size = SelectField('Size', validators=[DataRequired()], render_kw={"class": "w-full px-4 py-2 border rounded-md"})
    quantity = IntegerField('Quantity', 
                           validators=[DataRequired(), 
                                      NumberRange(min=1, max=10, message='Quantity must be between 1 and 10')],
                           render_kw={"class": "w-full px-4 py-2 border rounded-md", "min": "1", "max": "10"})
    price_per = FloatField('Price Per Pizza ($)', 
                          validators=[DataRequired()],
                          render_kw={"class": "w-full px-4 py-2 border rounded-md", "step": "0.01", "min": "0"})
    order_date = DateField('Order Date', 
                          validators=[DataRequired()], 
                          format='%Y-%m-%d',
                          render_kw={"class": "w-full px-4 py-2 border rounded-md"})
    submit = SubmitField('Submit Order', render_kw={"class": "w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-4"})

class ConfirmDeleteForm(FlaskForm):
    submit_yes = SubmitField('Yes, Delete', render_kw={"class": "py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"})
    submit_no = SubmitField('No, Cancel', render_kw={"class": "py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 ml-4"})