"""
Enhanced Contact Form Handler
Handles contact form submissions and email sending
"""
from flask import jsonify, request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import os
import json
from datetime import datetime, timedelta
import re
from typing import Dict, Tuple
import logging

class ContactFormHandler:
    def __init__(self):
        self.recipient_email = 'owl47d@gmail.com'
        self.smtp_server = 'smtp.gmail.com'
        self.smtp_port = 587
        self.rate_limit_window = timedelta(hours=1)
        self.max_attempts = 5
        self.attempts = {}
        self.spam_keywords = ['viagra', 'lottery', 'winner', 'forex', 'crypto']
        self.log_file = 'data/contact_log.json'

    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    def validate_postcode(self, postcode: str) -> bool:
        """Validate UK postcode format"""
        pattern = r'^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$'
        return bool(re.match(pattern, postcode.upper()))

    def check_rate_limit(self, email: str) -> bool:
        """Check if user has exceeded rate limit"""
        now = datetime.now()
        if email in self.attempts:
            # Clean up old attempts
            self.attempts[email] = [
                time for time in self.attempts[email]
                if now - time < self.rate_limit_window
            ]
            # Check limit
            if len(self.attempts[email]) >= self.max_attempts:
                return False
        else:
            self.attempts[email] = []
        
        self.attempts[email].append(now)
        return True

    def detect_spam(self, text: str) -> bool:
        """Detect potential spam messages"""
        text = text.lower()
        # Check for spam keywords
        if any(keyword in text for keyword in self.spam_keywords):
            return True
        
        # Check for excessive caps
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
        if caps_ratio > 0.5:
            return True
        
        # Check for repetitive patterns
        if any(text.count(word) > 3 for word in text.split()):
            return True
        
        return False

    def log_attempt(self, data: Dict, success: bool):
        """Log contact form submission"""
        try:
            log_entry = {
                'timestamp': datetime.now().isoformat(),
                'email': data['email'],
                'postcode': data['postcode'],
                'success': success,
                'ip_address': request.remote_addr
            }
            
            with open(self.log_file, 'a') as f:
                json.dump(log_entry, f)
                f.write('\n')
        except Exception as e:
            logging.error(f"Error logging contact attempt: {e}")

    def send_email(self, data: Dict) -> Tuple[bool, str]:
        """Send contact form email"""
        try:
            msg = MIMEMultipart()
            msg['From'] = data['email']
            msg['To'] = self.recipient_email
            msg['Subject'] = f"MP Contact Form: {data['subject']}"
            
            body = f"""
            New message from constituent:
            
            Name: {data['name']}
            Email: {data['email']}
            Postcode: {data['postcode']}
            Subject: {data['subject']}
            
            Message:
            {data['message']}
            
            Sent via GovWhiz MP Contact System
            Timestamp: {datetime.now().isoformat()}
            IP: {request.remote_addr}
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Get SMTP credentials from environment
            smtp_user = os.getenv('SMTP_USER')
            smtp_pass = os.getenv('SMTP_PASS')
            
            if not all([smtp_user, smtp_pass]):
                raise Exception("Email configuration not set")
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            
            return True, "Message sent successfully"
            
        except Exception as e:
            logging.error(f"Error sending email: {e}")
            return False, str(e)

    def handle_submission(self) -> Tuple[Dict, int]:
        """Handle contact form submission"""
        try:
            data = request.get_json()
            if not data:
                return {"success": False, "error": "No data provided"}, 400
            
            # Validate required fields
            required_fields = ['name', 'email', 'postcode', 'subject', 'message']
            if not all(field in data for field in required_fields):
                return {"success": False, "error": "Missing required fields"}, 400
            
            # Validate email
            if not self.validate_email(data['email']):
                return {"success": False, "error": "Invalid email format"}, 400
            
            # Validate postcode
            if not self.validate_postcode(data['postcode']):
                return {"success": False, "error": "Invalid UK postcode format"}, 400
            
            # Check rate limit
            if not self.check_rate_limit(data['email']):
                self.log_attempt(data, False)
                return {
                    "success": False,
                    "error": "Too many attempts. Please try again later."
                }, 429
            
            # Check for spam
            if self.detect_spam(data['subject']) or self.detect_spam(data['message']):
                self.log_attempt(data, False)
                return {
                    "success": False,
                    "error": "Your message was flagged as potential spam"
                }, 400
            
            # Send email
            success, message = self.send_email(data)
            
            if not success:
                self.log_attempt(data, False)
                return {"success": False, "error": message}, 500
            
            # Log successful attempt
            self.log_attempt(data, True)
            
            return {
                "success": True,
                "message": "Your message has been sent successfully",
                "data": {
                    "name": data['name'],
                    "email": data['email'],
                    "timestamp": datetime.now().isoformat()
                }
            }, 200
            
        except Exception as e:
            logging.error(f"Contact form error: {e}")
            return {
                "success": False,
                "error": "An unexpected error occurred. Please try again later."
            }, 500

contact_handler = ContactFormHandler()
