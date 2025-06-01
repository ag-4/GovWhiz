"""
Cron job script to automatically update MP database
"""
import argparse
import logging
import sys
from pathlib import Path
import codecs

# Add the parent directory to Python path
parent_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(parent_dir))

from scripts.automated_mp_updater import AutomatedMPUpdater

def setup_logging(log_file: str) -> None:
    """Set up logging configuration with UTF-8 support"""
    handlers = [
        logging.FileHandler(log_file, encoding='utf-8'),
        logging.StreamHandler(codecs.getwriter('utf-8')(sys.stdout.buffer))
    ]
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=handlers
    )

def update_mp_database(args) -> None:
    """Run the MP database update"""
    setup_logging(args.log_file)
    logging.info("Starting automated MP database update...")

    try:
        updater = AutomatedMPUpdater(args.database)
        result = updater.update_all_constituencies()
        
        logging.info("Update completed:")
        logging.info(f"Updated: {result['updated']} MPs")
        logging.info(f"Failed: {result['failed']} MPs")
        logging.info(f"Duration: {result['duration']}")
        
        if result['failed'] > 0:
            logging.warning("Some updates failed. Check the database update_status for details.")
            for error in result.get('errors', []):
                logging.error(error)
    except Exception as e:
        logging.error(f"Error during update: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update MP database automatically")
    parser.add_argument(
        "--database",
        default="data/mp_database.json",
        help="Path to the MP database file"
    )
    parser.add_argument(
        "--log-file",
        default="logs/mp_updater.log",
        help="Path to the log file"
    )
    
    args = parser.parse_args()
    update_mp_database(args)
