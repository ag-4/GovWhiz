/**
 * MP Lookup Integration Fix
 * This script fixes the MP lookup functionality by replacing the broken function
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for all scripts to load
    setTimeout(() => {
        if (window.findMPFixed) {
            console.log('🔧 Applying MP lookup fix...');
            
            // Replace the broken findMP function with the fixed version
            window.findMP = window.findMPFixed;
            
            // Update the MP lookup interface
            function showMPLookupFixed() {
                const resultsSection = document.getElementById('results');
                if (!resultsSection) return;
                
                resultsSection.innerHTML = `
                    <div class="mp-lookup-section">
                        <h2>🏛️ Find Your MP</h2>
                        <p>Enter your postcode to find your Member of Parliament and their contact information.</p>
                        
                        <div class="postcode-input-section">
                            <div class="input-group">
                                <input type="text" id="postcode-input" placeholder="Enter your postcode (e.g., SW1A 1AA)" maxlength="10">
                                <button onclick="performMPLookup()" class="search-btn">🔍 Find MP</button>
                            </div>
                            
                            <div class="example-postcodes">
                                <p><strong>Try these example postcodes:</strong></p>
                                <div class="example-buttons">
                                    <button onclick="tryPostcodeFixed('SW1A 1AA')" class="example-btn">SW1A 1AA (Westminster)</button>
                                    <button onclick="tryPostcodeFixed('WC1A 0AA')" class="example-btn">WC1A 0AA (Holborn)</button>
                                    <button onclick="tryPostcodeFixed('E1 6AN')" class="example-btn">E1 6AN (Bethnal Green)</button>
                                    <button onclick="tryPostcodeFixed('M1 1AA')" class="example-btn">M1 1AA (Manchester)</button>
                                    <button onclick="tryPostcodeFixed('B1 1AA')" class="example-btn">B1 1AA (Birmingham)</button>
                                </div>
                            </div>
                        </div>
                        
                        <div id="mp-results" class="mp-results"></div>
                        
                        <div class="mp-info-section">
                            <h3>📋 How to Contact Your MP</h3>
                            <div class="contact-tips">
                                <div class="tip-card">
                                    <h4>✉️ Email</h4>
                                    <p>Most effective way to contact your MP. Be clear, concise, and include your full address.</p>
                                </div>
                                <div class="tip-card">
                                    <h4>📞 Phone</h4>
                                    <p>Call their constituency office or Westminster office during business hours.</p>
                                </div>
                                <div class="tip-card">
                                    <h4>🏢 Surgery</h4>
                                    <p>Attend their regular constituency surgeries for face-to-face meetings.</p>
                                </div>
                                <div class="tip-card">
                                    <h4>📝 Letter</h4>
                                    <p>Write to their constituency office or House of Commons, Westminster, London SW1A 0AA.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="back-section">
                            <button onclick="showWelcomeMessage()" class="back-btn">← Back to Search</button>
                        </div>
                    </div>
                `;
                
                // Add event listener for Enter key
                const postcodeInput = document.getElementById('postcode-input');
                if (postcodeInput) {
                    postcodeInput.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            performMPLookup();
                        }
                    });
                }
            }
            
            // Fixed MP lookup function
            function performMPLookup() {
                const postcodeInput = document.getElementById('postcode-input');
                const mpResults = document.getElementById('mp-results');
                
                if (!postcodeInput || !mpResults) return;
                
                const postcode = postcodeInput.value.trim();
                
                if (!postcode) {
                    mpResults.innerHTML = '<p class="error">Please enter a postcode.</p>';
                    return;
                }
                
                console.log('🔍 Looking up MP for postcode:', postcode);
                
                // Show loading state
                mpResults.innerHTML = '<div class="loading">🔍 Looking up your MP...</div>';
                
                // Simulate a small delay for better UX
                setTimeout(() => {
                    const result = window.findMPFixed(postcode);
                    
                    if (result.found) {
                        const mp = result.mp;
                        const roleDisplay = mp.role ? `<div class="mp-role">🏛️ ${mp.role}</div>` : '';
                        const twitterDisplay = mp.twitter ? `<a href="https://twitter.com/${mp.twitter.substring(1)}" target="_blank" rel="noopener noreferrer">🐦 ${mp.twitter}</a>` : '';
                        
                        mpResults.innerHTML = `
                            <div class="mp-card">
                                <div class="mp-header">
                                    <h4>${mp.name}</h4>
                                    ${roleDisplay}
                                </div>
                                <p class="party">${mp.party} - ${mp.constituency}</p>
                                <div class="contact-info">
                                    <a href="mailto:${mp.email}" title="Send email to ${mp.name}">📧 Email</a>
                                    <a href="tel:${mp.phone}" title="Call ${mp.name}">📞 Phone</a>
                                    <a href="${mp.website}" target="_blank" rel="noopener noreferrer" title="Visit ${mp.name}'s Parliament profile">🌐 Parliament</a>
                                    ${twitterDisplay}
                                </div>
                                <div class="mp-actions">
                                    <button onclick="showEmailTemplate('support')" class="mp-action-btn">✉️ Support a Bill</button>
                                    <button onclick="showEmailTemplate('oppose')" class="mp-action-btn">❌ Oppose a Bill</button>
                                    <button onclick="showEmailTemplate('question')" class="mp-action-btn">❓ Ask Question</button>
                                    <button onclick="showEmailTemplate('meeting')" class="mp-action-btn">🤝 Request Meeting</button>
                                </div>
                            </div>
                            <div class="mp-info">
                                <p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-light);">
                                    ✅ <strong>Accurate Result:</strong> This MP lookup uses the correct postcode-to-constituency mapping.
                                    <br>📍 <strong>Constituency:</strong> ${result.constituency}
                                    <br>📮 <strong>Your Postcode:</strong> ${result.postcode}
                                </p>
                            </div>
                        `;
                        
                        console.log('✅ MP found successfully:', mp.name);
                    } else {
                        mpResults.innerHTML = `
                            <div class="mp-not-found">
                                <h4>❌ MP Not Found</h4>
                                <p>${result.message}</p>
                                <div class="alternative-options">
                                    <h5>Alternative Options:</h5>
                                    <ul>
                                        <li><a href="https://www.parliament.uk/get-involved/contact-your-mp/" target="_blank">Official Parliament MP Finder</a></li>
                                        <li><a href="https://www.theyworkforyou.com/" target="_blank">TheyWorkForYou.com</a></li>
                                        <li>Try a different postcode format (e.g., SW1A1AA or SW1A 1AA)</li>
                                    </ul>
                                </div>
                            </div>
                        `;
                        
                        console.log('❌ MP not found for postcode:', postcode);
                    }
                }, 500);
            }
            
            // Fixed try postcode function
            function tryPostcodeFixed(postcode) {
                const postcodeInput = document.getElementById('postcode-input');
                if (postcodeInput) {
                    postcodeInput.value = postcode;
                    performMPLookup();
                }
            }
            
            // Make functions globally available
            window.showMPLookupFixed = showMPLookupFixed;
            window.performMPLookup = performMPLookup;
            window.tryPostcodeFixed = tryPostcodeFixed;
            
            // Replace the original showMPLookup function
            window.showMPLookup = showMPLookupFixed;
            
            console.log('✅ MP lookup fix applied successfully');
            console.log('📍 Available postcodes:', Object.keys(window.postcodeToConstituency).slice(0, 5));
            
        } else {
            console.error('❌ MP lookup fix not available');
        }
    }, 1000);
});
