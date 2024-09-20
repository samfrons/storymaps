import pandas as pd
import requests
from bs4 import BeautifulSoup
import time
import re

def get_business_info_from_page(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        business_info = {}
        for div in soup.find_all('div', class_='col-xs-12 col-sm-8'):
            h4 = div.find('h4')
            if h4:
                business_name = h4.text.strip()
                b_tags = div.find_all('b')
                if b_tags:
                    last_b = b_tags[-1]
                    # Remove any nested <i> tags
                    for i in last_b.find_all('i'):
                        i.decompose()
                    category = last_b.text.strip()
                    # Remove any remaining parentheses and their contents
                    category = re.sub(r'\([^)]*\)', '', category).strip()
                    business_info[business_name] = category
        return business_info
    except Exception as e:
        print(f"Error fetching page {url}: {e}")
        return {}

def main():
    # Read the input CSV
    try:
        df = pd.read_csv('input.csv', encoding='utf-8')
    except Exception as e:
        print(f"Error reading CSV: {e}")
        print("Trying with different encoding...")
        df = pd.read_csv('input.csv', encoding='latin1')

    total_businesses = len(df)
    matches_found = 0

    # Add new column
    df['category'] = ''

    # Get all business info from pages 1-4
    all_website_businesses = {}
    for page in range(1, 1013):
        url = f'https://www2.hu-berlin.de/djgb/public/en/find?page={page}'
        all_website_businesses.update(get_business_info_from_page(url))
        time.sleep(1)  # Be polite to the server

    # Process each business in the CSV
    for index, row in df.iterrows():
        business_name = str(row['business_name']).strip()
        
        if business_name in all_website_businesses:
            df.at[index, 'category'] = all_website_businesses[business_name]
            matches_found += 1

        # Update progress
        print(f"Processed {index+1}/{total_businesses} businesses. Matches found: {matches_found}", end='\r')

    print("\nProcessing complete.")

    # Write the output CSV
    df.to_csv('output.csv', index=False, quoting=1)  # quoting=1 is equivalent to csv.QUOTE_ALL

    print(f"Total businesses processed: {total_businesses}")
    print(f"Total matches found: {matches_found}")
    print(f"Results saved to output.csv")

if __name__ == "__main__":
    main()