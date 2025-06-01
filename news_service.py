"""
AI-powered news fetching service for MP information
Uses web scraping and natural language processing to avoid API key requirements
"""
import requests
from bs4 import BeautifulSoup
import hashlib
from datetime import datetime, timedelta
import json
import os
import re
from typing import List, Dict
import logging

class NewsScraperService:
    def __init__(self):
        self.cache_dir = "data/news_cache"
        self.cache_expiry = timedelta(hours=1)
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        self.ensure_cache_dir()

    def ensure_cache_dir(self):
        """Ensure cache directory exists"""
        os.makedirs(self.cache_dir, exist_ok=True)

    def get_cache_path(self, query: str) -> str:
        """Generate cache file path for query"""
        query_hash = hashlib.md5(query.encode()).hexdigest()
        return os.path.join(self.cache_dir, f"{query_hash}.json")

    def get_cached_results(self, query: str) -> List[Dict]:
        """Get cached results if available and fresh"""
        cache_path = self.get_cache_path(query)
        if os.path.exists(cache_path):
            with open(cache_path, 'r') as f:
                cached = json.load(f)
                if datetime.fromisoformat(cached['timestamp']) + self.cache_expiry > datetime.now():
                    return cached['articles']
        return None

    def save_to_cache(self, query: str, articles: List[Dict]):
        """Save results to cache"""
        cache_path = self.get_cache_path(query)
        with open(cache_path, 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'articles': articles
            }, f)

    async def fetch_guardian_news(self, query: str) -> List[Dict]:
        """Fetch news from The Guardian without API key"""
        try:
            url = f"https://www.theguardian.com/politics/search?q={query}"
            headers = {'User-Agent': self.user_agent}
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            articles = []
            for article in soup.select('.fc-item'):
                title = article.select_one('.fc-item__title')
                link = article.select_one('a')
                date = article.select_one('.fc-item__timestamp')
                
                if title and link:
                    articles.append({
                        'title': title.text.strip(),
                        'url': link['href'],
                        'source': 'The Guardian',
                        'publishedAt': date['datetime'] if date else None,
                        'description': self.extract_description(link['href'])
                    })
            
            return articles[:5]  # Return top 5 articles
        except Exception as e:
            logging.error(f"Guardian news fetch error: {e}")
            return []

    async def fetch_bbc_news(self, query: str) -> List[Dict]:
        """Fetch news from BBC without API key"""
        try:
            url = f"https://www.bbc.co.uk/search?q={query}&filter=news"
            headers = {'User-Agent': self.user_agent}
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            articles = []
            for article in soup.select('.ssrcss-1v7bxtk-StyledContainer'):
                title = article.select_one('.ssrcss-6arcww-PromoHeadline')
                link = article.select_one('a')
                date = article.select_one('time')
                
                if title and link:
                    articles.append({
                        'title': title.text.strip(),
                        'url': f"https://www.bbc.co.uk{link['href']}" if not link['href'].startswith('http') else link['href'],
                        'source': 'BBC News',
                        'publishedAt': date['datetime'] if date else None,
                        'description': self.extract_description(link['href'])
                    })
            
            return articles[:5]  # Return top 5 articles
        except Exception as e:
            logging.error(f"BBC news fetch error: {e}")
            return []

    def extract_description(self, url: str) -> str:
        """Extract article description"""
        try:
            headers = {'User-Agent': self.user_agent}
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try meta description first
            meta_desc = soup.find('meta', {'name': 'description'})
            if meta_desc and meta_desc.get('content'):
                return meta_desc['content']
            
            # Try first paragraph
            first_para = soup.find('p')
            if first_para:
                return first_para.text.strip()
            
            return ""
        except:
            return ""

news_service = NewsScraperService()
