#!/usr/bin/env python3
"""
Simple News Fetcher with JSON Export
Exactly as requested - fetches news, summarizes with AI, saves to JSON
"""

import json
import os
import feedparser
import warnings
from datetime import datetime

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

def main():
    """Main function - exactly as requested"""
    print("🚀 Fetching BBC Politics News with AI Summarization...")
    
    # Load AI summarizer
    try:
        from transformers import pipeline
        print("🤖 Loading AI summarization model...")
        summarizer = pipeline(
            "summarization", 
            model="facebook/bart-large-cnn",
            device=-1  # Use CPU
        )
        print("✅ AI model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading AI model: {e}")
        return
    
    # Get BBC Politics RSS feed
    rss_url = "http://feeds.bbci.co.uk/news/politics/rss.xml"
    print(f"📰 Fetching news from {rss_url}")
    
    feed = feedparser.parse(rss_url)
    
    if not feed.entries:
        print("❌ No articles found")
        return
    
    print(f"✅ Found {len(feed.entries)} articles")
    
    # Process top 5 articles exactly as requested
    all_summaries = []
    
    for i, entry in enumerate(feed.entries[:5], 1):
        print(f"\n🧠 Processing article {i}/5: {entry.title[:50]}...")
        
        try:
            # Generate AI summary
            summary = summarizer(
                entry.summary, 
                max_length=50, 
                min_length=25, 
                do_sample=False
            )
            
            # Create item exactly as requested
            item = {
                "title": entry.title,
                "link": entry.link,
                "ai_summary": summary[0]['summary_text']
            }
            
            all_summaries.append(item)
            print(f"✅ Processed: {entry.title[:30]}...")
            
        except Exception as e:
            print(f"⚠️ Error processing article {i}: {e}")
            # Add item without AI summary as fallback
            item = {
                "title": entry.title,
                "link": entry.link,
                "ai_summary": "AI summary not available"
            }
            all_summaries.append(item)
    
    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)
    
    # Save to JSON file exactly as requested
    print(f"\n💾 Saving {len(all_summaries)} summaries to data/latest_news.json...")
    
    with open("data/latest_news.json", "w", encoding="utf-8") as f:
        json.dump(all_summaries, f, indent=2, ensure_ascii=False)
    
    print("✅ Successfully saved to data/latest_news.json")
    
    # Display what was saved
    print(f"\n📄 Summary of saved data:")
    for i, item in enumerate(all_summaries, 1):
        print(f"{i}. {item['title'][:60]}...")
        print(f"   AI Summary: {item['ai_summary'][:80]}...")
        print()
    
    print(f"🎉 Complete! {len(all_summaries)} articles processed and saved.")

if __name__ == "__main__":
    main()
