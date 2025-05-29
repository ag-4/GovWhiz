# 🏛️ UK Parliament News Scraper

A comprehensive news aggregation system that fetches political news from multiple UK sources and provides AI-powered summarization.

## ✨ Features

- **Multi-Source News Aggregation**: Fetches from BBC Politics, UK Parliament, and GOV.UK
- **AI-Powered Summarization**: Uses Facebook's BART model for intelligent article summaries
- **JSON Export**: Saves structured data for web integration
- **Web Demo Interface**: Beautiful HTML interface to view scraped news
- **Command Line Interface**: Multiple options for different use cases
- **Error Handling**: Robust fallback mechanisms and error reporting

## 🚀 Quick Start

### Prerequisites

- Python 3.7 or higher
- Internet connection for fetching news and AI models

### Installation

1. **Clone or download the project files**
2. **Install dependencies** (automatic with PowerShell script):
   ```bash
   pip install feedparser requests transformers torch
   ```

### Running the Scraper

#### Option 1: PowerShell Script (Recommended)
```powershell
.\run_news_scraper.ps1
```

#### Option 2: Batch File (Windows)
```cmd
run_news_scraper.bat
```

#### Option 3: Direct Python Commands
```bash
# Quick test (BBC only, no AI)
python fetch_news.py --quick

# Full scraper with AI
python fetch_news.py

# Test single source
python fetch_news.py --source bbc_politics

# List available sources
python fetch_news.py --list-sources

# Show help
python fetch_news.py --help
```

## 📰 News Sources

| Source | Description | URL |
|--------|-------------|-----|
| **BBC Politics** | BBC Politics RSS Feed | http://feeds.bbci.co.uk/news/politics/rss.xml |
| **UK Parliament** | Official Parliament News | https://www.parliament.uk/business/news/rss-feeds/ |
| **GOV.UK** | UK Government News | https://www.gov.uk/search/news-and-communications.atom |

## 🧠 AI Summarization

The scraper uses Facebook's BART (Bidirectional and Auto-Regressive Transformers) model for generating intelligent summaries:

- **Model**: `facebook/bart-large-cnn`
- **Purpose**: Condenses long articles into concise, meaningful summaries
- **Fallback**: Original article summaries if AI is unavailable
- **Performance**: Optimized for CPU usage with automatic GPU detection

## 📁 Output Files

### `data/latest_news.json`
```json
{
  "last_updated": "2025-05-27T20:30:00",
  "source": "BBC Politics RSS",
  "total_articles": 9,
  "articles": [
    {
      "title": "Article Title",
      "link": "https://...",
      "original_summary": "Original article summary...",
      "ai_summary": "AI-generated concise summary...",
      "published": "Mon, 27 May 2025 15:30:00 GMT",
      "source": "BBC Politics",
      "source_key": "bbc_politics",
      "processed_at": "2025-05-27T20:30:00"
    }
  ]
}
```

## 🌐 Web Demo

Open `news-scraper-demo.html` in your browser to view:

- **Interactive News Display**: Beautiful card-based layout
- **Source Filtering**: Filter by news source
- **Statistics Dashboard**: Article counts and AI summary stats
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Refresh to load latest scraped data

### Demo Features

- 🔄 **Refresh News**: Load latest scraped articles
- 📺 **BBC Only**: Filter for BBC Politics articles
- 📊 **Statistics**: View article and source counts
- 🚀 **Run Scraper**: Instructions to run the Python scraper

## 🛠️ Command Line Options

```bash
python fetch_news.py [OPTIONS]

Options:
  --quick           Quick test with BBC Politics only (no AI)
  --source <key>    Test fetching from a single source
  --list-sources    Show all available news sources
  --help, -h        Show help information
```

### Source Keys
- `bbc_politics` - BBC Politics RSS Feed
- `parliament_news` - UK Parliament News
- `gov_uk` - GOV.UK News

## 🔧 Configuration

### Adding New Sources

Edit the `NEWS_SOURCES` dictionary in `fetch_news.py`:

```python
NEWS_SOURCES = {
    "your_source": {
        "name": "Your News Source",
        "url": "https://example.com/rss.xml",
        "description": "Description of your source"
    }
}
```

### AI Model Configuration

Modify the summarizer settings in `load_summarizer()`:

```python
summarizer = pipeline(
    "summarization",
    model="facebook/bart-large-cnn",  # Change model here
    device=-1,  # -1 for CPU, 0 for GPU
    max_length=512,
    truncation=True
)
```

## 📊 Performance

- **Quick Test**: ~2-5 seconds (BBC only, no AI)
- **Full Scraper**: ~30-60 seconds (first run with AI model download)
- **Subsequent Runs**: ~10-20 seconds (AI model cached)
- **Memory Usage**: ~500MB-1GB (with AI model loaded)

## 🐛 Troubleshooting

### Common Issues

1. **"transformers not found"**
   ```bash
   pip install transformers torch
   ```

2. **"No articles found"**
   - Check internet connection
   - Verify RSS feed URLs are accessible
   - Some sources may be temporarily unavailable

3. **AI model download fails**
   - Ensure stable internet connection
   - Model downloads ~500MB on first run
   - Use `--quick` option to skip AI

4. **Permission errors**
   - Run as administrator (Windows)
   - Check write permissions for `data/` directory

### Debug Mode

Add debug prints by modifying the script or use verbose output:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🔄 Integration

### Web Integration

The JSON output is designed for easy web integration:

```javascript
// Load news data
fetch('data/latest_news.json')
  .then(response => response.json())
  .then(data => {
    data.articles.forEach(article => {
      console.log(article.title, article.ai_summary);
    });
  });
```

### Automation

Set up automated scraping with cron (Linux/Mac) or Task Scheduler (Windows):

```bash
# Run every hour
0 * * * * /usr/bin/python3 /path/to/fetch_news.py
```

## 📝 License

This project is for educational and research purposes. Please respect the terms of service of news sources and use responsibly.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review error messages carefully
3. Ensure all dependencies are installed
4. Test with `--quick` option first

---

**Happy News Scraping! 📰🚀**
