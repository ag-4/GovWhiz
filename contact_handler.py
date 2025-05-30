# Contact form handler for MP communications
from flask import jsonify, request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import os
import json
from datetime import datetime

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
    """Handle contact form submissions"""
    data = request.get_json()
    
    # Validate form data
    is_valid, error_message = validate_contact_form(data)
    if not is_valid:
        return jsonify({
            'success': False,
            'message': error_message
        }), 400
    
    # Send email
    success, message = send_contact_email(data)
    
    # Log the attempt
    log_contact_attempt(data, success)
    
    return jsonify({
        'success': success,
        'message': message
    })
