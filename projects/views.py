from django.shortcuts import render
from .models import Project
from django.http import HttpResponse

# Create your views here.

def project_list(request):
	projects = Project.objects.all().order_by('date')
	return render(request, 'projects/project_list.html', {'projects': projects})

def projects_detail(request, slug):
	project = Project.objects.get(slug=slug)
	return render(request, 'projects/project_detail.html',  {'project': project})

def jump_exaggeration_app_more_info(request):
	project = Project.objects.get(slug='jump-exaggeration-app')
	return render(request, 'projects/more-info.html', {'project': project})
