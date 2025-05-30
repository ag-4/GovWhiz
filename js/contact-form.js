// Contact form handling and validation
class MPContactForm {
    constructor() {
        this.modal = document.getElementById('contactFormModal');
        this.form = document.getElementById('mpContactForm');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal when clicking the close button
        const closeBtn = this.modal.querySelector('.close');
        closeBtn.onclick = () => this.hideModal();

        // Close modal when clicking outside
        window.onclick = (event) => {
            if (event.target === this.modal) {
                this.hideModal();
            }
        };

        // Form submission
        this.form.onsubmit = (e) => this.handleSubmit(e);
    }

    showModal(mpEmail) {
        this.form.reset();
        this.form.setAttribute('data-mp-email', mpEmail);
        this.modal.style.display = 'block';
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    showNotification(message, isSuccess) {
        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    async handleSubmit(event) {
        event.preventDefault();

        const formData = {
            name: this.form.name.value,
            email: this.form.email.value,
            subject: this.form.subject.value,
            message: this.form.message.value,
            constituency: this.form.constituency.value,
            mp_email: this.form.getAttribute('data-mp-email')
        };

        try {
            const response = await fetch('/.netlify/functions/app/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Message sent successfully!', true);
                this.hideModal();
            } else {
                this.showNotification(result.message || 'Failed to send message', false);
            }
        } catch (error) {
            this.showNotification('Error sending message. Please try again.', false);
            console.error('Contact form error:', error);
        }
    }
}

// Initialize contact form
const contactForm = new MPContactForm();

// Function to show contact form (called from MP profile template)
function showContactForm(mpEmail) {
    contactForm.showModal(mpEmail);
}
