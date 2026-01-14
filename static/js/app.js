function updateTabs(){
    let activeTab = JSON.parse(document.getElementById('active_page').textContent);
    let menuItems = document.getElementsByClassName('menu-item');
    for (let item in menuItems) {
        let element = menuItems.item(item)
        if (element.id === activeTab) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    }
}
function getStoreMode(){
    let storeMode = localStorage.getItem('darkMode');
    if (storeMode === null) { storeMode = 'true' }
    return storeMode;
}
function getBoolMode() {
    return (getStoreMode() === 'true');
}
function applyPhotoColorScheme(){
    let mode = getBoolMode();
    let bigLogo = document.getElementById('big-menu-logo')
    let smallLogo = document.getElementById('small-menu-logo')
    if (bigLogo !== null) {
        bigLogo.src = mode ? ("/static/CVESourceFull.webp") : ("/static/CVESourceFullLightMode.webp");
    }
    if (smallLogo !== null) {
        smallLogo.src = mode ? ("/static/CVESource.webp") : ("/static/CVESourceLightMode.webp");
    }
}
function applyColorScheme(){
    let mode = getBoolMode();
    let style = window.getComputedStyle(document.body)
    document.documentElement.style.setProperty('--color-text', mode ? style.getPropertyValue('--color-text-dark') : style.getPropertyValue('--color-text-light'));
    document.documentElement.style.setProperty('--color-background', mode ? style.getPropertyValue('--color-background-dark') : style.getPropertyValue('--color-background-light'));
    document.documentElement.style.setProperty('--color-panel', mode ? style.getPropertyValue('--color-panel-dark') : style.getPropertyValue('--color-panel-light'));
    document.documentElement.style.setProperty('--color-outer-shadow', mode ? style.getPropertyValue('--color-inner-shadow-dark') : style.getPropertyValue('--color-inner-shadow-light'));
    document.documentElement.style.setProperty('--color-inner-shadow', mode ? style.getPropertyValue('--color-inner-shadow-dark') : style.getPropertyValue('--color-inner-shadow-light'));
    document.documentElement.style.setProperty('--color-scheme', mode ? 'dark' : 'light', 'important');
    document.documentElement.style.setProperty('--display-sun', mode ? 'block' : 'none');
    document.documentElement.style.setProperty('--display-moon', mode ? 'none' : 'block');
    applyPhotoColorScheme()
    }
function toggleColorScheme(){
    const dark = 'true'
    const light = 'false'
    let storeMode = getStoreMode()
    storeMode = ((storeMode === dark) ? light : dark)
    localStorage.setItem('darkMode', storeMode)
    applyColorScheme()
    if (JSON.parse(document.getElementById('active_page').textContent) === 'database'){
        updateFieldOpacity();
    }
}
function getWeekday(weekdayInt){
    switch(weekdayInt){
        case 0: return 'Sun';
        case 1: return 'Mon';
        case 2: return 'Tue';
        case 3: return 'Wed';
        case 4: return 'Thu';
        case 5: return 'Fri';
        case 6: return 'Sat';
    }
}
function getMonth(weekdayInt){
    switch(weekdayInt){
        case 0: return 'Jan.';
        case 1: return 'Feb.';
        case 2: return 'March';
        case 3: return 'April';
        case 4: return 'May';
        case 5: return 'June';
        case 6: return 'July';
        case 7: return 'Aug.';
        case 8: return 'Sep.';
        case 9: return 'Oct.';
        case 10: return 'Nov.';
        case 11: return 'Dec.';
    }
}
function getTime(datetime){
    let timeMeridian = datetime.getHours() < 12 ? 'AM' : 'PM'
    let hours = datetime.getHours() % 12
    if (hours === 0){ hours = 12 }
    return hours + ':' + ('0' + datetime.getMinutes()).slice(-2) + ' ' + timeMeridian
}
function getDate(datetime){
    return getMonth(datetime.getMonth()) + ' ' + datetime.getDate() + ', ' + datetime.getFullYear()
}
function format_datetime(isoString){
    let datetime = new Date(isoString);
    return getDate(datetime) + ' at ' + getTime(datetime);
}
function format_all_datetimes(){
    let dt_ele_list = document.querySelectorAll('time')
    for (let ele in dt_ele_list){
        dt_ele_list[ele].textContent = format_datetime(dt_ele_list[ele].dateTime);
    }
}
