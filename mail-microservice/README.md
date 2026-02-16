docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management

{
"type": "SEND_MAIL",
"requestId": "debug-1",
"timeStamp": "2026-01-29T10:00:00.000Z",
"payload": {
"from":"gay",
"toEmail": "billcozy@yandex.ru",
"subject": "Test",
"text": "Hello"
}
}
