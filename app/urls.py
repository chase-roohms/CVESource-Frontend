from django.urls import path

from . import views

urlpatterns = [
    path('app/', views.dashboard, name='App'),
    path('app/dashboard/', views.dashboard, name='Dashboard'),
    path('app/database/', views.database, name='Database'),
    path('app/database/results', views.results, name='Results'),
    path('app/warnings/', views.warnings, name='Warnings'),
]