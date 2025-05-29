# GovWhiz

A modern web application for accessing UK government services and MP information. GovWhiz helps citizens easily find and connect with their Members of Parliament while providing access to essential government services.

## Features

- MP Lookup by postcode
- Detailed MP information including voting records and contact details
- Modern, responsive UI built with Tailwind CSS
- Flask backend with efficient caching system

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/GovWhiz.git
cd GovWhiz
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install Node.js dependencies:
```bash
npm install
```

4. Set up environment variables:
Create a `.env` file in the root directory and add:
```
THEYWORKFORYOU_API_KEY=your_api_key_here
```

## Development

Start the Flask development server:
```bash
python app_new.py
```

The application will be available at `http://localhost:5000`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.