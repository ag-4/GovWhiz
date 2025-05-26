document.addEventListener('DOMContentLoaded', () => {
    const postcodeInput = document.getElementById('postcode-input');
    const findMpBtn = document.getElementById('find-mp-btn');
    const postcodeSuggestions = document.getElementById('postcode-suggestions');
    const mpResults = document.getElementById('mp-results');

    // Sample data for demonstration
    const sampleData = {
        'SW1A': { constituency: 'Cities of London and Westminster', mp: 'Nickie Aiken', party: 'Conservative', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000' },
        'E1': { constituency: 'Bethnal Green and Bow', mp: 'Rushanara Ali', party: 'Labour', email: 'rushanara.ali.mp@parliament.uk', phone: '020 7219 7200' },
        'M1': { constituency: 'Manchester Central', mp: 'Lucy Powell', party: 'Labour', email: 'lucy.powell.mp@parliament.uk', phone: '020 7219 4402' },
        'B1': { constituency: 'Birmingham, Ladywood', mp: 'Shabana Mahmood', party: 'Labour', email: 'shabana.mahmood.mp@parliament.uk', phone: '020 7219 5044' },
        'G1': { constituency: 'Glasgow Central', mp: 'Alison Thewliss', party: 'Scottish National Party', email: 'alison.thewliss.mp@parliament.uk', phone: '020 7219 8471' },
    };

    postcodeInput.addEventListener('input', debounce(getSuggestions, 300));
    findMpBtn.addEventListener('click', findMP);

    function debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        }
    }

    function getSuggestions() {
        const postcode = postcodeInput.value.trim().toUpperCase();
        if (postcode.length < 2) {
            postcodeSuggestions.innerHTML = '';
            return;
        }

        const suggestions = Object.keys(sampleData)
            .filter(pc => pc.startsWith(postcode))
            .map(pc => `<div class="suggestion" data-postcode="${pc}">${pc}</div>`)
            .join('');

        postcodeSuggestions.innerHTML = suggestions || '<div>No suggestions found</div>';
    }

    function findMP() {
        const postcode = postcodeInput.value.trim();
        if (!postcode) {
            mpResults.innerHTML = '<div>Please enter a valid postcode</div>';
            return;
        }

        mpResults.innerHTML = '<div>Searching...</div>';

        fetch(`https://members-api.parliament.uk/api/Location/Constituency/Search?searchText=${postcode}`)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    const constituency = data.items[0].value;
                    return fetch(`https://members-api.parliament.uk/api/Location/Constituency/${constituency.id}/Members`);
                } else {
                    throw new Error('No constituency found for this postcode');
                }
            })
            .then(response => response.json())
            .then(mpData => {
                if (mpData.items && mpData.items.length > 0) {
                    const mp = mpData.items[0].value;
                    mpResults.innerHTML = `
                        <div>
                            <h3>Your Constituency: ${mp.latestHouseMembership.membershipFrom}</h3>
                            <h4>Your MP: ${mp.nameDisplayAs}</h4>
                            <p>Party: ${mp.latestParty.name}</p>
                            <p>Email: ${mp.contactDetails.find(c => c.type === 'Email')?.value || 'Not available'}</p>
                            <p>Phone: ${mp.contactDetails.find(c => c.type === 'Phone')?.value || 'Not available'}</p>
                        </div>
                    `;
                } else {
                    throw new Error('No current MP found for this constituency');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mpResults.innerHTML = `<div>Error: ${error.message}</div>`;
            });
    }

    postcodeSuggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion')) {
            postcodeInput.value = e.target.dataset.postcode;
            postcodeSuggestions.innerHTML = '';
            findMP();
        }
    });
});
