---
title: Composition
permalink: /dev/composition/
---

This document details how to create Oids prepared to work together through Javascript.

## Publish/Subscribe Composition

All components' communication follows the path `notice->publish->subscribe->notice`, as illustrated in the following figure:

![notice->publish->subscribe->notice](images/notice-publish-subscribe-notice.png)

### Step 1: Notifying - Dispatching a Notice

Every communication following this protocol starts with a `notice`, which reports some occurrence inside a component. Each notice is a "publication candidate" that can become a publication.