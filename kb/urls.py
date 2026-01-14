from django.urls import path, re_path

from . import views

urlpatterns = [
    re_path(r'vuln/cve/(?P<cve_id>CVE-[0-9]{4}-[0-9]{4,7})/$', views.cve, name='CVE'),
    path('', views.index, name='Index'),
]