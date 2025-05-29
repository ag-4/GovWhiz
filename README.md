# GovWhiz

GovWhiz is a web application that provides easy access to UK government services and parliamentary information. It features an MP lookup service, legislative information, and various tools to help citizens engage with their government representatives.

## Features

- MP Lookup Service: Find your MP by postcode or constituency
- Parliament Services Integration: Access various parliamentary services
- News Feed: Stay updated with the latest parliamentary news
- Government Services Directory: Easy access to various government services
- Lords Information: Look up information about members of the House of Lords

## Technology Stack

- Backend: Python/Flask
- Frontend: HTML, CSS (Tailwind), JavaScript
- Data Sources: UK Parliament API
- Caching System: Local JSON storage for improved performance

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   npm install
   ```
3. Start the Flask server:
   ```bash
   python app_new.py
   ```

## Project Structure

- `/static` - Static assets (CSS, JS, images)
- `/templates` - HTML templates
- `/data` - JSON data files and caches
- `/scripts` - Utility scripts
- `/js` - Frontend JavaScript modules

## Configuration

Create a `.env` file with the following variables:
```
FLASK_APP=app_new.py
FLASK_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License.
