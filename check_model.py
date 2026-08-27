import os
from huggingface_hub import hf_hub_download

path = hf_hub_download(
    repo_id="AnonymousCatX/Chronos-Bolt_DairyGuard",
    filename="model.safetensors",
)
size = os.path.getsize(path)
print("Downloaded to:", path)
print("Size in bytes:", size)
print("Size in MB:", round(size / (1024 * 1024), 2))

if size < 1000:
    print("STILL A POINTER FILE - not the real weights.")
else:
    print("This looks like the real model file.")
