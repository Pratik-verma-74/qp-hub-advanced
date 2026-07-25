// notifications.js
// Handles real-time notifications for QPHub

let unreadNotifCount = 0;
let lastNotifViewTime = localStorage.getItem('lastNotifViewTime') || 0;

function toggleNotifications(e) {
  if(e) e.stopPropagation();
  const dd = document.getElementById('notifDropdown');
  if(!dd) return;
  
  if (dd.style.display === 'block') {
    dd.style.display = 'none';
  } else {
    dd.style.display = 'block';
    // Mark as read when opened
    markAllNotificationsRead();
  }
}

function markAllNotificationsRead() {
  lastNotifViewTime = Date.now();
  localStorage.setItem('lastNotifViewTime', lastNotifViewTime);
  unreadNotifCount = 0;
  updateNotifBadge();
  
  // Visually remove "unread" styling from items
  document.querySelectorAll('.notif-item.unread').forEach(el => {
    el.classList.remove('unread');
    el.style.background = 'transparent';
  });
}

function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if(!badge) return;
  
  if (unreadNotifCount > 0) {
    badge.textContent = unreadNotifCount > 9 ? '9+' : unreadNotifCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function initNotificationsSystem(firestoreDb) {
  if (!firestoreDb) return;

  const notifList = document.getElementById('notifList');
  if (!notifList) return;

  // Listen to the last 20 notifications
  firestoreDb.collection('notifications')
    .orderBy('timestamp', 'desc')
    .limit(20)
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        notifList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No new notifications.</div>';
        return;
      }

      let html = '';
      let newUnread = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const timeMs = data.timestamp ? data.timestamp.toMillis() : Date.now();
        const isUnread = timeMs > lastNotifViewTime;
        
        if (isUnread) newUnread++;

        let icon = '<i class="fas fa-bell" style="color: var(--accent-1);"></i>';
        if (data.type === 'upload') icon = '<i class="fas fa-file-upload" style="color: var(--accent-2);"></i>';
        if (data.type === 'achievement') icon = '<i class="fas fa-trophy" style="color: #f59e0b;"></i>';

        const bgStyle = isUnread ? 'background: rgba(181,142,255,0.1); border-left: 3px solid var(--accent-1);' : 'background: transparent; border-left: 3px solid transparent;';
        const link = data.link ? `href="${data.link}"` : 'href="#"';

        html += `
          <a ${link} class="notif-item ${isUnread ? 'unread' : ''}" style="display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid var(--glass-border); text-decoration: none; color: inherit; transition: background 0.2s; ${bgStyle}">
            <div style="font-size: 1.2rem; flex-shrink: 0; margin-top: 2px;">${icon}</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); font-family: var(--font-head);">${data.title}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">${data.message}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">${formatNotifTime(timeMs)}</div>
            </div>
          </a>
        `;
      });

      notifList.innerHTML = html;
      unreadNotifCount = newUnread;
      updateNotifBadge();
    }, err => {
      console.error("Error fetching notifications:", err);
    });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('notifDropdown');
    const btn = document.getElementById('notifBellBtn');
    if (dd && dd.style.display === 'block' && !dd.contains(e.target) && !btn.contains(e.target)) {
      dd.style.display = 'none';
    }
  });
}

function formatNotifTime(ms) {
  const diff = Date.now() - ms;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
}

function broadcastNotification(firestoreDb, type, title, message, link) {
  if (!firestoreDb) return;
  firestoreDb.collection('notifications').add({
    type: type,
    title: title,
    message: message,
    link: link || '',
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(err => console.error("Error broadcasting notification:", err));
}
