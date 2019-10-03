from django.shortcuts import render
import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Create your views here.

def gallery(request):
    path = os.path.join(BASE_DIR, 'assets/photos')  # insert the path to your directory   
    img_list = os.listdir(path)   
    return render(request, 'photos/gallery.html', {'images': img_list})
