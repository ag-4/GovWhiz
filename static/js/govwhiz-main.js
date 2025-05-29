// MP Data Cache
let mpData = null;

// MP Lookup Integration
async function findMPFlask(postcode) {
    console.log('🏛️ Looking up MP for:', postcode);

    const mpResults = document.getElementById('mp-results');
    if (!mpResults) return;

    mpResults.innerHTML = '<div class="text-cyan-400 text-center">🔍 Looking up your MP...</div>';

    try {
        // Load MP data if not loaded
        if (!mpData) {
            const response = await fetch('static/data/mp_data.json');
            mpData = await response.json();
        }

        const data = mpData[postcode.toUpperCase()] || null;

        if (data && data.found) {
            const mockBadge = '<div class="text-xs text-blue-400 mb-2">📋 Demo Data</div>';

            mpResults.innerHTML = `
                <div class="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-lg p-6">
                    ${mockBadge}
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h4 class="text-xl font-semibold text-white">${data.name}</h4>
                            <div class="text-sm text-purple-400">${data.party}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-400">Constituency</div>
                            <div class="text-white font-medium">${data.constituency}</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        ${data.email ? `
                            <a href="mailto:${data.email}" class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Email
                            </a>
                        ` : '<div class="text-gray-500 text-sm">Email not available</div>'}
                        ${data.phone ? `
                            <a href="tel:${data.phone}" class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                Phone
                            </a>
                        ` : '<div class="text-gray-500 text-sm">Phone not available</div>'}
                        ${data.website ? `
                            <a href="${data.website}" target="_blank" class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                                </svg>
                                Parliament
                            </a>
                        ` : '<div></div>'}
                        <div class="text-xs text-gray-500">
                            🆓 UK Gov Data
                        </div>
                    </div>
                    <div class="text-sm text-gray-400 bg-gray-800/30 rounded p-3">
                        ✅ Found MP for ${postcode}.
                        ${new Date().toLocaleString()}
                    </div>
                </div>
            `;
        } else {
            mpResults.innerHTML = `
                <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 text-center">
                    <h4 class="text-red-400 font-semibold mb-2">❌ MP Not Found</h4>
                    <p class="text-gray-400">Please check your postcode and try again.</p>
                    <div class="mt-4">
                        <p class="text-gray-300 font-medium mb-2">Try these example postcodes:</p>
                        <div class="flex flex-wrap gap-2 justify-center">
                            <button onclick="tryPostcode('SW1A 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">SW1A 1AA</button>
                            <button onclick="tryPostcode('M1 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">M1 1AA</button>
                            <button onclick="tryPostcode('B1 1AA')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded text-sm transition-colors">B1 1AA</button>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error in MP lookup:', error);
        mpResults.innerHTML = `
            <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 text-center">
                <h4 class="text-red-400 font-semibold mb-2">❌ Lookup Error</h4>
                <p class="text-gray-400">An error occurred. Please try again.</p>
            </div>
        `;
    }
}

// Global helper functions
window.tryPostcode = function(postcode) {
    const postcodeInput = document.getElementById('postcode-input');
    if (postcodeInput) {
        postcodeInput.value = postcode;
        findMPFlask(postcode);
    }
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const findMpBtn = document.getElementById('find-mp-btn');
    const postcodeInput = document.getElementById('postcode-input');
    const contactForm = document.getElementById('contact-form');

    // MP lookup
    if (findMpBtn && postcodeInput) {
        findMpBtn.addEventListener('click', function() {
            const postcode = postcodeInput.value.trim();
            if (postcode) {
                findMPFlask(postcode);
            } else {
                alert('Please enter a valid postcode');
            }
        });

        postcodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const postcode = postcodeInput.value.trim();
                if (postcode) {
                    findMPFlask(postcode);
                }
            }
        });
    }

    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name');

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'bg-green-900/30 border border-green-500/30 rounded-lg p-4 mt-4';
            successDiv.innerHTML = `
                <h4 class="text-green-400 font-semibold mb-2">✅ Message Sent!</h4>
                <p class="text-gray-300">Thank you ${name}, your message has been received!</p>
            `;

            contactForm.appendChild(successDiv);
            contactForm.reset();

            setTimeout(() => {
                successDiv.remove();
            }, 5000);
        });
    }
});
