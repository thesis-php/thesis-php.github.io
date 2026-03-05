export default {
  drivers: [
    { name: 'amqp', title: 'Amqp' },
    { name: 'nats', title: 'Nats' },
    { name: 'pgmq', title: 'pgmq' },
    { name: 'nsq', title: 'Nsq' },
    { name: 'memcached', title: 'Memcached' }
  ],
  'low-level': [
    { name: 'byte-order', title: 'Byte Order' },
    { name: 'byte-cursor', title: 'Byte Cursor' },
    { name: 'byte-buffer', title: 'Byte Buffer' },
    { name: 'byte-reader-writer', title: 'Byte Reader/Writer' },
    { name: 'byte-writer', title: 'Byte Writer' },
    { name: 'byte-reader', title: 'Byte Reader' },
    { name: 'endian', title: 'Endian' },
    { name: 'clock', title: 'Clock' },
    { name: 'sync-once', title: 'Sync Once' },
    { name: 'time-span', title: 'Time Span' },
    { name: 'varint', title: 'Varint' }
  ]
}
