from django.shortcuts import render
from django.http import Http404
from django.conf import settings

def project_list(request):
    projects = settings.STATIC_PROJECTS
    return render(request, 'projects/project_list.html', {'projects': projects})

def projects_detail(request, slug):
    project = next((p for p in settings.STATIC_PROJECTS if p['slug'] == slug), None)
    if not project:
        raise Http404("Project not found")
    return render(request, 'projects/project_detail.html', {'project': project})

def jump_exaggeration_app_more_info(request):
    project = next((p for p in settings.STATIC_PROJECTS if p['slug'] == 'jump-exaggeration-app'), None)
    if not project:
        raise Http404("Project not found")
    return render(request, 'projects/more-info.html', {'project': project})