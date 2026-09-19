import os
from PIL import Image

dataset_path = "dataset"

categories = [
    "landslide",
    "crack",
    "stable_slope",
    "other"
]

for split in ["train", "validation"]:
    print(f"\n{split.upper()} DATASET")

    for category in categories:
        folder = os.path.join(dataset_path, split, category)

        if not os.path.exists(folder):
            print(f"{category}: Folder missing")
            continue

        valid_images = 0

        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)

            try:
                with Image.open(file_path) as image:
                    image.verify()
                valid_images += 1
            except Exception:
                print(f"Invalid image: {file_path}")

        print(f"{category}: {valid_images} images")