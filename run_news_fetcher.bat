@echo off
echo ======================================================
echo 🚀 UK Parliament News Fetcher - Auto Update Service
echo ======================================================

:loop
echo.
echo 📅 %date% %time%
echo 🔄 Running news update...
python fetch_news.py
echo.
echo 💤 Waiting 5 minutes before next update...
timeout /t 300 /nobreak
goto loop
