/**
 * Contact Form Handler
 * Handles the contact form submission and email sending functionality
 */
class ContactHandler {
    constructor() {
        this.emailRecipient = 'owl47d@gmail.com';
    }

    async submitContactForm(data) {
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    recipient: this.emailRecipient
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const result = await response.json();
            return {
                success: true,
                message: 'Your message has been sent successfully'
            };
        } catch (error) {
            console.error('Contact form error:', error);
            return {
                success: false,
                error: error.message || 'Failed to send message. Please try again.'
            };
        }
    }

    validateForm(data) {
        const errors = {};

        if (!data.name?.trim()) {
            errors.name = 'Name is required';
        }

        if (!data.email?.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!data.message?.trim()) {
            errors.message = 'Message is required';
        }

        if (!data.postcode?.trim()) {
            errors.postcode = 'Postcode is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}
