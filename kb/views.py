from django.http import HttpResponse
from django.template import loader


cve_source_description = ('CVESource, a single source of truth for Vulnerability (CVE) insights. Complete with a '
                          'dashboard and database, CVESource is perfect for quick reference of current data and '
                          'trends, as well as in depth research and intelligence gathering.')


# Create your views here.
def index(request):
    template = loader.get_template('index_full.html')
    return HttpResponse(template.render({
        'title': 'CVESource: Vulnerability Knowledgebase and Resources (CVE)',
        'description': cve_source_description,
        'og_type': 'website',
        'url_path': '',
        'twitter_card_type': 'summary',
    }, request))


def cve(request, cve_id):
    template = loader.get_template('CVE_details_full.html')
    return HttpResponse(template.render({
        'title': cve_id + ' Details - CVESource',
        'description': 'Description of the CVE',
        'og_type': 'article',
        'url_path': 'vuln/cve/' + cve_id,
        'twitter_card_type': 'summary',

        'cve_id': cve_id,
    }, request))
