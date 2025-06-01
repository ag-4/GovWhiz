/**
 * Enhanced Contact Form Handler
 * Handles MP contact form with email functionality
 */
class MPContactForm {
    constructor() {
        this.form = null;
        this.emailRecipient = 'owl47d@gmail.com';
        this.init();
    }

    init() {
        this.form = document.createElement('form');
        this.form.className = 'contact-form';
        this.form.innerHTML = this.getFormHTML();
        this.attachEventListeners();
    }

    getFormHTML() {
        return `
            <div class="form-group">
                <label for="name">Name <span class="required">*</span></label>
                <input type="text" id="name" name="name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="email">Email <span class="required">*</span></label>
                <input type="email" id="email" name="email" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="postcode">Postcode <span class="required">*</span></label>
                <input type="text" id="postcode" name="postcode" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="subject">Subject <span class="required">*</span></label>
                <input type="text" id="subject" name="subject" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="message">Message <span class="required">*</span></label>
                <textarea id="message" name="message" class="form-control" rows="5" required></textarea>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary">Send Message</button>
            </div>
        `;
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            postcode: formData.get('postcode'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            recipient: this.emailRecipient,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send message');
            }

            this.showSuccess('Your message has been sent successfully!');
            this.form.reset();

        } catch (error) {
            this.showError(error.message || 'Failed to send message. Please try again.');
        }
    }

    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.textContent = message;
        this.form.insertBefore(alert, this.form.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.textContent = message;
        this.form.insertBefore(alert, this.form.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }

    mount(container) {
        container.appendChild(this.form);
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mpContactForm = new MPContactForm();
});
