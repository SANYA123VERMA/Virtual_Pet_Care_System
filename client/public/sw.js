
self.addEventListener("push", function (event) {
    const data = event.data.json();
    console.log("Push Received...");
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || "/favicon.ico", // Ensure this path exists or use a default
    });
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
