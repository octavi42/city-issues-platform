import sys
import os
import json

# Ensure project root is on path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.env_loader import load_dotenv
load_dotenv()

from aiv2.agents.messages.agent import analyze_message

def main():
    # Input message for analysis
    params = {
        "image_url": "https://city-issues-assets.s3.eu-north-1.amazonaws.com/7482e2ab8a4347cea407801a5a92d755.jpeg",
        "description": "A blue car is parked blocking a cycle lane, making it difficult for cyclists to pass safely. The bike lane is clearly marked, but the car's position obstructs it entirely.",
        "current_score": 50,
        "node_details": {"node_id": "node123", "type": "test"},
        "additional_info": "Relevant."
    }
    message = json.dumps(params)
    print("Input message:", message)
    # Run the message analyzer agent
    result = analyze_message(message)
    print("Result:")
    print("image_url:", result.image_url)
    print("description:", result.description)
    print("current_score:", result.current_score)
    print("node_details:", result.node_details)
    print("additional_info:", result.additional_info)
    print("delta_score:", result.delta_score)

if __name__ == '__main__':
    main()