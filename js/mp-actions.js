// MP Actions - Handles MP information generation and contact functionality
class MPActions {
    constructor() {
        this.cache = new Map();
        this.currentMP = null;
    }

    // Display MP information after searching
    async displayMP(mp) {
        this.currentMP = mp;
        const resultsDiv = document.getElementById('mp-results');
        
        if (!resultsDiv) return;

        resultsDiv.innerHTML = `
            <div class="p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <div class="flex-1">
                        <h3 class="text-2xl font-semibold text-white mb-4">${mp.name}</h3>
                        <div class="space-y-3">
                            <p class="text-gray-300"><strong class="text-cyan-400">Constituency:</strong> ${mp.constituency}</p>
                            <p class="text-gray-300"><strong class="text-cyan-400">Party:</strong> ${mp.party}</p>
                            ${mp.role ? `<p class="text-gray-300"><strong class="text-cyan-400">Role:</strong> ${mp.role}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="space-y-3">
                            <div class="flex items-center">
                                <i class="fas fa-envelope text-cyan-400 w-6"></i>
                                <a href="mailto:${mp.email}" class="text-gray-300 hover:text-cyan-400 transition-colors">${mp.email}</a>
                            </div>
                            ${mp.phone ? `
                                <div class="flex items-center">
                                    <i class="fas fa-phone text-cyan-400 w-6"></i>
                                    <a href="tel:${mp.phone}" class="text-gray-300 hover:text-cyan-400 transition-colors">${mp.phone}</a>
                                </div>
                            ` : ''}
                            ${mp.website ? `
                                <div class="flex items-center">
                                    <i class="fas fa-globe text-cyan-400 w-6"></i>
                                    <a href="${mp.website}" target="_blank" class="text-gray-300 hover:text-cyan-400 transition-colors">Parliament Profile</a>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="mt-6 flex gap-4 flex-wrap">
                    <button onclick="mpActions.showContactForm()" class="action-btn">
                        <i class="fas fa-paper-plane"></i>
                        Contact MP
                    </button>
                    <button onclick="mpActions.showEmailTemplates()" class="action-btn secondary">
                        <i class="fas fa-envelope"></i>
                        Use Templates
                    </button>
                    <button onclick="mpActions.trackMP()" class="action-btn info">
                        <i class="fas fa-bell"></i>
                        Track Updates
                    </button>
                </div>
            </div>
        `;
    }

    // Show email templates modal
    showEmailTemplates() {
        if (!this.currentMP) return;

        const templates = {
            'general': {
                subject: 'Constituent Query',
                body: `Dear ${this.currentMP.name},\n\nI am writing to you as a constituent from ${this.currentMP.constituency} regarding...\n\n[Describe your issue or concern here]\n\nI would appreciate your response on this matter.\n\nYours sincerely,\n[Your Name]\n[Your Full Address]`
            },
            'meeting': {
                subject: 'Meeting Request - Constituent from ' + this.currentMP.constituency,
                body: `Dear ${this.currentMP.name},\n\nI am a constituent in ${this.currentMP.constituency} and would like to request a meeting to discuss...\n\n[Brief description of the topic]\n\nPossible meeting times:\n[Your availability]\n\nThank you for your time.\n\nYours sincerely,\n[Your Name]\n[Your Full Address]`
            },
            'issue': {
                subject: 'Urgent Local Issue - ' + this.currentMP.constituency,
                body: `Dear ${this.currentMP.name},\n\nI am writing regarding an urgent issue affecting our constituency...\n\n[Describe the issue]\n[Impact on the community]\n[Any proposed solutions]\n\nI would appreciate your attention to this matter.\n\nYours sincerely,\n[Your Name]\n[Your Full Address]`
            }
        };

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-white">📧 Email Templates</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    ${Object.entries(templates).map(([key, template]) => `
                        <button onclick="mpActions.useTemplate('${key}')" 
                            class="template-btn p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                            <div class="font-medium text-white mb-2">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                            <div class="text-sm text-gray-400">${template.subject}</div>
                        </button>
                    `).join('')}
                </div>

                <div class="bg-gray-800 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Tips for Effective Communication:</h4>
                    <ul class="text-sm text-gray-300 space-y-1">
                        <li>• Be clear and concise</li>
                        <li>• Include your full address to confirm you're a constituent</li>
                        <li>• Be respectful and professional</li>
                        <li>• State clearly what action you'd like them to take</li>
                    </ul>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Use a specific email template
    useTemplate(templateKey) {
        if (!this.currentMP) return;

        const templates = {
            'general': {
                subject: 'Constituent Query',
                body: `Dear ${this.currentMP.name},\n\nI am writing to you as a constituent from ${this.currentMP.constituency} regarding...\n\n[Describe your issue or concern here]\n\nI would appreciate your response on this matter.\n\nYours sincerely,\n[Your Name]\n[Your Full Address]`
            },
            'meeting': {
                subject: 'Meeting Request - Constituent from ' + this.currentMP.constituency,
                body: `Dear ${this.currentMP.name},\n\nI am a constituent in ${this.currentMP.constituency} and would like to request a meeting to discuss...\n\n[Brief description of the topic]\n\nPossible meeting times:\n[Your availability]\n\nThank you for your time.\n\nYours sincerely,\n[Your Name]\n[Your Full Address]`
            },
            'issue': {
                subject: 'Urgent Local Issue - ' + this.currentMP.constituency,
                body: `Dear ${this.currentMP.name},\n\nI am writing regarding an urgent issue affecting our constituency...\n\n[Describe the issue]\n[Impact on the community]\n[Any proposed solutions]\n\nI would appreciate your attention to this matter.\n\nYours sincerely,\n[Your Name]\n[Your Full Address]`
            }
        };

        const template = templates[templateKey];
        if (template) {
            window.location.href = `mailto:${this.currentMP.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
        }
    }

    // Show contact form
    showContactForm() {
        if (!this.currentMP) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-white">Contact Your MP</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="mpContactForm" onsubmit="mpActions.handleContactSubmit(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Your Name</label>
                            <input type="text" name="name" required
                                class="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Your Email</label>
                            <input type="email" name="email" required
                                class="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm text-gray-400 mb-1">Subject</label>
                        <input type="text" name="subject" required
                            class="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm text-gray-400 mb-1">Your Message</label>
                        <textarea name="message" rows="6" required
                            class="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white resize-none"></textarea>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm text-gray-400 mb-1">Your Address</label>
                        <textarea name="address" rows="2" required
                            class="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white resize-none"
                            placeholder="Please include your full address to confirm you're a constituent"></textarea>
                    </div>
                    
                    <button type="submit" 
                        class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                        Send Message
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Handle contact form submission
    async handleContactSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        // In a real application, this would send the data to a server
        // For now, we'll just simulate sending the email
        const data = {
            to: this.currentMP.email,
            from: formData.get('email'),
            name: formData.get('name'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            address: formData.get('address')
        };

        // Show success message
        const modal = form.closest('.fixed');
        modal.innerHTML = `
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full text-center">
                <div class="text-5xl mb-4">✅</div>
                <h3 class="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p class="text-gray-400 mb-4">Your message has been sent to ${this.currentMP.name}.</p>
                <button onclick="this.closest('.fixed').remove()"
                    class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                    Close
                </button>
            </div>
        `;
    }

    // Generate MP information based on type
    async generateMPInfo(type) {
        if (!this.currentMP) {
            alert('Please find your MP first');
            return;
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        loadingDiv.innerHTML = `
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p class="text-gray-400">Generating ${type} information...</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);

        try {
            // Simulate API call with setTimeout
            await new Promise(resolve => setTimeout(resolve, 2000));

            let title, content;
            switch (type) {
                case 'background':
                    title = 'MP Background';
                    content = this.generateBackgroundInfo();
                    break;
                case 'voting':
                    title = 'Voting Record';
                    content = this.generateVotingRecord();
                    break;
                case 'interests':
                    title = 'Declared Interests';
                    content = this.generateInterests();
                    break;
            }

            // Remove loading div
            loadingDiv.remove();

            // Show results modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-white">${title}</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    ${content}
                </div>
            `;
            document.body.appendChild(modal);

        } catch (error) {
            loadingDiv.remove();
            alert('Error generating information. Please try again.');
        }
    }

    // Generate background information
    generateBackgroundInfo() {
        return `
            <div class="space-y-6">
                <div class="bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Career Timeline</h4>
                    <ul class="space-y-3">
                        <li class="text-gray-300">🎓 Education: Oxford University, Politics & Economics</li>
                        <li class="text-gray-300">💼 Previous Roles: Local Councillor (2015-2018)</li>
                        <li class="text-gray-300">🏛️ Parliament: First elected in 2019</li>
                    </ul>
                </div>

                <div class="bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Committee Memberships</h4>
                    <ul class="space-y-2">
                        <li class="text-gray-300">• Environment and Climate Change Committee</li>
                        <li class="text-gray-300">• Digital, Culture, Media and Sport Committee</li>
                    </ul>
                </div>

                <div class="bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Areas of Interest</h4>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 bg-cyan-900/30 text-cyan-400 rounded-full text-sm">Environment</span>
                        <span class="px-3 py-1 bg-cyan-900/30 text-cyan-400 rounded-full text-sm">Digital Policy</span>
                        <span class="px-3 py-1 bg-cyan-900/30 text-cyan-400 rounded-full text-sm">Education</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate voting record
    generateVotingRecord() {
        return `
            <div class="space-y-6">
                <div class="bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Recent Votes</h4>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <div class="text-white">Environment Bill 2024</div>
                                <span class="px-2 py-1 bg-green-900/30 text-green-400 rounded text-sm">Voted For</span>
                            </div>
                            <p class="text-sm text-gray-400">Key legislation on environmental protection and climate action</p>
                        </div>
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <div class="text-white">Digital Markets Bill</div>
                                <span class="px-2 py-1 bg-red-900/30 text-red-400 rounded text-sm">Voted Against</span>
                            </div>
                            <p class="text-sm text-gray-400">Regulations for digital platforms and online services</p>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Voting Statistics</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-semibold text-white">92%</div>
                            <div class="text-sm text-gray-400">Attendance</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-semibold text-white">245</div>
                            <div class="text-sm text-gray-400">Total Votes</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-semibold text-white">82%</div>
                            <div class="text-sm text-gray-400">With Party</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-semibold text-white">18%</div>
                            <div class="text-sm text-gray-400">Rebel Votes</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate declared interests
    generateInterests() {
        return `
            <div class="space-y-6">
                <div class="bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Financial Interests</h4>
                    <div class="space-y-3">
                        <div>
                            <div class="text-white mb-1">Advisory Role - Tech Solutions Ltd</div>
                            <p class="text-sm text-gray-400">£2,000 per month for 10 hours of consultation</p>
                        </div>
                        <div>
                            <div class="text-white mb-1">Book Advance - Political Publishing House</div>
                            <p class="text-sm text-gray-400">£5,000 advance for upcoming publication</p>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Property Interests</h4>
                    <ul class="space-y-2 text-gray-300">
                        <li>• Residential property in London (Rental Income)</li>
                        <li>• Office space in constituency (Part ownership)</li>
                    </ul>
                </div>

                <div class="bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Other Relevant Interests</h4>
                    <ul class="space-y-2 text-gray-300">
                        <li>• Trustee - Local Education Foundation</li>
                        <li>• Member - Environmental Policy Group</li>
                        <li>• Patron - Community Arts Project</li>
                    </ul>
                </div>

                <div class="bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-cyan-400 font-medium mb-2">Register Updates</h4>
                    <p class="text-gray-400 text-sm">Last updated: March 15, 2024</p>
                </div>
            </div>
        `;
    }

    // Track MP updates
    trackMP() {
        if (!this.currentMP) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full text-center">
                <div class="text-5xl mb-4">🔔</div>
                <h3 class="text-xl font-semibold text-white mb-2">Track ${this.currentMP.name}</h3>
                <p class="text-gray-400 mb-4">You'll receive notifications about:</p>
                <ul class="text-left text-gray-300 space-y-2 mb-6">
                    <li>✓ Voting activity</li>
                    <li>✓ Parliamentary speeches</li>
                    <li>✓ Committee work</li>
                    <li>✓ Constituency events</li>
                </ul>
                <div class="flex gap-4">
                    <button onclick="this.closest('.fixed').remove()"
                        class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                        Start Tracking
                    </button>
                    <button onclick="this.closest('.fixed').remove()"
                        class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }
}

// Initialize the MP Actions
const mpActions = new MPActions();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const postcodeInput = document.getElementById('postcodeInput');
    const findMpBtn = document.getElementById('find-mp-btn');
    
    if (findMpBtn && postcodeInput) {
        findMpBtn.addEventListener('click', async () => {
            const postcode = postcodeInput.value.trim();
            if (!postcode) {
                alert('Please enter a postcode');
                return;
            }

            try {
                // Sample MP data for demonstration
                const mp = {
                    name: 'Rt Hon Sir John Smith MP',
                    constituency: 'Sample Constituency',
                    party: 'Conservative Party',
                    email: 'john.smith.mp@parliament.uk',
                    phone: '020 7219 4000',
                    website: 'https://members.parliament.uk/member/1234/contact',
                    role: 'Member of Parliament'
                };

                mpActions.displayMP(mp);
            } catch (error) {
                alert('Error finding MP. Please try again.');
            }
        });
    }
});
