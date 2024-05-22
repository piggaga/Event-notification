document.addEventListener('DOMContentLoaded', (event) => {
    loadEvents();
});

let currentPage = 1;
const eventsPerPage = 5;

function scheduleNotification() {
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventType = document.getElementById('eventType').value;
    const dailyNotification = document.getElementById('dailyNotification').checked;
    const reminder = document.getElementById('reminder').value;

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
        daily: dailyNotification,
        reminder: reminder,
        completed: false
    };

    saveEvent(event);
    addEventToDOM(event);
    scheduleEventNotification(event);

    document.getElementById('notificationForm').reset();
    loadEvents();
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
    displayEvents(events, currentPage);
    setupPagination(events);
}

function displayEvents(events, page) {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';
    const start = (page - 1) * eventsPerPage;
    const end = page * eventsPerPage;
    const paginatedEvents = events.slice(start, end);
    paginatedEvents.forEach(event => addEventToDOM(event));
}

function setupPagination(events) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(events.length / eventsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('span');
        pageLink.innerText = i;
        pageLink.className = 'page-link';
        pageLink.onclick = () => {
            currentPage = i;
            displayEvents(events, currentPage);
        };
        pagination.appendChild(pageLink);
    }
}

function addEventToDOM(event) {
    const eventList = document.getElementById('eventList');
    const eventItem = document.createElement('li');
    eventItem.id = `event-${event.id}`;
    eventItem.className = `${event.type} ${event.completed ? 'completed' : ''}`;
    eventItem.innerHTML = `
        名稱: ${event.name}, 日期: ${event.date}, 時間: ${event.time}, 每天通知: ${event.daily ? '是' : '否'}
        <button class="editButton" onclick="editEvent(${event.id})">編輯</button>
        <button onclick="deleteEvent(${event.id})">刪除</button>
        <button onclick="markAsCompleted(${event.id})">完成</button>
        <button onclick="viewDetails(${event.id})">詳情</button>
    `;
    eventList.appendChild(eventItem);
}

function deleteEvent(eventId) {
    const events = getEvents();
    const updatedEvents = events.filter(e => e.id !== eventId);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    document.getElementById(`event-${eventId}`).remove();
    loadEvents();
}

function editEvent(eventId) {
    const events = getEvents();
    const event = events.find(e => e.id === eventId);
    document.getElementById('eventName').value = event.name;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventType').value = event.type;
    document.getElementById('dailyNotification').checked = event.daily;
    document.getElementById('reminder').value = event.reminder;

    deleteEvent(eventId);

    document.getElementById('notificationForm').onsubmit = () => {
        saveEvent({
            id: eventId,
            name: document.getElementById('eventName').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            type: document.getElementById('eventType').value,
            daily: document.getElementById('dailyNotification').checked,
            reminder: document.getElementById('reminder').value,
            completed: false
        });
        loadEvents();
    };
}

function markAsCompleted(eventId) {
    const events = getEvents();
    const event = events.find(e => e.id === eventId);
    event.completed = true;
    localStorage.setItem('events', JSON.stringify(events));
    loadEvents();
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
        <strong>每天通知:</strong> ${event.daily ? '是' : '否'}<br>
        <strong>提醒時間:</strong> ${event.reminder}<br>
        <strong>完成狀態:</strong> ${event.completed ? '已完成' : '未完成'}
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
    displayEvents(filteredEvents, 1);
    setupPagination(filteredEvents);
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

function scheduleEventNotification(event) {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                const eventDateTime = new Date(`${event.date}T${event.time}`).getTime();
                const currentTime = Date.now();
                let delay = eventDateTime - currentTime;

                if (event.reminder !== "none") {
                    const reminderTimes = {
                        "10min": 10 * 60 * 1000,
                        "30min": 30 * 60 * 1000,
                        "1hour": 60 * 60 * 1000,
                        "1day": 24 * 60 * 60 * 1000
                    };
                    delay -= reminderTimes[event.reminder];
                }

                if (delay > 0) {
                    setTimeout(() => {
                        showNotification(event);
                        if (event.daily) {
                            setDailyNotification(event);
                        }
                    }, delay);
                } else {
                    alert('活動日期和時間必須是未來的時間');
                }
            } else {
                console.log("Notification permission denied.");
            }
        });
    } else {
        console.log("This browser does not support notifications.");
    }
}

function showNotification(event) {
    new Notification("活動通知", {
        body: `活動名稱: ${event.name}\n活動日期: ${event.date}\n活動時間: ${event.time}`,
        icon: "path/to/icon.png" // 可選
    });
}

function setDailyNotification(event) {
    const oneDay = 24 * 60 * 60 * 1000;
    const nextNotificationTime = new Date().getTime() + oneDay;
    const delay = nextNotificationTime - Date.now();

    setTimeout(() => {
        showNotification(event);
        setDailyNotification(event);
    }, delay);
}

function exportEvents() {
    const events = getEvents();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "events.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
