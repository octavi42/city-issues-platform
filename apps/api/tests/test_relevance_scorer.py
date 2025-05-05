import sys
import os
import json

# Ensure project root is on path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai.openai.def_agents import relevance_scorer
from agents import Runner

def main():
    # Input parameters for relevance scoring
    params = {
        "image_url": "https://city-issues-assets.s3.eu-north-1.amazonaws.com/ae5254d933694988bead33dd2041a7f2.webp",
        "description": "The public square is well-maintained with organized seating arrangements for an outdoor event, clean and orderly surroundings, and well-kept trees and benches. The infrastructure supports community gatherings effectively.",
        "current_score": 50,
        "node_details": {"node_id": "node123", "type": "test"},
        "additional_info": "The description is not accurate."
    }
    # Serialize input to JSON string for the agent
    input_text = json.dumps(params)
    print("Input:", input_text)
    # Run the relevance_scorer agent
    result = Runner.run_sync(relevance_scorer, input=input_text)
    print("Result:", result)

if __name__ == '__main__':
    main()