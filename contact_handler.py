# Contact form handler for MP communications
from flask import jsonify, request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import os
import json
from datetime import datetime
import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone):
    """Validate UK phone number format"""
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    # Check if it's a valid UK number (10-11 digits)
    return len(digits) in [10, 11] and digits.startswith(('07', '01', '02', '03'))

def validate_postcode(postcode):
    """Validate UK postcode format"""
    if not postcode:
        return False
    # Remove all spaces and convert to uppercase
    postcode = postcode.replace(" ", "").upper()
    # Basic format validation
    pattern = r'^[A-Z]{1,2}[0-9R][0-9A-Z]?[0-9][A-Z]{2}$'
    return bool(re.match(pattern, postcode))

def validate_contact_form(data):
    """Validate contact form data"""
    required_fields = ['name', 'email', 'subject', 'message', 'constituency']
    for field in required_fields:
        if not data.get(field):
            return False, f"Missing required field: {field}"
    
    # Validate email format
    if '@' not in data['email'] or '.' not in data['email']:
        return False, "Invalid email format"
    
    return True, None

def log_contact_attempt(data, success):
    """Log contact form submissions"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'constituency': data['constituency'],
        'success': success,
        'email': data['email']
    }
    
    try:
        with open('data/contact_log.json', 'a') as f:
            json.dump(log_entry, f)
            f.write('\n')
    except Exception as e:
        print(f"Error logging contact attempt: {e}")

def send_contact_email(data):
    """Send contact form email"""
    try:
        # Get email configuration from environment variables
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        smtp_user = os.getenv('SMTP_USER')
        smtp_pass = os.getenv('SMTP_PASS')
        
        if not all([smtp_user, smtp_pass]):
            return False, "Email configuration not set"
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = data['mp_email']
        msg['Subject'] = f"Constituent Contact: {data['subject']}"
        
        # Create email body
        body = f"""
        Constituent Message from {data['constituency']}
        
        From: {data['name']} ({data['email']})
        Subject: {data['subject']}
        
        Message:
        {data['message']}
        
        This message was sent via GovWhiz MP Contact System
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        
        return True, "Message sent successfully"
        
    except Exception as e:
        return False, f"Error sending email: {str(e)}"

def handle_contact_form():
    """Handle contact form submissions with improved validation and error handling"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400

        # Required fields
        required_fields = ['name', 'email', 'subject', 'message']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # Extract and clean data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        postcode = data.get('postcode', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        mp_id = data.get('mp_id', '').strip()

        # Validate name
        if len(name) < 2:
            return jsonify({
                "success": False,
                "error": "Name must be at least 2 characters long"
            }), 400

        # Validate email
        if not validate_email(email):
            return jsonify({
                "success": False,
                "error": "Invalid email format"
            }), 400

        # Validate phone if provided
        if phone and not validate_phone(phone):
            return jsonify({
                "success": False,
                "error": "Invalid UK phone number format"
            }), 400

        # Validate postcode if provided
        if postcode and not validate_postcode(postcode):
            return jsonify({
                "success": False,
                "error": "Invalid UK postcode format"
            }), 400

        # Validate subject
        if len(subject) < 5:
            return jsonify({
                "success": False,
                "error": "Subject must be at least 5 characters long"
            }), 400

        # Validate message
        if len(message) < 10:
            return jsonify({
                "success": False,
                "error": "Message must be at least 10 characters long"
            }), 400

        # Prepare contact data
        contact_data = {
            "name": name,
            "email": email,
            "phone": phone,
            "postcode": postcode,
            "subject": subject,
            "message": message,
            "mp_id": mp_id,
            "timestamp": datetime.now().isoformat(),
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string
        }

        # Here you would typically save the contact data to a database
        # For now, we'll just return success
        return jsonify({
            "success": True,
            "message": "Contact form submitted successfully",
            "data": {
                "name": name,
                "email": email,
                "subject": subject,
                "timestamp": contact_data["timestamp"]
            }
        })

    except Exception as e:
        # Log the error (in a production environment)
        print(f"Contact form error: {str(e)}")
        
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred. Please try again later."
        }), 500
