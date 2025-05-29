import feedparser
import json
from datetime import datetime
from pathlib import Path
import os
from transformers import pipeline

def fetch_news():
    # Initialize AI summarizer
    try:
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    except Exception as e:
        print(f"Warning: Could not initialize AI summarizer: {e}")
        summarizer = None
    
    # BBC Politics News Feed
    rss_url = "http://feeds.bbci.co.uk/news/politics/rss.xml"
    
    try:
        feed = feedparser.parse(rss_url)
        news_items = []
        
        # Get top 5 articles
        for entry in feed.entries[:5]:
            article = {
                "title": entry.title,
                "link": entry.link,
                "description": entry.summary,
                "timestamp": entry.published,
                "source": "BBC Politics"
            }
            
            # Add AI summary if available
            if summarizer:
                try:
                    summary = summarizer(entry.summary, max_length=50, min_length=25, do_sample=False)
                    article["ai_summary"] = summary[0]['summary_text']
                except Exception as e:
                    print(f"Warning: Could not generate AI summary: {e}")
                    article["ai_summary"] = None
            
            news_items.append(article)
        
        # Create data directory using pathlib
        data_dir = Path(__file__).parent.parent / 'data'
        data_dir.mkdir(exist_ok=True)
        
        output_data = {
            "lastUpdated": datetime.now().isoformat(),
            "articles": news_items
        }
        
        # Write to JSON file
        output_file = data_dir / 'latest-news.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
            
        print("News fetched successfully!")
        return True
        
    except Exception as e:
        print(f"Error fetching news: {str(e)}")
        return False

if __name__ == "__main__":
    fetch_news()
