#!/usr/bin/env python3
"""
🧠 Enhanced UK Parliament News Scraper with AI Summarization
Fetches BBC Politics news and provides AI-powered summaries
Saves results to JSON file for web integration

Features:
- BBC Politics RSS feed integration
- AI-powered summarization using BART model
- JSON export for web integration
- Error handling and fallback options
- Multiple news sources support
"""

import feedparser
import warnings
import sys
import json
import os
import time
import requests
from datetime import datetime
from typing import List, Dict, Optional

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

# News sources configuration
NEWS_SOURCES = {
    "bbc_politics": {
        "name": "BBC Politics",
        "url": "http://feeds.bbci.co.uk/news/politics/rss.xml",
        "description": "BBC Politics RSS Feed"
    },
    "parliament_news": {
        "name": "UK Parliament News",
        "url": "https://www.parliament.uk/business/news/rss-feeds/",
        "description": "Official UK Parliament News"
    },
    "gov_uk": {
        "name": "GOV.UK",
        "url": "https://www.gov.uk/search/news-and-communications.atom",
        "description": "UK Government News"
    }
}

def load_summarizer():
    """Load the AI summarization model with enhanced error handling"""
    try:
        print("🤖 Loading AI summarization model (this may take a moment on first run)...")

        # Try to import transformers
        try:
            from transformers import pipeline
        except ImportError:
            print("❌ transformers library not found. Installing...")
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "transformers", "torch"])
            from transformers import pipeline

        # Load the model
        summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=-1,  # Use CPU (set to 0 for GPU if available)
            max_length=512,
            truncation=True
        )
        print("✅ AI model loaded successfully!")
        return summarizer

    except Exception as e:
        print(f"❌ Error loading AI model: {e}")
        print("💡 Falling back to original summaries...")
        print("💡 To use AI summarization, install: pip install transformers torch")
        return None

def fetch_news_from_source(source_key: str, num_articles: int = 5) -> List[Dict]:
    """Fetch news from a specific source"""
    if source_key not in NEWS_SOURCES:
        print(f"❌ Unknown news source: {source_key}")
        return []

    source = NEWS_SOURCES[source_key]
    print(f"📰 Fetching news from {source['name']}...")

    try:
        # Parse the RSS feed with user agent
        feed = feedparser.parse(source['url'])

        if not feed.entries:
            print(f"❌ No articles found in {source['name']} feed")
            return []

        print(f"✅ Found {len(feed.entries)} articles from {source['name']}")

        # Convert to our standard format
        articles = []
        for entry in feed.entries[:num_articles]:
            article = {
                'title': entry.title,
                'link': entry.link,
                'summary': getattr(entry, 'summary', ''),
                'published': getattr(entry, 'published', ''),
                'source': source['name'],
                'source_key': source_key
            }
            articles.append(article)

        return articles

    except Exception as e:
        print(f"❌ Error fetching news from {source['name']}: {e}")
        return []

def fetch_politics_news(rss_url="http://feeds.bbci.co.uk/news/politics/rss.xml", num_articles=3):
    """Legacy function for backward compatibility"""
    try:
        print(f"📰 Fetching news from RSS feed...")
        feed = feedparser.parse(rss_url)

        if not feed.entries:
            print("❌ No articles found in the feed")
            return []

        print(f"✅ Found {len(feed.entries)} articles")
        return feed.entries[:num_articles]

    except Exception as e:
        print(f"❌ Error fetching news: {e}")
        return []

def fetch_all_news_sources(num_articles_per_source: int = 3) -> List[Dict]:
    """Fetch news from all configured sources"""
    all_articles = []

    for source_key in NEWS_SOURCES.keys():
        articles = fetch_news_from_source(source_key, num_articles_per_source)
        all_articles.extend(articles)

        # Small delay between requests to be respectful
        time.sleep(1)

    # Sort by publication date if available
    def get_pub_date(article):
        try:
            if article.get('published'):
                return datetime.strptime(article['published'], '%a, %d %b %Y %H:%M:%S %Z')
        except:
            pass
        return datetime.min

    all_articles.sort(key=get_pub_date, reverse=True)
    return all_articles

def clean_text(text):
    """Clean and prepare text for summarization"""
    if not text:
        return ""

    # Remove HTML tags and clean up text
    import re
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def summarize_article(summarizer, text, max_length=50, min_length=25):
    """Generate AI summary of article text"""
    if not summarizer or not text:
        return None

    try:
        # Clean the text
        clean_text_content = clean_text(text)

        # Skip if text is too short
        word_count = len(clean_text_content.split())
        if word_count < 10:
            return None

        # Adjust max_length based on input length to avoid warnings
        adjusted_max_length = min(max_length, max(word_count - 5, 10))
        adjusted_min_length = min(min_length, adjusted_max_length - 5)

        # Generate summary
        summary = summarizer(
            clean_text_content,
            max_length=adjusted_max_length,
            min_length=max(adjusted_min_length, 5),
            do_sample=False
        )
        return summary[0]['summary_text']

    except Exception as e:
        print(f"⚠️ Error summarizing text: {e}")
        return None

def format_article_output(entry, ai_summary=None, index=1):
    """Format article for display"""
    print(f"\n📄 Article {index}")
    print("=" * 60)
    print(f"📰 Title: {entry.title}")
    print(f"🔗 Link: {entry.link}")

    if hasattr(entry, 'published'):
        print(f"📅 Published: {entry.published}")

    print(f"\n📝 Original Summary:")
    print(f"   {entry.summary}")

    if ai_summary:
        print(f"\n🧠 AI Summary:")
        print(f"   {ai_summary}")
    else:
        print(f"\n🧠 AI Summary: Not available")

    print("-" * 60)

def save_to_json(articles_data, filename="data/latest_news.json"):
    """Save articles data to JSON file"""
    try:
        # Create data directory if it doesn't exist
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        # Add metadata
        output_data = {
            "last_updated": datetime.now().isoformat(),
            "source": "BBC Politics RSS",
            "total_articles": len(articles_data),
            "articles": articles_data
        }

        # Save to JSON file
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print(f"💾 Saved {len(articles_data)} articles to {filename}")
        return True

    except Exception as e:
        print(f"❌ Error saving to JSON: {e}")
        return False

def main():
    """Main function to run the enhanced news fetcher with AI summarization"""
    print("🚀 Enhanced UK Parliament News Scraper with AI Summarization")
    print("=" * 70)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Show available sources
    print(f"\n📰 Available News Sources:")
    for key, source in NEWS_SOURCES.items():
        print(f"   • {source['name']}: {source['description']}")

    # Load AI summarizer
    summarizer = load_summarizer()

    # Fetch news articles from all sources
    print(f"\n🔍 Fetching news from all sources...")
    articles = fetch_all_news_sources(num_articles_per_source=3)

    if not articles:
        print("❌ No articles to process")
        return

    print(f"\n🔍 Processing {len(articles)} articles from {len(NEWS_SOURCES)} sources...")

    # Store all summaries for JSON export
    all_summaries = []

    # Process each article
    for i, article in enumerate(articles, 1):
        # Generate AI summary if model is available
        ai_summary = None
        if summarizer and article.get('summary'):
            print(f"🧠 Generating AI summary for article {i}/{len(articles)}...")
            ai_summary = summarize_article(summarizer, article['summary'])

        # Create item for JSON export
        item = {
            "title": article['title'],
            "link": article['link'],
            "original_summary": article.get('summary', ''),
            "ai_summary": ai_summary if ai_summary else "AI summary not available",
            "published": article.get('published', ''),
            "source": article.get('source', 'Unknown'),
            "source_key": article.get('source_key', ''),
            "processed_at": datetime.now().isoformat()
        }
        all_summaries.append(item)

        # Display formatted output
        format_enhanced_article_output(article, ai_summary, i)

    # Save to JSON file
    print(f"\n💾 Saving summaries to JSON file...")
    save_to_json(all_summaries)

    print(f"\n✅ Completed processing {len(articles)} articles from {len(NEWS_SOURCES)} sources")
    print("=" * 70)

def format_enhanced_article_output(article: Dict, ai_summary: Optional[str] = None, index: int = 1):
    """Format article for display with enhanced information"""
    print(f"\n📄 Article {index}")
    print("=" * 60)
    print(f"📰 Title: {article['title']}")
    print(f"🔗 Link: {article['link']}")
    print(f"📡 Source: {article.get('source', 'Unknown')}")

    if article.get('published'):
        print(f"📅 Published: {article['published']}")

    print(f"\n📝 Original Summary:")
    summary_text = article.get('summary', 'No summary available')
    print(f"   {summary_text[:200]}{'...' if len(summary_text) > 200 else ''}")

    if ai_summary:
        print(f"\n🧠 AI Summary:")
        print(f"   {ai_summary}")
    else:
        print(f"\n🧠 AI Summary: Not available")

    print("-" * 60)

def quick_test():
    """Quick test function without AI summarization"""
    print("🚀 Quick News Test (No AI)")
    print("=" * 40)

    articles = fetch_politics_news(num_articles=2)

    for i, entry in enumerate(articles, 1):
        print(f"\n📄 Article {i}")
        print(f"Title: {entry.title}")
        print(f"Summary: {entry.summary[:100]}...")
        print("-" * 40)

def test_single_source(source_key: str):
    """Test fetching from a single news source"""
    print(f"🚀 Testing Single Source: {source_key}")
    print("=" * 50)

    if source_key not in NEWS_SOURCES:
        print(f"❌ Unknown source: {source_key}")
        print(f"Available sources: {', '.join(NEWS_SOURCES.keys())}")
        return

    articles = fetch_news_from_source(source_key, num_articles=3)

    for i, article in enumerate(articles, 1):
        print(f"\n📄 Article {i}")
        print(f"Title: {article['title']}")
        print(f"Source: {article['source']}")
        print(f"Summary: {article['summary'][:100]}...")
        print("-" * 40)

def show_help():
    """Show help information"""
    print("🚀 UK Parliament News Scraper")
    print("=" * 50)
    print("Usage:")
    print("  python fetch_news.py                    # Full scraper with AI")
    print("  python fetch_news.py --quick           # Quick test (BBC only)")
    print("  python fetch_news.py --source <key>    # Test single source")
    print("  python fetch_news.py --list-sources    # List available sources")
    print("  python fetch_news.py --help            # Show this help")
    print()
    print("Available sources:")
    for key, source in NEWS_SOURCES.items():
        print(f"  {key:15} - {source['name']}")

def list_sources():
    """List all available news sources"""
    print("📰 Available News Sources:")
    print("=" * 50)
    for key, source in NEWS_SOURCES.items():
        print(f"🔑 Key: {key}")
        print(f"📰 Name: {source['name']}")
        print(f"📝 Description: {source['description']}")
        print(f"🔗 URL: {source['url']}")
        print("-" * 30)

if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()

        if arg == "--quick":
            quick_test()
        elif arg == "--help" or arg == "-h":
            show_help()
        elif arg == "--list-sources":
            list_sources()
        elif arg == "--source" and len(sys.argv) > 2:
            test_single_source(sys.argv[2])
        else:
            print(f"❌ Unknown argument: {sys.argv[1]}")
            show_help()
    else:
        main()
