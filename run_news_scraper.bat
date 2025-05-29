@echo off
echo ======================================================
echo 🚀 UK Parliament News Scraper
echo ======================================================
echo.

:menu
echo Choose an option:
echo.
echo 1. Quick Test (BBC Politics only, no AI)
echo 2. Full Scraper (All sources with AI)
echo 3. Test Single Source
echo 4. List Available Sources
echo 5. Show Help
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto quick
if "%choice%"=="2" goto full
if "%choice%"=="3" goto single
if "%choice%"=="4" goto list
if "%choice%"=="5" goto help
if "%choice%"=="6" goto exit
echo Invalid choice. Please try again.
echo.
goto menu

:quick
echo.
echo 🚀 Running Quick Test...
echo.
python fetch_news.py --quick
echo.
pause
goto menu

:full
echo.
echo 🚀 Running Full Scraper with AI...
echo This may take several minutes on first run to download AI models.
echo.
python fetch_news.py
echo.
pause
goto menu

:single
echo.
echo Available sources: bbc_politics, parliament_news, gov_uk
set /p source="Enter source key: "
echo.
echo 🚀 Testing source: %source%
echo.
python fetch_news.py --source %source%
echo.
pause
goto menu

:list
echo.
echo 📰 Listing Available Sources...
echo.
python fetch_news.py --list-sources
echo.
pause
goto menu

:help
echo.
echo 📖 Showing Help...
echo.
python fetch_news.py --help
echo.
pause
goto menu

:exit
echo.
echo 👋 Goodbye!
echo.
pause
exit
