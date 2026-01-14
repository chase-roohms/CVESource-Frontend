import random
import re

from datetime import datetime, timezone, timedelta

from django.http import HttpResponse
from django.template import loader


formatted_date_pattern = r'[a-zA-Z]{3}, [a-zA-Z]{3,4} [0-9]{2}'


day_cve_data = [{'isForecast': False, 'dateRange': '2024-09-01', 'none': 0, 'low': 2, 'medium': 1, 'high': 1, 'critical': 2}, {'isForecast': False, 'dateRange': '2024-09-02', 'none': 0, 'low': 3, 'medium': 26, 'high': 39, 'critical': 5}, {'isForecast': False, 'dateRange': '2024-09-03', 'none': 0, 'low': 8, 'medium': 18, 'high': 32, 'critical': 10}, {'isForecast': False, 'dateRange': '2024-09-04', 'none': 0, 'low': 7, 'medium': 78, 'high': 38, 'critical': 12}, {'isForecast': False, 'dateRange': '2024-09-05', 'none': 0, 'low': 2, 'medium': 29, 'high': 16, 'critical': 17}, {'isForecast': False, 'dateRange': '2024-09-06', 'none': 0, 'low': 3, 'medium': 26, 'high': 26, 'critical': 9}, {'isForecast': False, 'dateRange': '2024-09-07', 'none': 0, 'low': 3, 'medium': 17, 'high': 9, 'critical': 0}, {'isForecast': False, 'dateRange': '2024-09-08', 'none': 0, 'low': 4, 'medium': 13, 'high': 9, 'critical': 2},
                {'isForecast': True, 'dateRange': '2024-09-09', 'none': 0, 'low': 3, 'medium': 26, 'high': 39, 'critical': 5}, {'isForecast': True, 'dateRange': '2024-09-10', 'none': 0, 'low': 8, 'medium': 18, 'high': 32, 'critical': 10}, {'isForecast': True, 'dateRange': '2024-09-11', 'none': 0, 'low': 7, 'medium': 43, 'high': 38, 'critical': 12}]


def severity_from_score(score):
    if score == 0:
        return 'info'
    elif score < 4:
        return 'low'
    elif score < 7:
        return 'medium'
    elif score < 9:
        return 'high'
    else:
        return 'critical'


def random_date(min_year=2000, min_month=1, min_day=1, min_hour=0, min_minute=0):
    year = random.randint(min_year, 2023)
    if year > min_year:
        min_month = 1
    month = random.randint(min_month, 12)
    if year > min_year or month > min_month:
        min_day = 1
    day = random.randint(min_day, 28)
    if year > min_year or month > min_month or day > min_day:
        min_hour = 0
    hour = random.randint(min_hour, 23)
    if year > min_year or month > min_month or day > min_day or hour > min_hour:
        min_minute = 0
    minute = random.randint(min_minute, 59)
    return datetime(year, month, day, hour, minute, tzinfo=timezone(timedelta(hours=0)))


def get_cve_list():
    cve_list = list()
    for i in range(10):
        score = round(random.uniform(0, 10), 1)
        pub_date = random_date()
        mod_date = random_date(min_year=pub_date.year, min_month=pub_date.month, min_day=pub_date.day, min_hour=pub_date.hour, min_minute=pub_date.minute)
        cve_list.append(
            {
                'id': 'CVE-1234-12345',
                'description': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                'score': score,
                'severity': severity_from_score(score),
                'pub_date': pub_date.isoformat(),
                'mod_date': mod_date.isoformat(),
            }
        )
    return cve_list


def get_date_from_formatted_string(datetime_formatted):
    if (datetime_formatted is None or datetime_formatted == '' or
            not re.match(formatted_date_pattern, datetime_formatted)):
        return ''
    curr_year = datetime.now().year
    datetime_formatted += ' ' + str(curr_year)
    date_time = datetime.strptime(datetime_formatted, '%a, %b %d %Y').date()
    return date_time.strftime('%Y-%m-%d')


def get_date(date_time_string):
    return get_date_from_formatted_string(date_time_string)


def dashboard(request):
    if request.htmx:
        template = loader.get_template('dashboard.html')
    else:
        template = loader.get_template('dashboard_full.html')

    cve_data = day_cve_data

    return HttpResponse(template.render({
        'active_page': 'dashboard',
        'cvss_average_today': 7.69,
        'cvss_average_today_severity': 'High',
        'num_cve_published_today': 45,
        'num_cve_updated_today': 23,
        'cve_data': cve_data,
    }, request), headers={'HX-Push-Url': '/app/dashboard/'})


def database(request):
    if request.htmx:
        template = loader.get_template('database.html')
    else:
        template = loader.get_template('database_full.html')

    return HttpResponse(template.render({
        'active_page': 'database',
        'cve_search': request.GET.get('cve_search', ''),
        'sort_by': request.GET.get('sort_by', ''),
        'order': request.GET.get('order', ''),
        'pub_from': get_date(request.GET.get('pub_from', '')),
        'pub_to': get_date(request.GET.get('pub_to', '')),
        'mod_from': get_date(request.GET.get('mod_from', '')),
        'mod_to': get_date(request.GET.get('mod_to', '')),
        'min_cvss': request.GET.get('min_cvss', ''),
        'max_cvss': request.GET.get('max_cvss', ''),
    }, request), headers={'HX-Push-Url': '/app/database/'})


def results(request):
    if request.htmx:
        template = loader.get_template('database_results.html')
        return HttpResponse(template.render({
            'cve_list': get_cve_list()
        }))


def warnings(request):
    if request.htmx:
        template = loader.get_template('warnings.html')
    else:
        template = loader.get_template('warnings_full.html')
    return HttpResponse(template.render({
        'active_page': 'warnings',
    }, request), headers={'HX-Push-Url': '/app/warnings/'})


def handler400(request, exception):
    template = loader.get_template('400.html')
    response = HttpResponse(template.render({}, request))
    response.status_code = 400
    return response


def handler404(request, exception):
    template = loader.get_template('404.html')
    response = HttpResponse(template.render({}, request))
    response.status_code = 404
    return response


def handler500(request, exception):
    template = loader.get_template('500.html')
    response = HttpResponse(template.render({}, request))
    response.status_code = 500
    return response
