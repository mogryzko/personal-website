from django.urls import path
from . import views

urlpatterns = [
    path('', views.project_list, name='projects'),
    path('<slug:slug>/', views.projects_detail, name="project"),
    path('jump-exaggeration-app/more-info', views.jump_exaggeration_app_more_info, name="jump_exaggeration_app_more_info"),
]