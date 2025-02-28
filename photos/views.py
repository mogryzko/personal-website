from django.shortcuts import render
import os
import random



BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def gallery(request):
    path = os.path.join(BASE_DIR, 'static/photos')
    # Filter for common image extensions
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', ".PNG", ".JPG", ".JPEG", ".GIF"]
    img_list = [f for f in os.listdir(path) 
                if os.path.splitext(f)[1].lower() in valid_extensions]
    random.shuffle(img_list)
    
    return render(request, 'photos/gallery.html', {'images': img_list})
