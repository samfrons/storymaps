import csv
import pandas as pd
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from tqdm import tqdm
import json

def geocode_with_arcgis(session, address):
    base_url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates"
    params = {
        "singleLine": f"{address}, Berlin, Germany",
        "f": "json",
        "maxLocations": 1
    }
    
    response = session.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        candidates = data.get("candidates", [])
        if candidates:
            location = candidates[0].get("location", {})
            return location.get("y"), location.get("x")  # Latitude, Longitude
    return None, None

def main():
    # Set up a session with retries and SSL verification disabled
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=1, status_forcelist=[502, 503, 504])
    session.mount("https://", HTTPAdapter(max_retries=retries))
    session.verify = False  # Disable SSL verification

    # Suppress only the single warning from urllib3 needed.
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # Read input CSV file
    input_file = "addresspo.csv"
    output_file = "addressb.csv"
    
    # Read existing output if it exists
    try:
        df = pd.read_csv(output_file)
        start_index = len(df)
        # Create a dictionary of already geocoded addresses
        geocoded_addresses = dict(zip(df['Address'], zip(df['Latitude'], df['Longitude'])))
    except FileNotFoundError:
        df = pd.DataFrame(columns=['Address', 'Latitude', 'Longitude'])
        start_index = 0
        geocoded_addresses = {}

    # Read input addresses
    with open(input_file, 'r') as f:
        reader = csv.reader(f)
        addresses = list(reader)

    # Geocode addresses with progress bar
    for i, row in tqdm(enumerate(addresses[start_index:], start=start_index), 
                       total=len(addresses)-start_index, 
                       desc="Geocoding", 
                       unit="address"):
        address = row[0]
        
        if address in geocoded_addresses:
            lat, lon = geocoded_addresses[address]
        else:
            try:
                lat, lon = geocode_with_arcgis(session, address)
                if lat and lon:
                    geocoded_addresses[address] = (lat, lon)
            except Exception as e:
                print(f"\nError geocoding {address}: {str(e)}")
                lat, lon = None, None

        df = pd.concat([df, pd.DataFrame({
            'Address': [address],
            'Latitude': [lat],
            'Longitude': [lon]
        })], ignore_index=True)

        # Save progress every 100 addresses
        if (i + 1) % 100 == 0:
            df.to_csv(output_file, index=False)

    # Save final results
    df.to_csv(output_file, index=False)

if __name__ == "__main__":
    main()