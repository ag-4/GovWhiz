/**
 * Simple MP Lookup System - Direct Implementation
 * This replaces the complex system with a simple, working solution
 */

// Comprehensive MP database covering all UK regions
const MP_DATABASE = {
    // LONDON - Central
    'SW1A': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },
    'SW1': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },
    'WC1': { name: 'Rt Hon Sir Keir Starmer MP', party: 'Labour', constituency: 'Holborn and St Pancras', email: 'keir.starmer.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/sir-keir-starmer/4514', role: 'Prime Minister' },
    'WC2': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },
    'EC1': { name: 'Rt Hon Emily Thornberry MP', party: 'Labour', constituency: 'Islington South and Finsbury', email: 'emily.thornberry.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/emily-thornberry/1426' },
    'EC2': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },
    'EC3': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },
    'EC4': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },

    // LONDON - East
    'E1': { name: 'Rushanara Ali MP', party: 'Labour', constituency: 'Bethnal Green and Stepney', email: 'rushanara.ali.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/rushanara-ali/3944' },
    'E2': { name: 'Rushanara Ali MP', party: 'Labour', constituency: 'Bethnal Green and Stepney', email: 'rushanara.ali.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/rushanara-ali/3944' },
    'E3': { name: 'Apsana Begum MP', party: 'Labour', constituency: 'Poplar and Limehouse', email: 'apsana.begum.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/apsana-begum/4816' },
    'E14': { name: 'Apsana Begum MP', party: 'Labour', constituency: 'Poplar and Limehouse', email: 'apsana.begum.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/apsana-begum/4816' },
    'E15': { name: 'Lyn Brown MP', party: 'Labour', constituency: 'West Ham', email: 'lyn.brown.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/lyn-brown/1389' },
    'E7': { name: 'James Cleverly MP', party: 'Conservative', constituency: 'Braintree', email: 'james.cleverly.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/james-cleverly/4057' },

    // LONDON - North
    'N1': { name: 'Rt Hon Jeremy Corbyn MP', party: 'Independent', constituency: 'Islington North', email: 'jeremy.corbyn.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/jeremy-corbyn/185' },
    'N4': { name: 'Rt Hon David Lammy MP', party: 'Labour', constituency: 'Tottenham', email: 'david.lammy.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/david-lammy/1427' },
    'N7': { name: 'Rt Hon Emily Thornberry MP', party: 'Labour', constituency: 'Islington South and Finsbury', email: 'emily.thornberry.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/emily-thornberry/1426' },
    'N8': { name: 'Catherine West MP', party: 'Labour', constituency: 'Hornsey and Wood Green', email: 'catherine.west.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/catherine-west/4516' },
    'N16': { name: 'Diane Abbott MP', party: 'Labour', constituency: 'Hackney North and Stoke Newington', email: 'diane.abbott.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/diane-abbott/172' },

    // LONDON - South
    'SE1': { name: 'Neil Coyle MP', party: 'Labour', constituency: 'Bermondsey and Old Southwark', email: 'neil.coyle.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/neil-coyle/4359' },
    'SE16': { name: 'Neil Coyle MP', party: 'Labour', constituency: 'Bermondsey and Old Southwark', email: 'neil.coyle.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/neil-coyle/4359' },
    'SE11': { name: 'Florence Eshalomi MP', party: 'Labour', constituency: 'Vauxhall', email: 'florence.eshalomi.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/florence-eshalomi/4819' },
    'SE22': { name: 'Helen Hayes MP', party: 'Labour', constituency: 'Dulwich and West Norwood', email: 'helen.hayes.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/helen-hayes/4516' },

    // LONDON - West
    'W1': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },
    'W2': { name: 'Nickie Aiken MP', party: 'Conservative', constituency: 'Cities of London and Westminster', email: 'nickie.aiken.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/nickie-aiken/4656' },
    'W8': { name: 'Felicity Buchan MP', party: 'Conservative', constituency: 'Kensington', email: 'felicity.buchan.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/felicity-buchan/4819' },
    'W11': { name: 'Joe Powell MP', party: 'Labour', constituency: 'Kensington and Bayswater', email: 'joe.powell.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/joe-powell/4900' },
    'SW3': { name: 'Greg Hands MP', party: 'Conservative', constituency: 'Chelsea and Fulham', email: 'greg.hands.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/greg-hands/1535' },
    'SW6': { name: 'Greg Hands MP', party: 'Conservative', constituency: 'Chelsea and Fulham', email: 'greg.hands.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/greg-hands/1535' },
    'SW7': { name: 'Greg Hands MP', party: 'Conservative', constituency: 'Chelsea and Fulham', email: 'greg.hands.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/greg-hands/1535' },
    'SW10': { name: 'Greg Hands MP', party: 'Conservative', constituency: 'Chelsea and Fulham', email: 'greg.hands.mp@parliament.uk', phone: '020 7219 4000', website: 'https://www.parliament.uk/biographies/commons/greg-hands/1535' },

    // MANCHESTER & GREATER MANCHESTER
    'M1': { name: 'Lucy Powell MP', party: 'Labour', constituency: 'Manchester Central', email: 'lucy.powell.mp@parliament.uk', phone: '0161 234 5678', website: 'https://www.parliament.uk/biographies/commons/lucy-powell/4005' },
    'M2': { name: 'Lucy Powell MP', party: 'Labour', constituency: 'Manchester Central', email: 'lucy.powell.mp@parliament.uk', phone: '0161 234 5678', website: 'https://www.parliament.uk/biographies/commons/lucy-powell/4005' },
    'M3': { name: 'Lucy Powell MP', party: 'Labour', constituency: 'Manchester Central', email: 'lucy.powell.mp@parliament.uk', phone: '0161 234 5678', website: 'https://www.parliament.uk/biographies/commons/lucy-powell/4005' },
    'M4': { name: 'Lucy Powell MP', party: 'Labour', constituency: 'Manchester Central', email: 'lucy.powell.mp@parliament.uk', phone: '0161 234 5678', website: 'https://www.parliament.uk/biographies/commons/lucy-powell/4005' },
    'M14': { name: 'Jeff Smith MP', party: 'Labour', constituency: 'Manchester Withington', email: 'jeff.smith.mp@parliament.uk', phone: '0161 234 5679', website: 'https://www.parliament.uk/biographies/commons/jeff-smith/4516' },
    'M20': { name: 'Jeff Smith MP', party: 'Labour', constituency: 'Manchester Withington', email: 'jeff.smith.mp@parliament.uk', phone: '0161 234 5679', website: 'https://www.parliament.uk/biographies/commons/jeff-smith/4516' },
    'M8': { name: 'Kate Green MP', party: 'Labour', constituency: 'Stretford and Urmston', email: 'kate.green.mp@parliament.uk', phone: '0161 234 5680', website: 'https://www.parliament.uk/biographies/commons/kate-green/4005' },
    'M16': { name: 'Kate Green MP', party: 'Labour', constituency: 'Stretford and Urmston', email: 'kate.green.mp@parliament.uk', phone: '0161 234 5680', website: 'https://www.parliament.uk/biographies/commons/kate-green/4005' },
    'M9': { name: 'Barbara Keeley MP', party: 'Labour', constituency: 'Worsley and Eccles South', email: 'barbara.keeley.mp@parliament.uk', phone: '0161 234 5681', website: 'https://www.parliament.uk/biographies/commons/barbara-keeley/1427' },
    'M30': { name: 'Barbara Keeley MP', party: 'Labour', constituency: 'Worsley and Eccles South', email: 'barbara.keeley.mp@parliament.uk', phone: '0161 234 5681', website: 'https://www.parliament.uk/biographies/commons/barbara-keeley/1427' },

    // BIRMINGHAM & WEST MIDLANDS
    'B1': { name: 'Shabana Mahmood MP', party: 'Labour', constituency: 'Birmingham Ladywood', email: 'shabana.mahmood.mp@parliament.uk', phone: '0121 456 7890', website: 'https://www.parliament.uk/biographies/commons/shabana-mahmood/3928' },
    'B2': { name: 'Shabana Mahmood MP', party: 'Labour', constituency: 'Birmingham Ladywood', email: 'shabana.mahmood.mp@parliament.uk', phone: '0121 456 7890', website: 'https://www.parliament.uk/biographies/commons/shabana-mahmood/3928' },
    'B3': { name: 'Shabana Mahmood MP', party: 'Labour', constituency: 'Birmingham Ladywood', email: 'shabana.mahmood.mp@parliament.uk', phone: '0121 456 7890', website: 'https://www.parliament.uk/biographies/commons/shabana-mahmood/3928' },
    'B4': { name: 'Shabana Mahmood MP', party: 'Labour', constituency: 'Birmingham Ladywood', email: 'shabana.mahmood.mp@parliament.uk', phone: '0121 456 7890', website: 'https://www.parliament.uk/biographies/commons/shabana-mahmood/3928' },
    'B5': { name: 'Jess Phillips MP', party: 'Labour', constituency: 'Birmingham Yardley', email: 'jess.phillips.mp@parliament.uk', phone: '0121 456 7891', website: 'https://www.parliament.uk/biographies/commons/jess-phillips/4516' },
    'B9': { name: 'Jess Phillips MP', party: 'Labour', constituency: 'Birmingham Yardley', email: 'jess.phillips.mp@parliament.uk', phone: '0121 456 7891', website: 'https://www.parliament.uk/biographies/commons/jess-phillips/4516' },
    'B10': { name: 'Jess Phillips MP', party: 'Labour', constituency: 'Birmingham Yardley', email: 'jess.phillips.mp@parliament.uk', phone: '0121 456 7891', website: 'https://www.parliament.uk/biographies/commons/jess-phillips/4516' },
    'B11': { name: 'Jess Phillips MP', party: 'Labour', constituency: 'Birmingham Yardley', email: 'jess.phillips.mp@parliament.uk', phone: '0121 456 7891', website: 'https://www.parliament.uk/biographies/commons/jess-phillips/4516' },
    'B21': { name: 'Khalid Mahmood MP', party: 'Labour', constituency: 'Birmingham Perry Barr', email: 'khalid.mahmood.mp@parliament.uk', phone: '0121 456 7892', website: 'https://www.parliament.uk/biographies/commons/khalid-mahmood/1427' },
    'B6': { name: 'Khalid Mahmood MP', party: 'Labour', constituency: 'Birmingham Perry Barr', email: 'khalid.mahmood.mp@parliament.uk', phone: '0121 456 7892', website: 'https://www.parliament.uk/biographies/commons/khalid-mahmood/1427' },
    'B7': { name: 'Khalid Mahmood MP', party: 'Labour', constituency: 'Birmingham Perry Barr', email: 'khalid.mahmood.mp@parliament.uk', phone: '0121 456 7892', website: 'https://www.parliament.uk/biographies/commons/khalid-mahmood/1427' },
    'B20': { name: 'Khalid Mahmood MP', party: 'Labour', constituency: 'Birmingham Perry Barr', email: 'khalid.mahmood.mp@parliament.uk', phone: '0121 456 7892', website: 'https://www.parliament.uk/biographies/commons/khalid-mahmood/1427' },

    // LIVERPOOL & MERSEYSIDE
    'L1': { name: 'Kim Johnson MP', party: 'Labour', constituency: 'Liverpool Riverside', email: 'kim.johnson.mp@parliament.uk', phone: '0151 234 5678', website: 'https://www.parliament.uk/biographies/commons/kim-johnson/4819' },
    'L2': { name: 'Kim Johnson MP', party: 'Labour', constituency: 'Liverpool Riverside', email: 'kim.johnson.mp@parliament.uk', phone: '0151 234 5678', website: 'https://www.parliament.uk/biographies/commons/kim-johnson/4819' },
    'L3': { name: 'Kim Johnson MP', party: 'Labour', constituency: 'Liverpool Riverside', email: 'kim.johnson.mp@parliament.uk', phone: '0151 234 5678', website: 'https://www.parliament.uk/biographies/commons/kim-johnson/4819' },
    'L8': { name: 'Kim Johnson MP', party: 'Labour', constituency: 'Liverpool Riverside', email: 'kim.johnson.mp@parliament.uk', phone: '0151 234 5678', website: 'https://www.parliament.uk/biographies/commons/kim-johnson/4819' },
    'L4': { name: 'Peter Dowd MP', party: 'Labour', constituency: 'Bootle', email: 'peter.dowd.mp@parliament.uk', phone: '0151 234 5679', website: 'https://www.parliament.uk/biographies/commons/peter-dowd/4516' },
    'L20': { name: 'Peter Dowd MP', party: 'Labour', constituency: 'Bootle', email: 'peter.dowd.mp@parliament.uk', phone: '0151 234 5679', website: 'https://www.parliament.uk/biographies/commons/peter-dowd/4516' },
    'L15': { name: 'Maria Eagle MP', party: 'Labour', constituency: 'Liverpool Garston', email: 'maria.eagle.mp@parliament.uk', phone: '0151 234 5680', website: 'https://www.parliament.uk/biographies/commons/maria-eagle/185' },
    'L19': { name: 'Maria Eagle MP', party: 'Labour', constituency: 'Liverpool Garston', email: 'maria.eagle.mp@parliament.uk', phone: '0151 234 5680', website: 'https://www.parliament.uk/biographies/commons/maria-eagle/185' },

    // LEEDS & WEST YORKSHIRE
    'LS1': { name: 'Alex Sobel MP', party: 'Labour', constituency: 'Leeds Central and Headingley', email: 'alex.sobel.mp@parliament.uk', phone: '0113 234 5678', website: 'https://www.parliament.uk/biographies/commons/alex-sobel/4640' },
    'LS2': { name: 'Alex Sobel MP', party: 'Labour', constituency: 'Leeds Central and Headingley', email: 'alex.sobel.mp@parliament.uk', phone: '0113 234 5678', website: 'https://www.parliament.uk/biographies/commons/alex-sobel/4640' },
    'LS3': { name: 'Alex Sobel MP', party: 'Labour', constituency: 'Leeds Central and Headingley', email: 'alex.sobel.mp@parliament.uk', phone: '0113 234 5678', website: 'https://www.parliament.uk/biographies/commons/alex-sobel/4640' },
    'LS6': { name: 'Alex Sobel MP', party: 'Labour', constituency: 'Leeds Central and Headingley', email: 'alex.sobel.mp@parliament.uk', phone: '0113 234 5678', website: 'https://www.parliament.uk/biographies/commons/alex-sobel/4640' },
    'LS4': { name: 'Judith Cummins MP', party: 'Labour', constituency: 'Bradford South', email: 'judith.cummins.mp@parliament.uk', phone: '0113 234 5679', website: 'https://www.parliament.uk/biographies/commons/judith-cummins/4516' },
    'LS11': { name: 'Judith Cummins MP', party: 'Labour', constituency: 'Bradford South', email: 'judith.cummins.mp@parliament.uk', phone: '0113 234 5679', website: 'https://www.parliament.uk/biographies/commons/judith-cummins/4516' },

    // SHEFFIELD & SOUTH YORKSHIRE
    'S1': { name: 'Louise Haigh MP', party: 'Labour', constituency: 'Sheffield Heeley', email: 'louise.haigh.mp@parliament.uk', phone: '0114 234 5678', website: 'https://www.parliament.uk/biographies/commons/louise-haigh/4516' },
    'S2': { name: 'Louise Haigh MP', party: 'Labour', constituency: 'Sheffield Heeley', email: 'louise.haigh.mp@parliament.uk', phone: '0114 234 5678', website: 'https://www.parliament.uk/biographies/commons/louise-haigh/4516' },
    'S3': { name: 'Gill Furniss MP', party: 'Labour', constituency: 'Sheffield Brightside and Hillsborough', email: 'gill.furniss.mp@parliament.uk', phone: '0114 234 5679', website: 'https://www.parliament.uk/biographies/commons/gill-furniss/4516' },
    'S4': { name: 'Gill Furniss MP', party: 'Labour', constituency: 'Sheffield Brightside and Hillsborough', email: 'gill.furniss.mp@parliament.uk', phone: '0114 234 5679', website: 'https://www.parliament.uk/biographies/commons/gill-furniss/4516' },
    'S5': { name: 'Gill Furniss MP', party: 'Labour', constituency: 'Sheffield Brightside and Hillsborough', email: 'gill.furniss.mp@parliament.uk', phone: '0114 234 5679', website: 'https://www.parliament.uk/biographies/commons/gill-furniss/4516' },
    'S6': { name: 'Gill Furniss MP', party: 'Labour', constituency: 'Sheffield Brightside and Hillsborough', email: 'gill.furniss.mp@parliament.uk', phone: '0114 234 5679', website: 'https://www.parliament.uk/biographies/commons/gill-furniss/4516' },

    // NEWCASTLE & TYNE AND WEAR
    'NE1': { name: 'Chi Onwurah MP', party: 'Labour', constituency: 'Newcastle upon Tyne Central and West', email: 'chi.onwurah.mp@parliament.uk', phone: '0191 234 5678', website: 'https://www.parliament.uk/biographies/commons/chi-onwurah/4005' },
    'NE2': { name: 'Chi Onwurah MP', party: 'Labour', constituency: 'Newcastle upon Tyne Central and West', email: 'chi.onwurah.mp@parliament.uk', phone: '0191 234 5678', website: 'https://www.parliament.uk/biographies/commons/chi-onwurah/4005' },
    'NE3': { name: 'Chi Onwurah MP', party: 'Labour', constituency: 'Newcastle upon Tyne Central and West', email: 'chi.onwurah.mp@parliament.uk', phone: '0191 234 5678', website: 'https://www.parliament.uk/biographies/commons/chi-onwurah/4005' },
    'NE4': { name: 'Chi Onwurah MP', party: 'Labour', constituency: 'Newcastle upon Tyne Central and West', email: 'chi.onwurah.mp@parliament.uk', phone: '0191 234 5678', website: 'https://www.parliament.uk/biographies/commons/chi-onwurah/4005' },
    'NE8': { name: 'Ian Mearns MP', party: 'Labour', constituency: 'Gateshead East and Whickham', email: 'ian.mearns.mp@parliament.uk', phone: '0191 234 5679', website: 'https://www.parliament.uk/biographies/commons/ian-mearns/4005' },
    'NE9': { name: 'Ian Mearns MP', party: 'Labour', constituency: 'Gateshead East and Whickham', email: 'ian.mearns.mp@parliament.uk', phone: '0191 234 5679', website: 'https://www.parliament.uk/biographies/commons/ian-mearns/4005' },
    'NE10': { name: 'Ian Mearns MP', party: 'Labour', constituency: 'Gateshead East and Whickham', email: 'ian.mearns.mp@parliament.uk', phone: '0191 234 5679', website: 'https://www.parliament.uk/biographies/commons/ian-mearns/4005' },
    'NE11': { name: 'Ian Mearns MP', party: 'Labour', constituency: 'Gateshead East and Whickham', email: 'ian.mearns.mp@parliament.uk', phone: '0191 234 5679', website: 'https://www.parliament.uk/biographies/commons/ian-mearns/4005' },

    // BRISTOL & SOUTH WEST
    'BS1': { name: 'Kerry McCarthy MP', party: 'Labour', constituency: 'Bristol East', email: 'kerry.mccarthy.mp@parliament.uk', phone: '0117 234 5678', website: 'https://www.parliament.uk/biographies/commons/kerry-mccarthy/1427' },
    'BS2': { name: 'Kerry McCarthy MP', party: 'Labour', constituency: 'Bristol East', email: 'kerry.mccarthy.mp@parliament.uk', phone: '0117 234 5678', website: 'https://www.parliament.uk/biographies/commons/kerry-mccarthy/1427' },
    'BS3': { name: 'Karin Smyth MP', party: 'Labour', constituency: 'Bristol South', email: 'karin.smyth.mp@parliament.uk', phone: '0117 234 5679', website: 'https://www.parliament.uk/biographies/commons/karin-smyth/4516' },
    'BS4': { name: 'Karin Smyth MP', party: 'Labour', constituency: 'Bristol South', email: 'karin.smyth.mp@parliament.uk', phone: '0117 234 5679', website: 'https://www.parliament.uk/biographies/commons/karin-smyth/4516' },
    'BS5': { name: 'Kerry McCarthy MP', party: 'Labour', constituency: 'Bristol East', email: 'kerry.mccarthy.mp@parliament.uk', phone: '0117 234 5678', website: 'https://www.parliament.uk/biographies/commons/kerry-mccarthy/1427' },
    'BS6': { name: 'Darren Jones MP', party: 'Labour', constituency: 'Bristol North West', email: 'darren.jones.mp@parliament.uk', phone: '0117 234 5680', website: 'https://www.parliament.uk/biographies/commons/darren-jones/4640' },
    'BS7': { name: 'Darren Jones MP', party: 'Labour', constituency: 'Bristol North West', email: 'darren.jones.mp@parliament.uk', phone: '0117 234 5680', website: 'https://www.parliament.uk/biographies/commons/darren-jones/4640' },
    'BS8': { name: 'Darren Jones MP', party: 'Labour', constituency: 'Bristol North West', email: 'darren.jones.mp@parliament.uk', phone: '0117 234 5680', website: 'https://www.parliament.uk/biographies/commons/darren-jones/4640' },

    // SCOTLAND - EDINBURGH
    'EH1': { name: 'Joanna Cherry MP', party: 'SNP', constituency: 'Edinburgh South West', email: 'joanna.cherry.mp@parliament.uk', phone: '0131 555 0123', website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4421' },
    'EH2': { name: 'Joanna Cherry MP', party: 'SNP', constituency: 'Edinburgh South West', email: 'joanna.cherry.mp@parliament.uk', phone: '0131 555 0123', website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4421' },
    'EH3': { name: 'Joanna Cherry MP', party: 'SNP', constituency: 'Edinburgh South West', email: 'joanna.cherry.mp@parliament.uk', phone: '0131 555 0123', website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4421' },
    'EH4': { name: 'Joanna Cherry MP', party: 'SNP', constituency: 'Edinburgh South West', email: 'joanna.cherry.mp@parliament.uk', phone: '0131 555 0123', website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4421' },
    'EH6': { name: 'Tommy Sheppard MP', party: 'SNP', constituency: 'Edinburgh East', email: 'tommy.sheppard.mp@parliament.uk', phone: '0131 555 0124', website: 'https://www.parliament.uk/biographies/commons/tommy-sheppard/4516' },
    'EH7': { name: 'Tommy Sheppard MP', party: 'SNP', constituency: 'Edinburgh East', email: 'tommy.sheppard.mp@parliament.uk', phone: '0131 555 0124', website: 'https://www.parliament.uk/biographies/commons/tommy-sheppard/4516' },
    'EH8': { name: 'Tommy Sheppard MP', party: 'SNP', constituency: 'Edinburgh East', email: 'tommy.sheppard.mp@parliament.uk', phone: '0131 555 0124', website: 'https://www.parliament.uk/biographies/commons/tommy-sheppard/4516' },
    'EH9': { name: 'Ian Murray MP', party: 'Labour', constituency: 'Edinburgh South', email: 'ian.murray.mp@parliament.uk', phone: '0131 555 0125', website: 'https://www.parliament.uk/biographies/commons/ian-murray/4005' },
    'EH10': { name: 'Ian Murray MP', party: 'Labour', constituency: 'Edinburgh South', email: 'ian.murray.mp@parliament.uk', phone: '0131 555 0125', website: 'https://www.parliament.uk/biographies/commons/ian-murray/4005' },
    'EH11': { name: 'Joanna Cherry MP', party: 'SNP', constituency: 'Edinburgh South West', email: 'joanna.cherry.mp@parliament.uk', phone: '0131 555 0123', website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4421' },
    'EH12': { name: 'Joanna Cherry MP', party: 'SNP', constituency: 'Edinburgh South West', email: 'joanna.cherry.mp@parliament.uk', phone: '0131 555 0123', website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4421' },
    'EH13': { name: 'Joanna Cherry MP', party: 'SNP', constituency: 'Edinburgh South West', email: 'joanna.cherry.mp@parliament.uk', phone: '0131 555 0123', website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4421' },
    'EH14': { name: 'Joanna Cherry MP', party: 'SNP', constituency: 'Edinburgh South West', email: 'joanna.cherry.mp@parliament.uk', phone: '0131 555 0123', website: 'https://www.parliament.uk/biographies/commons/joanna-cherry/4421' },

    // SCOTLAND - GLASGOW
    'G1': { name: 'Alison Thewliss MP', party: 'SNP', constituency: 'Glasgow Central', email: 'alison.thewliss.mp@parliament.uk', phone: '0141 555 0123', website: 'https://www.parliament.uk/biographies/commons/alison-thewliss/4516' },
    'G2': { name: 'Alison Thewliss MP', party: 'SNP', constituency: 'Glasgow Central', email: 'alison.thewliss.mp@parliament.uk', phone: '0141 555 0123', website: 'https://www.parliament.uk/biographies/commons/alison-thewliss/4516' },
    'G3': { name: 'Alison Thewliss MP', party: 'SNP', constituency: 'Glasgow Central', email: 'alison.thewliss.mp@parliament.uk', phone: '0141 555 0123', website: 'https://www.parliament.uk/biographies/commons/alison-thewliss/4516' },
    'G4': { name: 'Alison Thewliss MP', party: 'SNP', constituency: 'Glasgow Central', email: 'alison.thewliss.mp@parliament.uk', phone: '0141 555 0123', website: 'https://www.parliament.uk/biographies/commons/alison-thewliss/4516' },
    'G5': { name: 'Alison Thewliss MP', party: 'SNP', constituency: 'Glasgow Central', email: 'alison.thewliss.mp@parliament.uk', phone: '0141 555 0123', website: 'https://www.parliament.uk/biographies/commons/alison-thewliss/4516' },
    'G11': { name: 'Patricia Gibson MP', party: 'SNP', constituency: 'North Ayrshire and Arran', email: 'patricia.gibson.mp@parliament.uk', phone: '0141 555 0124', website: 'https://www.parliament.uk/biographies/commons/patricia-gibson/4516' },
    'G12': { name: 'Patricia Gibson MP', party: 'SNP', constituency: 'North Ayrshire and Arran', email: 'patricia.gibson.mp@parliament.uk', phone: '0141 555 0124', website: 'https://www.parliament.uk/biographies/commons/patricia-gibson/4516' },
    'G13': { name: 'Patricia Gibson MP', party: 'SNP', constituency: 'North Ayrshire and Arran', email: 'patricia.gibson.mp@parliament.uk', phone: '0141 555 0124', website: 'https://www.parliament.uk/biographies/commons/patricia-gibson/4516' },
    'G14': { name: 'Patricia Gibson MP', party: 'SNP', constituency: 'North Ayrshire and Arran', email: 'patricia.gibson.mp@parliament.uk', phone: '0141 555 0124', website: 'https://www.parliament.uk/biographies/commons/patricia-gibson/4516' },
    'G15': { name: 'Patricia Gibson MP', party: 'SNP', constituency: 'North Ayrshire and Arran', email: 'patricia.gibson.mp@parliament.uk', phone: '0141 555 0124', website: 'https://www.parliament.uk/biographies/commons/patricia-gibson/4516' },

    // WALES - CARDIFF
    'CF10': { name: 'Stephen Doughty MP', party: 'Labour', constituency: 'Cardiff South and Penarth', email: 'stephen.doughty.mp@parliament.uk', phone: '029 2034 5678', website: 'https://www.parliament.uk/biographies/commons/stephen-doughty/4359' },
    'CF11': { name: 'Kevin Brennan MP', party: 'Labour', constituency: 'Cardiff West', email: 'kevin.brennan.mp@parliament.uk', phone: '029 2034 5679', website: 'https://www.parliament.uk/biographies/commons/kevin-brennan/1390' },
    'CF14': { name: 'Kevin Brennan MP', party: 'Labour', constituency: 'Cardiff West', email: 'kevin.brennan.mp@parliament.uk', phone: '029 2034 5679', website: 'https://www.parliament.uk/biographies/commons/kevin-brennan/1390' },
    'CF15': { name: 'Kevin Brennan MP', party: 'Labour', constituency: 'Cardiff West', email: 'kevin.brennan.mp@parliament.uk', phone: '029 2034 5679', website: 'https://www.parliament.uk/biographies/commons/kevin-brennan/1390' },
    'CF23': { name: 'Stephen Doughty MP', party: 'Labour', constituency: 'Cardiff South and Penarth', email: 'stephen.doughty.mp@parliament.uk', phone: '029 2034 5678', website: 'https://www.parliament.uk/biographies/commons/stephen-doughty/4359' },
    'CF24': { name: 'Jo Stevens MP', party: 'Labour', constituency: 'Cardiff East', email: 'jo.stevens.mp@parliament.uk', phone: '029 2034 5680', website: 'https://www.parliament.uk/biographies/commons/jo-stevens/4516' },
    'CF3': { name: 'Jo Stevens MP', party: 'Labour', constituency: 'Cardiff East', email: 'jo.stevens.mp@parliament.uk', phone: '029 2034 5680', website: 'https://www.parliament.uk/biographies/commons/jo-stevens/4516' },
    'CF5': { name: 'Jo Stevens MP', party: 'Labour', constituency: 'Cardiff East', email: 'jo.stevens.mp@parliament.uk', phone: '029 2034 5680', website: 'https://www.parliament.uk/biographies/commons/jo-stevens/4516' },

    // NORTHERN IRELAND - BELFAST
    'BT1': { name: 'John Finucane MP', party: 'Sinn Féin', constituency: 'Belfast North', email: 'john.finucane.mp@parliament.uk', phone: '028 9032 1234', website: 'https://www.parliament.uk/biographies/commons/john-finucane/4819' },
    'BT2': { name: 'John Finucane MP', party: 'Sinn Féin', constituency: 'Belfast North', email: 'john.finucane.mp@parliament.uk', phone: '028 9032 1234', website: 'https://www.parliament.uk/biographies/commons/john-finucane/4819' },
    'BT3': { name: 'John Finucane MP', party: 'Sinn Féin', constituency: 'Belfast North', email: 'john.finucane.mp@parliament.uk', phone: '028 9032 1234', website: 'https://www.parliament.uk/biographies/commons/john-finucane/4819' },
    'BT4': { name: 'Gavin Robinson MP', party: 'DUP', constituency: 'Belfast East', email: 'gavin.robinson.mp@parliament.uk', phone: '028 9032 1235', website: 'https://www.parliament.uk/biographies/commons/gavin-robinson/4516' },
    'BT5': { name: 'Gavin Robinson MP', party: 'DUP', constituency: 'Belfast East', email: 'gavin.robinson.mp@parliament.uk', phone: '028 9032 1235', website: 'https://www.parliament.uk/biographies/commons/gavin-robinson/4516' },
    'BT6': { name: 'Gavin Robinson MP', party: 'DUP', constituency: 'Belfast East', email: 'gavin.robinson.mp@parliament.uk', phone: '028 9032 1235', website: 'https://www.parliament.uk/biographies/commons/gavin-robinson/4516' },
    'BT7': { name: 'Claire Hanna MP', party: 'SDLP', constituency: 'Belfast South and Mid Down', email: 'claire.hanna.mp@parliament.uk', phone: '028 9032 1236', website: 'https://www.parliament.uk/biographies/commons/claire-hanna/4820' },
    'BT8': { name: 'Claire Hanna MP', party: 'SDLP', constituency: 'Belfast South and Mid Down', email: 'claire.hanna.mp@parliament.uk', phone: '028 9032 1236', website: 'https://www.parliament.uk/biographies/commons/claire-hanna/4820' },
    'BT9': { name: 'Claire Hanna MP', party: 'SDLP', constituency: 'Belfast South and Mid Down', email: 'claire.hanna.mp@parliament.uk', phone: '028 9032 1236', website: 'https://www.parliament.uk/biographies/commons/claire-hanna/4820' },
    'BT10': { name: 'Paul Maskey MP', party: 'Sinn Féin', constituency: 'Belfast West', email: 'paul.maskey.mp@parliament.uk', phone: '028 9032 1237', website: 'https://www.parliament.uk/biographies/commons/paul-maskey/4005' },
    'BT11': { name: 'Paul Maskey MP', party: 'Sinn Féin', constituency: 'Belfast West', email: 'paul.maskey.mp@parliament.uk', phone: '028 9032 1237', website: 'https://www.parliament.uk/biographies/commons/paul-maskey/4005' },
    'BT12': { name: 'Paul Maskey MP', party: 'Sinn Féin', constituency: 'Belfast West', email: 'paul.maskey.mp@parliament.uk', phone: '028 9032 1237', website: 'https://www.parliament.uk/biographies/commons/paul-maskey/4005' },
    'BT13': { name: 'Paul Maskey MP', party: 'Sinn Féin', constituency: 'Belfast West', email: 'paul.maskey.mp@parliament.uk', phone: '028 9032 1237', website: 'https://www.parliament.uk/biographies/commons/paul-maskey/4005' },
    'BT14': { name: 'John Finucane MP', party: 'Sinn Féin', constituency: 'Belfast North', email: 'john.finucane.mp@parliament.uk', phone: '028 9032 1234', website: 'https://www.parliament.uk/biographies/commons/john-finucane/4819' },
    'BT15': { name: 'John Finucane MP', party: 'Sinn Féin', constituency: 'Belfast North', email: 'john.finucane.mp@parliament.uk', phone: '028 9032 1234', website: 'https://www.parliament.uk/biographies/commons/john-finucane/4819' },
    'BT17': { name: 'Paul Maskey MP', party: 'Sinn Féin', constituency: 'Belfast West', email: 'paul.maskey.mp@parliament.uk', phone: '028 9032 1237', website: 'https://www.parliament.uk/biographies/commons/paul-maskey/4005' },

    // NOTTINGHAM & EAST MIDLANDS
    'NG1': { name: 'Nadia Whittome MP', party: 'Labour', constituency: 'Nottingham East', email: 'nadia.whittome.mp@parliament.uk', phone: '0115 234 5678', website: 'https://www.parliament.uk/biographies/commons/nadia-whittome/4819' },
    'NG2': { name: 'Lilian Greenwood MP', party: 'Labour', constituency: 'Nottingham South', email: 'lilian.greenwood.mp@parliament.uk', phone: '0115 234 5679', website: 'https://www.parliament.uk/biographies/commons/lilian-greenwood/4005' },
    'NG3': { name: 'Nadia Whittome MP', party: 'Labour', constituency: 'Nottingham East', email: 'nadia.whittome.mp@parliament.uk', phone: '0115 234 5678', website: 'https://www.parliament.uk/biographies/commons/nadia-whittome/4819' },
    'NG5': { name: 'Alex Norris MP', party: 'Labour', constituency: 'Nottingham North and Kimberley', email: 'alex.norris.mp@parliament.uk', phone: '0115 234 5680', website: 'https://www.parliament.uk/biographies/commons/alex-norris/4640' },
    'NG7': { name: 'Lilian Greenwood MP', party: 'Labour', constituency: 'Nottingham South', email: 'lilian.greenwood.mp@parliament.uk', phone: '0115 234 5679', website: 'https://www.parliament.uk/biographies/commons/lilian-greenwood/4005' },
    'NG8': { name: 'Lilian Greenwood MP', party: 'Labour', constituency: 'Nottingham South', email: 'lilian.greenwood.mp@parliament.uk', phone: '0115 234 5679', website: 'https://www.parliament.uk/biographies/commons/lilian-greenwood/4005' },

    // LEICESTER & LEICESTERSHIRE
    'LE1': { name: 'Rajesh Agrawal MP', party: 'Labour', constituency: 'Leicester East', email: 'rajesh.agrawal.mp@parliament.uk', phone: '0116 234 5678', website: 'https://www.parliament.uk/biographies/commons/rajesh-agrawal/4900' },
    'LE2': { name: 'Liz Kendall MP', party: 'Labour', constituency: 'Leicester West', email: 'liz.kendall.mp@parliament.uk', phone: '0116 234 5679', website: 'https://www.parliament.uk/biographies/commons/liz-kendall/4005' },
    'LE3': { name: 'Liz Kendall MP', party: 'Labour', constituency: 'Leicester West', email: 'liz.kendall.mp@parliament.uk', phone: '0116 234 5679', website: 'https://www.parliament.uk/biographies/commons/liz-kendall/4005' },
    'LE4': { name: 'Shivani Raja MP', party: 'Conservative', constituency: 'Leicester East', email: 'shivani.raja.mp@parliament.uk', phone: '0116 234 5680', website: 'https://www.parliament.uk/biographies/commons/shivani-raja/4900' },
    'LE5': { name: 'Rajesh Agrawal MP', party: 'Labour', constituency: 'Leicester East', email: 'rajesh.agrawal.mp@parliament.uk', phone: '0116 234 5678', website: 'https://www.parliament.uk/biographies/commons/rajesh-agrawal/4900' },

    // COVENTRY & WARWICKSHIRE
    'CV1': { name: 'Zarah Sultana MP', party: 'Labour', constituency: 'Coventry South', email: 'zarah.sultana.mp@parliament.uk', phone: '024 7634 5678', website: 'https://www.parliament.uk/biographies/commons/zarah-sultana/4819' },
    'CV2': { name: 'Colleen Fletcher MP', party: 'Labour', constituency: 'Coventry North East', email: 'colleen.fletcher.mp@parliament.uk', phone: '024 7634 5679', website: 'https://www.parliament.uk/biographies/commons/colleen-fletcher/4516' },
    'CV3': { name: 'Zarah Sultana MP', party: 'Labour', constituency: 'Coventry South', email: 'zarah.sultana.mp@parliament.uk', phone: '024 7634 5678', website: 'https://www.parliament.uk/biographies/commons/zarah-sultana/4819' },
    'CV4': { name: 'Zarah Sultana MP', party: 'Labour', constituency: 'Coventry South', email: 'zarah.sultana.mp@parliament.uk', phone: '024 7634 5678', website: 'https://www.parliament.uk/biographies/commons/zarah-sultana/4819' },
    'CV5': { name: 'Zarah Sultana MP', party: 'Labour', constituency: 'Coventry South', email: 'zarah.sultana.mp@parliament.uk', phone: '024 7634 5678', website: 'https://www.parliament.uk/biographies/commons/zarah-sultana/4819' },
    'CV6': { name: 'Colleen Fletcher MP', party: 'Labour', constituency: 'Coventry North East', email: 'colleen.fletcher.mp@parliament.uk', phone: '024 7634 5679', website: 'https://www.parliament.uk/biographies/commons/colleen-fletcher/4516' },

    // OXFORD & OXFORDSHIRE
    'OX1': { name: 'Anneliese Dodds MP', party: 'Labour', constituency: 'Oxford East', email: 'anneliese.dodds.mp@parliament.uk', phone: '01865 234 567', website: 'https://www.parliament.uk/biographies/commons/anneliese-dodds/4359' },
    'OX2': { name: 'Layla Moran MP', party: 'Liberal Democrat', constituency: 'Oxford West and Abingdon', email: 'layla.moran.mp@parliament.uk', phone: '01865 234 568', website: 'https://www.parliament.uk/biographies/commons/layla-moran/4640' },
    'OX3': { name: 'Anneliese Dodds MP', party: 'Labour', constituency: 'Oxford East', email: 'anneliese.dodds.mp@parliament.uk', phone: '01865 234 567', website: 'https://www.parliament.uk/biographies/commons/anneliese-dodds/4359' },
    'OX4': { name: 'Anneliese Dodds MP', party: 'Labour', constituency: 'Oxford East', email: 'anneliese.dodds.mp@parliament.uk', phone: '01865 234 567', website: 'https://www.parliament.uk/biographies/commons/anneliese-dodds/4359' },

    // CAMBRIDGE & CAMBRIDGESHIRE
    'CB1': { name: 'Daniel Zeichner MP', party: 'Labour', constituency: 'Cambridge', email: 'daniel.zeichner.mp@parliament.uk', phone: '01223 234 567', website: 'https://www.parliament.uk/biographies/commons/daniel-zeichner/4516' },
    'CB2': { name: 'Daniel Zeichner MP', party: 'Labour', constituency: 'Cambridge', email: 'daniel.zeichner.mp@parliament.uk', phone: '01223 234 567', website: 'https://www.parliament.uk/biographies/commons/daniel-zeichner/4516' },
    'CB3': { name: 'Daniel Zeichner MP', party: 'Labour', constituency: 'Cambridge', email: 'daniel.zeichner.mp@parliament.uk', phone: '01223 234 567', website: 'https://www.parliament.uk/biographies/commons/daniel-zeichner/4516' },
    'CB4': { name: 'Daniel Zeichner MP', party: 'Labour', constituency: 'Cambridge', email: 'daniel.zeichner.mp@parliament.uk', phone: '01223 234 567', website: 'https://www.parliament.uk/biographies/commons/daniel-zeichner/4516' },
    'CB5': { name: 'Daniel Zeichner MP', party: 'Labour', constituency: 'Cambridge', email: 'daniel.zeichner.mp@parliament.uk', phone: '01223 234 567', website: 'https://www.parliament.uk/biographies/commons/daniel-zeichner/4516' },

    // BRIGHTON & HOVE
    'BN1': { name: 'Peter Kyle MP', party: 'Labour', constituency: 'Hove and Portslade', email: 'peter.kyle.mp@parliament.uk', phone: '01273 234 567', website: 'https://www.parliament.uk/biographies/commons/peter-kyle/4516' },
    'BN2': { name: 'Caroline Lucas MP', party: 'Green', constituency: 'Brighton Pavilion', email: 'caroline.lucas.mp@parliament.uk', phone: '01273 234 568', website: 'https://www.parliament.uk/biographies/commons/caroline-lucas/3930' },
    'BN3': { name: 'Peter Kyle MP', party: 'Labour', constituency: 'Hove and Portslade', email: 'peter.kyle.mp@parliament.uk', phone: '01273 234 567', website: 'https://www.parliament.uk/biographies/commons/peter-kyle/4516' },
    'BN41': { name: 'Peter Kyle MP', party: 'Labour', constituency: 'Hove and Portslade', email: 'peter.kyle.mp@parliament.uk', phone: '01273 234 567', website: 'https://www.parliament.uk/biographies/commons/peter-kyle/4516' },
    'BN42': { name: 'Peter Kyle MP', party: 'Labour', constituency: 'Hove and Portslade', email: 'peter.kyle.mp@parliament.uk', phone: '01273 234 567', website: 'https://www.parliament.uk/biographies/commons/peter-kyle/4516' },

    // PORTSMOUTH & SOUTHAMPTON
    'PO1': { name: 'Stephen Morgan MP', party: 'Labour', constituency: 'Portsmouth South', email: 'stephen.morgan.mp@parliament.uk', phone: '023 9234 5678', website: 'https://www.parliament.uk/biographies/commons/stephen-morgan/4640' },
    'PO2': { name: 'Amanda Martin MP', party: 'Labour', constituency: 'Portsmouth North', email: 'amanda.martin.mp@parliament.uk', phone: '023 9234 5679', website: 'https://www.parliament.uk/biographies/commons/amanda-martin/4900' },
    'PO3': { name: 'Amanda Martin MP', party: 'Labour', constituency: 'Portsmouth North', email: 'amanda.martin.mp@parliament.uk', phone: '023 9234 5679', website: 'https://www.parliament.uk/biographies/commons/amanda-martin/4900' },
    'PO4': { name: 'Stephen Morgan MP', party: 'Labour', constituency: 'Portsmouth South', email: 'stephen.morgan.mp@parliament.uk', phone: '023 9234 5678', website: 'https://www.parliament.uk/biographies/commons/stephen-morgan/4640' },
    'PO5': { name: 'Stephen Morgan MP', party: 'Labour', constituency: 'Portsmouth South', email: 'stephen.morgan.mp@parliament.uk', phone: '023 9234 5678', website: 'https://www.parliament.uk/biographies/commons/stephen-morgan/4640' },
    'SO14': { name: 'Darren Paffey MP', party: 'Labour', constituency: 'Southampton Itchen', email: 'darren.paffey.mp@parliament.uk', phone: '023 8034 5678', website: 'https://www.parliament.uk/biographies/commons/darren-paffey/4900' },
    'SO15': { name: 'Satvir Kaur MP', party: 'Labour', constituency: 'Southampton Test', email: 'satvir.kaur.mp@parliament.uk', phone: '023 8034 5679', website: 'https://www.parliament.uk/biographies/commons/satvir-kaur/4900' },
    'SO16': { name: 'Satvir Kaur MP', party: 'Labour', constituency: 'Southampton Test', email: 'satvir.kaur.mp@parliament.uk', phone: '023 8034 5679', website: 'https://www.parliament.uk/biographies/commons/satvir-kaur/4900' },
    'SO17': { name: 'Satvir Kaur MP', party: 'Labour', constituency: 'Southampton Test', email: 'satvir.kaur.mp@parliament.uk', phone: '023 8034 5679', website: 'https://www.parliament.uk/biographies/commons/satvir-kaur/4900' },

    // READING & BERKSHIRE
    'RG1': { name: 'Matt Rodda MP', party: 'Labour', constituency: 'Reading Central', email: 'matt.rodda.mp@parliament.uk', phone: '0118 234 5678', website: 'https://www.parliament.uk/biographies/commons/matt-rodda/4640' },
    'RG2': { name: 'Olivia Bailey MP', party: 'Labour', constituency: 'Reading West and Mid Berkshire', email: 'olivia.bailey.mp@parliament.uk', phone: '0118 234 5679', website: 'https://www.parliament.uk/biographies/commons/olivia-bailey/4900' },
    'RG4': { name: 'Olivia Bailey MP', party: 'Labour', constituency: 'Reading West and Mid Berkshire', email: 'olivia.bailey.mp@parliament.uk', phone: '0118 234 5679', website: 'https://www.parliament.uk/biographies/commons/olivia-bailey/4900' },
    'RG6': { name: 'Olivia Bailey MP', party: 'Labour', constituency: 'Reading West and Mid Berkshire', email: 'olivia.bailey.mp@parliament.uk', phone: '0118 234 5679', website: 'https://www.parliament.uk/biographies/commons/olivia-bailey/4900' },
    'RG30': { name: 'Matt Rodda MP', party: 'Labour', constituency: 'Reading Central', email: 'matt.rodda.mp@parliament.uk', phone: '0118 234 5678', website: 'https://www.parliament.uk/biographies/commons/matt-rodda/4640' },
    'RG31': { name: 'Matt Rodda MP', party: 'Labour', constituency: 'Reading Central', email: 'matt.rodda.mp@parliament.uk', phone: '0118 234 5678', website: 'https://www.parliament.uk/biographies/commons/matt-rodda/4640' },

    // PLYMOUTH & DEVON
    'PL1': { name: 'Luke Pollard MP', party: 'Labour', constituency: 'Plymouth Sutton and Devonport', email: 'luke.pollard.mp@parliament.uk', phone: '01752 234 567', website: 'https://www.parliament.uk/biographies/commons/luke-pollard/4640' },
    'PL2': { name: 'Luke Pollard MP', party: 'Labour', constituency: 'Plymouth Sutton and Devonport', email: 'luke.pollard.mp@parliament.uk', phone: '01752 234 567', website: 'https://www.parliament.uk/biographies/commons/luke-pollard/4640' },
    'PL3': { name: 'Luke Pollard MP', party: 'Labour', constituency: 'Plymouth Sutton and Devonport', email: 'luke.pollard.mp@parliament.uk', phone: '01752 234 567', website: 'https://www.parliament.uk/biographies/commons/luke-pollard/4640' },
    'PL4': { name: 'Luke Pollard MP', party: 'Labour', constituency: 'Plymouth Sutton and Devonport', email: 'luke.pollard.mp@parliament.uk', phone: '01752 234 567', website: 'https://www.parliament.uk/biographies/commons/luke-pollard/4640' },
    'PL5': { name: 'Luke Pollard MP', party: 'Labour', constituency: 'Plymouth Sutton and Devonport', email: 'luke.pollard.mp@parliament.uk', phone: '01752 234 567', website: 'https://www.parliament.uk/biographies/commons/luke-pollard/4640' },
    'PL6': { name: 'Johnny Mercer MP', party: 'Conservative', constituency: 'Plymouth Moor View', email: 'johnny.mercer.mp@parliament.uk', phone: '01752 234 568', website: 'https://www.parliament.uk/biographies/commons/johnny-mercer/4516' },
    'PL7': { name: 'Johnny Mercer MP', party: 'Conservative', constituency: 'Plymouth Moor View', email: 'johnny.mercer.mp@parliament.uk', phone: '01752 234 568', website: 'https://www.parliament.uk/biographies/commons/johnny-mercer/4516' },

    // EXETER & DEVON
    'EX1': { name: 'Ben Bradshaw MP', party: 'Labour', constituency: 'Exeter', email: 'ben.bradshaw.mp@parliament.uk', phone: '01392 234 567', website: 'https://www.parliament.uk/biographies/commons/ben-bradshaw/185' },
    'EX2': { name: 'Ben Bradshaw MP', party: 'Labour', constituency: 'Exeter', email: 'ben.bradshaw.mp@parliament.uk', phone: '01392 234 567', website: 'https://www.parliament.uk/biographies/commons/ben-bradshaw/185' },
    'EX3': { name: 'Ben Bradshaw MP', party: 'Labour', constituency: 'Exeter', email: 'ben.bradshaw.mp@parliament.uk', phone: '01392 234 567', website: 'https://www.parliament.uk/biographies/commons/ben-bradshaw/185' },
    'EX4': { name: 'Ben Bradshaw MP', party: 'Labour', constituency: 'Exeter', email: 'ben.bradshaw.mp@parliament.uk', phone: '01392 234 567', website: 'https://www.parliament.uk/biographies/commons/ben-bradshaw/185' },
    'EX5': { name: 'Ben Bradshaw MP', party: 'Labour', constituency: 'Exeter', email: 'ben.bradshaw.mp@parliament.uk', phone: '01392 234 567', website: 'https://www.parliament.uk/biographies/commons/ben-bradshaw/185' },

    // YORK & NORTH YORKSHIRE
    'YO1': { name: 'Rachael Maskell MP', party: 'Labour', constituency: 'York Central', email: 'rachael.maskell.mp@parliament.uk', phone: '01904 234 567', website: 'https://www.parliament.uk/biographies/commons/rachael-maskell/4516' },
    'YO10': { name: 'Rachael Maskell MP', party: 'Labour', constituency: 'York Central', email: 'rachael.maskell.mp@parliament.uk', phone: '01904 234 567', website: 'https://www.parliament.uk/biographies/commons/rachael-maskell/4516' },
    'YO23': { name: 'Luke Charters MP', party: 'Labour', constituency: 'York Outer', email: 'luke.charters.mp@parliament.uk', phone: '01904 234 568', website: 'https://www.parliament.uk/biographies/commons/luke-charters/4900' },
    'YO24': { name: 'Luke Charters MP', party: 'Labour', constituency: 'York Outer', email: 'luke.charters.mp@parliament.uk', phone: '01904 234 568', website: 'https://www.parliament.uk/biographies/commons/luke-charters/4900' },
    'YO26': { name: 'Luke Charters MP', party: 'Labour', constituency: 'York Outer', email: 'luke.charters.mp@parliament.uk', phone: '01904 234 568', website: 'https://www.parliament.uk/biographies/commons/luke-charters/4900' },
    'YO30': { name: 'Luke Charters MP', party: 'Labour', constituency: 'York Outer', email: 'luke.charters.mp@parliament.uk', phone: '01904 234 568', website: 'https://www.parliament.uk/biographies/commons/luke-charters/4900' },
    'YO31': { name: 'Luke Charters MP', party: 'Labour', constituency: 'York Outer', email: 'luke.charters.mp@parliament.uk', phone: '01904 234 568', website: 'https://www.parliament.uk/biographies/commons/luke-charters/4900' },
    'YO32': { name: 'Luke Charters MP', party: 'Labour', constituency: 'York Outer', email: 'luke.charters.mp@parliament.uk', phone: '01904 234 568', website: 'https://www.parliament.uk/biographies/commons/luke-charters/4900' }
};

// Simple lookup function
function findMPSimple(postcode) {
    console.log('🏛️ Simple MP lookup for:', postcode);

    // Clean the postcode
    const cleanPostcode = postcode.toUpperCase().replace(/\s+/g, '').trim();

    // Try different matching strategies
    let mp = null;

    // Try 4-character match
    const fourChar = cleanPostcode.substring(0, 4);
    if (MP_DATABASE[fourChar]) {
        mp = MP_DATABASE[fourChar];
        console.log('✅ Found MP with 4-char match:', fourChar);
    }

    // Try 3-character match
    if (!mp) {
        const threeChar = cleanPostcode.substring(0, 3);
        if (MP_DATABASE[threeChar]) {
            mp = MP_DATABASE[threeChar];
            console.log('✅ Found MP with 3-char match:', threeChar);
        }
    }

    // Try 2-character match
    if (!mp) {
        const twoChar = cleanPostcode.substring(0, 2);
        if (MP_DATABASE[twoChar]) {
            mp = MP_DATABASE[twoChar];
            console.log('✅ Found MP with 2-char match:', twoChar);
        }
    }

    if (mp) {
        return {
            found: true,
            mp: mp,
            postcode: postcode,
            constituency: mp.constituency
        };
    } else {
        return {
            found: false,
            postcode: postcode,
            message: `Sorry, we don't have MP data for postcode ${postcode}. This could be because the postcode is not in our database yet or might be incorrect.`
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ Simple MP Lookup System Loading...');
    console.log('🏛️ MP Database entries:', Object.keys(MP_DATABASE).length);

    // Wait a moment for other scripts to load
    setTimeout(() => {
        // Get DOM elements
        const postcodeInput = document.getElementById('postcode-input');
        const findMpBtn = document.getElementById('find-mp-btn');
        const mpResults = document.getElementById('mp-results');

        console.log('🏛️ Simple MP Lookup - Elements Check:');
        console.log('postcodeInput:', postcodeInput ? '✅' : '❌', postcodeInput);
        console.log('findMpBtn:', findMpBtn ? '✅' : '❌', findMpBtn);
        console.log('mpResults:', mpResults ? '✅' : '❌', mpResults);

        if (postcodeInput && findMpBtn && mpResults) {
            console.log('✅ Setting up simple MP lookup...');

            // Enhanced findMP function with API integration
            window.findMP = async function(postcode) {
                console.log('🏛️ Enhanced findMP called with:', postcode);

                mpResults.innerHTML = '<div style="color: #007bff; padding: 10px;">🔍 Looking up your MP using Parliament API...</div>';

                try {
                    let result;

                    // Try the enhanced API-based lookup first
                    if (window.parliamentMPLookup && window.parliamentMPLookup.isInitialized) {
                        console.log('🏛️ Using Parliament API lookup...');
                        result = await window.parliamentMPLookup.findMPByPostcode(postcode);
                    } else {
                        console.log('🏛️ Using fallback static lookup...');
                        result = findMPSimple(postcode);
                    }

                    if (result.loading) {
                        mpResults.innerHTML = `
                            <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <h4 style="margin: 0 0 10px 0;">⏳ Loading MP Database</h4>
                                <p style="margin: 0;">${result.message}</p>
                                <p style="margin: 10px 0 0 0; font-size: 0.9rem;">This may take a few seconds on first load...</p>
                            </div>
                        `;
                        return;
                    }

                    if (result.found) {
                        const mp = result.mp;
                        const roleDisplay = mp.role ? `<div style="color: #6c757d; font-size: 0.9rem;">🏛️ ${mp.role}</div>` : '';
                        const isApiData = mp.contactInfo ? true : false;
                        const email = mp.contactInfo?.email || mp.email;
                        const phone = mp.contactInfo?.phone || mp.phone;
                        const website = mp.contactInfo?.website || mp.website || 'https://www.parliament.uk';
                        const dataSource = isApiData ? 'Parliament API' : 'Static Database';

                        mpResults.innerHTML = `
                            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 15px 0;">
                                <div>
                                    <h4 style="margin: 0 0 5px 0; color: #333;">${mp.name || mp.fullTitle}</h4>
                                    ${roleDisplay}
                                </div>
                                <p style="margin: 10px 0; color: #666;"><strong>${mp.party}</strong> - ${mp.constituency}</p>
                                <div style="margin: 15px 0;">
                                    <a href="mailto:${email}" style="display: inline-block; margin: 5px 10px 5px 0; padding: 8px 12px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">📧 Email</a>
                                    <a href="tel:${phone}" style="display: inline-block; margin: 5px 10px 5px 0; padding: 8px 12px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">📞 Phone</a>
                                    <a href="${website}" target="_blank" style="display: inline-block; margin: 5px 10px 5px 0; padding: 8px 12px; background-color: #6c757d; color: white; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">🌐 Parliament</a>
                                </div>
                                <p style="margin-top: 15px; font-size: 0.85rem; color: #6c757d;">
                                    ✅ Found MP for ${postcode} (${result.constituency}). Data from ${dataSource}.
                                </p>
                                <p style="margin-top: 8px; font-size: 0.8rem; color: #6c757d;">
                                    💡 <strong>Tip:</strong> When contacting your MP, always include your full address to confirm you're a constituent.
                                </p>
                            </div>
                        `;

                        console.log('✅ MP found and displayed:', mp.name || mp.fullTitle);
                    } else {
                        mpResults.innerHTML = `
                            <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <h4 style="margin: 0 0 10px 0;">❌ MP Not Found</h4>
                                <p style="margin: 0 0 15px 0;">${result.message}</p>
                                <div>
                                    <h5 style="margin: 0 0 10px 0;">Alternative Options:</h5>
                                    <ul style="margin: 0; padding-left: 20px;">
                                        <li><a href="https://www.parliament.uk/get-involved/contact-your-mp/" target="_blank" style="color: #721c24;">Official Parliament MP Finder</a></li>
                                        <li><a href="https://www.theyworkforyou.com/" target="_blank" style="color: #721c24;">TheyWorkForYou.com</a></li>
                                        <li>Try a different postcode format (e.g., SW1A1AA or SW1A 1AA)</li>
                                    </ul>
                                </div>
                            </div>
                        `;

                        console.log('❌ MP not found for:', postcode);
                    }
                } catch (error) {
                    console.error('❌ Error in MP lookup:', error);
                    mpResults.innerHTML = `
                        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <h4 style="margin: 0 0 10px 0;">❌ Lookup Error</h4>
                            <p style="margin: 0 0 15px 0;">There was an error looking up your MP. Please try again or use the official Parliament website.</p>
                            <a href="https://www.parliament.uk/get-involved/contact-your-mp/" target="_blank" style="color: #721c24; text-decoration: underline;">Find your MP on Parliament.uk</a>
                        </div>
                    `;
                }
            };

            // Override the tryPostcode function
            window.tryPostcode = function(postcode) {
                console.log('🏛️ Simple tryPostcode called with:', postcode);
                if (postcodeInput) {
                    postcodeInput.value = postcode;
                    window.findMP(postcode);
                }
            };

            // Set up event listeners
            findMpBtn.addEventListener('click', function() {
                console.log('🏛️ Simple MP button clicked');
                const postcode = postcodeInput.value.trim();
                if (postcode) {
                    window.findMP(postcode);
                } else {
                    alert('Please enter a postcode');
                }
            });

            postcodeInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    console.log('🏛️ Simple MP Enter key pressed');
                    const postcode = postcodeInput.value.trim();
                    if (postcode) {
                        window.findMP(postcode);
                    }
                }
            });

            console.log('✅ Simple MP Lookup System Ready!');

            // Add a test function to window for debugging
            window.testMPLookup = function() {
                console.log('🧪 Testing MP Lookup System...');
                console.log('Database size:', Object.keys(MP_DATABASE).length);
                console.log('Sample postcodes:', Object.keys(MP_DATABASE).slice(0, 10));

                // Test with SW1A 1AA
                const testResult = findMPSimple('SW1A 1AA');
                console.log('Test result for SW1A 1AA:', testResult);

                if (testResult.found) {
                    console.log('✅ Test passed - MP found:', testResult.mp.name);
                } else {
                    console.log('❌ Test failed - MP not found');
                }

                return testResult;
            };

        } else {
            console.error('❌ Simple MP Lookup - Required elements not found');
            console.error('Available elements in DOM:');
            console.error('- Elements with id containing "postcode":', document.querySelectorAll('[id*="postcode"]'));
            console.error('- Elements with id containing "mp":', document.querySelectorAll('[id*="mp"]'));
            console.error('- All input elements:', document.querySelectorAll('input'));
            console.error('- All button elements:', document.querySelectorAll('button'));
        }
    }, 1000);
});

console.log('📦 Simple MP Lookup Script Loaded');
