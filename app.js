document.addEventListener('DOMContentLoaded', (event) => {
    loadEvents();
});

function scheduleNotification() {
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventType = document.getElementById('eventType').value;
    const dailyNotification = document.getElementById('dailyNotification').checked;

    if (!eventName || !eventDate || !eventTime) {
        alert('請填寫所有必要的資訊');
        return;
    }

    const event = {
        id: new Date().getTime(),
        name: eventName,
        date: eventDate,
        time: eventTime,
        type: eventType,
        daily: dailyNotification
    };

    saveEvent(event);
    addEventToDOM(event);
    scheduleEventNotification(event);

    document.getElementById('notificationForm').reset();
}

function saveEvent(event) {
    const events = getEvents();
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));
}

function getEvents() {
    const events = localStorage.getItem('events');
    return events ? JSON.parse(events) : [];
}

function loadEvents() {
    const events = getEvents();
    events.forEach(event => addEventToDOM(event));
}

function addEventToDOM(event) {
    const eventList = document.getElementById('eventList');
    const eventItem = document.createElement('li');
    eventItem.id = `event-${event.id}`;
    eventItem.className = event.type;
    eventItem.innerHTML = `
        名稱: ${event.name}, 日期: ${event.date}, 時間: ${event.time}, 每天通知: ${event.daily ? '是' : '否'}
        <button class="editButton" onclick="editEvent(${event.id})">編輯</button>
        <button onclick="deleteEvent(${event.id})">刪除</button>
        <button onclick="viewDetails(${event.id})">詳情</button>
    `;
    eventList.appendChild(eventItem);
}

function deleteEvent(eventId) {
    const events = getEvents();
    const updatedEvents = events.filter(e => e.id !== eventId);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    document.getElementById(`event-${eventId}`).remove();
}

function editEvent(eventId) {
    const events = getEvents();
    const event = events.find(e => e.id === eventId);
    document.getElementById('eventName').value = event.name;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventType').value = event.type;
    document.getElementById('dailyNotification').checked = event.daily;

    deleteEvent(eventId);

    document.getElementById('notificationForm').onsubmit = () => {
        saveEvent({
            id: eventId,
            name: document.getElementById('eventName').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            type: document.getElementById('eventType').value,
            daily: document.getElementById('dailyNotification').checked
        });
        loadEvents();
    };
}

function viewDetails(eventId) {
    const events = getEvents();
    const event = events.find(e => e.id === eventId);
    const detailsContent = document.getElementById('detailsContent');
    detailsContent.innerHTML = `
        <strong>名稱:</strong> ${event.name}<br>
        <strong>日期:</strong> ${event.date}<br>
        <strong>時間:</strong> ${event.time}<br>
        <strong>類型:</strong> ${event.type}<br>
        <strong>每天通知:</strong> ${event.daily ? '是' : '否'}
    `;
    const modal = document.getElementById('eventDetails');
    modal.style.display = 'block';
}

function closeDetails() {
    const modal = document.getElementById('eventDetails');
    modal.style.display = 'none';
}

function searchEvents() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const events = getEvents();
    const filteredEvents = events.filter(event => event.name.toLowerCase().includes(query));
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';
    filteredEvents.forEach(event => addEventToDOM(event));
}

function sortEvents(criteria) {
    const events = getEvents();
    if (criteria === 'name') {
        events.sort((a, b) => a.name.localeCompare(b.name));
    } else if (criteria === 'date') {
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    localStorage.setItem('events', JSON.stringify(events));
    loadEvents();
}

function exportEvents() {
    const events = getEvents();
    const filename = 'events.json';
    const data = JSON.stringify(events);
    const blob = new Blob([data], { type: 'application/json' });

    // 创建一个下载链接
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    // 触发点击下载链接
    link.click();
}
