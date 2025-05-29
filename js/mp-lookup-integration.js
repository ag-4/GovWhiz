/**
 * MP Lookup Integration Script
 * Handles the integration between the MP lookup module and the UI
 */

document.addEventListener('DOMContentLoaded', function() {
    const postcodeInput = document.getElementById('postcode-input');
    const findMpBtn = document.getElementById('find-mp-btn');
    const mpResults = document.getElementById('mp-results');
    const mpLookup = window.mpLookup;
    let currentMP = null;

    async function displayMP(postcode) {
        if (!mpResults) return;
        
        mpResults.innerHTML = '<div class="loading-message"><div class="spinner"></div><p>Looking up your MP...</p></div>';
        
        try {
            const mp = await mpLookup.findMP(postcode);
            currentMP = mp;
            
            mpResults.innerHTML = `
                <div class="mp-card">
                    <div class="mp-header">
                        <h3>Your MP</h3>
                        <h2>${mp.name}</h2>
                    </div>
                    <div class="mp-info">
                        <p><strong>Constituency:</strong> ${mp.constituency}</p>
                        <p><strong>Party:</strong> ${mp.party}</p>
                        <p><strong>Email:</strong> <a href="mailto:${mp.email}">${mp.email}</a></p>
                        <p><strong>Phone:</strong> <a href="tel:${mp.phone}">${mp.phone}</a></p>
                        ${mp.role ? `<p><strong>Role:</strong> ${mp.role}</p>` : ''}
                        ${mp.website ? `<p><strong>Website:</strong> <a href="${mp.website}" target="_blank">Parliament Profile</a></p>` : ''}
                    </div>
                    <div class="mp-actions">
                        <button onclick="showTemplateDialog()" class="action-btn">Email Templates</button>
                        <a href="mailto:${mp.email}" class="action-btn secondary">Direct Email</a>
                    </div>
                </div>
            `;
        } catch (error) {
            mpResults.innerHTML = `<div class="error-message">${error.message}</div>`;
        }
    }

    // Event Listeners
    if (findMpBtn) {
        findMpBtn.addEventListener('click', () => {
            const postcode = postcodeInput.value.trim();
            if (postcode) displayMP(postcode);
        });
    }

    if (postcodeInput) {
        postcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const postcode = postcodeInput.value.trim();
                if (postcode) displayMP(postcode);
            }
        });
    }

    // Template Dialog Functions
    window.showTemplateDialog = function() {
        const dialog = document.getElementById('template-dialog');
        if (!dialog) return;
        
        dialog.classList.add('active');

        // Add click listeners to template options
        document.querySelectorAll('.template-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.template-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                const templateType = option.dataset.template;
                
                if (currentMP) {
                    const template = mpLookup.getEmailTemplate(templateType, currentMP.name, currentMP.constituency);
                    document.getElementById('template-preview').innerHTML = `
                        <div class="preview-header">
                            <strong>Subject:</strong> ${template.subject}
                        </div>
                        <div class="preview-body">
                            <pre>${template.body}</pre>
                        </div>
                    `;
                }
            });
        });
    };

    window.closeTemplateDialog = function() {
        const dialog = document.getElementById('template-dialog');
        if (dialog) {
            dialog.classList.remove('active');
        }
    };

    window.useSelectedTemplate = function() {
        const selectedOption = document.querySelector('.template-option.selected');
        if (!selectedOption || !currentMP) return;

        const templateType = selectedOption.dataset.template;
        const template = mpLookup.getEmailTemplate(templateType, currentMP.name, currentMP.constituency);
        
        if (template) {
            window.location.href = `mailto:${currentMP.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
            closeTemplateDialog();
        }
    };

    // Close dialog when clicking outside
    document.getElementById('template-dialog')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('template-popup')) {
            closeTemplateDialog();
        }
    });

    // Make functions globally available
    window.displayMP = displayMP;
});
