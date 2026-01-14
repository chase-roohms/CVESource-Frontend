function get_date_from_field(date, start_of_day) {
    if (date == null || date === '') {
        return ''
    }
    let time = start_of_day ? 'T00:00:00.000' : 'T23:59:59.999'
    return (new Date(date + time).toISOString())
}

function get_results() {
    let cve_search = document.getElementById('cve_search').value;
    let sort_by = document.getElementById('sort_by').value;
    let order = document.getElementById('order').value;
    let pub_from = get_date_from_field(document.getElementById('pub_from').value, true);
    let pub_to = get_date_from_field(document.getElementById('pub_from').value, false);
    let mod_from = get_date_from_field(document.getElementById('mod_from').value, true);
    let mod_to = get_date_from_field(document.getElementById('mod_to').value, false);
    let min_cvss = document.getElementById('min_cvss').value;
    let max_cvss = document.getElementById('max_cvss').value;
    let url = `/app/database/results?cve_search=${cve_search}&pub_from=${pub_from}&pub_to=${pub_to}&mod_from=${mod_from}&mod_to=${mod_to}&min_cvss=${min_cvss}&max_cvss=${max_cvss}&sort_by=${sort_by}&order=${order}`;
    htmx.ajax('GET', url, {target: '#db-results'})
}

function addAlpha(color, opacity) {
    let newOpacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
    return color + newOpacity.toString(16).toUpperCase();
}
function check_field_opacity(field_element){
    if (field_element.type === 'date' && field_element.value === '') {
        field_element.style.color = addAlpha(window.getComputedStyle(document.body).getPropertyValue('--color-text'), '0.5');
    } else if (field_element.type === 'date') {
        field_element.style.color = window.getComputedStyle(document.body).getPropertyValue('--color-text');
    }
}
function set_date_empty_opacity(field_element) {
    check_field_opacity(field_element)
}
function updateFieldOpacity(){
    let inputs = document.querySelectorAll('input')
    for (let field in inputs) {
        check_field_opacity(inputs[field]);
    }
}
function format_init() {
    for (let element of document.querySelectorAll('input')) {
        set_date_empty_opacity(element);
    }
}

function autosave_init() {
    let form_fields = ['cve_search', 'sort_by', 'order', 'pub_from', 'pub_to', 'mod_from', 'mod_to', 'min_cvss', 'max_cvss']
    for (let field in form_fields) {
        let field_element = document.getElementById(form_fields[field]);
        field_element.addEventListener('change', function () {
            sessionStorage.setItem(form_fields[field], field_element.value);
            set_date_empty_opacity(field_element);
        })
    }
}

function load_fields_from_session_store() {
    let form_fields = ['cve_search', 'sort_by', 'order', 'pub_from', 'pub_to', 'mod_from', 'mod_to', 'min_cvss', 'max_cvss']
    for (let field in form_fields) {
        let field_element = document.getElementById(form_fields[field]);
        if (sessionStorage.getItem(form_fields[field])) {
            field_element.value = sessionStorage.getItem(form_fields[field]);
        }
    }
}

function populateDropdown() {
    let selected = document.getElementById('sort_by_value_field').value;
    if (selected === '') {
        return;
    }
    let dropdown = document.getElementById('sort_by');
    for (let i = 0; i < dropdown.options.length; i++) {
        let option = dropdown.options[i];
        if (option.value === selected) {
            option.selected = true;
            return;
        }
    }
}

function addSubmitListener(id) {
    let ele = document.getElementById(id);
    if (ele.addEventListener) {
        ele.addEventListener("submit", function (e) {
            get_results();
            e.preventDefault();
        });
    }
}

function is_descending() {
    if (document.getElementById('order').value === '') {
        return true;
    } else {
        return (document.getElementById('order').value === 'desc');
    }
}

function set_sort_order_icon() {
    let icon = document.getElementById('sort_asc_desc_icon');
    if (is_descending()) {
        icon.style.rotate = '0deg';
    } else {
        icon.style.rotate = '180deg';
    }
}

function toggle_sort_asc_desc() {
    let descending = !is_descending();
    let order = descending ? 'desc' : 'asc'
    document.getElementById('order').value = order;
    sessionStorage.setItem('order', order);
    set_sort_order_icon()
}

function prep_sort_order_button() {
    let icon = document.getElementById('sort_asc_desc_icon');
    if (is_descending()) {
        icon.style.rotate = '-5deg';
    } else {
        icon.style.rotate = '185deg';
    }
}
