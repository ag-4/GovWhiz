document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // MP Elements
    const postcodeInput = document.getElementById('postcode-input');
    const findMpBtn = document.getElementById('find-mp-btn');
    const postcodeSuggestions = document.getElementById('postcode-suggestions');
    const mpResults = document.getElementById('mp-results');
    const postcodeExamples = document.querySelectorAll('.postcode-example');
    
    // Lords Elements
    const lordsSearch = document.getElementById('lords-search');
    const findLordsBtn = document.getElementById('find-lords-btn');
    const lordsSuggestions = document.getElementById('lords-suggestions');
    const lordsResults = document.getElementById('lords-results');
    const expertiseButtons = document.querySelectorAll('.expertise-btn');

    // Regular expression for UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

    // Comprehensive MP Database
    const MPDatabase = {
        // England - London
        'SW1A': {
            name: 'Nickie Aiken',
            constituency: 'Cities of London and Westminster',
            party: 'Conservative',
            email: 'nickie.aiken.mp@parliament.uk',
            phone: '020 7219 4028',
            surgeries: 'Monthly, by appointment',
            majorIssues: ['Business', 'Tourism', 'Housing']
        },
        'E1': {
            name: 'Rushanara Ali',
            constituency: 'Bethnal Green and Bow',
            party: 'Labour',
            email: 'rushanara.ali.mp@parliament.uk',
            phone: '020 7219 7200',
            surgeries: 'Weekly, Friday afternoons',
            majorIssues: ['Housing', 'Education', 'Immigration']
        },

        // South East England
        'RG1': {
            name: 'Matt Rodda',
            constituency: 'Reading East',
            party: 'Labour',
            email: 'matt.rodda.mp@parliament.uk',
            phone: '0118 936 3170',
            surgeries: 'Regular surgeries in Reading',
            majorIssues: ['Transport', 'Education', 'Environment']
        },
        'BN1': {
            name: 'Caroline Lucas',
            constituency: 'Brighton Pavilion',
            party: 'Green',
            email: 'caroline.lucas.mp@parliament.uk',
            phone: '020 7219 7025',
            surgeries: 'Regular surgeries across Brighton',
            majorIssues: ['Environment', 'Social Justice', 'Brexit']
        },

        // South West England
        'BS1': {
            name: 'Thangam Debbonaire',
            constituency: 'Bristol West',
            party: 'Labour',
            email: 'thangam.debbonaire.mp@parliament.uk',
            phone: '0117 379 0980',
            surgeries: 'Regular surgeries across Bristol',
            majorIssues: ['Arts & Culture', 'Housing', 'Environment']
        },
        'EX1': {
            name: 'Ben Bradshaw',
            constituency: 'Exeter',
            party: 'Labour',
            email: 'ben.bradshaw.mp@parliament.uk',
            phone: '01392 424464',
            surgeries: 'Regular surgeries in Exeter',
            majorIssues: ['NHS', 'Environment', 'Brexit']
        },

        // East of England
        'CB1': {
            name: 'Daniel Zeichner',
            constituency: 'Cambridge',
            party: 'Labour',
            email: 'daniel.zeichner.mp@parliament.uk',
            phone: '01223 423252',
            surgeries: 'Regular surgeries in Cambridge',
            majorIssues: ['Education', 'Science', 'Transport']
        },
        'NR1': {
            name: 'Clive Lewis',
            constituency: 'Norwich South',
            party: 'Labour',
            email: 'clive.lewis.mp@parliament.uk',
            phone: '01603 219890',
            surgeries: 'Regular surgeries in Norwich',
            majorIssues: ['Environment', 'Mental Health', 'Housing']
        },

        // West Midlands
        'B1': {
            name: 'Shabana Mahmood',
            constituency: 'Birmingham Ladywood',
            party: 'Labour',
            email: 'shabana.mahmood.mp@parliament.uk',
            phone: '0121 236 4577',
            surgeries: 'Weekly surgeries across constituency',
            majorIssues: ['Housing', 'Employment', 'Education']
        },
        'CV1': {
            name: 'Taiwo Owatemi',
            constituency: 'Coventry North West',
            party: 'Labour',
            email: 'taiwo.owatemi.mp@parliament.uk',
            phone: '020 7219 6446',
            surgeries: 'Regular surgeries in Coventry',
            majorIssues: ['Health', 'Education', 'Housing']
        },

        // East Midlands
        'NG1': {
            name: 'Nadia Whittome',
            constituency: 'Nottingham East',
            party: 'Labour',
            email: 'nadia.whittome.mp@parliament.uk',
            phone: '020 7219 6384',
            surgeries: 'Regular surgeries in Nottingham',
            majorIssues: ['Social Justice', 'Climate Change', 'Housing']
        },
        'LE1': {
            name: 'Jonathan Ashworth',
            constituency: 'Leicester South',
            party: 'Labour',
            email: 'jon.ashworth.mp@parliament.uk',
            phone: '0116 251 1927',
            surgeries: 'Regular surgeries in Leicester',
            majorIssues: ['Health', 'Education', 'Welfare']
        },

        // Yorkshire and the Humber
        'S1': {
            name: 'Paul Blomfield',
            constituency: 'Sheffield Central',
            party: 'Labour',
            email: 'paul.blomfield.mp@parliament.uk',
            phone: '0114 272 2882',
            surgeries: 'Regular surgeries in Sheffield',
            majorIssues: ['Education', 'Brexit', 'Mental Health']
        },
        'HU1': {
            name: 'Emma Hardy',
            constituency: 'Kingston upon Hull West and Hessle',
            party: 'Labour',
            email: 'emma.hardy.mp@parliament.uk',
            phone: '01482 219211',
            surgeries: 'Regular surgeries in Hull',
            majorIssues: ['Education', 'Fishing Industry', 'Transport']
        },

        // North West England
        'M1': {
            name: 'Lucy Powell',
            constituency: 'Manchester Central',
            party: 'Labour',
            email: 'lucy.powell.mp@parliament.uk',
            phone: '0161 232 0872',
            surgeries: 'Weekly surgeries across Manchester',
            majorIssues: ['Education', 'Housing', 'Employment']
        },
        'L1': {
            name: 'Kim Johnson',
            constituency: 'Liverpool Riverside',
            party: 'Labour',
            email: 'kim.johnson.mp@parliament.uk',
            phone: '0151 236 4045',
            surgeries: 'Regular surgeries in Liverpool',
            majorIssues: ['Housing', 'Poverty', 'Education']
        },

        // North East England
        'NE1': {
            name: 'Chi Onwurah',
            constituency: 'Newcastle upon Tyne Central',
            party: 'Labour',
            email: 'chi.onwurah.mp@parliament.uk',
            phone: '0191 232 5838',
            surgeries: 'Regular surgeries in Newcastle',
            majorIssues: ['Science & Technology', 'Industry', 'Education']
        },
        'SR1': {
            name: 'Julie Elliott',
            constituency: 'Sunderland Central',
            party: 'Labour',
            email: 'julie.elliott.mp@parliament.uk',
            phone: '0191 565 5327',
            surgeries: 'Regular surgeries in Sunderland',
            majorIssues: ['Industry', 'Employment', 'Health']
        },

        // Scotland
        'G1': {
            name: 'Alison Thewliss',
            constituency: 'Glasgow Central',
            party: 'Scottish National Party',
            email: 'alison.thewliss.mp@parliament.uk',
            phone: '0141 552 7117',
            surgeries: 'Regular surgeries across Glasgow',
            majorIssues: ['Scottish Independence', 'Poverty', 'Housing']
        },
        'EH1': {
            name: 'Deidre Brock',
            constituency: 'Edinburgh North and Leith',
            party: 'Scottish National Party',
            email: 'deidre.brock.mp@parliament.uk',
            phone: '0131 555 7009',
            surgeries: 'Regular surgeries across Edinburgh',
            majorIssues: ['Scottish Independence', 'Culture', 'Environment']
        },

        // Wales
        'CF1': {
            name: 'Jo Stevens',
            constituency: 'Cardiff Central',
            party: 'Labour',
            email: 'jo.stevens.mp@parliament.uk',
            phone: '029 2039 8339',
            surgeries: 'Regular surgeries across Cardiff',
            majorIssues: ['Education', 'Culture', 'Welsh Affairs']
        },
        'SA1': {
            name: 'Carolyn Harris',
            constituency: 'Swansea East',
            party: 'Labour',
            email: 'carolyn.harris.mp@parliament.uk',
            phone: '01792 462054',
            surgeries: 'Regular surgeries in Swansea',
            majorIssues: ['Poverty', 'Gambling Reform', "Women's Rights"]
        },

        // Northern Ireland
        'BT1': {
            name: 'Paul Maskey',
            constituency: 'Belfast West',
            party: 'Sinn Féin',
            email: 'paul.maskey.mp@parliament.uk',
            phone: '028 9024 0770',
            surgeries: 'Regular surgeries across West Belfast',
            majorIssues: ['Peace Process', 'Housing', 'Employment']
        },
        'BT7': {
            name: 'Claire Hanna',
            constituency: 'Belfast South',
            party: 'SDLP',
            email: 'claire.hanna.mp@parliament.uk',
            phone: '028 9024 2999',
            surgeries: 'Regular surgeries in South Belfast',
            majorIssues: ['Brexit', 'Economic Development', 'Environment']
        }
        // ... and many more constituencies
    };

    const LordsDatabase = [
        {
            name: 'Baroness Smith of Basildon',
            role: 'Leader of the Opposition in the House of Lords',
            party: 'Labour',
            expertise: ['Economy', 'Foreign Affairs', 'Constitutional Affairs'],
            email: 'smithb@parliament.uk',
            committees: ['Liaison Committee', 'Procedure Committee'],
            appointed: '2010',
            biography: 'Former MP for Basildon and South Thurrock'
        },
        {
            name: 'Lord Fowler',
            role: 'Former Lord Speaker',
            party: 'Conservative',
            expertise: ['Health', 'Education', 'Media'],
            email: 'fowlern@parliament.uk',
            committees: ['Communications Committee'],
            appointed: '2001',
            biography: 'Former Secretary of State for Health'
        },
        {
            name: 'Baroness Brown of Cambridge',
            role: 'Chair of the Carbon Trust',
            party: 'Crossbench',
            expertise: ['Environment', 'Science', 'Engineering'],
            email: 'brownj@parliament.uk',
            committees: ['Science and Technology Committee', 'Climate Change Committee'],
            appointed: '2008',
            biography: 'Former Vice Chancellor of Aston University'
        },
        {
            name: 'Lord Patel',
            role: 'Former Chair of the Science and Technology Committee',
            party: 'Crossbench',
            expertise: ['Healthcare', 'Medical Research', 'Science Policy'],
            email: 'patelk@parliament.uk',
            committees: ['Science and Technology Committee'],
            appointed: '1999',
            biography: 'Distinguished professor of obstetrics'
        }
    ];

    // Tab Handling
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
    });

    // MP Search Functionality
    postcodeInput?.addEventListener('input', debounce(async (e) => {
        const postcode = e.target.value.trim().toUpperCase();
        if (postcode.length < 2) {
            postcodeSuggestions.innerHTML = '';
            return;
        }
        await getPostcodeSuggestions(postcode);
    }, 300));

    findMpBtn?.addEventListener('click', () => findMP());
    
    postcodeInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') findMP();
    });

    postcodeExamples.forEach(button => {
        button.addEventListener('click', () => {
            postcodeInput.value = button.dataset.postcode;
            findMP();
        });
    });

    // Lords Search Functionality
    lordsSearch?.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            lordsSuggestions.innerHTML = '';
            return;
        }
        await searchLords(query);
    }, 300));

    findLordsBtn?.addEventListener('click', () => {
        const query = lordsSearch.value.trim();
        if (query) searchLords(query, true);
    });

    expertiseButtons.forEach(button => {
        button.addEventListener('click', () => {
            searchLordsByExpertise(button.dataset.expertise);
        });
    });

    // Helper Functions
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function validatePostcode(postcode) {
        return postcodeRegex.test(postcode);
    }

    function showLoading(element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Searching...</p>
            </div>
        `;
    }

    function showError(element, message, title = 'Error') {
        element.innerHTML = `
            <div class="error-message">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
    }

    // MP Search Functions
    async function getPostcodeSuggestions(postcode) {
        try {
            const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}/autocomplete`);
            const data = await response.json();
            
            if (data.result) {
                const suggestions = data.result
                    .map(pc => `<div class="suggestion" data-postcode="${pc}">${pc}</div>`)
                    .join('');
                postcodeSuggestions.innerHTML = suggestions || '<div class="no-results">No matching postcodes found</div>';
            }
        } catch (error) {
            console.error('Error fetching postcode suggestions:', error);
            postcodeSuggestions.innerHTML = '';
        }
    }

    // Postcode API Integration
    async function validateAndLookupPostcode(postcode) {
        try {
            // First validate the postcode format
            const formattedPostcode = formatPostcode(postcode);
            if (!postcodeRegex.test(formattedPostcode)) {
                throw new Error('Invalid postcode format');
            }

            // Call postcode.io API to validate and get location data
            const response = await fetch(`https://api.postcodes.io/postcodes/${formattedPostcode}`);
            const data = await response.json();

            if (!data.result) {
                throw new Error('Postcode not found');
            }

            // Extract constituency information
            const constituency = data.result.parliamentary_constituency;
            
            // Find MP by constituency name
            const mp = findMPByConstituency(constituency);
            if (mp) {
                return mp;
            }

            // If MP not found in our database, try Parliament API
            return await lookupMPFromAPI(formattedPostcode, constituency);
        } catch (error) {
            console.error('Postcode lookup error:', error);
            throw error;
        }
    }

    function findMPByConstituency(constituencyName) {
        return Object.values(MPDatabase).find(mp => 
            mp.constituency.toLowerCase() === constituencyName.toLowerCase()
        );
    }

    // Enhanced MP lookup with fallback options
    async function lookupMPFromAPI(postcode, constituency) {
        try {
            // Try Parliament API first
            const parliamentApiUrl = `https://members-api.parliament.uk/api/Location/Constituency/Search/${constituency}`;
            const response = await fetch(parliamentApiUrl);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const mpInfo = data.items[0].value.currentRepresentation.member;
                
                // Format the data
                const mp = {
                    name: mpInfo.nameDisplayAs,
                    constituency: constituency,
                    party: mpInfo.latestParty.name,
                    email: mpInfo.email || `${mpInfo.nameDisplayAs.toLowerCase().replace(/ /g, '.')}@parliament.uk`,
                    phone: mpInfo.phone || '020 7219 3000',
                    surgeries: 'Please contact the office for surgery times',
                    majorIssues: ['Constituency Matters']
                };

                // Cache the result
                const outwardCode = postcode.split(' ')[0];
                MPDatabase[outwardCode] = mp;

                return mp;
            }
            
            throw new Error('MP not found in Parliament API');
        } catch (error) {
            console.error('Parliament API lookup error:', error);
            throw error;
        }
    }

    // Enhanced postcode formatting
    function formatPostcode(postcode) {
        // Remove all non-alphanumeric characters
        postcode = postcode.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Add space in the correct position
        if (postcode.length > 3) {
            return `${postcode.slice(0, -3)} ${postcode.slice(-3)}`;
        }
        return postcode;
    }

    // Display functions
    function displayMPResult(mp) {
        const resultHtml = `
            <div class="mp-card">
                <h3>${mp.name}</h3>
                <div class="mp-details">
                    <p><strong>Constituency:</strong> ${mp.constituency}</p>
                    <p><strong>Party:</strong> ${mp.party}</p>
                    <p><strong>Surgery Times:</strong> ${mp.surgeries}</p>
                    <p><strong>Key Issues:</strong> ${mp.majorIssues.join(', ')}</p>
                    
                    <div class="contact-details">
                        <h4>Contact Details:</h4>
                        <p><a href="mailto:${mp.email}" class="contact-link">
                            <span class="icon">📧</span> ${mp.email}
                        </a></p>
                        <p><a href="tel:${mp.phone}" class="contact-link">
                            <span class="icon">📞</span> ${mp.phone}
                        </a></p>
                    </div>

                    <div class="action-buttons">
                        <button onclick="showContactTemplate('mp', '${mp.name}', '${mp.email}')" class="contact-btn primary">
                            Write to MP
                        </button>
                        <button onclick="showSurgeryBooking('${mp.constituency}')" class="contact-btn secondary">
                            Book Surgery Appointment
                        </button>
                    </div>
                </div>
            </div>
        `;

        const mpResults = document.getElementById('mp-results');
        mpResults.innerHTML = resultHtml;
    }

    // Error handling
    function showError(message) {
        const mpResults = document.getElementById('mp-results');
        mpResults.innerHTML = `
            <div class="error-message">
                <span class="icon">⚠️</span>
                <p>${message}</p>
                <p class="help-text">Need help? Try these options:</p>
                <ul>
                    <li>Check your postcode is correctly formatted</li>
                    <li>Use our example postcodes to test the system</li>
                    <li>Contact our support team for assistance</li>
                </ul>
            </div>
        `;
    }

    // Initialize event listeners
    document.addEventListener('DOMContentLoaded', () => {
        const searchButton = document.getElementById('find-mp-btn');
        const postcodeInput = document.getElementById('postcode-input');

        if (searchButton && postcodeInput) {
            searchButton.addEventListener('click', async () => {
                try {
                    const mp = await validateAndLookupPostcode(postcodeInput.value);
                    displayMPResult(mp);
                } catch (error) {
                    showError(error.message);
                }
            });

            postcodeInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchButton.click();
                }
            });
        }
    });
});
