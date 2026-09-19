from inference_sdk import (
    InferenceHTTPClient,
    InferenceConfiguration
)

client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="4qUi3gFsvhcGDX6eY4bW"
)

configuration = InferenceConfiguration(
    confidence_threshold=0.1,
    api_key_transport="header"
)

with client.use_configuration(configuration):
    result = client.infer(
        "test.jpg",
        model_id="landslide-detection-yx051/1"
    )

print(result)