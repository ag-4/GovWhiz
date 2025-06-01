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

# Constants
RECIPIENT_EMAIL = 'owl47d@gmail.com'
MAX_ATTEMPTS_PER_HOUR = 5
SPAM_KEYWORDS = ['viagra', 'lottery', 'winner', 'forex', 'crypto']

def detect_spam(text):
    """Use simple rules to detect spam messages"""
    text = text.lower()
    
    # Check for spam keywords
    if any(keyword in text for keyword in SPAM_KEYWORDS):
        return True
        
    # Check for excessive caps (shouting)
    caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
    if caps_ratio > 0.5:
        return True
        
    # Check for repetitive characters
    if re.search(r'(.)\1{4,}', text):
        return True
        
    return False

def check_rate_limit(email):
    """Check if user has exceeded rate limit"""
    try:
        with open('data/contact_log.json', 'r') as f:
            logs = [json.loads(line) for line in f if line.strip()]
            
        # Get attempts in the last hour
        one_hour_ago = datetime.now().timestamp() - 3600
        recent_attempts = sum(
            1 for log in logs 
            if log['email'] == email 
            and datetime.fromisoformat(log['timestamp']).timestamp() > one_hour_ago
        )
        
        return recent_attempts < MAX_ATTEMPTS_PER_HOUR
    except FileNotFoundError:
        return True
    except Exception as e:
        print(f"Rate limit check error: {e}")
        return True

def handle_contact_form():
    """Handle contact form submissions with improved validation and error handling"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400

        # Extract and clean data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        postcode = data.get('postcode', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        mp_id = data.get('mp_id', '').strip()

        # Perform validations
        if len(name) < 2:
            return jsonify({"success": False, "error": "Name must be at least 2 characters long"}), 400

        if not validate_email(email):
            return jsonify({"success": False, "error": "Invalid email format"}), 400

        if phone and not validate_phone(phone):
            return jsonify({"success": False, "error": "Invalid UK phone number format"}), 400

        if postcode and not validate_postcode(postcode):
            return jsonify({"success": False, "error": "Invalid UK postcode format"}), 400

        if len(subject) < 5:
            return jsonify({"success": False, "error": "Subject must be at least 5 characters long"}), 400

        if len(message) < 10:
            return jsonify({"success": False, "error": "Message must be at least 10 characters long"}), 400

        # Check for spam
        if detect_spam(message) or detect_spam(subject):
            log_contact_attempt(data, False)
            return jsonify({"success": False, "error": "Your message was flagged as potential spam"}), 400

        # Check rate limit
        if not check_rate_limit(email):
            log_contact_attempt(data, False)
            return jsonify({
                "success": False,
                "error": "Too many attempts. Please try again later."
            }), 429

        # Prepare and send email
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

        # Update recipient email
        data['mp_email'] = RECIPIENT_EMAIL

        # Send the email
        success, message = send_contact_email(data)
        
        if not success:
            log_contact_attempt(data, False)
            return jsonify({"success": False, "error": message}), 500

        # Log successful attempt
        log_contact_attempt(data, True)

        return jsonify({
            "success": True,
            "message": "Your message has been sent successfully",
            "data": {
                "name": name,
                "email": email,
                "subject": subject,
                "timestamp": contact_data["timestamp"]
            }
        })

    except Exception as e:
        print(f"Contact form error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred. Please try again later."
        }), 500
