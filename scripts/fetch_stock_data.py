import yfinance as yf
import json
import os
from datetime import datetime, timedelta

# Define sectors and their 10 stocks (Large + Small/Mid Cap)
SECTORS = {
    "AI_Robot": [
        "9984.T", "6861.T", "6954.T", "6273.T", "6645.T", # Large
        "3993.T", "4180.T", "247A.T", "4382.T", "4011.T"  # Small/Mid
    ],
    "Quantum": [
        "6702.T", "6701.T", "9432.T", "6501.T", "6503.T",
        "3687.T", "6597.T", "6521.T", "7713.T", "2693.T"
    ],
    "Semi": [
        "8035.T", "6857.T", "4063.T", "6146.T", "6920.T",
        "6323.T", "6315.T", "4369.T", "6871.T", "6266.T"
    ],
    "Bio": [
        "4519.T", "4568.T", "4502.T", "4578.T", "4503.T",
        "4587.T", "2160.T", "4552.T", "4592.T", "4599.T"
    ],
    "Fusion": [
        "7013.T", "5802.T", "5803.T", "5801.T", "1963.T",
        "5310.T", "7711.T", "3446.T", "6378.T", "6864.T"
    ],
    "Space": [
        "7011.T", "7012.T", "9412.T", "7751.T", "9433.T",
        "9348.T", "5595.T", "186A.T", "290A.T", "402A.T"
    ]
}

def fetch_sector_performance():
    results = {}
    
    print(f"Fetching data at {datetime.now()}...")

    for sector, tickers in SECTORS.items():
        sector_changes = []
        valid_tickers = []
        print(f"Processing {sector}...")
        
        for ticker in tickers:
            try:
                # Fetch data for last 5 days to ensure we get at least 2 trading days
                stock = yf.Ticker(ticker)
                hist = stock.history(period="5d")
                
                if len(hist) < 2:
                    print(f"  Warning: Insufficient data for {ticker}")
                    continue
                
                # Get latest close and previous close
                latest_close = hist['Close'].iloc[-1]
                prev_close = hist['Close'].iloc[-2]
                
                if prev_close == 0:
                    continue
                    
                # Calculate daily percent change
                change = ((latest_close - prev_close) / prev_close) * 100
                sector_changes.append(change)
                valid_tickers.append({
                    "ticker": ticker,
                    "change": round(change, 2),
                    "price": round(latest_close, 1)
                })
                print(f"  {ticker}: {change:+.2f}% (¥{latest_close:,.0f})")
                
            except Exception as e:
                print(f"  Error fetching {ticker}: {e}")
        
        # Calculate average for the sector
        if sector_changes:
            avg_change = sum(sector_changes) / len(sector_changes)
            results[sector] = {
                "change_percent": round(avg_change, 2),
                "tickers": valid_tickers
            }
        else:
            results[sector] = {
                "change_percent": 0,
                "tickers": []
            }

    return results

def save_to_json(data):
    output_data = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "sectors": data
    }
    
    # Ensure public directory exists
    os.makedirs("public", exist_ok=True)
    
    with open("public/stock_data.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    print("Saved data to public/stock_data.json")

if __name__ == "__main__":
    data = fetch_sector_performance()
    save_to_json(data)
