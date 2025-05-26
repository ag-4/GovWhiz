/**
 * Fixed MP Lookup System with Proper Postcode Mapping
 * This file contains the corrected MP lookup functionality
 */

// Postcode to Constituency Mapping
const postcodeToConstituency = {
    // London postcodes
    'SW1A': 'Cities of London and Westminster',
    'SW1P': 'Cities of London and Westminster', 
    'SW1H': 'Cities of London and Westminster',
    'SW1V': 'Cities of London and Westminster',
    'SW1W': 'Cities of London and Westminster',
    'SW1X': 'Cities of London and Westminster',
    'SW1Y': 'Cities of London and Westminster',
    'W1': 'Cities of London and Westminster',
    'WC1': 'Holborn and St Pancras',
    'WC2': 'Cities of London and Westminster',
    'E1': 'Bethnal Green and Stepney',
    'E2': 'Bethnal Green and Stepney',
    'E3': 'Poplar and Limehouse',
    'E14': 'Poplar and Limehouse',
    'SE1': 'Bermondsey and Old Southwark',
    'SE16': 'Bermondsey and Old Southwark',
    'N1': 'Islington North',
    'N7': 'Islington North',
    'N19': 'Islington North',
    
    // Manchester postcodes
    'M1': 'Manchester Central',
    'M2': 'Manchester Central',
    'M3': 'Manchester Central',
    'M4': 'Manchester Central',
    'M15': 'Manchester Central',
    'M14': 'Manchester Withington',
    'M20': 'Manchester Withington',
    'M21': 'Manchester Withington',
    'M40': 'Blackley and Middleton South',
    'M9': 'Blackley and Middleton South',
    
    // Birmingham postcodes
    'B1': 'Birmingham Ladywood',
    'B16': 'Birmingham Ladywood',
    'B18': 'Birmingham Ladywood',
    'B19': 'Birmingham Ladywood',
    'B21': 'Birmingham Perry Barr',
    'B20': 'Birmingham Perry Barr',
    'B42': 'Birmingham Perry Barr',
    'B43': 'Birmingham Perry Barr',
    
    // Leeds postcodes
    'LS1': 'Leeds Central and Headingley',
    'LS2': 'Leeds Central and Headingley',
    'LS3': 'Leeds Central and Headingley',
    'LS6': 'Leeds Central and Headingley',
    'LS11': 'Leeds South',
    'LS10': 'Leeds South',
    'LS9': 'Leeds South',
    
    // Liverpool postcodes
    'L1': 'Liverpool Walton',
    'L4': 'Liverpool Walton',
    'L9': 'Liverpool Walton',
    'L15': 'Liverpool Wavertree',
    'L7': 'Liverpool Wavertree',
    'L25': 'Liverpool Wavertree',
    
    // Bristol postcodes
    'BS1': 'Bristol East',
    'BS2': 'Bristol East',
    'BS5': 'Bristol East',
    'BS8': 'Bristol North West',
    'BS9': 'Bristol North West',
    'BS10': 'Bristol North West',
    
    // Newcastle postcodes
    'NE1': 'Newcastle upon Tyne Central and West',
    'NE4': 'Newcastle upon Tyne Central and West',
    'NE15': 'Newcastle upon Tyne Central and West',
    'NE2': 'Newcastle upon Tyne North',
    'NE3': 'Newcastle upon Tyne North',
    'NE12': 'Newcastle upon Tyne North',
    
    // Edinburgh postcodes
    'EH1': 'Edinburgh South West',
    'EH11': 'Edinburgh South West',
    'EH14': 'Edinburgh South West',
    'EH8': 'Edinburgh East',
    'EH7': 'Edinburgh East',
    'EH6': 'Edinburgh East',
    
    // Glasgow postcodes
    'G1': 'Glasgow Central',
    'G2': 'Glasgow Central',
    'G3': 'Glasgow Central',
    'G40': 'Glasgow Central',
    
    // Cardiff postcodes
    'CF10': 'Cardiff East',
    'CF24': 'Cardiff East',
    'CF23': 'Cardiff East',
    'CF11': 'Cardiff South and Penarth',
    'CF64': 'Cardiff South and Penarth',
    
    // Belfast postcodes
    'BT1': 'Belfast North',
    'BT2': 'Belfast North',
    'BT3': 'Belfast North',
    'BT9': 'Belfast South and Mid Down',
    'BT7': 'Belfast South and Mid Down',
    'BT8': 'Belfast South and Mid Down'
};

// MP Database
const constituencyToMP = {
    'Cities of London and Westminster': {
        name: 'Nickie Aiken MP',
        party: 'Conservative',
        constituency: 'Cities of London and Westminster',
        email: 'nickie.aiken.mp@parliament.uk',
        phone: '020 7219 4000',
        website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656',
        twitter: '@NickieAiken',
        role: 'MP'
    },
    'Holborn and St Pancras': {
        name: 'Rt Hon Sir Keir Starmer MP',
        party: 'Labour',
        constituency: 'Holborn and St Pancras',
        email: 'keir.starmer.mp@parliament.uk',
        phone: '020 7219 4000',
        website: 'https://www.parliament.uk/biographies/commons/sir-keir-starmer/4514',
        twitter: '@Keir_Starmer',
        role: 'Prime Minister'
    },
    'Bethnal Green and Stepney': {
        name: 'Rushanara Ali MP',
        party: 'Labour',
        constituency: 'Bethnal Green and Stepney',
        email: 'rushanara.ali.mp@parliament.uk',
        phone: '020 7219 4000',
        website: 'https://www.parliament.uk/biographies/commons/rushanara-ali/3930',
        twitter: '@RushanAli',
        role: 'MP'
    },
    'Poplar and Limehouse': {
        name: 'Apsana Begum MP',
        party: 'Labour',
        constituency: 'Poplar and Limehouse',
        email: 'apsana.begum.mp@parliament.uk',
        phone: '020 7219 4000',
        website: 'https://www.parliament.uk/biographies/commons/apsana-begum/4656',
        twitter: '@ApsanaBegumMP',
        role: 'MP'
    },
    'Bermondsey and Old Southwark': {
        name: 'Neil Coyle MP',
        party: 'Labour',
        constituency: 'Bermondsey and Old Southwark',
        email: 'neil.coyle.mp@parliament.uk',
        phone: '020 7219 4000',
        website: 'https://www.parliament.uk/biographies/commons/neil-coyle/4359',
        twitter: '@coyleneil',
        role: 'MP'
    },
    'Islington North': {
        name: 'Jeremy Corbyn MP',
        party: 'Independent',
        constituency: 'Islington North',
        email: 'jeremy.corbyn.mp@parliament.uk',
        phone: '020 7219 4000',
        website: 'https://www.parliament.uk/biographies/commons/jeremy-corbyn/185',
        twitter: '@jeremycorbyn',
        role: 'MP'
    },
    'Manchester Central': {
        name: 'Lucy Powell MP',
        party: 'Labour',
        constituency: 'Manchester Central',
        email: 'lucy.powell.mp@parliament.uk',
        phone: '0161 234 5678',
        website: 'https://www.parliament.uk/biographies/commons/lucy-powell/4359',
        twitter: '@LucyMPowell',
        role: 'MP'
    },
    'Manchester Withington': {
        name: 'Jeff Smith MP',
        party: 'Labour',
        constituency: 'Manchester Withington',
        email: 'jeff.smith.mp@parliament.uk',
        phone: '0161 234 5678',
        website: 'https://www.parliament.uk/biographies/commons/jeff-smith/4359',
        twitter: '@JeffSmithMP',
        role: 'MP'
    },
    'Birmingham Ladywood': {
        name: 'Shabana Mahmood MP',
        party: 'Labour',
        constituency: 'Birmingham Ladywood',
        email: 'shabana.mahmood.mp@parliament.uk',
        phone: '0121 456 7890',
        website: 'https://www.parliament.uk/biographies/commons/shabana-mahmood/3930',
        twitter: '@ShabanaMahmood',
        role: 'MP'
    },
    'Leeds Central and Headingley': {
        name: 'Alex Sobel MP',
        party: 'Labour',
        constituency: 'Leeds Central and Headingley',
        email: 'alex.sobel.mp@parliament.uk',
        phone: '0113 456 7890',
        website: 'https://www.parliament.uk/biographies/commons/alex-sobel/4656',
        twitter: '@alexsobel',
        role: 'MP'
    }
};

// Fixed MP Lookup Function
function findMPFixed(postcode) {
    console.log('Looking up MP for postcode:', postcode);
    
    // Clean and normalize the postcode
    const cleanPostcode = postcode.toUpperCase().replace(/\s+/g, '').trim();
    console.log('Cleaned postcode:', cleanPostcode);
    
    // Try different postcode matching strategies
    let constituency = null;
    
    // Strategy 1: Try exact match with first 4 characters
    const fourChar = cleanPostcode.substring(0, 4);
    if (postcodeToConstituency[fourChar]) {
        constituency = postcodeToConstituency[fourChar];
        console.log('Found constituency with 4-char match:', constituency);
    }
    
    // Strategy 2: Try with first 3 characters
    if (!constituency) {
        const threeChar = cleanPostcode.substring(0, 3);
        if (postcodeToConstituency[threeChar]) {
            constituency = postcodeToConstituency[threeChar];
            console.log('Found constituency with 3-char match:', constituency);
        }
    }
    
    // Strategy 3: Try with first 2 characters
    if (!constituency) {
        const twoChar = cleanPostcode.substring(0, 2);
        if (postcodeToConstituency[twoChar]) {
            constituency = postcodeToConstituency[twoChar];
            console.log('Found constituency with 2-char match:', constituency);
        }
    }
    
    // Strategy 4: Try extracting just the letters
    if (!constituency) {
        const lettersOnly = cleanPostcode.match(/^[A-Z]+/)?.[0];
        if (lettersOnly && postcodeToConstituency[lettersOnly]) {
            constituency = postcodeToConstituency[lettersOnly];
            console.log('Found constituency with letters-only match:', constituency);
        }
    }
    
    console.log('Final constituency found:', constituency);
    
    // Find MP data
    let mpData = null;
    if (constituency && constituencyToMP[constituency]) {
        mpData = constituencyToMP[constituency];
        console.log('Found MP data:', mpData);
    }
    
    if (mpData) {
        return {
            found: true,
            mp: mpData,
            postcode: postcode,
            constituency: constituency
        };
    } else {
        return {
            found: false,
            postcode: postcode,
            message: `Sorry, we don't have MP data for postcode ${postcode}. This could be because:
            • The postcode is not in our database yet
            • The postcode might be incorrect
            • This might be a new constituency after boundary changes
            
            You can find your MP at: https://www.parliament.uk/get-involved/contact-your-mp/`
        };
    }
}

// Export for use in main script
window.findMPFixed = findMPFixed;
window.postcodeToConstituency = postcodeToConstituency;
window.constituencyToMP = constituencyToMP;

console.log('✅ MP Lookup Fix loaded successfully');
console.log('Available test postcodes:', Object.keys(postcodeToConstituency).slice(0, 10));
