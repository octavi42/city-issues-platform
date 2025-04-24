try:
    from agents import Runner
except ImportError:
    raise ImportError("agents library is required for Runner")

from city_inspector import city_inspector

msg = [
    {"role": "user", "content": [
        {"type": "input_text", "text": "Analyse this image."},
        {"type": "input_image", "image_url": "https://nub.news/api/image/526263/article.png"}
    ]}
]

result = Runner.run_sync(city_inspector, msg)
print(result.final_output)               #→ string returned by the tool or model
print(result.tool_calls)                 #→ list of tool-call payloads