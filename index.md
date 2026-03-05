---
layout: home

hero:
  name: "Thesis PHP"
  text: "Drivers and tools for asynchronous PHP"
  tagline: "Native AMQP, NATS, and gRPC/Protobuf support for the AMPHP v3 ecosystem"
  image:
    src: /logo.png
    alt: Thesis PHP
  actions:
    - theme: brand
      text: Documentation
      link: /drivers/amqp/
    - theme: alt
      text: GitHub
      link: https://github.com/thesis-php

features:
  - title: Async Drivers
    details: "Core Thesis libraries close critical infrastructure gaps in async PHP: AMQP and NATS."
    link: /drivers/amqp/
    linkText: Open drivers docs
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8"/><path d="M12 8v8"/><path d="M2 9h2"/><path d="M2 15h2"/><path d="M20 9h2"/><path d="M20 15h2"/></svg>'
  - title: gRPC + Protobuf
    details: "In progress: gRPC driver, protobuf support, and proto file tooling for integrations and contracts."
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 11l8-4"/><path d="M8 13l8 4"/></svg>'
  - title: Low-level Components
    details: "Low-level primitives for async runtime and protocol implementations: buffers, cursors, varint, endian, and timing utilities."
    link: /low-level/byte-order/
    linkText: Open low-level docs
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>'
---
