"""
Runner module for the city inspector agent.
"""
try:
    from agents import Runner
except ImportError:
    raise ImportError("agents library is required for Runner")

import sys
import os
from def_agents import city_inspector

def run_with_image_url(image_url: str, message: str = "Analyze this image"):
    """
    Run the city inspector agent with an image URL, properly formatted for vision.
    """
    # Build a single multimodal turn:
    multimodal_input = [
        {
            "role": "user",
            "content": [
                {"type": "input_text",  "text": message},
                {"type": "input_image", "image_url": image_url}
            ]
        }
    ]

    # Execute the agent synchronously
    result = Runner.run_sync(city_inspector, input=multimodal_input)
    return result



# Example usage when run directly
if __name__ == "__main__":
    image_url = "https://abc3340.com/resources/media2/16x9/full/1015/center/80/0d07bb0e-a4e9-45a0-aaae-0246c7be94e1-large16x9_AP18121311865539.jpg"
    result = run_with_image_url(image_url)
    print("Final Output:", result)
